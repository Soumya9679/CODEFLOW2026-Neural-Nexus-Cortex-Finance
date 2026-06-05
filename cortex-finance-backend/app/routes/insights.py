from fastapi import APIRouter, Depends
from app.services.analytics import generate_dashboard_data
from app.ai.insight_generator import generate_financial_insights
from app.ai.summary_generator import generate_financial_summary
from app.utils.auth import get_current_user
from app.utils.cache import global_cache

router = APIRouter()

@router.get("/insights")
def get_insights(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    cache_key = f"insights_{user_id}"
    
    cached_insights = global_cache.get(cache_key)
    if cached_insights is not None:
        return {"insights": cached_insights}
        
    analytics_data = generate_dashboard_data(user_id)
    insights = generate_financial_insights(analytics_data)
    global_cache.set(cache_key, insights)
    return {
        "insights": insights
    }

@router.get("/summary")
def get_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    cache_key = f"summary_{user_id}"
    
    cached_summary = global_cache.get(cache_key)
    if cached_summary is not None:
        return {"summary": cached_summary}
        
    analytics_data = generate_dashboard_data(user_id)
    summary = generate_financial_summary(analytics_data)
    global_cache.set(cache_key, summary)
    return {
        "summary": summary
    }
