# 01 - HƯỚNG DẪN THIẾT KẾ DATABASE (MySQL)

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Cài Đặt MySQL](#cài-đặt-mysql)
3. [Thiết Kế Database Schema](#thiết-kế-database-schema)
4. [Tạo Database và Tables](#tạo-database-và-tables)
5. [Relationships và Foreign Keys](#relationships-và-foreign-keys)
6. [Indexes và Optimization](#indexes-và-optimization)
7. [Seed Data - Dữ Liệu Mẫu](#seed-data---dữ-liệu-mẫu)
8. [Kiểm Tra và Test](#kiểm-tra-và-test)

---

## Tổng Quan

### Database Platform
- **CSDL**: MySQL 8.0 hoặc mới hơn
- **Tools**: MySQL Workbench
- **Database Name**: `aesp_db`
- **Character Set**: `utf8mb4` (hỗ trợ Unicode đầy đủ)

### Mục Tiêu
Thiết kế database cho hệ thống **AESP** (AI-Supported English Speaking Practice) với:
- **3 vai trò**: Admin, Mentor, Learner
- **Chức năng chính**: Quản lý người dùng, gói học, đăng ký, tiến độ học tập
- **Tích hợp AI**: Lưu trữ điểm số phát âm, ngữ pháp, từ vựng

---

## Cài Đặt MySQL

### Bước 1: Download MySQL
```
Link: https://dev.mysql.com/downloads/mysql/
Chọn: MySQL Community Server 8.0
Platform: Windows (x64)
File: mysql-installer-web-community-8.0.x.x.msi
```

### Bước 2: Cài đặt MySQL
1. **Chạy MySQL Installer**
2. **Setup Type**: Chọn **"Developer Default"**
3. **Check Requirements**: Click **"Next"**
4. **Installation**: Click **"Execute"** để cài đặt
5. **Product Configuration**:
   - **High Availability**: Standalone MySQL Server
   - **Type and Networking**: Default (Port 3306)
   - **Authentication Method**: **"Use Strong Password Encryption"**
   - **Accounts and Roles**: 
     - Root Password: **Nhập password mạnh** (ví dụ: `AespRoot123!`)
     - Ghi nhớ password này!
   - **Windows Service**: MySQL80 (Start at System Startup)
6. **Apply Configuration** → **Finish**

### Bước 3: Download MySQL Workbench
```
Link: https://dev.mysql.com/downloads/workbench/
Download: MySQL Workbench 8.0
```

### Bước 4: Kết Nối Database
1. **Mở MySQL Workbench**
2. **MySQL Connections** → Click **"+"** để tạo connection mới
3. **Connection Name**: `AESP Local`
4. **Hostname**: `127.0.0.1` hoặc `localhost`
5. **Port**: `3306`
6. **Username**: `root`
7. **Password**: Click **"Store in Vault"** → Nhập password đã tạo
8. **Test Connection** → **OK**
9. **OK** để save connection

### Bước 5: Mở Connection
1. **Double-click** vào connection **"AESP Local"**
2. Màn hình SQL Editor sẽ mở
3. Bây giờ bạn có thể chạy SQL commands

---

## Thiết Kế Database Schema

### ERD (Entity Relationship Diagram)

```
┌─────────────┐       ┌──────────────┐        ┌─────────────┐
│   roles     │───┐   │ user_roles   │    ┌───│    users    │
└─────────────┘   │   └──────────────┘    │   └─────────────┘
                  └──────────┬────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────▼──────┐  ┌───────▼───────┐
            │   mentors    │  │   learners    │
            └──────────────┘  └───────────────┘
                    │                 │
                    │         ┌───────┴────────┐
                    │         │                │
                    │   ┌─────▼─────┐  ┌───────▼────────────┐
                    │   │ packages  │  │  subscriptions     │
                    │   └───────────┘  └────────────────────┘
                    │                          │
                    │                  ┌───────▼────────────┐
                    └──────────────────┤ learning_progress  │
                                       └────────────────────┘
```

### 8 Tables Chính

| Bảng | Mô Tả | Quan Hệ |
|------|-------|---------|
| **roles** | Lưu các vai trò hệ thống | 1-N với user_roles |
| **users** | Thông tin người dùng | N-N với roles (qua user_roles) |
| **user_roles** | Bảng trung gian | Many-to-Many |
| **mentors** | Thông tin mentor | 1-1 với users |
| **learners** | Thông tin learner | 1-1 với users |
| **packages** | Gói học phí | 1-N với subscriptions |
| **subscriptions** | Đăng ký gói học | N-1 với learners, packages |
| **learning_progress** | Tiến độ học tập | N-1 với learners |

---

## Tạo Database và Tables

### Tạo Database

```sql
-- Tạo database với UTF8MB4 encoding (hỗ trợ emoji và Unicode đầy đủ)
CREATE DATABASE aesp_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE aesp_db;
```

**Copy đoạn SQL trên vào MySQL Workbench và chạy (Ctrl+Enter)**

### Tạo 8 Tables

#### 1. Bảng `roles` - Vai Trò Hệ Thống

```sql
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. Bảng `users` - Người Dùng

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Giải thích:**
- `AUTO_INCREMENT`: Tự động tăng ID
- `VARCHAR(255)`: Chuỗi có độ dài tối đa 255 ký tự
- `BOOLEAN`: Kiểu true/false
- `UNIQUE`: Không được trùng lặp
- `DEFAULT CURRENT_TIMESTAMP`: Tự động lấy thời gian hiện tại

#### 3. Bảng `user_roles` - Bảng Trung Gian

```sql
CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role_id)
);
```

**Foreign Key Constraints:**
- `ON DELETE CASCADE`: Xóa user → xóa luôn user_roles
- `UNIQUE KEY`: 1 user không thể có trùng role

#### 4. Bảng `mentors` - Thông Tin Mentor

```sql
CREATE TABLE mentors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    bio TEXT,
    experience_years INT DEFAULT 0,
    certification VARCHAR(255),
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_students INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Giải thích:**
- `TEXT`: Chuỗi dài (cho bio)
- `DECIMAL(10,2)`: Số thập phân (10 chữ số, 2 chữ số thập phân)
- `DECIMAL(3,2)`: Rating từ 0.00 đến 5.00

#### 5. Bảng `packages` - Gói Học Phí

```sql
CREATE TABLE packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Giải thích:**
- `JSON`: Lưu features dưới dạng JSON (MySQL 8.0+)
- `duration_days`: Số ngày có hiệu lực của gói

#### 6. Bảng `learners` - Thông Tin Learner

```sql
CREATE TABLE learners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    mentor_id BIGINT,
    english_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER',
    learning_goals TEXT,
    current_streak INT DEFAULT 0,
    total_practice_hours DECIMAL(5,2) DEFAULT 0.00,
    pronunciation_score DECIMAL(5,2) DEFAULT 0.00,
    grammar_score DECIMAL(5,2) DEFAULT 0.00,
    vocabulary_score DECIMAL(5,2) DEFAULT 0.00,
    overall_score DECIMAL(5,2) DEFAULT 0.00,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
);
```

**Giải thích:**
- `english_level`: BEGINNER, INTERMEDIATE, ADVANCED
- `current_streak`: Số ngày học liên tiếp
- Các `*_score`: Điểm từ AI (0.00-100.00)
- `mentor_id`: Có thể NULL (learner chưa có mentor)

#### 7. Bảng `subscriptions` - Đăng Ký Gói

```sql
CREATE TABLE subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') DEFAULT 'ACTIVE',
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE RESTRICT
);
```

**Giải thích:**
- `ENUM`: Chỉ cho phép 3 giá trị status
- `DATE`: Chỉ lưu ngày (không có giờ)
- `ON DELETE RESTRICT`: Không được xóa package nếu có subscription

#### 8. Bảng `learning_progress` - Tiến Độ Học

```sql
CREATE TABLE learning_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    lesson_type VARCHAR(50) NOT NULL,
    lesson_title VARCHAR(200) NOT NULL,
    score DECIMAL(5,2) DEFAULT 0.00,
    time_spent_minutes INT DEFAULT 0,
    attempts INT DEFAULT 1,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
);
```

**Giải thích:**
- `lesson_type`: PRONUNCIATION, GRAMMAR, VOCABULARY
- `attempts`: Số lần thử làm bài
- `notes`: Ghi chú từ mentor hoặc AI

---

## Relationships và Foreign Keys

### Primary Relationships

1. **Users ↔ User_Roles ↔ Roles** (Many-to-Many)
   - 1 user có thể có nhiều roles
   - 1 role có thể được gán cho nhiều users

2. **Users → Mentors** (One-to-One)
   - 1 user có thể là mentor
   - 1 mentor chỉ thuộc về 1 user

3. **Users → Learners** (One-to-One)
   - 1 user có thể là learner
   - 1 learner chỉ thuộc về 1 user

4. **Mentors → Learners** (One-to-Many)
   - 1 mentor có thể dạy nhiều learners
   - 1 learner chỉ có 1 mentor

5. **Learners → Subscriptions** (One-to-Many)
   - 1 learner có thể mua nhiều packages
   - 1 subscription thuộc về 1 learner

6. **Packages → Subscriptions** (One-to-Many)
   - 1 package có thể được mua bởi nhiều learners
   - 1 subscription thuộc về 1 package

7. **Learners → Learning_Progress** (One-to-Many)
   - 1 learner có nhiều bài học
   - 1 progress record thuộc về 1 learner

### Foreign Key Actions

- **CASCADE**: Xóa parent → xóa child
- **SET NULL**: Xóa parent → set child = NULL
- **RESTRICT**: Không được xóa parent nếu có child

---

## Indexes và Optimization

### Tạo Indexes Cần Thiết

```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);

-- User_roles table indexes  
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- Mentors table indexes
CREATE INDEX idx_mentors_user ON mentors(user_id);
CREATE INDEX idx_mentors_available ON mentors(is_available);
CREATE INDEX idx_mentors_rating ON mentors(rating DESC);

-- Learners table indexes
CREATE INDEX idx_learners_user ON learners(user_id);
CREATE INDEX idx_learners_mentor ON learners(mentor_id);
CREATE INDEX idx_learners_level ON learners(english_level);

-- Packages table indexes
CREATE INDEX idx_packages_active ON packages(is_active);
CREATE INDEX idx_packages_price ON packages(price);

-- Subscriptions table indexes
CREATE INDEX idx_subscriptions_learner ON subscriptions(learner_id);
CREATE INDEX idx_subscriptions_package ON subscriptions(package_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);

-- Learning_progress table indexes
CREATE INDEX idx_progress_learner ON learning_progress(learner_id);
CREATE INDEX idx_progress_type ON learning_progress(lesson_type);
CREATE INDEX idx_progress_completed ON learning_progress(completed_at DESC);
```

**Copy và chạy tất cả indexes trên trong MySQL Workbench**

---

## Seed Data - Dữ Liệu Mẫu

### Bước 1: Insert Roles

```sql
INSERT INTO roles (name, description) VALUES
('ADMIN', 'System administrator with full access'),
('MENTOR', 'English mentor who teaches learners'),
('LEARNER', 'Student learning English');
```

### Bước 2: Insert Users

```sql
INSERT INTO users (username, email, password_hash, full_name, phone, is_active) VALUES
-- Admin user
('admin', 'admin@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'System Admin', '0123456789', TRUE),

-- Mentor users  
('mentor1', 'mentor1@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'Sarah Johnson', '0123456790', TRUE),
('mentor2', 'mentor2@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'David Wilson', '0123456791', TRUE),

-- Learner users
('learner1', 'learner1@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'Nguyễn Văn An', '0123456792', TRUE),
('learner2', 'learner2@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'Trần Thị Bình', '0123456793', TRUE),
('learner3', 'learner3@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'Lê Minh Cường', '0123456794', TRUE);
```

**Lưu ý:** Password hash trên là cho password "password123"

### Bước 3: Insert User Roles

```sql
INSERT INTO user_roles (user_id, role_id) VALUES
-- Admin role
(1, 1),

-- Mentor roles
(2, 2),  
(3, 2),

-- Learner roles
(4, 3),
(5, 3),
(6, 3);
```

### Bước 4: Insert Mentors

```sql
INSERT INTO mentors (user_id, bio, experience_years, certification, hourly_rate, rating) VALUES
(2, 'Experienced English teacher with TESOL certification. Specializing in pronunciation and conversation.', 
 5, 'TESOL Certified', 25.00, 4.8),
 
(3, 'Native English speaker with business English expertise. Former corporate trainer.', 
 3, 'TEFL Certified', 30.00, 4.6);
```

### Bước 5: Insert Packages

```sql
INSERT INTO packages (name, description, price, duration_days, features) VALUES
('Basic Plan', 'Essential English practice with AI feedback', 99000.00, 30, 
 JSON_OBJECT('ai_sessions', 100, 'mentor_sessions', 2, 'progress_tracking', true, 'mobile_access', true)),
 
('Premium Plan', 'Advanced learning with mentor support', 199000.00, 30,
 JSON_OBJECT('ai_sessions', 500, 'mentor_sessions', 8, 'progress_tracking', true, 'mobile_access', true, 'priority_support', true)),
 
('Enterprise Plan', 'Complete learning solution for organizations', 499000.00, 90,
 JSON_OBJECT('ai_sessions', 2000, 'mentor_sessions', 20, 'progress_tracking', true, 'mobile_access', true, 'priority_support', true, 'custom_curriculum', true));
```

### Bước 6: Insert Learners

```sql
INSERT INTO learners (user_id, mentor_id, english_level, learning_goals) VALUES
(4, 1, 'BEGINNER', 'Improve basic conversation skills and pronunciation'),
(5, 1, 'INTERMEDIATE', 'Business English communication and presentation skills'),
(6, 2, 'ADVANCED', 'Native-level fluency and accent reduction');
```

### Bước 7: Insert Subscriptions

```sql
INSERT INTO subscriptions (learner_id, package_id, start_date, end_date, payment_amount, payment_method) VALUES
(1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 99000.00, 'CREDIT_CARD'),
(2, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 199000.00, 'PAYPAL'),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 199000.00, 'BANK_TRANSFER');
```

### Bước 8: Insert Learning Progress

```sql
INSERT INTO learning_progress (learner_id, lesson_type, lesson_title, score, time_spent_minutes, attempts) VALUES
-- Learner 1 progress
(1, 'PRONUNCIATION', 'Basic Vowel Sounds', 75.5, 25, 2),
(1, 'VOCABULARY', 'Common Greetings', 88.0, 15, 1),
(1, 'GRAMMAR', 'Present Simple Tense', 82.5, 30, 1),

-- Learner 2 progress  
(2, 'PRONUNCIATION', 'Business Presentation Skills', 91.0, 45, 1),
(2, 'VOCABULARY', 'Business Terminology', 94.5, 20, 1),

-- Learner 3 progress
(3, 'PRONUNCIATION', 'Advanced Accent Training', 96.5, 60, 1),
(3, 'GRAMMAR', 'Complex Sentence Structures', 89.0, 40, 2);
```

---

## Kiểm Tra và Test

### Test Queries Cơ Bản

#### 1. Kiểm Tra Tất Cả Tables

```sql
-- Xem tất cả tables đã tạo
SHOW TABLES;

-- Xem cấu trúc của từng table
DESCRIBE users;
DESCRIBE roles;
DESCRIBE mentors;
DESCRIBE learners;
DESCRIBE packages;
DESCRIBE subscriptions;
DESCRIBE learning_progress;
```

#### 2. Kiểm Tra User và Roles

```sql
-- Xem tất cả users và roles của họ
SELECT 
    u.id,
    u.username,
    u.full_name,
    u.email,
    GROUP_CONCAT(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.username, u.full_name, u.email;
```

#### 3. Kiểm Tra Mentors và Learners

```sql
-- Xem mentor và số learners
SELECT 
    u.full_name as mentor_name,
    m.experience_years,
    m.rating,
    COUNT(l.id) as total_learners
FROM mentors m
JOIN users u ON m.user_id = u.id
LEFT JOIN learners l ON m.id = l.mentor_id
GROUP BY m.id, u.full_name, m.experience_years, m.rating;
```

#### 4. Kiểm Tra Subscriptions

```sql
-- Xem active subscriptions
SELECT 
    u.full_name as learner_name,
    p.name as package_name,
    s.start_date,
    s.end_date,
    s.status,
    s.payment_amount
FROM subscriptions s
JOIN learners l ON s.learner_id = l.id
JOIN users u ON l.user_id = u.id
JOIN packages p ON s.package_id = p.id
WHERE s.status = 'ACTIVE'
ORDER BY s.start_date DESC;
```

#### 5. Kiểm Tra Learning Progress

```sql
-- Xem progress tổng hợp của learners
SELECT 
    u.full_name as learner_name,
    COUNT(lp.id) as total_lessons,
    AVG(lp.score) as average_score,
    SUM(lp.time_spent_minutes) as total_minutes
FROM learners l
JOIN users u ON l.user_id = u.id
LEFT JOIN learning_progress lp ON l.id = lp.learner_id
GROUP BY l.id, u.full_name
ORDER BY average_score DESC;
```

#### 6. Test Complex Query - Report Tổng Hợp

```sql
-- Report tổng hợp: Active learners với tiến độ học tập
SELECT 
    u.full_name as learner_name,
    u.email,
    l.english_level,
    p.name as current_package,
    s.end_date as package_expiry,
    COUNT(lp.id) as completed_lessons,
    AVG(lp.score) as avg_score,
    l.current_streak,
    MENTOR.full_name as mentor_name
FROM learners l
JOIN users u ON l.user_id = u.id
LEFT JOIN subscriptions s ON l.id = s.learner_id AND s.status = 'ACTIVE'
LEFT JOIN packages p ON s.package_id = p.id
LEFT JOIN learning_progress lp ON l.id = lp.learner_id
LEFT JOIN mentors m ON l.mentor_id = m.id
LEFT JOIN users MENTOR ON m.user_id = MENTOR.id
WHERE u.is_active = TRUE
GROUP BY l.id, u.full_name, u.email, l.english_level, p.name, s.end_date, l.current_streak, MENTOR.full_name
ORDER BY avg_score DESC;
```

**Kết quả mong đợi:** Thấy được 3 learners với thông tin đầy đủ

---

## 📋 Checklist Hoàn Thành

### Database Setup
- [ ] **Cài đặt MySQL Server 8.0**
- [ ] **Cài đặt MySQL Workbench**
- [ ] **Kết nối thành công (root password)**
- [ ] **Tạo database `aesp_db`**
- [ ] **Tạo 8 tables chính**
- [ ] **Tạo indexes cần thiết**
- [ ] **Insert seed data thành công**
- [ ] **Chạy test queries OK**

### Verification
- [ ] **All tables created** - `SHOW TABLES;` return 8 tables
- [ ] **Foreign key constraints working** - Không thể insert invalid data
- [ ] **Sample data inserted correctly** - 6 users, 3 roles, 2 mentors, 3 learners
- [ ] **Complex queries return expected results** - Report query hiển thị đúng
- [ ] **Database size < 50MB** (for development)

### Connection Test
- [ ] **MySQL service running** - Check Services.msc
- [ ] **Port 3306 accessible** - `netstat -an | find "3306"`
- [ ] **Spring Boot connects** - Update application.properties password

---

## 🚀 Bước Tiếp Theo

### 1. **Update Backend Config**
```properties
# Trong application.properties, thay:
spring.datasource.password=YOUR_PASSWORD_HERE
# Thành password thật của bạn, ví dụ:
spring.datasource.password=AespRoot123!
```

### 2. **Test Connection**
```bash
cd backend
mvn spring-boot:run
```

**Kết quả mong đợi:**
```
Started AespApplication in X.XXX seconds
AESP Backend is running on http://localhost:8080
```

### 3. **Create JPA Entities** 
Follow `docs/huong-dan/02-BACKEND.md`

### 4. **Build REST APIs**
Implement CRUD operations

### 5. **Frontend Integration**
Connect React với Backend APIs

---

## 🆘 Troubleshooting

### Lỗi Connection Refused
```sql
ERROR 2003 (HY000): Can't connect to MySQL server on 'localhost' (10061)
```
**Fix:** Start MySQL service: `services.msc` → MySQL80 → Start

### Lỗi Access Denied
```sql
ERROR 1045 (28000): Access denied for user 'root'@'localhost'
```
**Fix:** Reset root password hoặc check password đã nhập

### Lỗi Database Exists
```sql
ERROR 1007 (HY000): Can't create database 'aesp_db'; database exists
```
**Fix:** `DROP DATABASE aesp_db;` rồi tạo lại

### Spring Boot Connection Error
```
com.mysql.cj.jdbc.exceptions.CommunicationsException
```
**Fix:** 
1. Check MySQL service running
2. Check password trong application.properties
3. Check firewall port 3306

---

**🎉 Database MySQL của bạn đã sẵn sàng cho AESP project!**

**Next:** `docs/huong-dan/02-BACKEND.md` - Tạo JPA Entities và REST APIs