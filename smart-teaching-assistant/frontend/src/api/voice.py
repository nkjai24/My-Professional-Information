"""
Voice API endpoints for Smart Teacher Robot
Handles PDF processing, question answering, and speech-to-text
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import io
import logging

# For PDF processing - you may need to install these
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

# For STT fallback - you may need to install whisper
try:
    import whisper
except ImportError:
    whisper = None

logger = logging.getLogger(__name__)

router = APIRouter(tags=["voice"])
# Request/Response models
class LessonChunk(BaseModel):
    id: int
    text: str

class ProcessPDFResponse(BaseModel):
    chunks: List[LessonChunk]
    total_chunks: int

class QuestionRequest(BaseModel):
    question: str
    context_chunk_index: Optional[int] = None

class QuestionResponse(BaseModel):
    answer: str

class STTResponse(BaseModel):
    transcript: str

# Global variables for storing lesson state (in production, use proper database)
current_chunks: List[LessonChunk] = []

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF using available libraries"""
    text = ""
    
    # Try PyMuPDF first (better quality)
    if fitz:
        try:
            pdf_document = fitz.open(stream=file_content, filetype="pdf")
            for page_num in range(pdf_document.page_count):
                page = pdf_document[page_num]
                text += page.get_text() + "\n\n"
            pdf_document.close()
            return text
        except Exception as e:
            logger.warning(f"PyMuPDF failed: {e}")
    
    # Fallback to PyPDF2
    if PyPDF2:
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n\n"
            return text
        except Exception as e:
            logger.warning(f"PyPDF2 failed: {e}")
    
    raise HTTPException(
        status_code=500, 
        detail="No PDF processing library available. Please install PyMuPDF or PyPDF2."
    )

def chunk_text(text: str, chunk_size: int = 500) -> List[LessonChunk]:
    """Split text into digestible chunks for teaching"""
    if not text.strip():
        return []
    
    # Simple chunking by sentences and paragraphs
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    chunk_id = 0
    
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
            
        # If adding this paragraph would exceed chunk size, save current chunk
        if len(current_chunk) + len(paragraph) > chunk_size and current_chunk:
            chunks.append(LessonChunk(id=chunk_id, text=current_chunk.strip()))
            chunk_id += 1
            current_chunk = paragraph
        else:
            if current_chunk:
                current_chunk += "\n\n" + paragraph
            else:
                current_chunk = paragraph
    
    # Don't forget the last chunk
    if current_chunk.strip():
        chunks.append(LessonChunk(id=chunk_id, text=current_chunk.strip()))
    
    return chunks

@router.post("/ask_question", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """Answer student questions using REAL LLM"""

    global current_chunks

    try:
        # ✅ Build context from chunks
        context = ""
        if request.context_chunk_index is not None and current_chunks:
            start_idx = max(0, request.context_chunk_index - 1)
            end_idx = min(len(current_chunks), request.context_chunk_index + 2)

            context_chunks = current_chunks[start_idx:end_idx]
            context = "\n\n".join([chunk.text for chunk in context_chunks])

        # ✅ IMPORT YOUR REAL LLM
        from app.llm_provider import answer_question

        # ✅ CALL REAL AI
        answer = answer_question(
            question=request.question,
            context=context
        )

        return QuestionResponse(answer=answer)

    except Exception as e:
        logger.error(f"Error answering question: {e}")
        raise HTTPException(status_code=500, detail=str(e))
async def process_pdf(file: UploadFile = File(...)):
    """Process uploaded PDF and return lesson chunks"""
    global current_chunks
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text
        text = extract_text_from_pdf(file_content)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")
        
        # Create chunks
        chunks = chunk_text(text)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not create lesson chunks")
        
        # Store chunks globally (in production, use proper storage)
        current_chunks = chunks
        
        logger.info(f"Successfully processed PDF: {len(chunks)} chunks created")
        
        return ProcessPDFResponse(
            chunks=chunks,
            total_chunks=len(chunks)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.post("/ask_question", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """Answer student questions with context from current lesson"""
    global current_chunks
    
    try:
        # Get context from current chunks
        context = ""
        if request.context_chunk_index is not None and current_chunks:
            # Include current and previous chunk for context
            start_idx = max(0, request.context_chunk_index - 1)
            end_idx = min(len(current_chunks), request.context_chunk_index + 2)
            
            context_chunks = current_chunks[start_idx:end_idx]
            context = "\n\n".join([chunk.text for chunk in context_chunks])
        
        # For now, provide a simple response based on the question
        # In production, you would integrate with your LLM/QA system
        question_lower = request.question.lower()
        
        # Simple keyword-based responses
        if "what" in question_lower:
            answer = f"Based on the lesson context, here's what I can explain: {context[:200]}..." if context else "I need more context to answer 'what' questions. Could you be more specific?"
        elif "why" in question_lower:
            answer = "That's a great question about the reasoning. Let me explain the underlying concepts from what we've covered so far."
        elif "how" in question_lower:
            answer = "Let me break down the process or method for you based on our current lesson material."
        elif "explain" in question_lower:
            answer = f"I'll explain that concept. {context[:300]}..." if context else "I'd be happy to explain! Could you specify which part you'd like me to clarify?"
        else:
            answer = "I understand your question. Let me provide some insight based on our current lesson."
        
        # In production, replace this with actual LLM integration:
        # answer = await your_llm_service.generate_answer(
        #     question=request.question,
        #     context=context
        # )
        
        return QuestionResponse(answer=answer)
        
    except Exception as e:
        logger.error(f"Error answering question: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@router.post("/stt", response_model=STTResponse)
async def speech_to_text(audio: UploadFile = File(...)):
    """Convert audio to text using Whisper (fallback for browsers without SpeechRecognition)"""
    
    if not whisper:
        raise HTTPException(
            status_code=501, 
            detail="Speech-to-text not available. Please install whisper: pip install openai-whisper"
        )
    
    try:
        # Save uploaded audio temporarily
        audio_content = await audio.read()
        
        # In production, you might want to save to a temporary file
        # For now, we'll return a placeholder response
        
        # Load Whisper model (you might want to cache this)
        model = whisper.load_model("base")
        
        # Transcribe audio
        # Note: This is a simplified example. In production, you'd handle
        # the audio file properly with temporary storage
        result = model.transcribe(audio_content)
        transcript = result["text"]
        
        return STTResponse(transcript=transcript)
        
    except Exception as e:
        logger.error(f"Error in speech-to-text: {e}")
        # Return a fallback response for development
        return STTResponse(transcript="I heard your question, please try again with clearer speech.")

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check for voice API"""
    return {"status": "healthy", "service": "voice_api"}

# Get current chunks (for debugging)
@router.get("/chunks")
async def get_current_chunks():
    """Get currently loaded lesson chunks"""
    global current_chunks
    return {"chunks": current_chunks, "total": len(current_chunks)}