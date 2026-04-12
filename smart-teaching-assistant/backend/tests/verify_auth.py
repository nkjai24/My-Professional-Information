import requests
import json
import sqlite3
import time

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    # 1. Register a new user
    print("\n--- Testing Registration ---")
    register_data = {
        "name": "Verification Test",
        "email": f"test_{int(time.time())}@example.com",
        "password": "password123",
        "phone_number": "1234567890"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print(f"Register status: {response.status_code}")
    print(f"Register response: {response.json()}")
    assert response.status_code == 200
    
    email = register_data["email"]

    # 2. Check DB for verification token
    print("\n--- Checking DB for Verification Token ---")
    conn = sqlite3.connect("./users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT verification_token, is_verified FROM users WHERE email=?", (email,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        token, is_verified = row
        print(f"Token found: {token}, is_verified: {is_verified}")
        assert is_verified == 0
        assert token is not None
    else:
        print("User not found in DB")
        return

    # 3. Verify Email
    print("\n--- Testing Email Verification ---")
    verify_response = requests.get(f"{BASE_URL}/auth/verify-email?token={token}")
    print(f"Verify status: {verify_response.status_code}")
    print(f"Verify response: {verify_response.json()}")
    assert verify_response.status_code == 200

    # Check DB again
    conn = sqlite3.connect("./users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT is_verified FROM users WHERE email=?" ,(email,))
    is_verified = cursor.fetchone()[0]
    conn.close()
    print(f"is_verified after verification: {is_verified}")
    assert is_verified == 1

    # 4. Forgot Password
    print("\n--- Testing Forgot Password ---")
    forgot_response = requests.post(f"{BASE_URL}/auth/forgot-password", json={"email": email})
    print(f"Forgot password status: {forgot_response.status_code}")
    print(f"Forgot password response: {forgot_response.json()}")
    assert forgot_response.status_code == 200

    # 5. Check DB for reset token
    print("\n--- Checking DB for Reset Token ---")
    conn = sqlite3.connect("./users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT reset_token FROM users WHERE email=?", (email,))
    reset_token = cursor.fetchone()[0]
    conn.close()
    print(f"Reset token: {reset_token}")
    assert reset_token is not None

    # 6. Reset Password
    print("\n--- Testing Reset Password ---")
    reset_data = {
        "token": reset_token,
        "new_password": "newpassword456"
    }
    reset_response = requests.post(f"{BASE_URL}/auth/reset-password", json=reset_data)
    print(f"Reset password status: {reset_response.status_code}")
    print(f"Reset password response: {reset_response.json()}")
    assert reset_response.status_code == 200

    # 7. Try Login with new password
    print("\n--- Testing Login with New Password ---")
    login_data = {"email": email, "password": "newpassword456"}
    login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login status: {login_response.status_code}")
    assert login_response.status_code == 200
    print("Login successful!")

if __name__ == "__main__":
    try:
        test_auth_flow()
        print("\n✅ All auth tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
