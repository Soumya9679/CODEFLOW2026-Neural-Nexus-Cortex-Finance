from fastapi import APIRouter
from app.services.analytics import generate_dashboard_data
from app.database.db import get_all_transactions

router = APIRouter()


@router.get("/dashboard")
def dashboard():
    data = generate_dashboard_data()
    return data


@router.get("/transactions")
def get_transactions():
    """Retrieves all transactions from the SQLite database."""
    txs = get_all_transactions()
    return {"transactions": txs}