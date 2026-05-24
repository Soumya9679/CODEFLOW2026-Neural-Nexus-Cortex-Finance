import sys
import os
import sqlite3
from fastapi.testclient import TestClient

# Add parent directories to system path to resolve imports correctly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "app"))

# Ensure we use an isolated test db path during tests
os.environ["DATABASE_URL"] = ""  # SQLite fallback
test_db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_cortex_finance.db")

from app.database.db import DB_PATH, init_db, get_db_connection, get_db_cursor
# Override DB path for testing to keep the main DB clean
import app.database.db as db_mod
db_mod.DB_PATH = test_db_path

from app.main import app

client = TestClient(app)

def run_tests():
    print("Initializing test database...")
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    init_db()

    try:
        # 1. Success Signup
        print("Testing signup success...")
        payload = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "securepassword123"
        }
        response = client.post("/auth/signup", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "token" in data
        assert data["user"]["name"] == "Jane Doe"
        assert data["user"]["email"] == "jane@example.com"
        assert "id" in data["user"]
        print("[OK] Signup success passed.")

        # 2. Duplicate Signup
        print("Testing signup duplicate email...")
        payload = {
            "name": "Jane Clone",
            "email": "jane@example.com",
            "password": "password456"
        }
        response = client.post("/auth/signup", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "already registered" in response.json()["detail"].lower()
        print("[OK] Signup duplicate email passed.")

        # 3. Success Login
        print("Testing login success...")
        payload = {
            "email": "jane@example.com",
            "password": "securepassword123"
        }
        response = client.post("/auth/login", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "token" in data
        assert data["user"]["email"] == "jane@example.com"
        token = data["token"]
        print("[OK] Login success passed.")

        # 4. Invalid Password Login
        print("Testing login invalid password...")
        payload = {
            "email": "jane@example.com",
            "password": "wrongpassword"
        }
        response = client.post("/auth/login", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        assert "invalid email or password" in response.json()["detail"].lower()
        print("[OK] Login invalid password passed.")

        # 5. Nonexistent User Login
        print("Testing login nonexistent user...")
        payload = {
            "email": "nonexistent@example.com",
            "password": "somepassword"
        }
        response = client.post("/auth/login", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("[OK] Login nonexistent user passed.")

        # 6. Get Me Unauthorized
        print("Testing get_me unauthorized...")
        response = client.get("/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("[OK] Get me unauthorized passed.")

        # 7. Get Me Authorized
        print("Testing get_me authorized...")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["email"] == "jane@example.com"
        assert data["name"] == "Jane Doe"
        print("[OK] Get me authorized passed.")

        # 8. User scoped dashboard access
        print("Testing dashboard user scoping...")
        response = client.get("/dashboard", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "income" in data
        assert "anomalies" in data
        print("[OK] Dashboard user scoping passed.")

        print("\nALL BACKEND AUTH & USER-SCOPING TESTS PASSED SUCCESSFULLY!")

    finally:
        print("Cleaning up test database...")
        if os.path.exists(test_db_path):
            os.remove(test_db_path)

if __name__ == "__main__":
    run_tests()
