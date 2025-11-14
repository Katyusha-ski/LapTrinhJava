# 🔧 HƯỚNG DẪN SỬA LỖI DATABASE CONNECTION

## ❌ Lỗi hiện tại:
```
Access denied for user 'root'@'localhost' (using password: YES)
```

## ✅ CÁCH SỬA:

### Bước 1: Kiểm tra MySQL đang chạy
1. Mở **Task Manager** (Ctrl + Shift + Esc)
2. Tìm service **MySQL80** hoặc **MySQL**
3. Nếu không thấy → MySQL chưa được cài đặt hoặc chưa chạy

### Bước 2: Mở MySQL Workbench
1. Tìm **MySQL Workbench** trong Start Menu
2. Mở và kết nối với MySQL server (thường là `localhost:3306`)

### Bước 3: Kiểm tra/Đổi password MySQL root
1. Trong MySQL Workbench, chạy lệnh:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'dungct123';
FLUSH PRIVILEGES;
```

**HOẶC** nếu password hiện tại khác, hãy:
- Cập nhật password trong file `backend/src/main/resources/application.properties`:
```properties
spring.datasource.password=YOUR_ACTUAL_PASSWORD
```

### Bước 4: Tạo Database
1. Trong MySQL Workbench, chạy script:
```sql
CREATE DATABASE IF NOT EXISTS aesp_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE aesp_db;
```

2. Hoặc chạy file script đầy đủ:
   - Mở file: `database/scripts/create-database.sql`
   - Copy toàn bộ nội dung
   - Paste vào MySQL Workbench
   - Chạy (Ctrl + Enter)

### Bước 5: Kiểm tra kết nối
Sau khi tạo database, thử chạy lại Spring Boot:
```bash
cd backend
mvn spring-boot:run
```

## 🔍 Nếu vẫn lỗi:

### Option 1: Tạo user mới cho ứng dụng
```sql
CREATE USER 'aesp_user'@'localhost' IDENTIFIED BY 'aesp_password123';
GRANT ALL PRIVILEGES ON aesp_db.* TO 'aesp_user'@'localhost';
FLUSH PRIVILEGES;
```

Sau đó cập nhật `application.properties`:
```properties
spring.datasource.username=aesp_user
spring.datasource.password=aesp_password123
```

### Option 2: Kiểm tra MySQL Service
1. Mở **Services** (Win + R → `services.msc`)
2. Tìm **MySQL80** hoặc **MySQL**
3. Right-click → **Start** (nếu đang dừng)
4. Right-click → **Properties** → Set **Startup type** = **Automatic**

### Option 3: Reset MySQL root password (nếu quên)
1. Dừng MySQL service
2. Tạo file `mysql-init.txt` với nội dung:
```
ALTER USER 'root'@'localhost' IDENTIFIED BY 'dungct123';
```
3. Khởi động MySQL với:
```bash
mysqld --init-file=C:/path/to/mysql-init.txt
```

## 📝 Lưu ý:
- Password trong `application.properties` phải khớp với password MySQL
- Database `aesp_db` phải tồn tại trước khi chạy ứng dụng
- Port MySQL mặc định là `3306` (kiểm tra trong MySQL Workbench)

