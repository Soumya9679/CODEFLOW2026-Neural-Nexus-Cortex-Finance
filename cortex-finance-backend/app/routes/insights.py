from fastapi import APIRouter, Depends
from app.services.analytics import generate_dashboard_data
from app.ai.insight_generator import generate_financial_insights
from app.ai.summary_generator import generate_financial_summary
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/insights")
def get_insights(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    analytics_data = generate_dashboard_data(user_id)
    insights = generate_financial_insights(analytics_data)
    return {
        "insights": insights
    }

@router.get("/summary")
def get_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    analytics_data = generate_dashboard_data(user_id)
    summary = generate_financial_summary(analytics_data)
    return {
        "summary": summary
    }
