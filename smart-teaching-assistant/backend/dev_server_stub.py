# dev_server_stub.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/process_pdf")
async def process_pdf(file: UploadFile = File(...)):
    # Read just to validate upload
    await file.read()
    chunks = [
        {"id": 0, "text": "Dummy chunk one. Replace with real extractor."},
        {"id": 1, "text": "Dummy chunk two."}
    ]
    return JSONResponse({"chunks": chunks})

@app.post("/ask_question")
async def ask_question(payload: dict):
    return {"answer": f"Simulated answer for: {payload.get('question','')}"}

@app.post("/stt")
async def stt(audio: UploadFile = File(...)):
    return {"transcript": "simulated transcript"}

if __name__ == "__main__":
    uvicorn.run("dev_server_stub:app", host="0.0.0.0", port=8000, reload=True)
