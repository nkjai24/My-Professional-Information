# app/api/routes/documents.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import os
import uuid
from datetime import datetime

from app.services.document_processor import DocumentProcessor
from app.models.document import DocumentResponse, DocumentListResponse
from app.api.config import settings

router = APIRouter()
document_processor = DocumentProcessor()

@router.post("/upload-document", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document"""
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Supported: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Generate unique filename
    document_id = str(uuid.uuid4())
    filename = f"{document_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_FOLDER, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    # Process document
    try:
        processed_data = document_processor.process_document(file_path, file_extension)
        
        return DocumentResponse(
            document_id=document_id,
            filename=file.filename,
            file_path=file_path,
            file_type=file_extension,
            content_preview=processed_data["content"][:500] + "..." if len(processed_data["content"]) > 500 else processed_data["content"],
            word_count=len(processed_data["content"].split()),
            upload_time=datetime.now(),
            status="processed"
        )
    
    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@router.get("/documents", response_model=DocumentListResponse)
async def list_documents():
    """List all uploaded documents"""
    # Implementation for listing documents
    # This would typically fetch from a database
    return DocumentListResponse(documents=[], total=0)

@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document"""
    # Implementation for deleting documents
    return {"message": f"Document {document_id} deleted successfully"}