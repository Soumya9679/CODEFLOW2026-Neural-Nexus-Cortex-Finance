import requests

def test_chat():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Signup / Login to get token
    signup_data = {
        "name": "Chat Test User",
        "email": "chattest@example.com",
        "password": "password123"
    }
    
    # Try signing up
    r = requests.post(f"{base_url}/auth/signup", json=signup_data)
    if r.status_code == 200:
        token = r.json()["token"]
        print("Signed up successfully.")
    else:
        # If already registered, login
        login_data = {
            "email": "chattest@example.com",
            "password": "password123"
        }
        r = requests.post(f"{base_url}/auth/login", json=login_data)
        if r.status_code == 200:
            token = r.json()["token"]
            print("Logged in successfully.")
        else:
            print("Signup/Login failed:", r.status_code, r.text)
            return

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Test 1: Sending JSON string as raw data (without application/json Content-Type)
    print("\n--- Test 1: Raw JSON string without application/json Content-Type ---")
    raw_data = '{"query": "What is my total income?"}'
    r1 = requests.post(f"{base_url}/chat", data=raw_data, headers=headers)
    print("Status Code:", r1.status_code)
    print("Response:", r1.text)

    # Test 2: Sending JSON string with application/json Content-Type
    print("\n--- Test 2: Raw JSON string with application/json Content-Type ---")
    headers_with_json = headers.copy()
    headers_with_json["Content-Type"] = "application/json"
    r2 = requests.post(f"{base_url}/chat", data=raw_data, headers=headers_with_json)
    print("Status Code:", r2.status_code)
    print("Response:", r2.text)

    # Test 3: Sending dict with requests json parameter (which automatically sets Content-Type)
    print("\n--- Test 3: dict with requests' json parameter ---")
    r3 = requests.post(f"{base_url}/chat", json={"query": "What is my total income?"}, headers=headers)
    print("Status Code:", r3.status_code)
    print("Response:", r3.text)

if __name__ == "__main__":
    test_chat()
