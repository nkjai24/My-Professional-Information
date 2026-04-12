# Ollama Setup Guide for Smart Teacher Robot

## Problem
You're getting connection errors when trying to use the teaching assistant features because Ollama (the local AI service) is not running.

## Solution
Follow these steps to set up Ollama on your Windows machine:

### Method 1: Automated Setup (Recommended)
1. **Run the PowerShell setup script:**
   - Right-click `setup_ollama.ps1`
   - Select "Run with PowerShell"
   - Follow the on-screen instructions

2. **Or run the batch file:**
   - Double-click `setup_ollama.bat`
   - Follow the on-screen instructions

### Method 2: Manual Setup
1. **Download and Install Ollama:**
   - Go to https://ollama.ai/download
   - Download the Windows installer
   - Run the installer and follow the setup wizard

2. **Start Ollama Server:**
   - Open Command Prompt or PowerShell as Administrator
   - Run: `ollama serve`
   - Keep this window open (it runs the server)

3. **Pull the Mistral Model:**
   - Open a new Command Prompt or PowerShell window
   - Run: `ollama pull mistral`
   - Wait for the download to complete

4. **Verify Installation:**
   - Run: `ollama list`
   - You should see `mistral` in the list

## Testing the Setup
1. Restart your Smart Teacher Robot backend
2. Try using the teaching assistant features
3. The connection errors should be resolved

## Troubleshooting
- **Port 11434 blocked:** Make sure no firewall is blocking port 11434
- **Permission issues:** Run Ollama as Administrator
- **Still not working:** Check if Ollama is running with `netstat -ano | findstr 11434`

## Alternative: Use OpenAI
If you prefer not to use Ollama, you can set up OpenAI:
1. Get an API key from https://platform.openai.com/api-keys
2. Create a `.env` file in the project root
3. Add: `OPENAI_API_KEY=your_key_here`
4. Set: `LLM_BACKEND=openai` in the `.env` file

The backend will automatically use OpenAI instead of Ollama.
