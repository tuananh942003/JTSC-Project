# VAR Project - Start All Services
# Usage: .\start.ps1

$root = $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VAR Project - Khoi dong tat ca       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backend API Server
Write-Host "[1/3] Backend API Server   -> http://localhost:5000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "`$host.UI.RawUI.WindowTitle = 'Backend API'; Set-Location '$root\server'; npm run dev"

Start-Sleep -Seconds 1

# 2. AI Chatbot Server
Write-Host "[2/3] AI Chatbot Server    -> http://localhost:3000" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "`$host.UI.RawUI.WindowTitle = 'AI Chatbot'; Set-Location '$root\AI Chatbot'; npm run dev"

Start-Sleep -Seconds 1

# 3. Frontend Vite Dev Server
Write-Host "[3/3] Frontend (Vite)      -> http://localhost:5173" -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "`$host.UI.RawUI.WindowTitle = 'Frontend Vite'; Set-Location '$root\FE\vite-project'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Tat ca service da duoc khoi dong!    " -ForegroundColor Cyan
Write-Host "   Backend  : http://localhost:5000      " -ForegroundColor White
Write-Host "   Chatbot  : http://localhost:3000      " -ForegroundColor White
Write-Host "   Frontend : http://localhost:5173      " -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""