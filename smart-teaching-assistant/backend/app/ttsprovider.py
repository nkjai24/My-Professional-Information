# backend/app/tts_provider.py
from typing import List
import os
from gtts import gTTS
import hashlib
import pathlib
import requests

TTS_PROVIDER = os.getenv("TTS_PROVIDER", "gtts")  # 'gtts' or 'elevenlabs'

def _write_mp3(text: str, out_path: str):
    tts = gTTS(text=text, lang="en")
    tts.save(out_path)

def _elevenlabs_tts(text: str, api_key: str, voice: str, out_path: str):
    # Example placeholder: implement real ElevenLabs API call here.
    # For now we'll fallback to gTTS if not configured.
    _write_mp3(text, out_path)

def tts_generate_audio_for_scripts(scripts: List[str], out_dir: str, uid: str) -> List[str]:
    pathlib.Path(out_dir).mkdir(parents=True, exist_ok=True)
    audio_urls = []
    for i, s in enumerate(scripts):
        # create stable filename
        h = hashlib.sha1(s.encode("utf-8")).hexdigest()[:10]
        fname = f"{uid}_{i}_{h}.mp3"
        out_path = os.path.join(out_dir, fname)
        if TTS_PROVIDER == "elevenlabs" and os.getenv("ELEVENLABS_API_KEY"):
            _elevenlabs_tts(s, os.getenv("ELEVENLABS_API_KEY"), os.getenv("ELEVENLABS_VOICE", "alloy"), out_path)
        else:
            # fallback to gTTS (works without keys; demo only)
            _write_mp3(s, out_path)
        audio_urls.append(f"/audio/{fname}")
    return audio_urls
