import os
import logging
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from app.database.db import get_all_transactions

# Disable Hugging Face telemetry warnings
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

logger = logging.getLogger("vector_store")
INDEX_PATH = os.path.join(os.path.dirname(__file__), "faiss_index")

# Initialize Hugging Face embeddings using a lightweight, fast model
try:
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
except Exception as e:
    logger.error(f"Failed to load Hugging Face embedding model: {e}")
    embedding_model = None

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

def create_vector_store(documents: list[str]) -> FAISS | None:
    """Creates a FAISS vector store from a list of document strings and saves it locally."""
    if not documents or not embedding_model:
        return None
        
    try:
        vectorstore = FAISS.from_texts(
            documents,
            embedding_model
        )
        vectorstore.save_local(INDEX_PATH)
        return vectorstore
    except Exception as e:
        logger.error(f"Error creating/saving FAISS vector store: {e}")
        return None

def rebuild_vector_store() -> bool:
    """
    Fetches all transactions from DB, formats them, rebuilds the vector store, 
    and saves the FAISS index locally.
    
    Returns:
    - True if successfully rebuilt, False otherwise.
    """
    transactions = get_all_transactions()
    if not transactions:
        logger.info("No transactions found to index in vector store.")
        # If vector store files exist, remove them to keep index in sync with empty DB
        if os.path.exists(INDEX_PATH):
            import shutil
            try:
                shutil.rmtree(INDEX_PATH)
            except Exception:
                pass
        return False
        
    documents = [format_transaction_to_text(tx) for tx in transactions]
    store = create_vector_store(documents)
    return store is not None