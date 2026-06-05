import os
import logging
from app.tasks.celery_app import celery_app
from app.services.pdf_parser import extract_transactions as parse_pdf
from app.services.csv_parser import extract_transactions_csv as parse_csv
from app.services.category_mapper import categorize_transaction
from app.ai.gemini_classifier import classify_transactions_gemini
from app.services.anomaly_detector import detect_anomalies
from app.services.recurring_detector import detect_recurring_payments
from app.database.db import save_transactions, clear_db, save_recurring_patterns
from app.rag.vector_store import rebuild_vector_store
from app.utils.cache import global_cache

logger = logging.getLogger("celery_worker")

@celery_app.task(bind=True, name="app.tasks.worker.process_statement_task")
def process_statement_task(self, user_id: int, file_path: str, filename: str, ext: str):
    logger.info(f"Starting async processing for user {user_id}, file {filename}")
    self.update_state(state="PROGRESS", meta={"status": "Parsing statement file..."})
    
    try:
        if ext == ".pdf":
            transactions = parse_pdf(file_path)
        else:
            transactions = parse_csv(file_path)
    except Exception as e:
        logger.error(f"Error parsing statement: {e}")
        self.update_state(state="FAILURE", meta={"detail": f"Failed to parse statement: {str(e)}"})
        if os.path.exists(file_path):
            os.remove(file_path)
        raise e

    if not transactions:
        self.update_state(state="FAILURE", meta={"detail": "No valid transactions could be extracted."})
        if os.path.exists(file_path):
            os.remove(file_path)
        return {"success": False, "detail": "Empty transaction list."}

    self.update_state(state="PROGRESS", meta={"status": "Categorizing transactions..."})
    unmapped_narrations = []
    for tx in transactions:
        category = categorize_transaction(tx.get("narration", ""))
        tx["category"] = category
        if category == "Others":
            unmapped_narrations.append(tx.get("narration", ""))

    if unmapped_narrations:
        try:
            ai_categories = classify_transactions_gemini(unmapped_narrations)
            for tx in transactions:
                if tx["category"] == "Others":
                    tx["category"] = ai_categories.get(tx["narration"], "Others")
        except Exception as e:
            logger.error(f"Gemini fallback classification error: {e}")

    # 3. Detect Anomalies & Outliers
    self.update_state(state="PROGRESS", meta={"status": "Detecting anomalies..."})
    try:
        debits = []
        for i, tx in enumerate(transactions):
            debit_amt = float(tx.get("debit", 0.0) or 0.0)
            if debit_amt > 0:
                debits.append({
                    "index": i,
                    "amount": debit_amt,
                    "narration": tx.get("narration", "")
                })
        
        flagged_anomalies = detect_anomalies(debits)
        anomaly_indices = {a["index"] for a in flagged_anomalies if "index" in a}
        
        for i, tx in enumerate(transactions):
            tx["is_anomaly"] = 1 if i in anomaly_indices else 0
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        for tx in transactions:
            tx["is_anomaly"] = 0

    # 4. Detect Recurring Payments
    self.update_state(state="PROGRESS", meta={"status": "Detecting recurring patterns..."})
    recurring_patterns = []
    try:
        detector_input = []
        for i, tx in enumerate(transactions):
            debit_amt = float(tx.get("debit", 0.0) or 0.0)
            credit_amt = float(tx.get("credit", 0.0) or 0.0)
            detector_input.append({
                "index": i,
                "date": tx.get("date"),
                "amount": debit_amt if debit_amt > 0 else credit_amt,
                "narration": tx.get("narration", ""),
                "type": "debit" if debit_amt > 0 else "credit"
            })
        
        recurring_patterns = detect_recurring_payments(detector_input)
        recurring_narrations = {p["narration"] for p in recurring_patterns}
        
        for tx in transactions:
            tx["is_recurring"] = 1 if tx.get("narration") in recurring_narrations else 0
    except Exception as e:
        logger.error(f"Recurring detection error: {e}")
        for tx in transactions:
            tx["is_recurring"] = 0

    # 5. Database Persistence (scoped to user)
    self.update_state(state="PROGRESS", meta={"status": "Saving transaction data..."})
    try:
        clear_db(user_id)
        save_transactions(transactions, filename, user_id)
        if recurring_patterns:
            save_recurring_patterns(recurring_patterns, user_id)
    except Exception as e:
        logger.error(f"Database save error: {e}")
        if os.path.exists(file_path):
            os.remove(file_path)
        raise e

    # 6. Rebuild RAG Vector Store
    self.update_state(state="PROGRESS", meta={"status": "Building AI chatbot index..."})
    try:
        rebuild_vector_store(user_id)
    except Exception as e:
        logger.error(f"Vector store build error: {e}")

    # 7. Invalidate Caches
    try:
        global_cache.delete(f"dashboard_{user_id}")
        global_cache.delete(f"insights_{user_id}")
        global_cache.delete(f"summary_{user_id}")
    except Exception as e:
        logger.error(f"Cache invalidation error: {e}")

    # Clean up uploaded local file to save space
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass

    return {
        "success": True,
        "filename": filename,
        "transaction_count": len(transactions)
    }
