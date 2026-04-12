# backend/app/llm_provider.py
from typing import List, Tuple, Dict
import os

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

def _demo_summarize_chunk(chunk: str) -> str:
    # Lightweight, safe demo transform — friendly teaching voice
    intro = "Now we'll cover: "
    # pick first sentence as title
    first_line = chunk.strip().splitlines()[0][:80]
    body = (
        f"{intro}{first_line}. "
        "I'll explain the core ideas, give a simple example, and a one-question check for you. "
        f"{chunk[:1000]} ... (summarized for voice)"
    )
    return body

def generate_lesson_and_scripts(chunks: List[str]) -> Tuple[Dict, List[str]]:
    """
    Returns: (lesson_meta, list_of_script_texts)
    lesson_meta: {title, summary, tags}
    """
    # In production replace this with an LLM call (OpenAI/Anthropic) and generate:
    # title, summary, tags, spoken-script for each chunk.
    # Example pseudo:
    # - prompt: "You are an engaging teacher. Given chunk: <text>, produce spoken narration with examples and a one-question check."
    lesson_title = "Auto Lesson — Document"
    summary = "This lesson introduces the extracted content and presents it in short spoken modules."
    scripts = []
    for i, c in enumerate(chunks):
        if LLM_PROVIDER == "openai" and OPENAI_API_KEY:
            # Add production code to call OpenAI chat completions here.
            # Keep this file a single place to implement provider-specific calls.
            pass
        scripts.append(_demo_summarize_chunk(c))
    return {"title": lesson_title, "summary": summary, "tags": ["Generated", "Voice"]}, scripts
