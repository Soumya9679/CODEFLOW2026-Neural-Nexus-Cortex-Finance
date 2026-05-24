from fastapi import APIRouter
from app.services.analytics import generate_dashboard_data
from app.ai.insight_generator import generate_financial_insights
from app.ai.summary_generator import generate_financial_summary

router = APIRouter()

@router.get("/insights")
def get_insights():
    analytics_data = generate_dashboard_data()
    insights = generate_financial_insights(analytics_data)
    return {
        "insights": insights
    }

@router.get("/summary")
def get_summary():
    analytics_data = generate_dashboard_data()
    summary = generate_financial_summary(analytics_data)
    return {
        "summary": summary
    }
