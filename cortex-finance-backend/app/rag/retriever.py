import os
import logging
from langchain_community.vectorstores import FAISS
from app.rag.vector_store import embedding_model, INDEX_BASE_PATH, get_pinecone_index

logger = logging.getLogger("retriever")

def retrieve_context(query: str, user_id: int, k: int = 10) -> str:
    namespace = f"user_{user_id}"
    
    # 1. Try Pinecone query first
    index = get_pinecone_index()
    if index:
        try:
            query_vector = embedding_model.embed_query(query)
            results = index.query(
                vector=query_vector,
                top_k=k,
                include_metadata=True,
                namespace=namespace
            )
            matches = results.get("matches", [])
            if matches:
                context_lines = [match.get("metadata", {}).get("text", "") for match in matches if match.get("metadata")]
                context_lines = [line for line in context_lines if line]
                if context_lines:
                    return "\n".join(context_lines)
        except Exception as e:
            logger.error(f"Pinecone query failed for user {user_id}: {e}. Falling back to FAISS.")
            
    # 2. Fallback to local FAISS index
    user_index_path = os.path.join(INDEX_BASE_PATH, f"faiss_index_user_{user_id}")
    if not os.path.exists(user_index_path) or not embedding_model:
        return "No transaction history has been indexed yet."
        
    try:
        # allow_dangerous_deserialization=True is safe here as this is a local FAISS index
        # generated entirely by our own backend from our database.
        vector_store = FAISS.load_local(
            user_index_path, 
            embedding_model, 
            allow_dangerous_deserialization=True
        )
        docs = vector_store.similarity_search(query, k=k)
        if not docs:
            return "No matching transactions found."
            
        context_lines = [doc.page_content for doc in docs]
        return "\n".join(context_lines)
    except Exception as e:
        logger.error(f"Error executing similarity search: {e}")
        return "Failed to query the transaction history index."
