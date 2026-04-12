from __future__ import annotations
import logging
import os
import time
import httpx
from typing import Any, Dict, List, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

logger = logging.getLogger("app.llm_provider")

if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

MAX_RETRIES = int(os.getenv("LLM_MAX_RETRIES", 3))
BASE_DELAY = float(os.getenv("LLM_BASE_DELAY", 1.0))
TOP_K_CHUNKS = int(os.getenv("LLM_TOP_K_CHUNKS", 1))

LLM_BACKEND = os.getenv("LLM_BACKEND", "ollama").lower()
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

logger.info(f"LLM_BACKEND = {LLM_BACKEND}")
logger.info(f"OLLAMA_MODEL = {OLLAMA_MODEL}")

LANG_MAP = {
    "ta": "Tamil",
    "tamil": "Tamil",
    "hi": "Hindi",
    "hindi": "Hindi",
    "te": "Telugu",
    "telugu": "Telugu",
    "en": "English",
    "english": "English"
}


def extract_answer(result):
    if not result:
        return "Sorry, I couldn't generate a response."

    if isinstance(result, str):
        return result.strip()

    if isinstance(result, dict):
        return (
            result.get("response")
            or result.get("answer")
            or ""
        ).strip()

    return str(result).strip()


def check_ollama_health() -> bool:
    try:
        with httpx.Client(timeout=5.0) as client_http:
            resp = client_http.get("http://127.0.0.1:11434/api/tags")
            resp.raise_for_status()
            return True
    except Exception as e:
        logger.warning(f"Ollama health check failed: {e}")
        return False


def ensure_model_available(model: str) -> bool:
    try:
        with httpx.Client(timeout=30.0) as client_http:
            resp = client_http.get("http://127.0.0.1:11434/api/tags")
            resp.raise_for_status()
            models = resp.json().get("models", [])
            model_names = [m.get("name", "").split(":")[0] for m in models]

            if model in model_names:
                return True

            logger.info(f"Pulling model {model}...")
            resp = client_http.post(
                "http://127.0.0.1:11434/api/pull",
                json={"name": model},
                timeout=300.0
            )
            resp.raise_for_status()
            return True

    except Exception as e:
        logger.error(f"Model error: {e}")
        return False


# ✅ SAME (NO CHANGE)
def call_ollama(prompt: str) -> str:
    if not check_ollama_health():
        raise RuntimeError("Ollama is not running. Start it using: ollama serve")

    if not ensure_model_available(OLLAMA_MODEL):
        raise RuntimeError(f"Model {OLLAMA_MODEL} not available")

    last_exc = None
    timeout = httpx.Timeout(180.0, connect=10.0)

    with httpx.Client(timeout=timeout) as client_http:
        for attempt in range(MAX_RETRIES):
            try:
                resp = client_http.post(
                    "http://127.0.0.1:11434/api/chat",
                    json={
                        "model": OLLAMA_MODEL,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                        "stream": False
                    }
                )

                resp.raise_for_status()
                data = resp.json()
                text = data.get("message", {}).get("content", "").strip()

                if text:
                    return text

                last_exc = "Empty response"

            except Exception as e:
                last_exc = e
                logger.warning(f"Ollama error (attempt={attempt+1}): {e}")

            time.sleep(BASE_DELAY * (2 ** attempt))

    raise RuntimeError(f"Ollama failed: {last_exc}")


# 🔥 IMPROVED (MAIN FIX)
def build_prompt(question: str, chunks: List[Dict]) -> str:

    if not chunks:
        return f"""
You are a smart teaching assistant.

Explain clearly with examples.

Question:
{question}

Answer:
""".strip()

    text = chunks[0].get("text", "")

    return f"""
You are an intelligent teacher.

Use the content below to answer.

CONTENT:
{text}

INSTRUCTIONS:
- Do NOT repeat the content directly
- Explain in simple terms
- Give examples
- Make it easy to understand

QUESTION:
{question}

FINAL ANSWER:
""".strip()


# 🔥 IMPROVED TEACHING
def generate_lesson_and_scripts(topic: str, language: str = "English", context_text: Optional[str] = None) -> Dict[str, Any]:
    try:
        safe_topic = topic if topic else "Lesson"
        lang_input = str(language).lower().strip()
        lang_name = LANG_MAP.get(lang_input, "English")

        if context_text:
            prompt = f"""
You are a teacher.

Teach this content clearly in {lang_name}:

{context_text}

INSTRUCTIONS:
- Explain simply
- Add examples
- Break into steps
"""
        else:
            prompt = f"""
Create a lesson on {safe_topic} in {lang_name}.

Explain step by step with examples.
"""

        text = call_ollama(prompt)

        return {
            "topic": safe_topic,
            "title": f"Lesson on {safe_topic}",
            "steps": [{"id": 0, "title": "Lesson", "text": text}]
        }

    except Exception as e:
        return {
            "topic": topic,
            "title": "Error",
            "steps": [{"id": 0, "title": "Error", "text": str(e)}]
        }


# ✅ SAME
def answer_question(question: str, context: Optional[Any] = None) -> str:
    # 🔥 FIX: Handle context being a string or dict safely
    chunks = []
    if isinstance(context, dict):
        chunks = context.get("chunks", [])
    elif isinstance(context, list):
        chunks = context

    prompt = build_prompt(question, chunks)

    try:
        result = call_ollama(prompt)
        print("LLM RAW RESULT:", result)

        answer = extract_answer(result)

        if not answer:
            answer = "Sorry, I couldn't generate a response."

        return answer
    except Exception as e:
        logger.error(f"Error in answer_question: {e}")
        return "Sorry, I couldn't generate a response."