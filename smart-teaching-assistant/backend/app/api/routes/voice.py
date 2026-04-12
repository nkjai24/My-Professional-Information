# app/api/routes/voice.py
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger("app.api.routes.voice")

# Import the simple_tts function
from app.simple_tts import text_to_speech

class VoiceRequest(BaseModel):
    text: str
    language: str = "en"
    speed: int = 200

@router.post("/speak-text")
async def speak_text(request: VoiceRequest):
    """Convert text to speech"""
    logger.info(f"Voice API: Received speak-text request with language='{request.language}', text='{request.text[:50]}...'")
    
    try:
        # Call simple_tts to generate audio
        audio_path = text_to_speech(request.text, request.language)
        logger.info(f"Voice API: Generated audio file: {audio_path}")
        
        return {
            "message": "Text-to-speech conversion completed",
            "text": request.text,
            "language": request.language,
            "audio_path": audio_path,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Voice API: TTS error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")
