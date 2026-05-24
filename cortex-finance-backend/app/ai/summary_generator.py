import os
import google.generativeai as genai
from app.ai.gemini_classifier import api_key
from app.utils.ollama_client import is_ollama_available, get_ollama_llm

# Configure Gemini if key is available
if api_key:
    genai.configure(api_key=api_key)

def generate_financial_summary(analytics_data: dict) -> str:
    """
    Generates a high-level narrative summary of the user's financial profile.
    
    Prioritizes local Ollama (qwen2.5:1.5b); falls back to Gemini or rules-based summary.
    """
    income = analytics_data.get("income", 0.0)
    expense = analytics_data.get("expense", 0.0)
    savings = analytics_data.get("savings", 0.0)
    savings_rate = analytics_data.get("savings_rate", 0.0)
    categories = analytics_data.get("categories", {})
    anomalies = analytics_data.get("anomalies", [])
    recurring = analytics_data.get("recurring_payments", [])
    score = analytics_data.get("score", 50.0)

    def get_rules_based_summary():
        if income == 0 and expense == 0:
            return "No transactions have been uploaded or parsed yet. Upload a bank statement to generate your profile summary."

        top_category = "None"
        top_amount = 0.0
        if categories:
            sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
            top_category = sorted_cats[0][0]
            top_amount = sorted_cats[0][1]

        summary_text = (
            f"Your bank statement shows a total cash inflow of {income:,.2f} INR and a total cash outflow of {expense:,.2f} INR, "
            f"resulting in net savings of {savings:,.2f} INR with a savings rate of {savings_rate:.1f}%. "
            f"Your highest expenditure was in the '{top_category}' category, totaling {top_amount:,.2f} INR. "
        )

        if recurring:
            summary_text += f"We identified {len(recurring)} active recurring payments (such as subscriptions or EMIs). "
            
        if anomalies:
            summary_text += f"Additionally, there are {len(anomalies)} large transactions flagged as unusual outliers. "
            
        summary_text += f"Overall, your financial health score is rated at {score}/100."
        return summary_text

    if is_ollama_available():
        print("INFO: Local Ollama (qwen2.5:1.5b) is running. Using Ollama for financial summary.")
        try:
            llm = get_ollama_llm()
            prompt = f"""You are an expert financial analyst. Summarize this user's bank statement metrics into a single, cohesive, professional narrative paragraph (3-4 sentences max).

Financial Metrics:
- Total Income: {income} INR
- Total Expense: {expense} INR
- Net Savings: {savings} INR (Savings Rate: {savings_rate}%)
- Health Score: {score}/100
- Category Spend Breakdown: {categories}
- Anomalies Count: {len(anomalies)}
- Recurring Subscriptions Count: {len(recurring)}

Instructions:
- Write a professional, high-quality narrative paragraph.
- Address the general cash flow, top spending category, and overall health score rating.
- Do not use any introductory tags (like "Here is the summary:") or bullet points. Just return the raw paragraph.
"""
            response = llm.invoke(prompt)
            return response.strip()
        except Exception as e:
            print(f"Error using local Ollama for summary: {e}. Falling back to Gemini.")

    # 3. Try Gemini API
    if not api_key:
        return get_rules_based_summary()

    try:
        print("INFO: Local Ollama not available or failed. Falling back to Gemini for summary.")
        prompt = f"""
You are an expert financial analyst. Summarize this user's bank statement metrics into a single, cohesive, professional narrative paragraph (3-4 sentences max).

Financial Metrics:
- Total Income: {income} INR
- Total Expense: {expense} INR
- Net Savings: {savings} INR (Savings Rate: {savings_rate}%)
- Health Score: {score}/100
- Category Spend Breakdown: {categories}
- Anomalies Count: {len(anomalies)}
- Recurring Subscriptions Count: {len(recurring)}

Instructions:
- Write a professional, high-quality narrative paragraph.
- Address the general cash flow, top spending category, and overall health score rating.
- Do not use any introductory tags (like "Here is the summary:") or bullet points. Just return the raw paragraph.
"""
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"Error generating narrative summary with Gemini: {e}")
        return get_rules_based_summary()
