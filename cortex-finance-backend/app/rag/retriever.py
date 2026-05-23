import os
import logging
from langchain_community.vectorstores import FAISS
from app.rag.vector_store import embedding_model, INDEX_PATH

logger = logging.getLogger("retriever")

def load_local_vector_store() -> FAISS | None:
    """Loads the locally saved FAISS vector store if it exists."""
    if not os.path.exists(INDEX_PATH) or not embedding_model:
        return None
    try:
        # allow_dangerous_deserialization=True is safe here as this is a local FAISS index
        # generated entirely by our own backend from our SQLite database.
        return FAISS.load_local(
            INDEX_PATH, 
            embedding_model, 
            allow_dangerous_deserialization=True
        )
    except Exception as e:
        logger.error(f"Error loading FAISS index: {e}")
        return None

def retrieve_context(query: str, k: int = 10) -> str:
    """
    Queries the FAISS index to find the top k most semantically relevant 
    transaction records corresponding to the user's inquiry.
    
    Returns:
    - A compiled string containing the formatted transaction details, or a 
      graceful default message if no vector store is available.
    """
    vector_store = load_local_vector_store()
    if not vector_store:
        return "No transaction history has been indexed yet."
        
    try:
        docs = vector_store.similarity_search(query, k=k)
        if not docs:
            return "No matching transactions found."
            
        context_lines = [doc.page_content for doc in docs]
        return "\n".join(context_lines)
    except Exception as e:
        logger.error(f"Error executing similarity search: {e}")
        return "Failed to query the transaction history index."
