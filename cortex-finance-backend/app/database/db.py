import sqlite3
import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.getenv("DATABASE_URL", "")
IS_POSTGRES = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "cortex_finance.db")

def get_db_connection():
    """Establishes and returns a database connection based on the configured engine."""
    if IS_POSTGRES:
        # Standard connection to Postgres
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    else:
        # Fallback to SQLite
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

def get_db_cursor(conn):
    """Returns a cursor that returns rows as dictionaries/dict-like objects."""
    if IS_POSTGRES:
        return conn.cursor(cursor_factory=RealDictCursor)
    else:
        return conn.cursor()

def format_query(query: str) -> str:
    """Formats placeholders for the active database engine."""
    if IS_POSTGRES:
        return query.replace("?", "%s")
    return query

def init_db():
    """Initializes the database schema and creates tables if they do not exist."""
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    
    # Create users table and transactions table
    if IS_POSTGRES:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                date VARCHAR(20) NOT NULL,
                narration TEXT NOT NULL,
                debit REAL DEFAULT 0.0,
                credit REAL DEFAULT 0.0,
                balance REAL DEFAULT 0.0,
                category VARCHAR(100) DEFAULT 'Others',
                is_recurring INTEGER DEFAULT 0,
                is_anomaly INTEGER DEFAULT 0,
                filename VARCHAR(255) NOT NULL
            )
        """)
    else:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

def clear_db(user_id: int):
    """Deletes all transaction records belonging to a specific user."""
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    query = format_query("DELETE FROM transactions WHERE user_id = ?")
    cursor.execute(query, (user_id,))
    conn.commit()
    conn.close()

def save_transactions(transactions, filename, user_id: int):
    """Bulk inserts transaction records mapped to a user_id."""
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    
    query = """
        INSERT INTO transactions (user_id, date, narration, debit, credit, balance, category, is_recurring, is_anomaly, filename)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    insert_query = format_query(query)
    
    data_to_insert = [
        (
            user_id,
            t.get("date"),
            t.get("narration"),
            t.get("debit", 0.0) or 0.0,
            t.get("credit", 0.0) or 0.0,
            t.get("balance", 0.0) or 0.0,
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

def get_all_transactions(user_id: int):
    """Retrieves all transaction records belonging to a specific user."""
    init_db()  # Ensure database and table are initialized before query
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    query = format_query("SELECT * FROM transactions WHERE user_id = ? ORDER BY date ASC")
    cursor.execute(query, (user_id,))
    rows = cursor.fetchall()
    
    # Convert rows to plain dictionaries
    transactions = [dict(row) for row in rows]
    conn.close()
    return transactions

def create_user(name: str, email: str, password_hash: str) -> int:
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    
    if IS_POSTGRES:
        query = """
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s) RETURNING id
        """
        cursor.execute(query, (name, email, password_hash))
        user_id = cursor.fetchone()["id"]
    else:
        query = """
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
        """
        cursor.execute(query, (name, email, password_hash))
        user_id = cursor.lastrowid
        
    conn.commit()
    conn.close()
    return user_id

def get_user_by_email(email: str) -> dict | None:
    init_db()
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    query = format_query("SELECT * FROM users WHERE email = ?")
    cursor.execute(query, (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: int) -> dict | None:
    init_db()
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    query = format_query("SELECT * FROM users WHERE id = ?")
    cursor.execute(query, (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
