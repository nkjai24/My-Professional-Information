# TODO: Fix End-to-End Multilingual Teaching

## Task
Fix the Smart Teacher Robot to teach PDFs in Tamil and other languages by passing the frontend language dropdown to backend TTS/teaching pipeline.

## Issues Identified
1. `generate_lesson_and_scripts` in llm_provider.py doesn't accept language parameter
2. Voice endpoints in voice.py are just placeholders - don't call actual TTS
3. lang_map in simple_tts.py expects full names ("tamil") not codes ("ta")
4. No logging to confirm language flow

## Plan

### Phase 1: Update TTS Engine (simple_tts.py)
- [x] Fix lang_map to handle both codes ("ta", "hi", "te", "en") and names ("tamil", "hindi", "telugu", "english")
- [x] Add fallback if language not supported (default to "en")
- [x] Add logging to confirm language flow

### Phase 2: Implement Voice Endpoints (voice.py)
- [x] Implement actual TTS using simple_tts.py in /speak-text endpoint
- [x] Add language parameter to request/response
- [x] Add logging to confirm language flow
- [x] Add fallback handling

### Phase 3: Update LLM Lesson Generation (llm_provider.py)
- [x] Add language parameter to generate_lesson_and_scripts function
- [x] Include language in prompt to generate lessons in target language
- [x] Add logging to confirm language flow

### Phase 4: Update AI Teacher Service (ai_teacher.py)
- [x] Pass language parameter to generate_lesson_and_scripts
- [x] Add logging to confirm language flow

### Phase 5: Update Teaching Routes (teaching.py)
- [x] Add logging to confirm language flow from frontend

## Dependent Files
- app/simple_tts.py
- app/api/routes/voice.py
- app/llm_provider.py
- app/services/ai_teacher.py
- app/api/routes/teaching.py

## Testing
- Verify language "ta" generates Tamil speech
- Verify language "hi" generates Hindi speech
- Verify fallback to "en" for unsupported languages
- Verify logging shows language flow
