import os
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_parser import extract_transactions as parse_pdf
from app.services.csv_parser import extract_transactions_csv as parse_csv
from app.services.category_mapper import categorize_transaction
from app.ai.gemini_classifier import classify_transactions_gemini
from app.services.anomaly_detector import detect_anomalies
from app.services.recurring_detector import detect_recurring_payments
from app.database.db import save_transactions, clear_db
from app.rag.vector_store import rebuild_vector_store

logger = logging.getLogger("upload_route")
router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
 
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".pdf", ".csv"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Only bank statements in PDF or CSV format are accepted."
        )

    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Error saving uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save the uploaded statement file.")

    try:
        if ext == ".pdf":
            transactions = parse_pdf(file_path)
        else:
            transactions = parse_csv(file_path)
    except Exception as e:
        logger.error(f"Error parsing statement file {filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse transaction data from {ext.upper()} file.")

    if not transactions:
        raise HTTPException(
            status_code=422,
            detail="No valid transactions could be extracted from this statement. Please check the file formatting."
        )

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
    try:
        # Prepare list of debit transactions to detect anomalies
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

    # 5. Database Persistence (Clearing previous data as we analyze a single statement at a time)
    try:
        clear_db()
        save_transactions(transactions, filename)
    except Exception as e:
        logger.error(f"Database save error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save transaction records into the database.")

    # 6. Rebuild RAG Vector Store
    try:
        rebuild_vector_store()
    except Exception as e:
        logger.error(f"Vector store build error: {e}")
        # Non-fatal error; user still gets parsed transactions database and dashboard metrics

    return {
        "success": True,
        "filename": filename,
        "transaction_count": len(transactions),
        "transactions": transactions[:10]  # Return preview of the first 10 transactions
    }