import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "cortex_finance.db")

def get_db_connection():
    """Establishes and returns a database connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema and creates tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create transactions table
    # Security note: Schema matches strict constraints, using parameterized queries.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            narration TEXT NOT NULL,
            debit REAL DEFAULT 0.0,
            credit REAL DEFAULT 0.0,
            balance REAL DEFAULT 0.0,
            category TEXT DEFAULT 'Others',
            is_recurring INTEGER DEFAULT 0,
            is_anomaly INTEGER DEFAULT 0,
            filename TEXT NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()

def clear_db():
    """Deletes all records from the database for a clean state."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM transactions")
    conn.commit()
    conn.close()

def save_transactions(transactions, filename):
    """
    Bulk inserts transaction records using parameterized queries.
    
    Security: Uses parameterized queries to prevent SQL Injection.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    insert_query = """
        INSERT INTO transactions (date, narration, debit, credit, balance, category, is_recurring, is_anomaly, filename)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data_to_insert = [
        (
            t.get("date"),
            t.get("narration"),
            t.get("debit", 0.0),
            t.get("credit", 0.0),
            t.get("balance", 0.0),
            t.get("category", "Others"),
            t.get("is_recurring", 0),
            t.get("is_anomaly", 0),
            filename
        )
        for t in transactions
    ]
    
    cursor.executemany(insert_query, data_to_insert)
    conn.commit()
    conn.close()

def get_all_transactions():
    """Retrieves all transaction records from the database."""
    init_db()  # Ensure database and table are initialized before query
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions ORDER BY date ASC")
    rows = cursor.fetchall()
    
    # Convert sqlite3.Row objects to dictionaries
    transactions = [dict(row) for row in rows]
    conn.close()
    return transactions

