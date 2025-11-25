# Script to clean up build artifacts and cache

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Cleaning AESP Project" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Clean Maven target
if (Test-Path "E:\LTJAVA\LapTrinhJava\backend\target") {
    Write-Host "Removing backend/target..." -ForegroundColor Yellow
    Remove-Item -Path "E:\LTJAVA\LapTrinhJava\backend\target" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cleaned backend/target" -ForegroundColor Green
}

# Clean node_modules
if (Test-Path "E:\LTJAVA\LapTrinhJava\frontend\node_modules") {
    Write-Host "Removing frontend/node_modules..." -ForegroundColor Yellow
    Remove-Item -Path "E:\LTJAVA\LapTrinhJava\frontend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cleaned frontend/node_modules" -ForegroundColor Green
}

# Clean dist
if (Test-Path "E:\LTJAVA\LapTrinhJava\frontend\dist") {
    Write-Host "Removing frontend/dist..." -ForegroundColor Yellow
    Remove-Item -Path "E:\LTJAVA\LapTrinhJava\frontend\dist" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cleaned frontend/dist" -ForegroundColor Green
}

# Clean log files
Get-ChildItem -Path "E:\LTJAVA\LapTrinhJava" -Recurse -Include "*.log" -ErrorAction SilentlyContinue | 
    ForEach-Object {
        Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
    }
Write-Host "✅ Cleaned log files" -ForegroundColor Green

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: cd frontend && npm install" -ForegroundColor Gray
Write-Host "  2. Run: & 'E:\LTJAVA\LapTrinhJava\run-project.ps1'" -ForegroundColor Gray
