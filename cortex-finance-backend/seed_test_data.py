import os
import sys

# Add the current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.db import save_transactions, clear_db
from app.rag.vector_store import rebuild_vector_store

def seed(user_id: int = 1):
    dummy_transactions = [
        # Income
        {"date": "2026-05-01", "narration": "MONTHLY SALARY / INITECH CORP", "debit": 0.0, "credit": 95000.0, "balance": 95000.0, "category": "Salary"},
        
        # Groceries
        {"date": "2026-05-02", "narration": "UPI-SWIGGY INSTAMART-BANGALORE", "debit": 1450.0, "credit": 0.0, "balance": 93550.0, "category": "Food"},
        {"date": "2026-05-15", "narration": "UPI-SWIGGY INSTAMART-BANGALORE", "debit": 1200.0, "credit": 0.0, "balance": 62350.0, "category": "Food"},
        
        # Subscriptions (Recurring)
        {"date": "2026-05-03", "narration": "NETFLIX CARD PAYMENT SG", "debit": 649.0, "credit": 0.0, "balance": 92901.0, "category": "Subscriptions"},
        
        # Rent (Recurring)
        {"date": "2026-05-05", "narration": "FT-RENT TRANSFER TO RAJESH", "debit": 22000.0, "credit": 0.0, "balance": 70901.0, "category": "Rent"},
        
        # Utilities
        {"date": "2026-05-07", "narration": "ACH-BESCOM ELECTRICITY BILL", "debit": 3200.0, "credit": 0.0, "balance": 67701.0, "category": "Utilities"},
        
        # Shopping
        {"date": "2026-05-10", "narration": "AMZN-AMAZON PAYMENTS INDIA", "debit": 4500.0, "credit": 0.0, "balance": 63201.0, "category": "Shopping"},
        
        # Entertainment
        {"date": "2026-05-12", "narration": "BOOKMYSHOW TICKETS MUMBAI", "debit": 850.0, "credit": 0.0, "balance": 62351.0, "category": "Entertainment"},
        
        # Travel
        {"date": "2026-05-18", "narration": "OLA CABS RIDE BANGALORE", "debit": 450.0, "credit": 0.0, "balance": 61900.0, "category": "Travel"},
        
        # Anomaly (Huge Expense)
        {"date": "2026-05-20", "narration": "JEWELLERY PURCHASE GOLD SPARKLE", "debit": 48000.0, "credit": 0.0, "balance": 13900.0, "category": "Shopping"},
    ]

    # Flag recurring and anomalies manually for tests or let it be 
    for tx in dummy_transactions:
        tx["is_recurring"] = 1 if tx["category"] in ["Subscriptions", "Rent"] else 0
        tx["is_anomaly"] = 1 if tx["debit"] >= 30000.0 else 0

    print(f"Clearing database for user {user_id}...")
    clear_db(user_id)
    
    print(f"Saving test transactions for user {user_id}...")
    save_transactions(dummy_transactions, "test_statement.csv", user_id)
    
    print(f"Rebuilding vector store for user {user_id}...")
    rebuild_vector_store(user_id)
    
    print("Done seeding test data!")

if __name__ == "__main__":
    # Can pass user_id via arguments
    u_id = 1
    if len(sys.argv) > 1:
        try:
            u_id = int(sys.argv[1])
        except ValueError:
            pass
    seed(u_id)
