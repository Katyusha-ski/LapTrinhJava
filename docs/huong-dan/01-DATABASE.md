# 04 - HƯỚNG DẪN THIẾT KẾ DATABASE

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Cài Đặt SQL Server](#cài-đặt-sql-server)
3. [Thiết Kế Database Schema](#thiết-kế-database-schema)
4. [Tạo Database và Tables](#tạo-database-và-tables)
5. [Relationships và Foreign Keys](#relationships-và-foreign-keys)
6. [Indexes và Optimization](#indexes-và-optimization)
7. [Seed Data - Dữ Liệu Mẫu](#seed-data---dữ-liệu-mẫu)
8. [Kiểm Tra và Test](#kiểm-tra-và-test)

---

## Tổng Quan

### Database Platform
- **CSDL**: Microsoft SQL Server 2019 hoặc mới hơn
- **Tools**: SQL Server Management Studio (SSMS)
- **Database Name**: `AESP_DB`
- **Authentication**: SQL Server Authentication hoặc Windows Authentication

### Mục Tiêu
Thiết kế database cho hệ thống **AESP** (AI-Supported English Speaking Practice) với:
- **3 vai trò**: Admin, Mentor, Learner
- **Chức năng chính**: Quản lý người dùng, gói học, đăng ký, tiến độ học tập
- **Tích hợp AI**: Lưu trữ điểm số phát âm, ngữ pháp, từ vựng

---

## Cài Đặt SQL Server

### Bước 1: Download SQL Server
```
Link: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
Chọn: SQL Server 2019 Developer Edition (Miễn phí)
```

### Bước 2: Cài Đặt SSMS
```
Link: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms
Download: SQL Server Management Studio 19 (mới nhất)
```

### Bước 3: Kết Nối Database
1. Mở SSMS
2. Server name: `localhost` hoặc `.\SQLEXPRESS`
3. Authentication: Windows Authentication (hoặc SQL Server Authentication)
4. Click **Connect**

### Bước 4: Tạo Database Mới
```sql
-- Mở New Query window và chạy:
CREATE DATABASE AESP_DB;
GO

USE AESP_DB;
GO
```

---

## Thiết Kế Database Schema

### ERD - Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   roles     │───┐   │ user_roles   │   ┌───│    users    │
└─────────────┘   │   └──────────────┘   │   └─────────────┘
                  └──────────┬────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────▼──────┐  ┌──────▼────────┐
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

### Các Bảng Chính

| Bảng | Mô Tả | Quan Hệ |
|------|-------|---------|
| **roles** | Lưu các vai trò hệ thống | 1-N với user_roles |
| **users** | Thông tin người dùng | N-N với roles (qua user_roles) |
| **user_roles** | Bảng trung gian | Many-to-Many |
| **mentors** | Thông tin mentor | 1-1 với users |
| **learners** | Thông tin learner | 1-1 với users |
| **packages** | Gói học phí | 1-N với subscriptions |
| **subscriptions** | Đăng ký gói học | N-1 với learners, packages |
| **learning_progress** | Tiến độ học tập | N-1 với learners, mentors |

---

## Tạo Database và Tables

### 1. Bảng `roles` - Vai Trò Hệ Thống

```sql
-- Tạo bảng roles
CREATE TABLE roles (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
```

**Giải thích:**
- `IDENTITY(1,1)`: Auto-increment, bắt đầu từ 1, tăng 1 đơn vị
- `NVARCHAR`: Hỗ trợ Unicode (tiếng Việt)
- `UNIQUE`: Tên vai trò không được trùng
- `DEFAULT GETDATE()`: Tự động lấy thời gian hiện tại

---

### 2. Bảng `users` - Người Dùng

```sql
CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL, -- Mã hóa BCrypt
    full_name NVARCHAR(100),
    phone NVARCHAR(20),
    avatar_url NVARCHAR(500),
    is_active BIT DEFAULT 1, -- 1: Active, 0: Inactive
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
```

**Lưu ý:**
- Password phải mã hóa bằng BCrypt (Spring Security sẽ xử lý)
- Email và Username phải UNIQUE
- `BIT`: Kiểu boolean (0/1)

---

### 3. Bảng `user_roles` - Bảng Trung Gian

```sql
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

**Giải thích:**
- **Composite Primary Key**: Kết hợp user_id và role_id
- **CASCADE**: Khi xóa user/role, tự động xóa các bản ghi liên quan
- **Many-to-Many**: Một user có thể có nhiều roles

---

### 4. Bảng `mentors` - Thông Tin Mentor

```sql
CREATE TABLE mentors (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    bio NVARCHAR(1000), -- Giới thiệu bản thân
    experience_years INT DEFAULT 0, -- Số năm kinh nghiệm
    specialization NVARCHAR(255), -- Chuyên môn: IELTS, TOEIC, Business English
    hourly_rate DECIMAL(10,2), -- Giá/giờ (nếu có)
    rating DECIMAL(3,2) DEFAULT 0.00, -- Đánh giá: 0.00 - 5.00
    total_reviews INT DEFAULT 0, -- Số lượt đánh giá
    is_available BIT DEFAULT 1, -- Còn nhận học viên không
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Giải thích:**
- `DECIMAL(10,2)`: Số thập phân, 10 chữ số, 2 chữ số thập phân
- `rating`: Điểm đánh giá từ 0 đến 5 sao
- **1-1 Relationship**: Một user chỉ là một mentor

---

### 5. Bảng `learners` - Thông Tin Học Viên

```sql
CREATE TABLE learners (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    proficiency_level NVARCHAR(20) DEFAULT 'BEGINNER', 
    -- BEGINNER, INTERMEDIATE, ADVANCED
    learning_goals NVARCHAR(500), -- Mục tiêu học tập
    preferred_topics NVARCHAR(500), -- Chủ đề yêu thích
    mentor_id BIGINT, -- Mentor đang hướng dẫn (nếu có)
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
);
```

**Lưu ý:**
- `proficiency_level`: Trình độ hiện tại
- `mentor_id`: NULL nếu chưa có mentor
- `ON DELETE SET NULL`: Khi xóa mentor, không xóa learner, chỉ set NULL

---

### 6. Bảng `packages` - Gói Học Phí

```sql
CREATE TABLE packages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL, -- VD: Basic, Standard, Premium
    description NVARCHAR(1000),
    price DECIMAL(10,2) NOT NULL, -- Giá gói (VNĐ hoặc USD)
    duration_days INT NOT NULL, -- Thời hạn (ngày)
    ai_practice_sessions INT DEFAULT 0, -- Số buổi AI practice
    mentor_hours DECIMAL(5,2) DEFAULT 0.00, -- Số giờ mentor (nếu có)
    has_mentor BIT DEFAULT 0, -- Có mentor không
    features NVARCHAR(MAX), -- Các tính năng (JSON format)
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
```

**Ví dụ packages:**
- **Basic**: 500k VNĐ, 30 ngày, 20 buổi AI, không mentor
- **Standard**: 1 triệu VNĐ, 30 ngày, 50 buổi AI, không mentor
- **Premium**: 2 triệu VNĐ, 30 ngày, unlimited AI, 5 giờ mentor

---

### 7. Bảng `subscriptions` - Đăng Ký Gói Học

```sql
CREATE TABLE subscriptions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status NVARCHAR(20) DEFAULT 'ACTIVE', 
    -- ACTIVE, EXPIRED, CANCELLED, PENDING
    payment_method NVARCHAR(50), -- VNPay, Momo, Banking
    payment_amount DECIMAL(10,2),
    payment_date DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);
```

**Giải thích:**
- `status`: Trạng thái đăng ký
- `payment_*`: Thông tin thanh toán
- Tự động tính `end_date = start_date + duration_days`

---

### 8. Bảng `learning_progress` - Tiến Độ Học Tập

```sql
CREATE TABLE learning_progress (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    mentor_id BIGINT, -- NULL nếu tự học với AI
    session_date DATETIME2 NOT NULL,
    topic NVARCHAR(255), -- Chủ đề bài học
    duration_minutes INT, -- Thời lượng (phút)
    
    -- Điểm số AI đánh giá (0-100)
    pronunciation_score DECIMAL(5,2),
    grammar_score DECIMAL(5,2),
    vocabulary_score DECIMAL(5,2),
    fluency_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    
    ai_feedback NVARCHAR(MAX), -- Phản hồi từ AI (JSON)
    mentor_feedback NVARCHAR(MAX), -- Phản hồi từ Mentor
    recording_url NVARCHAR(500), -- Link file ghi âm
    notes NVARCHAR(1000), -- Ghi chú
    
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
);
```

**Lưu ý:**
- Lưu điểm số chi tiết từ AI
- `ai_feedback` có thể lưu dạng JSON
- `recording_url`: Link file âm thanh trên cloud

---

## Relationships và Foreign Keys

### Tóm Tắt Quan Hệ

```sql
-- Users <-> Roles (Many-to-Many)
users 1-N user_roles N-1 roles

-- Users <-> Mentors (One-to-One)
users 1-1 mentors

-- Users <-> Learners (One-to-One)
users 1-1 learners

-- Mentors <-> Learners (One-to-Many)
mentors 1-N learners

-- Learners <-> Packages (Many-to-Many qua Subscriptions)
learners 1-N subscriptions N-1 packages

-- Learners <-> Learning Progress (One-to-Many)
learners 1-N learning_progress

-- Mentors <-> Learning Progress (One-to-Many)
mentors 1-N learning_progress
```

### Kiểm Tra Foreign Keys

```sql
-- Xem tất cả foreign keys trong database
SELECT 
    fk.name AS ForeignKeyName,
    tp.name AS ParentTable,
    cp.name AS ParentColumn,
    tr.name AS ReferencedTable,
    cr.name AS ReferencedColumn
FROM 
    sys.foreign_keys AS fk
    INNER JOIN sys.tables AS tp ON fk.parent_object_id = tp.object_id
    INNER JOIN sys.tables AS tr ON fk.referenced_object_id = tr.object_id
    INNER JOIN sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
    INNER JOIN sys.columns AS cp ON fkc.parent_column_id = cp.column_id AND fkc.parent_object_id = cp.object_id
    INNER JOIN sys.columns AS cr ON fkc.referenced_column_id = cr.column_id AND fkc.referenced_object_id = cr.object_id
ORDER BY tp.name, fk.name;
```

---

## Indexes và Optimization

### Tại Sao Cần Index?
- **Tăng tốc độ query**: Tìm kiếm nhanh hơn (giống mục lục sách)
- **Cải thiện performance**: Đặc biệt với bảng lớn (>10,000 records)
- **Foreign Key**: Nên có index trên cột FK

### Tạo Indexes

```sql
-- Index trên users.email (thường xuyên search by email)
CREATE INDEX idx_users_email ON users(email);

-- Index trên users.username
CREATE INDEX idx_users_username ON users(username);

-- Index trên user_roles (tăng tốc JOIN)
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Index trên learners.mentor_id
CREATE INDEX idx_learners_mentor_id ON learners(mentor_id);

-- Index trên subscriptions
CREATE INDEX idx_subscriptions_learner_id ON subscriptions(learner_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- Index trên learning_progress
CREATE INDEX idx_progress_learner_id ON learning_progress(learner_id);
CREATE INDEX idx_progress_mentor_id ON learning_progress(mentor_id);
CREATE INDEX idx_progress_session_date ON learning_progress(session_date);
```

### Kiểm Tra Indexes

```sql
-- Xem tất cả indexes trong database
SELECT 
    t.name AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    COL_NAME(ic.object_id, ic.column_id) AS ColumnName
FROM 
    sys.indexes AS i
    INNER JOIN sys.index_columns AS ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    INNER JOIN sys.tables AS t ON i.object_id = t.object_id
WHERE 
    i.type > 0 -- Loại bỏ HEAP
ORDER BY t.name, i.name, ic.index_column_id;
```

---

## Seed Data - Dữ Liệu Mẫu

### 1. Insert Roles

```sql
-- Thêm 3 roles chính
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Administrator - Full system access'),
('ROLE_MENTOR', 'Mentor - Teach and guide learners'),
('ROLE_LEARNER', 'Learner - Practice English speaking');
```

### 2. Insert Users (Admin)

```sql
-- Thêm admin user
-- Password: "admin123" đã mã hóa BCrypt
INSERT INTO users (username, email, password, full_name, phone, is_active) VALUES
('admin', 'admin@aesp.com', '$2a$10$DummyHashForTesting', N'System Admin', '0901234567', 1);

-- Gán role ADMIN cho user
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1); -- user_id=1 (admin), role_id=1 (ROLE_ADMIN)
```

**LƯU Ý:** Password `$2a$10$DummyHashForTesting` là ví dụ. Khi code Backend, dùng BCryptPasswordEncoder để mã hóa thật.

### 3. Insert Mentor

```sql
-- Thêm user mentor
INSERT INTO users (username, email, password, full_name, phone, is_active) VALUES
('mentor1', 'mentor1@aesp.com', '$2a$10$DummyHashForTesting', N'John Smith', '0902345678', 1);

-- Gán role MENTOR
INSERT INTO user_roles (user_id, role_id) VALUES
(2, 2); -- user_id=2, role_id=2 (ROLE_MENTOR)

-- Thêm thông tin mentor
INSERT INTO mentors (user_id, bio, experience_years, specialization, hourly_rate, rating, is_available) VALUES
(2, N'Experienced IELTS trainer with 8+ years teaching English', 8, 'IELTS, Business English', 500000, 4.85, 1);
```

### 4. Insert Learner

```sql
-- Thêm user learner
INSERT INTO users (username, email, password, full_name, phone, is_active) VALUES
('learner1', 'learner1@aesp.com', '$2a$10$DummyHashForTesting', N'Nguyen Van A', '0903456789', 1);

-- Gán role LEARNER
INSERT INTO user_roles (user_id, role_id) VALUES
(3, 3); -- user_id=3, role_id=3 (ROLE_LEARNER)

-- Thêm thông tin learner (có mentor)
INSERT INTO learners (user_id, proficiency_level, learning_goals, mentor_id) VALUES
(3, 'INTERMEDIATE', N'Improve speaking for IELTS 7.0', 1); -- mentor_id=1 (John Smith)
```

### 5. Insert Packages

```sql
-- Thêm 4 gói học
INSERT INTO packages (name, description, price, duration_days, ai_practice_sessions, mentor_hours, has_mentor, is_active) VALUES
('Basic', N'Học với AI - Phù hợp người mới bắt đầu', 500000, 30, 20, 0, 0, 1),
('Standard', N'Học với AI - Không giới hạn buổi học', 1000000, 30, 999, 0, 0, 1),
('Premium', N'AI + Mentor - 5 giờ hướng dẫn', 2000000, 30, 999, 5, 1, 1),
('Enterprise', N'AI + Mentor - 15 giờ hướng dẫn + Lộ trình cá nhân', 5000000, 90, 999, 15, 1, 1);
```

### 6. Insert Subscription

```sql
-- Learner1 đăng ký gói Premium
INSERT INTO subscriptions (learner_id, package_id, start_date, end_date, status, payment_method, payment_amount, payment_date) VALUES
(1, 3, '2024-01-01', '2024-01-31', 'ACTIVE', 'VNPay', 2000000, '2024-01-01 10:30:00');
```

### 7. Insert Learning Progress

```sql
-- Thêm 1 buổi học mẫu
INSERT INTO learning_progress (learner_id, mentor_id, session_date, topic, duration_minutes, 
    pronunciation_score, grammar_score, vocabulary_score, fluency_score, overall_score, 
    ai_feedback, mentor_feedback) 
VALUES
(1, 1, '2024-01-05 14:00:00', 'Daily Conversation - Introducing Yourself', 45,
 85.5, 78.0, 82.0, 80.5, 81.5,
 N'{"strengths": ["Good pronunciation", "Clear voice"], "improvements": ["Grammar tenses", "Vocabulary range"]}',
 N'Good progress! Focus more on past tense usage.');
```

---

## Kiểm Tra và Test

### 1. Kiểm Tra Tables Đã Tạo

```sql
-- Xem tất cả tables trong database
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
```

Kết quả mong đợi:
```
learners
learning_progress
mentors
packages
roles
subscriptions
user_roles
users
```

### 2. Đếm Số Records

```sql
-- Đếm số records trong mỗi bảng
SELECT 'roles' AS TableName, COUNT(*) AS RecordCount FROM roles
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'mentors', COUNT(*) FROM mentors
UNION ALL
SELECT 'learners', COUNT(*) FROM learners
UNION ALL
SELECT 'packages', COUNT(*) FROM packages
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'learning_progress', COUNT(*) FROM learning_progress;
```

### 3. Test Queries

```sql
-- Lấy thông tin user kèm roles
SELECT 
    u.id, u.username, u.email, u.full_name,
    STRING_AGG(r.name, ', ') AS roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.username, u.email, u.full_name;

-- Lấy danh sách learners và mentors của họ
SELECT 
    u.full_name AS learner_name,
    l.proficiency_level,
    m.full_name AS mentor_name
FROM learners l
INNER JOIN users u ON l.user_id = u.id
LEFT JOIN mentors mt ON l.mentor_id = mt.id
LEFT JOIN users m ON mt.user_id = m.id;

-- Lấy subscriptions đang active
SELECT 
    u.full_name AS learner_name,
    p.name AS package_name,
    s.start_date,
    s.end_date,
    s.status
FROM subscriptions s
INNER JOIN learners l ON s.learner_id = l.id
INNER JOIN users u ON l.user_id = u.id
INNER JOIN packages p ON s.package_id = p.id
WHERE s.status = 'ACTIVE';

-- Thống kê learning progress của learner
SELECT 
    u.full_name AS learner_name,
    COUNT(*) AS total_sessions,
    AVG(lp.overall_score) AS avg_score,
    MAX(lp.session_date) AS last_session
FROM learning_progress lp
INNER JOIN learners l ON lp.learner_id = l.id
INNER JOIN users u ON l.user_id = u.id
GROUP BY u.full_name;
```

---

## 📝 Checklist - Hoàn Thành Database

- [ ] Cài đặt SQL Server và SSMS
- [ ] Tạo database `AESP_DB`
- [ ] Tạo 8 tables: roles, users, user_roles, mentors, learners, packages, subscriptions, learning_progress
- [ ] Thiết lập Foreign Keys đúng
- [ ] Tạo Indexes trên các cột quan trọng
- [ ] Insert seed data: 3 roles, 3 users (admin/mentor/learner), 4 packages
- [ ] Test queries để kiểm tra relationships
- [ ] Backup database (optional): Right-click AESP_DB → Tasks → Back Up

---

## 🎯 Bước Tiếp Theo

Sau khi hoàn thành Database:
1. ✅ Chuyển sang **05-BACKEND.md**: Setup Spring Boot, tạo Entities, Repositories, Services
2. Kiểm tra connection từ Spring Boot đến SQL Server
3. Test API endpoints với Postman

---

## 📚 Tài Liệu Tham Khảo

- [SQL Server Documentation](https://docs.microsoft.com/en-us/sql/)
- [Database Design Best Practices](https://www.sqlshack.com/learn-sql-database-design/)
- [Indexing Strategies](https://use-the-index-luke.com/)

---

**File:** `docs/huong-dan/04-DATABASE.md`  
**Tác giả:** AESP Development Team  
**Cập nhật:** 2024-01-01
