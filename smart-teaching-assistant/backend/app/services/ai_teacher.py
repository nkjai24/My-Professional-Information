# app/services/ai_teacher.py

import logging
from typing import Optional

logger = logging.getLogger("app.services.ai_teacher")

try:
    from app.llm_provider import generate_lesson_and_scripts
    LLM_PROVIDER_AVAILABLE = True
except ImportError as e:
    LLM_PROVIDER_AVAILABLE = False
    print(f"Warning: LLM provider not available: {e}")


class AITeacher:
    def __init__(self):
        pass

    async def generate_lesson(
        self,
        document_id: str,
        topic: str,
        difficulty_level: str,
        language: str = "English",
        chunk_text: Optional[str] = None
    ):
        """Generate a lesson using REAL PDF content (STRICT FIX)"""

        logger.info(
            f"AI Teacher: topic='{topic}', language='{language}', has_chunk={bool(chunk_text)}"
        )

        try:
            if not LLM_PROVIDER_AVAILABLE:
                return {
                    "lesson_title": "Error",
                    "content": "LLM service unavailable",
                    "key_points": [],
                    "summary": "Error"
                }

            # 🔥 DEBUG
            print("🔥 RAW CHUNK RECEIVED:", (chunk_text or "")[:200])

            # -------------------------------------------------
            # ✅ CRITICAL FIX: DETECT FAKE / DEFAULT CHUNK
            # -------------------------------------------------
            if not chunk_text or "Sample chunk" in chunk_text:
                logger.warning("❌ INVALID CHUNK DETECTED (Sample chunk)")

                chunk_text = f"Explain the topic clearly: {topic}"

            else:
                logger.info("✅ REAL PDF CHUNK DETECTED")

            # -------------------------------------------------
            # ✅ CALL LLM WITH CORRECT CONTEXT
            # -------------------------------------------------
            lesson_data = generate_lesson_and_scripts(
                topic,
                language,
                context_text=chunk_text
            )

            # -------------------------------------------------
            # ✅ EXTRACT CONTENT
            # -------------------------------------------------
            content_text = ""

            if isinstance(lesson_data, dict):
                steps = lesson_data.get("steps", [])

                if isinstance(steps, list) and steps:
                    content_text = str(steps[0].get("text", "")).strip()

            # -------------------------------------------------
            # 🔥 FINAL FIX: FORCE REAL CONTENT IF LLM FAILS
            # -------------------------------------------------
            if not content_text or len(content_text) < 20:
                logger.warning("⚠️ LLM FAILED → USING RAW PDF TEXT")

                content_text = (chunk_text or "").strip()

            # FINAL SAFETY
            if not content_text:
                content_text = "Unable to extract content from document."

            return {
                "lesson_title": "Lesson from document",
                "content": content_text,
                "key_points": [],
                "summary": "Generated from uploaded document"
            }

        except Exception as e:
            logger.exception(f"Error generating lesson: {e}")

            return {
                "lesson_title": "Lesson",
                "content": (chunk_text or "Error generating lesson"),
                "key_points": [],
                "summary": "Fallback content"
            }