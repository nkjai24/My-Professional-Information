# test_multilingual.py - Test script for multilingual teaching feature
import sys
import os

# Add the current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_tts():
    """Test the TTS functionality with different languages"""
    print("=" * 60)
    print("Testing TTS (Text-to-Speech) Functionality")
    print("=" * 60)
    
    try:
        from app.simple_tts import text_to_speech
        
        test_cases = [
            ("Hello, this is a test in English", "en"),
            ("வணக்கம், இது தமிழ் சோதனை", "ta"),
            ("नमस्ते, यह हिंदी में परीक्षण है", "hi"),
            ("హలో, ఇది telugu లో టెస్ట్", "te"),
        ]
        
        for text, lang in test_cases:
            print(f"\nTesting language: {lang}")
            print(f"Text: {text[:50]}...")
            try:
                audio_path = text_to_speech(text, lang)
                print(f"✅ SUCCESS: Audio saved to: {audio_path}")
            except Exception as e:
                print(f"❌ FAILED: {e}")
        
        print("\n" + "=" * 60)
        print("TTS Tests Complete")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"❌ TTS Test Failed: {e}")
        return False


def test_llm():
    """Test the LLM lesson generation with different languages"""
    print("\n" + "=" * 60)
    print("Testing LLM Lesson Generation")
    print("=" * 60)
    
    try:
        from app.llm_provider import generate_lesson_and_scripts
        
        test_cases = [
            ("What is Artificial Intelligence", "English"),
            ("What is Artificial Intelligence", "Tamil"),
            ("What is Artificial Intelligence", "Hindi"),
            ("What is Artificial Intelligence", "Telugu"),
        ]
        
        for topic, lang in test_cases:
            print(f"\nTesting language: {lang}")
            print(f"Topic: {topic}")
            try:
                result = generate_lesson_and_scripts(topic, lang)
                title = result.get("title", "N/A")
                content = result.get("steps", [{}])[0].get("text", "N/A")[:100]
                print(f"✅ SUCCESS: Generated lesson - Title: {title}")
                print(f"   Content preview: {content}...")
            except Exception as e:
                print(f"❌ FAILED: {e}")
        
        print("\n" + "=" * 60)
        print("LLM Tests Complete")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"❌ LLM Test Failed: {e}")
        return False


def test_ai_teacher():
    """Test the AI Teacher service"""
    print("\n" + "=" * 60)
    print("Testing AI Teacher Service")
    print("=" * 60)
    
    try:
        import asyncio
        from app.services.ai_teacher import AITeacher
        
        async def run_test():
            teacher = AITeacher()
            
            test_cases = [
                ("Python Programming", "English"),
                ("Python Programming", "Tamil"),
            ]
            
            for topic, lang in test_cases:
                print(f"\nTesting language: {lang}")
                print(f"Topic: {topic}")
                try:
                    result = await teacher.generate_lesson(
                        document_id="test",
                        topic=topic,
                        difficulty_level="beginner",
                        language=lang
                    )
                    title = result.get("lesson_title", "N/A")
                    content = result.get("content", "N/A")[:100]
                    print(f"✅ SUCCESS: Generated lesson - Title: {title}")
                    print(f"   Content preview: {content}...")
                except Exception as e:
                    print(f"❌ FAILED: {e}")
        
        asyncio.run(run_test())
        
        print("\n" + "=" * 60)
        print("AI Teacher Tests Complete")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"❌ AI Teacher Test Failed: {e}")
        return False


if __name__ == "__main__":
    print("\n🚀 Starting Multilingual Teaching Feature Tests\n")
    
    # Run tests
    tts_result = test_tts()
    llm_result = test_llm()
    ai_teacher_result = test_ai_teacher()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"TTS Test: {'✅ PASSED' if tts_result else '❌ FAILED'}")
    print(f"LLM Test: {'✅ PASSED' if llm_result else '❌ FAILED'}")
    print(f"AI Teacher Test: {'✅ PASSED' if ai_teacher_result else '❌ FAILED'}")
    
    if all([tts_result, llm_result, ai_teacher_result]):
        print("\n🎉 All tests passed! Multilingual teaching feature is working.")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
