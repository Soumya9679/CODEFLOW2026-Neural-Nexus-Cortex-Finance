import sqlite3
import os
import psycopg2
import psycopg2.pool
from psycopg2.extras import RealDictCursor
import app.utils.config  # Loads .env variables first

DATABASE_URL = os.getenv("DATABASE_URL", "")
IS_POSTGRES = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "cortex_finance.db")

# Threaded connection pool for PostgreSQL
pg_pool = None

def init_pool():
    global pg_pool
    if IS_POSTGRES and not pg_pool:
        try:
            pg_pool = psycopg2.pool.ThreadedConnectionPool(5, 20, DATABASE_URL)
        except Exception as e:
            import logging
            logging.getLogger("db").error(f"Failed to initialize PostgreSQL connection pool: {e}")

class PoolConnectionWrapper:
    def __init__(self, conn, pool):
        self._conn = conn
        self._pool = pool

    def __getattr__(self, name):
        return getattr(self._conn, name)

    def cursor(self, *args, **kwargs):
        return self._conn.cursor(*args, **kwargs)

    def commit(self):
        return self._conn.commit()

    def rollback(self):
        return self._conn.rollback()

    def close(self):
        if self._pool and self._conn:
            try:
                self._pool.putconn(self._conn)
            except Exception:
                try:
                    self._conn.close()
                except Exception:
                    pass
            self._conn = None
            self._pool = None

def get_db_connection():
    """Establishes and returns a database connection based on the configured engine."""
    if IS_POSTGRES:
        if not pg_pool:
            init_pool()
        if pg_pool:
            try:
                conn = pg_pool.getconn()
                return PoolConnectionWrapper(conn, pg_pool)
            except Exception:
                pass
        return psycopg2.connect(DATABASE_URL)
    else:
        conn = sqlite3.connect(DB_PATH, timeout=30.0)
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA synchronous=NORMAL;")
            conn.execute("PRAGMA cache_size = -2000;")
            conn.execute("PRAGMA temp_store = MEMORY;")
        except Exception:
            pass
        return conn

def get_db_cursor(conn):
    """Returns a cursor that returns rows as dictionaries/dict-like objects."""
    if IS_POSTGRES:
        real_conn = conn._conn if isinstance(conn, PoolConnectionWrapper) else conn
        return real_conn.cursor(cursor_factory=RealDictCursor)
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
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recurring_patterns (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                narration TEXT NOT NULL,
                frequency VARCHAR(50),
                average_amount REAL,
                occurrences INTEGER,
                last_date VARCHAR(20),
                is_fixed_amount INTEGER
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_recurring_patterns_user_id ON recurring_patterns (user_id);")
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
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recurring_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                narration TEXT NOT NULL,
                frequency TEXT,
                average_amount REAL,
                occurrences INTEGER,
                last_date TEXT,
                is_fixed_amount INTEGER
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_recurring_patterns_user_id ON recurring_patterns (user_id);")
        
    conn.commit()
    conn.close()

def clear_db(user_id: int):
    """Deletes all transaction records belonging to a specific user."""
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    query1 = format_query("DELETE FROM transactions WHERE user_id = ?")
    cursor.execute(query1, (user_id,))
    query2 = format_query("DELETE FROM recurring_patterns WHERE user_id = ?")
    cursor.execute(query2, (user_id,))
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

def save_recurring_patterns(patterns: list[dict], user_id: int):
    """Bulk inserts recurring patterns mapped to a user_id."""
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    
    query = """
        INSERT INTO recurring_patterns (user_id, narration, frequency, average_amount, occurrences, last_date, is_fixed_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """
    insert_query = format_query(query)
    
    data_to_insert = [
        (
            user_id,
            p.get("narration"),
            p.get("frequency"),
            float(p.get("average_amount", 0.0) or 0.0),
            int(p.get("occurrences", 0) or 0),
            p.get("last_date"),
            1 if p.get("is_fixed_amount") else 0
        )
        for p in patterns
    ]
    
    cursor.executemany(insert_query, data_to_insert)
    conn.commit()
    conn.close()

def get_recurring_patterns(user_id: int) -> list[dict]:
    """Retrieves all recurring pattern records belonging to a specific user."""
    init_db()
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    query = format_query("SELECT * FROM recurring_patterns WHERE user_id = ?")
    cursor.execute(query, (user_id,))
    rows = cursor.fetchall()
    
    patterns = []
    for row in rows:
        r = dict(row)
        patterns.append({
            "narration": r.get("narration"),
            "frequency": r.get("frequency"),
            "average_amount": r.get("average_amount"),
            "occurrences": r.get("occurrences"),
            "last_date": r.get("last_date"),
            "is_fixed_amount": bool(r.get("is_fixed_amount"))
        })
    conn.close()
    return patterns
