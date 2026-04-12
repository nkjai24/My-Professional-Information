
import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000"

def test_teaching_flow():
    print("1. Testing Health...")
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"Health: {r.status_code} {r.json()}")
    except Exception as e:
        print(f"Server not running? {e}")
        return

    # Simulate PDF chunks (mocking the extraction step)
    chunks = [
        {"id": 0, "text": "Python is a high-level, general-purpose programming language."},
        {"id": 1, "text": "Its design philosophy emphasizes code readability with the use of significant indentation."}
    ]
    
    print(f"\n2. Testing Teaching Loop for {len(chunks)} chunks...")
    
    session_id = "test_session_123"
    language = "tamil" # Testing non-English support
    
    for i, chunk in enumerate(chunks):
        print(f"\n--- Processing Chunk {i} ---")
        payload = {
            "document_id": "test_doc",
            "topic": "Python Introduction",
            "difficulty_level": "beginner",
            "language": language,
            "session_id": session_id,
            "chunk_text": chunk["text"],
            "chunk_index": chunk["id"]
        }
        
        try:
            start_time = time.time()
            response = requests.post(f"{BASE_URL}/api/start-teaching", json=payload)
            elapsed = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                lesson = data.get("lesson_content", {})
                print(f"Success ({elapsed:.2f}s)")
                print(f"Title: {lesson.get('lesson_title')}")
                print(f"Chunk Index in response: {lesson.get('chunk_index')}")
                
                # Check if lesson content actually looks like Tamil (mock check)
                steps = lesson.get("steps", [])
                if steps:
                    text = steps[0].get("text", "")
                    print(f"Lesson Snippet: {text[:100]}...")
                
            else:
                print(f"Failed: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"Error calling API: {e}")

if __name__ == "__main__":
    test_teaching_flow()
