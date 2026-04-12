from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

# Lazy import
try:
    from app.services.llm_service import ask_llm
    LLM_AVAILABLE = True
except ImportError as e:
    LLM_AVAILABLE = False
    print(f"Warning: LLM service not available: {e}")

router = APIRouter()


# =========================
# MODELS
# =========================

class QuestionRequest(BaseModel):
    question: str
    session_id: str
    document_id: str
    language: str = "English"

    # 🔥 CRITICAL FIX
    chunks: List[Dict[str, Any]] = []


class QuestionResponse(BaseModel):
    answer: str
    confidence: float
    session_id: str


# =========================
# ASK QUESTION
# =========================

@router.post("/ask-question", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):

    try:
        print("🔥 QUESTION:", request.question)
        print("🔥 CHUNKS RECEIVED:", request.chunks[:1])

        if not LLM_AVAILABLE:
            raise HTTPException(status_code=503, detail="LLM not available")

        # ❌ If chunks missing → show clear error
        if not request.chunks:
            return QuestionResponse(
                answer="❌ No PDF content received. Please upload again.",
                confidence=0.0,
                session_id=request.session_id
            )

        # ✅ Build context from chunks
        context = " ".join([c.get("text", "") for c in request.chunks])
        context = context[:4000]

        # ✅ Call LLM WITH CONTEXT
        answer = ask_llm(
            question=request.question,
            document_id=request.document_id,
            language=request.language,
            context=context
        )

        return QuestionResponse(
            answer=str(answer) if answer else "Sorry, I couldn't generate a response.",
            confidence=0.85,
            session_id=request.session_id
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Error: {str(e)}"
        )