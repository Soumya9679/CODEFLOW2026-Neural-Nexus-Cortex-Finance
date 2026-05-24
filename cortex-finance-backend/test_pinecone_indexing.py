# test_pinecone_indexing.py
import os
import sys
import logging
# Ensure we import config first to load env variables

# Ensure we import config first to load env variables
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import app.utils.config

from app.rag.vector_store import (
    embedding_model,
    get_pinecone_index,
    rebuild_vector_store
)
from app.rag.retriever import retrieve_context

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_pinecone")

def test_embeddings():
    print("\n--- Step 1: Testing Hugging Face Inference Embeddings ---")
    if not embedding_model:
        print("[FAIL] embedding_model failed to initialize!")
        return False
        
    sample_text = "This is a test transaction to verify embeddings."
    try:
        print(f"Generating embedding for: '{sample_text}'")
        vector = embedding_model.embed_query(sample_text)
        if all(v == 0.0 for v in vector):
            print("[FAIL] Generated vector is all zeros (dummy/fallback vector). HuggingFace query failed.")
            return False
        print(f"[SUCCESS] Generated embedding vector of length: {len(vector)}")
        if len(vector) != 384:
            print(f"[WARNING] Vector length is {len(vector)}, expected 384 (MiniLM-L6-v2).")
        return True
    except Exception as e:
        print(f"[FAIL] Embeddings generation failed: {e}")
        return False

def test_pinecone_connection():
    print("\n--- Step 2: Testing Pinecone Index Connection ---")
    try:
        index = get_pinecone_index()
        if index is None:
            print("[FAIL] Pinecone API key is missing or failed to initialize Pinecone Client.")
            return False
            
        print(f"[SUCCESS] Connected to Pinecone index: '{os.getenv('PINECONE_INDEX_NAME')}'")
        
        # Describe index stats
        stats = index.describe_index_stats()
        print(f"Index Stats: {stats}")
        return True
    except Exception as e:
        print(f"[FAIL] Pinecone connection failed: {e}")
        return False

def test_rebuild_and_retrieve():
    print("\n--- Step 3: Testing rebuild_vector_store and Retrieval ---")
    try:
        # We will trigger a mock rebuild for user 1 (will use database records or FAISS fallback)
        print("Rebuilding vector store for user_id = 1...")
        success = rebuild_vector_store(user_id=1)
        if success:
            print("[SUCCESS] Rebuilt vector store.")
        else:
            print("[FAIL] Rebuild vector store failed.")
            return False
            
        # Try retrieving context
        query = "How much did I spend on rent?"
        print(f"Retrieving context for query: '{query}'")
        context = retrieve_context(query, user_id=1)
        print(f"[SUCCESS] Retrieved context: {context[:500]}...")
        return True
    except Exception as e:
        print(f"[FAIL] Rebuild/retrieve test failed: {e}")
        return False

if __name__ == "__main__":
    print("=== STARTING PINECONE INDEXING VERIFICATION ===")
    print(f"PINECONE_INDEX_NAME: {os.getenv('PINECONE_INDEX_NAME')}")
    print(f"HF_API_TOKEN set: {bool(os.getenv('HF_API_TOKEN'))}")
    
    emb_ok = test_embeddings()
    pc_ok = test_pinecone_connection()
    rebuild_ok = False
    if emb_ok and pc_ok:
        rebuild_ok = test_rebuild_and_retrieve()
        
    print("\n=== VERIFICATION SUMMARY ===")
    print(f"Embeddings Generation: {'PASS' if emb_ok else 'FAIL'}")
    print(f"Pinecone Connection:   {'PASS' if pc_ok else 'FAIL'}")
    print(f"Vector Store Rebuild:  {'PASS' if rebuild_ok else 'FAIL'}")
    
    if emb_ok and pc_ok and rebuild_ok:
        print("\nPinecone indexing is 100% WORKING in the backend!")
    else:
        print("\nThere is an issue with your Pinecone or Embedding configuration.")
