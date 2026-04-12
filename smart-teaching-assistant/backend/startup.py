# startup.py - Smart Teacher Robot Backend Launcher (port 8002)

import os
import sys
import subprocess
import importlib

# Mapping of PyPI package → import name
REQUIRED_PACKAGES = {
    "uvicorn": "uvicorn",
    "fastapi": "fastapi",
    "python-dotenv": "dotenv",
    "pydantic": "pydantic",
}

def install_and_import(pip_name: str, import_name: str):
    """Ensure a package is installed and importable."""
    try:
        importlib.import_module(import_name)
    except ImportError:
        print(f"⚠️  {pip_name} not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name])
    finally:
        globals()[import_name] = importlib.import_module(import_name)

def create_directories():
    """Create necessary directories"""
    directories = ["uploads", "logs", "temp"]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created: {directory}")

def main():
    print("🤖 Smart Teacher Robot Backend")
    print("=" * 50)

    # Step 1: Ensure dependencies
    for pip_name, import_name in REQUIRED_PACKAGES.items():
        install_and_import(pip_name, import_name)

    import uvicorn  # safe now

    # Step 2: Create directories
    create_directories()

    # Step 3: Print helpful URLs
    print("\n🚀 Starting server...")
    print("📖 API Docs: http://localhost:8002/docs")
    print("🔧 Test API: http://localhost:8002/test")
    print("❤️ Health Check: http://localhost:8002/health")

    # Step 4: Start FastAPI backend
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8002,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
