import os
import logging
import app.utils.config  # Loads .env variables first
from langchain_community.vectorstores import FAISS
from langchain_core.embeddings import Embeddings
from app.database.db import get_all_transactions
from pinecone import Pinecone, ServerlessSpec
from huggingface_hub import InferenceClient

# Disable Hugging Face telemetry warnings
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

logger = logging.getLogger("vector_store")
INDEX_BASE_PATH = os.path.dirname(__file__)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "cortex-finance")

class HuggingFaceInferenceEmbeddings(Embeddings):
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2", api_token: str = None):
        self.model_name = model_name
        self.api_token = api_token or os.getenv("HF_API_TOKEN", "")
        self.client = InferenceClient(api_key=self.api_token)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        
        batch_size = 32
        embeddings = []
        for i in range(0, len(texts), batch_size):
            chunk = texts[i:i+batch_size]
            try:
                res = self.client.feature_extraction(chunk, model=self.model_name)
                if hasattr(res, "tolist"):
                    res = res.tolist()
                elif isinstance(res, list) and len(res) > 0 and not isinstance(res[0], list):
                    res = [res]
                embeddings.extend(res)
            except Exception as e:
                logger.error(f"Failed to fetch embeddings chunk {i}-{i+batch_size} from HuggingFace Inference API: {e}")
                raise e
        return embeddings

    def embed_query(self, text: str) -> list[float]:
        try:
            res = self.client.feature_extraction(text, model=self.model_name)
            if hasattr(res, "tolist"):
                res = res.tolist()
            if isinstance(res, list) and len(res) > 0 and isinstance(res[0], list):
                return res[0]
            return res
        except Exception as e:
            logger.error(f"Error in embed_query: {e}")
            return [0.0] * 384

# Initialize our new cloud-based Inference API embedding model
try:
    embedding_model = HuggingFaceInferenceEmbeddings()
except Exception as e:
    logger.error(f"Failed to initialize Hugging Face Inference embedding model: {e}")
    embedding_model = None

def get_pinecone_index():
    if not PINECONE_API_KEY:
        return None
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        existing_indexes = [idx.name for idx in pc.list_indexes()]
        if PINECONE_INDEX_NAME not in existing_indexes:
            logger.info(f"Creating Pinecone index '{PINECONE_INDEX_NAME}' with dimension 384...")
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=384,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        return pc.Index(PINECONE_INDEX_NAME)
    except Exception as e:
        logger.error(f"Failed to connect/initialize Pinecone: {e}")
        return None

def format_transaction_to_text(tx: dict) -> str:
    """Formats a database transaction record into a semantic text sentence for embedding."""
    date = tx.get("date", "Unknown Date")
    narration = tx.get("narration", "Unknown Narration").strip()
    category = tx.get("category", "Others")
    debit = float(tx.get("debit", 0.0) or 0.0)
    credit = float(tx.get("credit", 0.0) or 0.0)
    
    if debit > 0:
        tx_type = "debit (expense)"
        amount = debit
    else:
        tx_type = "credit (income)"
        amount = credit
        
    recurring_str = " (marked as recurring subscription/EMI)" if tx.get("is_recurring", 0) == 1 else ""
    anomaly_str = " (flagged as outlier/anomaly)" if tx.get("is_anomaly", 0) == 1 else ""

    return (
        f"On {date}, there was a {tx_type} transaction of {amount:.2f} INR with narration '{narration}' "
        f"categorized as '{category}'{recurring_str}{anomaly_str}."
    )

def rebuild_vector_store(user_id: int) -> bool:
    """
    Fetches all transactions for a user from DB, formats them, rebuilds the vector store, 
    and saves to Pinecone or local FAISS.
    """
    transactions = get_all_transactions(user_id)
    namespace = f"user_{user_id}"
    
    # If no transactions exist, clear vector storage for user
    if not transactions:
        logger.info(f"No transactions found for user {user_id}. Clearing vector store.")
        # Pinecone clear
        index = get_pinecone_index()
        if index:
            try:
                index.delete(delete_all=True, namespace=namespace)
            except Exception as e:
                logger.error(f"Failed to clear Pinecone namespace {namespace}: {e}")
        # FAISS clear
        user_index_path = os.path.join(INDEX_BASE_PATH, f"faiss_index_user_{user_id}")
        if os.path.exists(user_index_path):
            import shutil
            try:
                shutil.rmtree(user_index_path)
            except Exception:
                pass
        return True
        
    documents = [format_transaction_to_text(tx) for tx in transactions]
    
    # Try Pinecone build
    index = get_pinecone_index()
    if index:
        try:
            # Delete old vectors
            try:
                index.delete(delete_all=True, namespace=namespace)
            except Exception:
                pass
                
            # Embed
            embeddings = embedding_model.embed_documents(documents)
            
            # Format Pinecone vectors
            vectors_to_upsert = []
            for idx, (doc, emb) in enumerate(zip(documents, embeddings)):
                vectors_to_upsert.append((
                    f"tx_{user_id}_{idx}",
                    emb,
                    {"text": doc}
                ))
            
            # Batch upsert
            for i in range(0, len(vectors_to_upsert), 100):
                chunk = vectors_to_upsert[i:i+100]
                index.upsert(vectors=chunk, namespace=namespace)
                
            logger.info(f"Successfully uploaded {len(documents)} vectors to Pinecone namespace {namespace}")
            return True
        except Exception as e:
            logger.error(f"Pinecone build failed for user {user_id}: {e}. Falling back to FAISS.")
            
    # Fallback to FAISS build
    user_index_path = os.path.join(INDEX_BASE_PATH, f"faiss_index_user_{user_id}")
    try:
        vectorstore = FAISS.from_texts(
            documents,
            embedding_model
        )
        vectorstore.save_local(user_index_path)
        logger.info(f"Successfully saved FAISS index to {user_index_path}")
        return True
    except Exception as e:
        logger.error(f"FAISS build failed for user {user_id}: {e}")
        return False