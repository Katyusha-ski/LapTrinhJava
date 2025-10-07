# AESP Frontend - React Application

## 📁 Cấu Trúc Thư Mục

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/                     # Images, fonts
│   ├── components/                 # Reusable components
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   └── learner/
│   │       └── PackageCard.jsx
│   ├── context/                    # React Context
│   │   └── AuthContext.jsx
│   ├── pages/                      # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── learner/
│   │   │   ├── LearnerDashboard.jsx
│   │   │   └── PackagesPage.jsx
│   │   ├── mentor/
│   │   │   └── MentorDashboard.jsx
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx
│   │   └── HomePage.jsx
│   ├── services/                   # API calls
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── userService.js
│   │   └── packageService.js
│   ├── utils/                      # Utility functions
│   │   └── constants.js
│   ├── styles/                     # CSS files
│   ├── App.jsx                     # Main App component
│   ├── App.css
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── .env                            # Environment variables
├── vite.config.js                  # Vite configuration
├── package.json                    # Dependencies
└── README.md
```

## 🚀 Chạy Frontend

### Bước 1: Cài Đặt Dependencies
```bash
npm install
```

### Bước 2: Chạy Development Server
```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### Bước 3: Build Production
```bash
npm run build
```

## 📝 TODO: Các Thành Phần Cần Code

### 1. Context (src/context/)
- [ ] AuthContext.jsx - Quản lý authentication state

### 2. Services (src/services/)
- [ ] api.js - Axios instance với interceptors
- [ ] authService.js - Login, Register, Logout
- [ ] userService.js - User CRUD
- [ ] packageService.js - Package management
- [ ] subscriptionService.js - Subscription management

### 3. Components (src/components/)
- [ ] Header.jsx - Navigation bar
- [ ] Footer.jsx
- [ ] ProtectedRoute.jsx - Route guard
- [ ] LoginForm.jsx
- [ ] RegisterForm.jsx
- [ ] PackageCard.jsx

### 4. Pages (src/pages/)
- [ ] HomePage.jsx
- [ ] LoginPage.jsx
- [ ] RegisterPage.jsx
- [ ] LearnerDashboard.jsx
- [ ] MentorDashboard.jsx
- [ ] AdminDashboard.jsx
- [ ] PackagesPage.jsx

## 📚 Hướng Dẫn Chi Tiết

Xem file: `docs/huong-dan/06-FRONTEND.md`
