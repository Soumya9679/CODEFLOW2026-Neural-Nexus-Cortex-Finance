import os
import google.generativeai as genai
from app.ai.gemini_classifier import api_key

# Configure Gemini if key is available
if api_key:
    genai.configure(api_key=api_key)

def generate_financial_insights(analytics_data: dict) -> list[str]:
    """
    Generates actionable financial insights and budgeting advice based on 
    dashboard analytics.
    
    If Gemini API key is missing or calls fail, uses a rules-based fallback engine.
    """
    # 1. Rules-based Fallback Generator
    def get_rules_based_insights():
        insights = []
        income = analytics_data.get("income", 0)
        expense = analytics_data.get("expense", 0)
        savings_rate = analytics_data.get("savings_rate", 0)
        categories = analytics_data.get("categories", {})
        anomalies = analytics_data.get("anomalies", [])
        recurring = analytics_data.get("recurring_payments", [])
        score = analytics_data.get("score", 50)

        # Health score insights
        if score < 40:
            insights.append("🔴 Your financial health score is critical. Prioritize building an emergency fund and cutting discretionary costs.")
        elif score < 70:
            insights.append("🟡 Your financial health is stable but has room for improvement. Aim to save at least 20% of your income.")
        else:
            insights.append("🟢 Outstanding financial discipline! You have strong savings habits and a healthy expense ratio.")

        # Savings rate insights
        if savings_rate < 0:
            insights.append(f"⚠️ Warning: Overspending detected. You spent {abs(savings_rate):.1f}% more than you earned this period.")
        elif savings_rate > 30:
            insights.append(f"💰 Excellent savings rate of {savings_rate:.1f}%. Consider diverting some savings into high-yield investments.")

        # Discretionary spending alerts
        discretionary_categories = ["Shopping", "Entertainment", "Subscriptions"]
        discretionary_spend = sum(categories.get(cat, 0) for cat in discretionary_categories)
        if expense > 0:
            disc_ratio = discretionary_spend / expense
            if disc_ratio > 0.4:
                insights.append(f"🛍️ Discretionary spending (Shopping, Entertainment, Subscriptions) makes up {disc_ratio*100:.1f}% of your total expenses. Consider scaling back.")

        # Anomalies
        if anomalies:
            top_anomaly = anomalies[0]
            insights.append(f"🔍 Unusual spending detected: {top_anomaly.get('narration')} on {top_anomaly.get('date')} for {top_anomaly.get('amount')} INR is significantly higher than your typical average.")

        # Recurring subscription checklist
        if recurring:
            total_recurring = sum(rec.get("average_amount", 0) for rec in recurring)
            insights.append(f"🔄 You have {len(recurring)} active subscription(s) / EMI(s) totaling roughly {total_recurring:.2f} INR. Periodically audit them to prune unused items.")

        # Catch-all if insights are sparse
        if len(insights) < 2:
            insights.append("💡 Keep track of your monthly statements regularly to maintain a clear picture of your cash flows.")
            
        return insights

    # 2. Check if Gemini API is configured
    if not api_key:
        return get_rules_based_insights()

    try:
        prompt = f"""
You are an expert financial advisor and planner. 
Analyze the following financial analytics data and generate a list of exactly 4 actionable, highly personalized financial insights, savings suggestions, or budgeting tips for the user.

Financial Data:
- Total Income: {analytics_data.get("income")} INR
- Total Expenses: {analytics_data.get("expense")} INR
- Net Savings: {analytics_data.get("savings")} INR
- Savings Rate: {analytics_data.get("savings_rate")}%
- Financial Health Score: {analytics_data.get("score")}/100
- Spending by Category: {analytics_data.get("categories")}
- Top Merchant Spending: {analytics_data.get("merchant_rankings")}
- Outlier Anomalies: {analytics_data.get("anomalies")}
- Recurring Subscriptions/EMIs: {analytics_data.get("recurring_payments")}

Instructions:
- Provide exactly 4 bulleted insights.
- Keep each insight brief, encouraging, and direct (max 2 sentences per bullet point).
- Emphasize specific issues like high discretionary spending, recurring charges, low savings rate, or anomalous transactions if present.
- Do not return any conversational intro or outro text, only return the list of bullet points starting with standard icons (like 💰, ⚠️, 🔴, 🟢, 🛍️, 🔄).
"""
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        
        # Parse output into clean lines
        lines = [line.strip().lstrip("-* ").strip() for line in response.text.strip().split("\n") if line.strip()]
        # Fall back to rules-based if output formatting is wrong
        return lines if len(lines) >= 2 else get_rules_based_insights()
        
    except Exception as e:
        print(f"Error generating insights with Gemini: {e}")
        return get_rules_based_insights()
