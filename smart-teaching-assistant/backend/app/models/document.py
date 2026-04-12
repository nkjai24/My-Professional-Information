# app/models/document.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class DocumentResponse(BaseModel):
    document_id: str
    filename: str
    file_path: str
    file_type: str
    content_preview: str
    word_count: int
    upload_time: datetime
    status: str

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int

class DocumentProcessRequest(BaseModel):
    document_id: str
    processing_type: Optional[str] = "full"