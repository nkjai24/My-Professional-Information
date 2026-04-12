# debug_test.py - Use different port
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def hello():
    return {"message": "Hello World! Backend is working!", "status": "success"}

@app.get("/health")
def health():
    return {"status": "healthy", "port": 8001}

if __name__ == "__main__":
    print("🔧 Running DEBUG TEST SERVER...")
    print("Visit: http://127.0.0.1:8001")  # Changed to port 8001
    print("API Docs: http://127.0.0.1:8001/docs")
    uvicorn.run(app, host="127.0.0.1", port=8001)  # Changed to port 8001