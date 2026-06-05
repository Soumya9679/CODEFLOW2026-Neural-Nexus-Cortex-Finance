from fastapi import APIRouter, Depends
from app.services.analytics import generate_dashboard_data
from app.database.db import get_all_transactions
from app.utils.auth import get_current_user
from app.utils.cache import global_cache

router = APIRouter()

@router.get("/dashboard")
def dashboard(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    cache_key = f"dashboard_{user_id}"
    
    cached_data = global_cache.get(cache_key)
    if cached_data is not None:
        return cached_data
        
    data = generate_dashboard_data(user_id)
    global_cache.set(cache_key, data)
    return data

@router.get("/transactions")
def get_transactions(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    txs = get_all_transactions(user_id)
    return {"transactions": txs}
