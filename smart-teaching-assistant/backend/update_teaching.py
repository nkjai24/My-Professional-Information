# Script to update teaching.py to add logging for language

# Read the file
with open('app/api/routes/teaching.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old code
old_text = '''# app/api/routes/teaching.py
from fastapi import APIRouter, HTTPException

# Lazy import to avoid startup failures
try:
    from app.services.ai_teacher import AITeacher
    from app.models.teaching import TeachingRequest, TeachingResponse
    AI_TEACHER_AVAILABLE = True
    ai_teacher = AITeacher()
except ImportError as e:
    AI_TEACHER_AVAILABLE = False
    print(f"Warning: AI Teacher service not available: {e}")

router = APIRouter()

@router.post("/start-teaching")
async def start_teaching(request):
    """Start an AI teaching session using Mistral"""
    try:
        if not AI_TEACHER_AVAILABLE:
            raise HTTPException(status_code=503, detail="AI Teacher service is currently unavailable. Please ensure Ollama is running with Mistral model.")

        lesson = await ai_teacher.generate_lesson(
            document_id=getattr(request, 'document_id', ''),
            topic=getattr(request, 'topic', ''),
            difficulty_level=getattr(request, 'difficulty_level', 'beginner'),
            language=getattr(request, 'language', 'English')
        )'''

# Define the new code
new_text = '''# app/api/routes/teaching.py
import logging
from fastapi import APIRouter, HTTPException

# Setup logger
logger = logging.getLogger("app.api.routes.teaching")

# Lazy import to avoid startup failures
try:
    from app.services.ai_teacher import AITeacher
    from app.models.teaching import TeachingRequest, TeachingResponse
    AI_TEACHER_AVAILABLE = True
    ai_teacher = AITeacher()
except ImportError as e:
    AI_TEACHER_AVAILABLE = False
    print(f"Warning: AI Teacher service not available: {e}")

router = APIRouter()

@router.post("/start-teaching")
async def start_teaching(request):
    """Start an AI teaching session using Mistral"""
    # Extract language from request and log it
    language = getattr(request, 'language', 'English')
    topic = getattr(request, 'topic', '')
    logger.info(f"Teaching API: Received start-teaching request with topic='{topic}', language='{language}'")
    
    try:
        if not AI_TEACHER_AVAILABLE:
            raise HTTPException(status_code=503, detail="AI Teacher service is currently unavailable. Please ensure Ollama is running with Mistral model.")

        logger.info(f"Teaching API: Forwarding to AI Teacher with language='{language}'")
        
        lesson = await ai_teacher.generate_lesson(
            document_id=getattr(request, 'document_id', ''),
            topic=getattr(request, 'topic', ''),
            difficulty_level=getattr(request, 'difficulty_level', 'beginner'),
            language=language
        )'''

# Replace the old text with new text
if old_text in content:
    content = content.replace(old_text, new_text)
    with open('app/api/routes/teaching.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS: File updated')
else:
    print('ERROR: Old text not found in file')
