# Hướng dẫn chạy AESP Project

## 🚀 Cách chạy nhanh nhất (Khuyến nghị)

### Windows (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force ; & "E:\LTJAVA\LapTrinhJava\run-project.ps1"
```

---

## 🧹 Dọn dẹp Project

Để xóa các file build cũ, cache, và dependencies:

### Clean Build Artifacts
```powershell
& "E:\LTJAVA\LapTrinhJava\clean-project.ps1"
```

Lệnh này sẽ xóa:
- ✅ `backend/target/` - Maven build output
- ✅ `frontend/node_modules/` - NPM dependencies (có thể cài lại bằng `npm install`)
- ✅ `frontend/dist/` - Build output
- ✅ Tất cả `*.log` files

---

## 🔧 Manual Setup (Nếu script không hoạt động)

### 1. Kill tất cả process đang chạy
```powershell
# PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
```

```cmd
REM Command Prompt
taskkill /F /IM java.exe
taskkill /F /IM node.exe
```

### 2. Start Backend (Terminal 1)
```powershell
cd E:\LTJAVA\LapTrinhJava\backend
mvn clean spring-boot:run
```

### 3. Start Frontend (Terminal 2)
```powershell
cd E:\LTJAVA\LapTrinhJava\frontend
npm run dev
```

---

## 📊 Kiểm tra Status

### Xem tất cả job đang chạy
```powershell
Get-Job | Select-Object Name, State
```

### Xem logs Backend
```powershell
Receive-Job -Name aesp-backend -Keep
```

### Xem logs Frontend
```powershell
Receive-Job -Name aesp-frontend -Keep
```

---

## 🛑 Dừng Services

### Dừng tất cả
```powershell
Get-Job | Stop-Job -PassThru | Remove-Job -Force
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force
```

### Dừng chỉ Backend
```powershell
Stop-Job -Name aesp-backend -PassThru | Remove-Job
```

### Dừng chỉ Frontend
```powershell
Stop-Job -Name aesp-frontend -PassThru | Remove-Job
```

---

## 🌐 Endpoints

- **Backend API**: http://localhost:8080/api
- **Frontend**: http://localhost:5173
- **Health Check**: http://localhost:8080/api/health

---

## 📝 Lưu ý

- Đảm bảo đã cài đặt:
  - Java 17+
  - Maven 3.6+
  - Node.js 16+ (npm 7+)
  
- Nếu port 8080 hoặc 5173 bị chiếm, thay đổi trong:
  - Backend: `backend/src/main/resources/application.properties` (server.port)
  - Frontend: `frontend/vite.config.ts` hoặc chạy `npm run dev -- --port 5174`

- MySQL phải chạy trên `localhost:3306` với database `aesp_db`

---

## ✅ Xác nhận chạy thành công

### Backend
- Xem log có "Started AespApplication in X seconds"
- Truy cập http://localhost:8080/api/health → Response 200 OK

### Frontend
- Xem "VITE v7.1.9 ready in X ms"
- Truy cập http://localhost:5173 → Thấy giao diện login

---

## 🐛 Troubleshooting

### Maven không found
```powershell
# Kiểm tra Maven đã cài chưa
mvn --version

# Nếu chưa, download từ https://maven.apache.org/download.cgi
```

### npm không found
```powershell
# Kiểm tra npm đã cài chưa
npm --version

# Nếu chưa, download Node.js từ https://nodejs.org
```

### Port đang bị sử dụng
```powershell
# Kiểm tra port 8080
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue

# Kiểm tra port 5173
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

# Kill process nếu cần
taskkill /F /PID <PID>
```

### Database connection error
- Kiểm tra MySQL đang chạy
- Kiểm tra `.env` file có `GROQ_API_KEY` và `HUGGINGFACE_API_KEY`
- Kiểm tra `application.properties` có cấu hình database đúng
