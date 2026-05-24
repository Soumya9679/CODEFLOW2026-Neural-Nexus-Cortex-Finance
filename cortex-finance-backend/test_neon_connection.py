import os
import sys

# Add parent directories to system path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "app"))

from app.database.db import get_db_connection, get_db_cursor, init_db, IS_POSTGRES, DATABASE_URL

def test_connection():
    print("Testing connection to database...")
    print(f"Is PostgreSQL: {IS_POSTGRES}")
    
    if not DATABASE_URL:
        print("Error: DATABASE_URL is not set in your .env file!")
        print("Please check your .env file in the cortex-finance-backend folder.")
        sys.exit(1)
        
    try:
        # Initialize database tables
        print("Initializing tables if they don't exist...")
        init_db()
        
        # Test connection and fetch tables
        conn = get_db_connection()
        cursor = get_db_cursor(conn)
        
        if IS_POSTGRES:
            print("Successfully connected to Neon PostgreSQL cloud!")
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
            tables = cursor.fetchall()
            print("Found tables in public schema:")
            for t in tables:
                print(f" - {t['table_name']}")
        else:
            print("Connected to SQLite local database.")
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print("Found tables:")
            for t in tables:
                print(f" - {t[0]}")
                
        cursor.close()
        conn.close()
        print("\nDATABASE CONNECTED & INITIALIZED SUCCESSFULLY!")
        
    except Exception as e:
        print(f"\nFailed to connect to database: {e}")
        print("Please verify your DATABASE_URL in the .env file is correct.")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
