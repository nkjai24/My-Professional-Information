# test_openai.py
import os
import requests
from dotenv import load_dotenv

# load .env if you store your OPENAI_API_KEY there
load_dotenv()

key = os.getenv("OPENAI_API_KEY")
print("OPENAI_API_KEY present?:", bool(key))

if not key:
    raise SystemExit("No OPENAI_API_KEY found in environment")

url = "https://api.openai.com/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
}
data = {
    "model": "gpt-4o-mini",
    "messages": [
        {"role": "system", "content": "You are a helpful teacher."},
        {"role": "user", "content": "In one sentence, what is Artificial Intelligence?"},
    ],
    "temperature": 0.3,
    "max_tokens": 100,
}

resp = requests.post(url, headers=headers, json=data, timeout=20)
print("Status:", resp.status_code)
try:
    print(resp.json())
except Exception:
    print(resp.text)
