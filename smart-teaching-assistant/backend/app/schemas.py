# backend/app/schemas.py
from pydantic import BaseModel
from typing import List

class UploadResponse(BaseModel):
    lesson_title: str
    summary: str
    tags: List[str]
    transcripts: List[str]
    audio_urls: List[str]
