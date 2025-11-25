# Script to run both Backend and Frontend

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Starting AESP Project (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Kill existing processes
Write-Host "Killing existing Java and Node processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Start Backend (Maven build)
Write-Host ""
Write-Host "Starting Backend (Java/Spring Boot)..." -ForegroundColor Green
Write-Host "Backend will start on: http://localhost:8080" -ForegroundColor Green

$backendPath = "E:\LTJAVA\LapTrinhJava\backend"
Push-Location $backendPath

# Start backend in background
Start-Job -ScriptBlock {
    Set-Location "E:\LTJAVA\LapTrinhJava\backend"
    mvn clean spring-boot:run 2>&1
} -Name "aesp-backend" | Out-Null

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Frontend
Write-Host ""
Write-Host "Starting Frontend (Vite + React)..." -ForegroundColor Green
Write-Host "Frontend will start on: http://localhost:5173" -ForegroundColor Green

$frontendPath = "E:\LTJAVA\LapTrinhJava\frontend"
Push-Location $frontendPath

# Start frontend in background
Start-Job -ScriptBlock {
    Set-Location "E:\LTJAVA\LapTrinhJava\frontend"
    npm run dev 2>&1
} -Name "aesp-frontend" | Out-Null

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ Project Started Successfully!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Endpoints:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:8080/api" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Running Jobs:" -ForegroundColor Cyan
Get-Job | Select-Object Name, State | Format-Table -AutoSize
Write-Host ""
Write-Host "💡 To stop all services:" -ForegroundColor Yellow
Write-Host "   Stop-Job -Name aesp-backend -PassThru | Remove-Job" -ForegroundColor Gray
Write-Host "   Stop-Job -Name aesp-frontend -PassThru | Remove-Job" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 To view backend logs:" -ForegroundColor Yellow
Write-Host "   Receive-Job -Name aesp-backend -Keep" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 To view frontend logs:" -ForegroundColor Yellow
Write-Host "   Receive-Job -Name aesp-frontend -Keep" -ForegroundColor Gray
