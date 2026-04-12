# app/api/routes/teaching.py
import logging
import traceback
from fastapi import APIRouter, HTTPException

# Setup logger
logger = logging.getLogger("app.api.routes.teaching")

# Lazy import to avoid startup failures
try:
    from app.services.ai_teacher import AITeacher
    from app.models.teaching import TeachingRequest, TeachingResponse
    AI_TEACHER_AVAILABLE = True
    ai_teacher = AITeacher()
    print("Teaching API: AI Teacher service loaded successfully")
except ImportError as e:
    AI_TEACHER_AVAILABLE = False
    print(f"WARNING: AI Teacher service not available: {e}")
    traceback.print_exc()

router = APIRouter()

@router.post("/start-teaching")
async def start_teaching(request: TeachingRequest):
    """Start an AI teaching session using Mistral"""
    # Extract language from request - properly typed with TeachingRequest
    language = request.language
    topic = request.topic
    chunk_text = request.chunk_text
    chunk_index = request.chunk_index
    
    # Enhanced logging for debugging
    logger.info(f"=== TEACHING API REQUEST ===")
    logger.info(f"Topic: {topic}")
    logger.info(f"Language: {language}")
    logger.info(f"Chunk Index: {chunk_index}")
    logger.info(f"Chunk Text provided: {'Yes' if chunk_text else 'No'}")
    
    try:
        if not AI_TEACHER_AVAILABLE:
            error_msg = "AI Teacher service is not available"
            logger.error(error_msg)
            raise HTTPException(status_code=503, detail=error_msg)

        logger.info(f"Calling AI Teacher (Chunk {chunk_index}) with language='{language}'...")
        
        try:
            lesson = await ai_teacher.generate_lesson(
                document_id=request.document_id,
                topic=request.topic,
                difficulty_level=request.difficulty_level,
                language=language,
                chunk_text=chunk_text
            )
            
            logger.info(f"=== LESSON GENERATED (Chunk {chunk_index}) ===")
            logger.info(f"Lesson title: {lesson.get('lesson_title', 'N/A')}")
            
            # Add chunk meta-data to response so frontend can track it
            lesson["chunk_index"] = chunk_index
            
            return {
                "session_id": request.session_id,
                "lesson_content": lesson,
                "status": "active"
            }
        except Exception as lesson_error:
            # specifically log this error
            logger.exception(f"Error in ai_teacher.generate_lesson: {lesson_error}")
            # Fallback for frontend loop - DO NOT RAISE HTTPException
            return {
                "session_id": request.session_id,
                "lesson_content": {
                    "lesson_title": "Temporary Error",
                    "content": "Unable to generate lesson content. Processing next chunk...",
                    "chunk_index": chunk_index
                },
                "status": "error_handled"
            }

    except Exception as e:
        logger.exception(f"Unexpected error in teaching API: {e}")
        # Global safety net - return valid structure
        return {
            "session_id": request.session_id,
            "lesson_content": {
                "lesson_title": "System Error",
                "content": "System error occurred. Moving to next section.",
                "chunk_index": chunk_index
            },
            "status": "error_handled"
        }

@router.get("/teaching-session/{session_id}")
async def get_teaching_session(session_id: str):
    """Get teaching session details"""
    # Implementation for retrieving session
    pass