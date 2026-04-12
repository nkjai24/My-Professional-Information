# PowerShell script to set up Ollama on Windows
Write-Host "🤖 Setting up Ollama for Smart Teacher Robot..." -ForegroundColor Green

# Check if Ollama is installed
$ollamaPath = "$env:USERPROFILE\scoop\shims\ollama.exe"
if (!(Test-Path $ollamaPath)) {
    $ollamaPath = "ollama"  # Check if in PATH
    try {
        & $ollamaPath --version > $null 2>&1
    } catch {
        Write-Host "❌ Ollama not found. Installing via Scoop..." -ForegroundColor Red

        # Install Scoop if not present
        if (!(Get-Command scoop -ErrorAction SilentlyContinue)) {
            Write-Host "Installing Scoop package manager..." -ForegroundColor Yellow
            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
            Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
        }

        # Install Ollama via Scoop
        scoop install ollama
        $ollamaPath = "$env:USERPROFILE\scoop\shims\ollama.exe"
    }
}

Write-Host "✅ Ollama found at: $ollamaPath" -ForegroundColor Green

# Start Ollama server in background
Write-Host "🚀 Starting Ollama server..." -ForegroundColor Yellow
Start-Process -FilePath $ollamaPath -ArgumentList "serve" -NoNewWindow

# Wait a moment for server to start
Start-Sleep -Seconds 5

# Pull Mistral model
Write-Host "📥 Pulling Mistral model..." -ForegroundColor Yellow
& $ollamaPath pull mistral

Write-Host "✅ Ollama setup complete!" -ForegroundColor Green
Write-Host "🔄 You can now restart your Smart Teacher Robot backend." -ForegroundColor Cyan

# Keep window open
Read-Host "Press Enter to exit"
