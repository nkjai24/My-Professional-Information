# app/models/teaching.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class TeachingRequest(BaseModel):
    document_id: str
    topic: str
    difficulty_level: str = "beginner"  # beginner, intermediate, advanced
    language: str = "English"
    chunk_text: Optional[str] = None
    chunk_index: int = 0
    session_id: str

class TeachingResponse(BaseModel):
    session_id: str
    lesson_content: Dict[str, Any]
    status: str