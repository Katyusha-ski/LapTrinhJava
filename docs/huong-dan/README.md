# 📚 HƯỚNG DẪN ĐỌC CÁC FILE

> **Folder này chứa 3 file hướng dẫn CODE chi tiết**

---

## 🎯 Mục Đích

Các file trong folder này hướng dẫn bạn **TỰ CODE** từ đầu đến cuối:
- Database (SQL Server)
- Backend (Spring Boot)
- Frontend (React)

⚠️ **Lưu ý:** Đây là hướng dẫn, KHÔNG có code mẫu. Bạn sẽ tự code 100%!

---

## 📖 Thứ Tự Đọc

### 1️⃣ **01-DATABASE.md** (ĐỌC VÀ LÀM ĐẦU TIÊN)
📌 **Hướng dẫn tạo Database từ đầu**

**Nội dung:**
- 🗄️ Thiết kế database schema (ERD)
- 📊 Tạo 8 tables với SQL commands
- 🔗 Relationships và Foreign Keys
- 📝 Indexes để tối ưu
- 💾 Seed data (dữ liệu mẫu)
- 🧪 Test queries

**Thời gian:** ~2-3 giờ

**Kết quả sau khi làm xong:**
- ✅ Database `AESP_DB` với 8 tables
- ✅ Dữ liệu mẫu để test

---

### 2️⃣ **02-BACKEND.md** (LÀM TIẾP SAU DATABASE)
📌 **Hướng dẫn code Backend Spring Boot**

**Nội dung:**
- ⚙️ Setup Spring Boot project
- 📝 Config `pom.xml` và `application.properties`
- 🗂️ Code 7 Entity classes (User, Role, Mentor, Learner, Package, Subscription, LearningProgress)
- 📚 Code Repository layer (JPA)
- 🔐 Implement Security + JWT
- 🎯 Code Service layer (Business logic)
- 🌐 Code Controller layer (REST API)
- ⚠️ Exception handling

**Thời gian:** ~1-2 tuần (20-30 giờ)

**Kết quả sau khi làm xong:**
- ✅ Backend API: http://localhost:8080/api
- ✅ Authentication với JWT
- ✅ CRUD endpoints đầy đủ

---

### 3️⃣ **03-FRONTEND.md** (LÀM CUỐI CÙNG)
📌 **Hướng dẫn code Frontend React**

**Nội dung:**
- ⚛️ Setup React với Vite
- 📦 Install dependencies (router, axios, bootstrap)
- 🔐 Code Authentication Context
- 🌐 Code API Service layer (axios)
- 🧩 Code Components (Header, Footer, ProtectedRoute)
- 📄 Code Pages (Login, Register, Dashboards)
- 🎨 Styling với Bootstrap

**Thời gian:** ~1 tuần (15-20 giờ)

**Kết quả sau khi làm xong:**
- ✅ Frontend UI: http://localhost:5173
- ✅ Login/Register pages
- ✅ Dashboards cho Admin/Mentor/Learner

---

## 🗺️ Workflow Đơn Giản

```
📅 TUẦN 1: DATABASE + BACKEND CORE
├─ Ngày 1-2: Database (04-DATABASE.md)
└─ Ngày 3-7: Backend Authentication (05-BACKEND.md)

📅 TUẦN 2: BACKEND FEATURES
├─ Entities, Repositories, Services
└─ Controllers & APIs

📅 TUẦN 3: FRONTEND
├─ Setup + Auth pages
└─ Dashboards

📅 TUẦN 4: HOÀN THIỆN
├─ Integration testing
├─ Bug fixes
└─ Polish UI
```

---

## 📋 Checklist Nhanh

### Database
- [ ] Đọc `01-DATABASE.md`
- [ ] Tạo 8 tables
- [ ] Insert seed data
- [ ] Test queries

### Backend
- [ ] Đọc `02-BACKEND.md`
- [ ] Code 7 Entities
- [ ] Code 7 Repositories
- [ ] Code Security + JWT
- [ ] Code Services
- [ ] Code Controllers
- [ ] Test APIs với Postman

### Frontend
- [ ] Đọc `03-FRONTEND.md`
- [ ] Code AuthContext
- [ ] Code API Services
- [ ] Code Components
- [ ] Code Pages
- [ ] Test UI trong browser

---

## 💡 Tips

1. **Làm từng bước nhỏ**: Đừng cố code tất cả một lúc
2. **Test thường xuyên**: Test sau mỗi feature
3. **Commit code**: Git commit sau mỗi bước hoàn thành
4. **Đọc kỹ hướng dẫn**: Mỗi file có examples chi tiết

---

## 🆘 Khi Cần Hỗ Trợ

### Đọc thêm các file:
- `../../README.md` - Tổng quan dự án
- `../../BAT-DAU-CODE.md` - Roadmap chi tiết 5 tuần
- `../CHUC-NANG-DE-BAI.md` - Checklist theo đề bài
- `../../SETUP-HOAN-TAT.md` - Xác nhận setup hoàn tất
- `../../backend/README.md` - Backend checklist
- `../../frontend/README.md` - Frontend checklist

---

## ❓ Câu Hỏi Thường Gặp

### Q: Tôi phải code theo thứ tự không?
**A:** CÓ. Luôn luôn: Database → Backend → Frontend

### Q: Foundation files đã setup chưa?
**A:** RỒI. Backend và Frontend foundation files đã có sẵn trong `backend/` và `frontend/`

### Q: Tôi cần biết gì trước khi bắt đầu?
**A:** 
- Java 17 + Maven (backend)
- Node.js + npm (frontend)
- SQL Server (database)
- Biết cơ bản Spring Boot, React, SQL

### Q: Mất bao lâu để hoàn thành?
**A:** 3-5 tuần:
- Database: 2-3 giờ
- Backend: 1-2 tuần
- Frontend: 1 tuần
- Testing + polish: 3-7 ngày

### Q: File nào quan trọng nhất?
**A:** `../../BAT-DAU-CODE.md` - Roadmap đầy đủ với timeline chi tiết

---

## 🚀 Bắt Đầu Ngay!

**👉 Bước tiếp theo:** 

1. Đọc `../../BAT-DAU-CODE.md` để hiểu roadmap
2. Đọc `../CHUC-NANG-DE-BAI.md` để biết features cần làm
3. Bắt đầu với `01-DATABASE.md`

---

**Chúc bạn code vui vẻ! 🎉**
