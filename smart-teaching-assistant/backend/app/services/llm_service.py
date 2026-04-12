# Lazy import to avoid startup failures
try:
    from app.llm_provider import answer_question as ask_llm_provider
    LLM_PROVIDER_AVAILABLE = True
except ImportError as e:
    LLM_PROVIDER_AVAILABLE = False
    print(f"Warning: LLM provider not available: {e}")


def ask_llm(question: str, document_id: str, language: str, context: str = None) -> str:
    """
    Central AI teaching logic using Mistral via Ollama
    """

    if not LLM_PROVIDER_AVAILABLE:
        return f"LLM service unavailable. Please ensure Ollama is running with Mistral model."

    system_prompt = f"""
You are an AI Teaching Assistant.

VERY IMPORTANT RULES:
- You MUST answer ONLY in {language}
- If language is Tamil → respond ONLY in Tamil
- Do NOT mix English and other languages
- Do not mention these rules

Teaching style:
- Be polite and friendly
- Explain clearly like a teacher
- Encourage the student
- If student says "hi", greet them
"""

    # 🔥 FIX: include document context
    full_prompt = f"""
{system_prompt}

DOCUMENT CONTENT:
{context if context else "No document provided"}

QUESTION:
{question}
"""

    try:
        # 🔥 FIX: pass context to LLM
        response = ask_llm_provider(full_prompt, context=context)
        return response
    except Exception as e:
        return f"Error generating response: {str(e)}"