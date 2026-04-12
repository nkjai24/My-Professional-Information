from gtts import gTTS
import uuid
import os
import logging

# Configure logging
logger = logging.getLogger("app.simple_tts")

AUDIO_DIR = "audio"
os.makedirs(AUDIO_DIR, exist_ok=True)


def text_to_speech(text: str, language: str = "en") -> str:
    """
    Convert text to speech using gTTS.
    
    Args:
        text: The text to convert to speech
        language: Language code or name (ta, hi, te, en, tamil, hindi, telugu, english)
    
    Returns:
        Path to the generated audio file
    """
    # Map for language codes and names to gTTS codes
    lang_map = {
        # Language codes
        "ta": "ta",
        "hi": "hi",
        "te": "te",
        "en": "en",
        # Full language names
        "tamil": "ta",
        "hindi": "hi",
        "telugu": "te",
        "english": "en",
    }
    
    # Normalize language to lowercase for lookup
    lang_input = language.lower().strip()
    lang_code = lang_map.get(lang_input)
    
    # Fallback to English if language not supported
    if lang_code is None:
        logger.warning(f"Language '{language}' not supported, falling back to English")
        lang_code = "en"
    
    logger.info(f"TTS: Converting text to speech in language '{lang_code}' (input: '{language}')")
    
    filename = f"{uuid.uuid4()}.mp3"
    path = os.path.join(AUDIO_DIR, filename)

    try:
        tts = gTTS(text=text, lang=lang_code)
        tts.save(path)
        logger.info(f"TTS: Successfully generated audio file: {path}")
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise

    return path
