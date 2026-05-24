from fastapi import APIRouter, Depends
from app.services.analytics import generate_dashboard_data
from app.database.db import get_all_transactions
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
def dashboard(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    data = generate_dashboard_data(user_id)
    return data

@router.get("/transactions")
def get_transactions(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    txs = get_all_transactions(user_id)
    return {"transactions": txs}
