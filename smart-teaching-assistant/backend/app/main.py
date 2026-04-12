# file: app/main.py

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import logging
import os
from typing import Any
import tempfile
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

# ✅ ADD THIS IMPORT (CRITICAL FIX)
from app.pdf_utils import extract_text_from_pdf_bytes, clean_text, chunk_text

# ✅ GOOGLE AUTH IMPORTS
from google.oauth2 import id_token
from google.auth.transport import requests

from app.admin_routes import router as admin_router
from app.simple_auth import (
    router as auth_router,
    get_current_user,
    get_db,
    Lesson,
    User
)

# =========================
# CONFIG
# =========================

GOOGLE_CLIENT_ID = "61694655181-2a3215g3p00i048qqph34a3tj3gahqc3.apps.googleusercontent.com"

# =========================
# LOGGER
# =========================

logging.basicConfig(level="INFO")
logger = logging.getLogger("app.main")

# =========================
# APP
# =========================

app = FastAPI(title="Smart Teacher Robot API")

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# STATIC
# =========================

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# =========================
# ROUTERS
# =========================

from app.api.routes.questions import router as questions_router
from app.api.routes.voice import router as voice_router
from app.api.routes.teaching import router as teaching_router

app.include_router(questions_router, prefix="/api")
app.include_router(voice_router, prefix="/api")
app.include_router(teaching_router, prefix="/api/teaching")

app.include_router(auth_router)
app.include_router(admin_router)

# =========================
# HEALTH
# =========================

@app.get("/")
def root():
    return {"message": "API running"}

@app.get("/health")
def health():
    return {"status": "ok"}

# =========================
# 🔥 GOOGLE LOGIN
# =========================

@app.post("/auth/google")
async def google_login(payload: dict):

    try:
        token = payload.get("credential")

        if not token:
            raise HTTPException(status_code=400, detail="Missing credential")

        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")

        return {
            "success": True,
            "user": {
                "email": email,
                "name": name,
                "photo": picture,
                "role": "user"
            },
            "token": "demo-jwt-token"
        }

    except Exception as e:
        logger.error(f"Google auth failed: {e}")
        raise HTTPException(status_code=401, detail="Google authentication failed")

# =========================
# ✅ FIXED PDF PROCESS
# =========================

@app.post("/process_pdf")
async def process_pdf(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF")

    try:
        contents = await file.read()

        # ✅ Extract real text
        extracted_text = extract_text_from_pdf_bytes(contents)

        if not extracted_text or len(extracted_text.strip()) < 20:
            raise HTTPException(400, "No valid text found in PDF")

        # ✅ Clean text
        cleaned_text = clean_text(extracted_text)

        # ✅ Chunk text
        chunk_list = chunk_text(cleaned_text)

        # ✅ Format for frontend
        chunks = [
            {"id": i, "text": chunk}
            for i, chunk in enumerate(chunk_list)
        ]

        return {"chunks": chunks}

    except Exception as e:
        raise HTTPException(500, str(e))

# =========================
# ASK QUESTION
# =========================



# =========================
# VOICE
# =========================

@app.post("/ask_question_voice")
async def ask_question_voice(payload: dict):

    from gtts import gTTS

    answer = "Voice response"

    tts = gTTS(text=answer, lang="en")
    file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")

    tts.save(file.name)

    return FileResponse(file.name, media_type="audio/mpeg")