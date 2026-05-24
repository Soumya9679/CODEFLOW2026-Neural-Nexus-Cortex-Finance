from app.database.db import get_all_transactions
from collections import defaultdict
from app.services.anomaly_detector import detect_anomalies
from app.services.recurring_detector import detect_recurring_payments

def generate_dashboard_data(user_id: int) -> dict:
    """
    Calculates detailed financial analytics from database transactions for a specific user.
    
    Returns:
    - income: Total credit amount.
    - expense: Total debit amount.
    - savings: Net savings (income - expense).
    - savings_rate: Percentage of income saved.
    - score: Dynamic Financial Health Score (0-100).
    - categories: Category-wise spending breakdown.
    - merchant_rankings: Top merchants/narrations by debit amount.
    - monthly_trend: Monthly breakdown of credits vs debits.
    - anomalies: Flagged anomalous transactions.
    - recurring_payments: Detected recurring subscriptions and EMIs.
    """
    transactions = get_all_transactions(user_id)
    
    # Defaults for empty database
    default_data = {
        "income": 0.0,
        "expense": 0.0,
        "savings": 0.0,
        "savings_rate": 0.0,
        "score": 50.0,
        "categories": {},
        "merchant_rankings": [],
        "monthly_trend": {},
        "anomalies": [],
        "recurring_payments": []
    }
    
    if not transactions:
        return default_data

    total_income = 0.0
    total_expense = 0.0
    category_spending = defaultdict(float)
    merchant_spending = defaultdict(float)
    monthly_stats = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    
    # Process transactions for basic statistics
    detector_txs = []  # formatted list of txs for anomaly/recurring detectors
    
    for tx in transactions:
        try:
            debit = float(tx.get("debit", 0.0) or 0.0)
            credit = float(tx.get("credit", 0.0) or 0.0)
            amount = credit - debit  # Net amount (positive is credit, negative is debit)
            
            total_income += credit
            total_expense += debit
            
            # Format date for monthly trend (YYYY-MM)
            date_str = tx.get("date", "")
            if len(date_str) >= 7:
                month_key = date_str[:7]  # Extract YYYY-MM
                monthly_stats[month_key]["income"] += credit
                monthly_stats[month_key]["expense"] += debit
            
            category = tx.get("category", "Others")
            if debit > 0:
                category_spending[category] += debit
                merchant_spending[tx.get("narration", "Unknown")] += debit
                
            # Prepare transaction dict for detectors (using positive amount for debit)
            detector_txs.append({
                "id": tx.get("id"),
                "date": date_str,
                "amount": debit if debit > 0 else credit,
                "narration": tx.get("narration"),
                "type": "debit" if debit > 0 else "credit",
                "category": category
            })
        except Exception:
            continue

    net_savings = total_income - total_expense
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0.0
    
    # Calculate Dynamic Financial Health Score (0 to 100)
    score = 50.0
    if total_income > 0:
        # Savings Rate contribution (max +30 or negative impact)
        if savings_rate > 0:
            score += min(savings_rate * 0.6, 30.0)
        else:
            score += max(savings_rate * 0.5, -30.0)
            
        # Debt-to-Income / Expense-to-Income ratio contribution
        expense_ratio = total_expense / total_income
        if expense_ratio < 0.4:
            score += 15.0
        elif expense_ratio < 0.6:
            score += 10.0
        elif expense_ratio > 0.9:
            score -= 15.0
    else:
        # No income: penalty
        score -= 20.0

    # Discretionary spending penalty
    discretionary_categories = {"Shopping", "Entertainment", "Subscriptions"}
    discretionary_spend = sum(category_spending[c] for c in discretionary_categories)
    if total_expense > 0:
        discretionary_pct = (discretionary_spend / total_expense) * 100
        if discretionary_pct > 45.0:
            score -= min((discretionary_pct - 45.0) * 0.5, 15.0)
            
    # Clamp score between 0 and 100
    score = max(0.0, min(100.0, score))

    # Format merchant rankings (Top 5)
    sorted_merchants = sorted(merchant_spending.items(), key=lambda x: x[1], reverse=True)
    merchant_rankings = [
        {"merchant": merchant, "amount": round(amount, 2)}
        for merchant, amount in sorted_merchants[:5]
    ]

    # Run detectors
    # Filter for debits only when detecting anomalies to focus on unusual expenses
    debit_detector_txs = [t for t in detector_txs if t["type"] == "debit"]
    anomalies = detect_anomalies(debit_detector_txs)
    recurring_payments = detect_recurring_payments(detector_txs)

    return {
        "income": round(total_income, 2),
        "expense": round(total_expense, 2),
        "savings": round(net_savings, 2),
        "savings_rate": round(savings_rate, 2),
        "score": round(score, 1),
        "categories": {cat: round(amt, 2) for cat, amt in category_spending.items()},
        "merchant_rankings": merchant_rankings,
        "monthly_trend": {month: {"income": round(data["income"], 2), "expense": round(data["expense"], 2)} for month, data in monthly_stats.items()},
        "anomalies": anomalies,
        "recurring_payments": recurring_payments
    }