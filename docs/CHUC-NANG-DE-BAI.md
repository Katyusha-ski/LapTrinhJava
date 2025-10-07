# 📋 CHỨC NĂNG THEO ĐỀ BÀI

> File này liệt kê **CHỈ CÁC CHỨC NĂNG CÓ TRONG ĐỀ BÀI**. Không code thêm gì dư thừa!

---

## 👤 ADMIN

### Authentication
- [ ] Login
- [ ] Logout

### User Management
- [ ] View user list (Admin, Mentor, Learner)
- [ ] Enable/Disable user accounts
- [ ] Dashboard with statistics

### Mentor Management
- [ ] View mentor list
- [ ] Manage mentor skills/specializations
- [ ] Enable/Disable mentor accounts

### Package Management
- [ ] Create service packages
- [ ] Update package pricing
- [ ] Set package features (with/without mentor)
- [ ] Enable/Disable packages

### Purchase Management
- [ ] View learner package purchases
- [ ] View purchase history
- [ ] Manage payment status

### Content Moderation
- [ ] Moderate feedback & comments
- [ ] Provide learner support services

### Reports & Statistics
- [ ] View system statistics
- [ ] Generate reports
- [ ] Create system policies

---

## 👨‍🏫 MENTOR

### Authentication
- [ ] Login
- [ ] Logout

### Assessment
- [ ] Organize assessment for learners
- [ ] Leveling learners based on proficiency

### Teaching Materials
- [ ] Provide relevant documents
- [ ] Share learning resources

### Feedback & Correction
- [ ] Point out pronunciation errors
- [ ] Point out grammar errors
- [ ] Point out unnatural word usage
- [ ] Give immediate feedback after practice sessions

### Guidance
- [ ] Guide learners to express clearly & confidently
- [ ] Provide conversation topics
- [ ] Provide real-life conversation situations
- [ ] Suggest vocabulary learning methods
- [ ] Suggest collocations and idioms
- [ ] Share communication experiences with native speakers

---

## 🎓 LEARNER

### Authentication
- [ ] Login
- [ ] Logout

### Initial Assessment
- [ ] Complete English proficiency assessment
- [ ] Complete pronunciation assessment

### Profile & Goals
- [ ] Create learning profile
- [ ] Customize learning profile
- [ ] Set learning goals
- [ ] Set preferences

### Package Purchase
- [ ] Search service packages
- [ ] Compare packages
- [ ] Purchase packages
- [ ] Choose package with/without mentor
- [ ] Upgrade subscription
- [ ] Downgrade subscription

### Learning Features
- [ ] Access adaptive curriculum
- [ ] Access personalized learning paths
- [ ] Practice speaking with AI support
- [ ] Practice speaking with other learners
- [ ] Choose conversation topics (travel, business, daily life, etc.)
- [ ] Choose conversation scenarios
- [ ] Select specialized topics/industries (business, tourism, healthcare)

### Feedback & Scoring
- [ ] Receive grammar corrections
- [ ] Receive vocabulary corrections
- [ ] Receive pronunciation scoring
- [ ] Get immediate feedback after practice

### Progress Tracking
- [ ] Track progress with analytics
- [ ] View heat maps
- [ ] View progress trends
- [ ] Receive weekly performance reports
- [ ] Receive monthly performance reports

### Gamification (Optional - có trong đề)
- [ ] Access speaking challenges
- [ ] View leaderboards
- [ ] Earn rewards
- [ ] Track learning streaks

---

## 🗄️ DATABASE TABLES CẦN THIẾT

### Core Tables
1. **users** - Lưu thông tin user (admin/mentor/learner)
2. **roles** - Vai trò (ADMIN, MENTOR, LEARNER)
3. **user_roles** - Many-to-many giữa users và roles

### Mentor Tables
4. **mentors** - Thông tin mentor (bio, experience, specialization, rating)
5. **mentor_skills** - Kỹ năng của mentor

### Learner Tables
6. **learners** - Thông tin learner (proficiency level, goals)
7. **learning_profiles** - Profile học tập chi tiết
8. **assessments** - Kết quả đánh giá đầu vào

### Package Tables
9. **packages** - Gói học phí
10. **subscriptions** - Đăng ký gói của learners

### Practice & Progress Tables
11. **practice_sessions** - Buổi luyện tập
12. **learning_progress** - Tiến độ học tập
13. **feedback** - Phản hồi từ mentor/AI
14. **corrections** - Sửa lỗi (pronunciation, grammar, vocabulary)

### Content Tables
15. **topics** - Chủ đề hội thoại
16. **scenarios** - Tình huống thực tế
17. **documents** - Tài liệu học tập từ mentor

### Gamification Tables (Optional)
18. **challenges** - Thử thách
19. **rewards** - Phần thưởng
20. **leaderboard** - Bảng xếp hạng
21. **streaks** - Chuỗi ngày học liên tục

### Reports Tables
22. **performance_reports** - Báo cáo tuần/tháng
23. **statistics** - Thống kê hệ thống

---

## 🚫 KHÔNG CẦN THIẾT (Không code)

- ❌ Chart.js visualization (dùng simple tables)
- ❌ ModelMapper (convert manual)
- ❌ Real-time chat (không có trong đề)
- ❌ Video call (không có trong đề)
- ❌ Payment gateway integration (chỉ quản lý payment status)
- ❌ Email notifications (không bắt buộc)
- ❌ SMS notifications (không có trong đề)
- ❌ Social media login (không có trong đề)

---

## 📌 LƯU Ý QUAN TRỌNG

1. **Focus vào Core Features trước**:
   - Authentication (Login/Logout)
   - User Management
   - Package Management
   - Basic Learning Flow

2. **Gamification là Optional**:
   - Có thể làm sau khi hoàn thành core features
   - Hoặc bỏ qua nếu không đủ thời gian

3. **AI Features**:
   - Pronunciation scoring: Có thể mock data
   - Grammar/vocabulary corrections: Có thể dùng rule-based đơn giản
   - Adaptive learning paths: Có thể dùng logic if-else đơn giản

4. **Reports**:
   - Weekly/Monthly reports: Generate từ learning_progress data
   - Analytics: Tính toán từ practice_sessions

---

**File:** `docs/CHUC-NANG-DE-BAI.md`  
**Mục đích:** Checklist các chức năng CẦN làm theo đề bài  
**Cập nhật:** 2024-01-01
