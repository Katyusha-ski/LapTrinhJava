# 06 - HƯỚNG DẪN FRONTEND REACT

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Setup React Project với Vite](#setup-react-project-với-vite)
3. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
4. [Configuration Files](#configuration-files)
5. [Routing với React Router](#routing-với-react-router)
6. [Authentication Context](#authentication-context)
7. [API Service Layer](#api-service-layer)
8. [Components](#components)
9. [Pages](#pages)
10. [Styling với Bootstrap](#styling-với-bootstrap)
11. [State Management](#state-management)
12. [Testing và Deployment](#testing-và-deployment)

---

## Tổng Quan

### Tech Stack
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8 (nhanh hơn Create React App)
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.2
- **UI Library**: React Bootstrap 2.9.1
- **State Management**: Context API (hoặc Redux)
- **Charts**: Chart.js 4.4.0

### Kiến Trúc
```
Pages (UI Screens)
    ↓
Components (Reusable UI)
    ↓
Services (API Calls)
    ↓
Backend API
```

---

## Setup React Project với Vite

### Bước 1: Tạo Project với Vite

```bash
# Trong folder frontend/
npm create vite@latest . -- --template react

# Hoặc nếu folder chưa tồn tại:
npm create vite@latest frontend -- --template react
cd frontend
```

**Lựa chọn:**
- Framework: **React**
- Variant: **JavaScript** (hoặc TypeScript nếu bạn muốn)

---

### Bước 2: Install Dependencies

```bash
npm install
```

---

### Bước 3: Install Thêm Packages

```bash
# Routing
npm install react-router-dom

# HTTP Client
npm install axios

# UI Library
npm install react-bootstrap bootstrap

# Icons
npm install react-icons

# Toast Notifications
npm install react-toastify

# Charts (optional)
npm install chart.js react-chartjs-2

# Form Validation (optional)
npm install formik yup
```

---

## Cấu Trúc Thư Mục

```
frontend/
├── public/
│   └── vite.svg                    # Favicon
├── src/
│   ├── assets/                     # Images, fonts
│   │   └── logo.png
│   ├── components/                 # Reusable components
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── learner/
│   │   │   ├── PackageCard.jsx
│   │   │   ├── ProgressChart.jsx
│   │   │   └── SessionHistory.jsx
│   │   └── mentor/
│   │       ├── LearnerList.jsx
│   │       └── SessionForm.jsx
│   ├── context/                    # React Context
│   │   └── AuthContext.jsx
│   ├── pages/                      # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── learner/
│   │   │   ├── LearnerDashboard.jsx
│   │   │   ├── PackagesPage.jsx
│   │   │   ├── MyProgressPage.jsx
│   │   │   └── PracticePage.jsx
│   │   ├── mentor/
│   │   │   ├── MentorDashboard.jsx
│   │   │   ├── MyLearnersPage.jsx
│   │   │   └── SessionsPage.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   └── PackagesManagement.jsx
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/                   # API calls
│   │   ├── api.js                  # Axios instance
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── packageService.js
│   │   └── learningProgressService.js
│   ├── utils/                      # Utility functions
│   │   ├── constants.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── styles/                     # CSS files
│   │   ├── App.css
│   │   ├── Dashboard.css
│   │   └── Auth.css
│   ├── App.jsx                     # Main App component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── .env                            # Environment variables
├── .env.example                    # Example env file
├── vite.config.js                  # Vite configuration
├── package.json                    # Dependencies
└── README.md
```

---

## Configuration Files

### 1. `vite.config.js` - Vite Configuration

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

**Giải thích:**
- `port: 5173`: Frontend chạy ở port 5173
- `proxy`: Chuyển tiếp requests từ `/api` sang `http://localhost:8080/api`
  - Tránh CORS errors khi development
  - Frontend gọi `/api/auth/login` → Backend `http://localhost:8080/api/auth/login`

---

### 2. `.env` - Environment Variables

```env
# Backend API URL
VITE_API_URL=http://localhost:8080/api

# App Name
VITE_APP_NAME=AESP - AI English Speaking Practice
```

**Lưu ý:**
- Vite yêu cầu prefix `VITE_` cho environment variables
- Sử dụng: `import.meta.env.VITE_API_URL`

---

### 3. `package.json` - Dependencies

```json
{
  "name": "aesp-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "react-bootstrap": "^2.9.1",
    "bootstrap": "^5.3.2",
    "react-icons": "^4.12.0",
    "react-toastify": "^9.1.3",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

---

## Routing với React Router

### 1. `main.jsx` - Entry Point

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

---

### 2. `App.jsx` - Main App Component với Routes

```jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Header from './components/common/Header'
import Footer from './components/common/Footer'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import LearnerDashboard from './pages/learner/LearnerDashboard'
import MentorDashboard from './pages/mentor/MentorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import NotFoundPage from './pages/NotFoundPage'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes - Learner */}
            <Route 
              path="/learner/*" 
              element={
                <ProtectedRoute roles={['ROLE_LEARNER']}>
                  <LearnerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Mentor */}
            <Route 
              path="/mentor/*" 
              element={
                <ProtectedRoute roles={['ROLE_MENTOR']}>
                  <MentorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Admin */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute roles={['ROLE_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </AuthProvider>
  )
}

export default App
```

---

## Authentication Context

### `AuthContext.jsx` - Quản Lý Authentication State

```jsx
import React, { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import { toast } from 'react-toastify'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  // Load user từ localStorage khi app khởi động
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])
  
  // Login
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      const userData = response.data
      
      // Lưu user và token vào localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', userData.token)
      setUser(userData)
      
      // Redirect theo role
      const role = userData.roles[0]
      if (role === 'ROLE_ADMIN') {
        navigate('/admin')
      } else if (role === 'ROLE_MENTOR') {
        navigate('/mentor')
      } else {
        navigate('/learner')
      }
      
      toast.success('Đăng nhập thành công!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại')
      throw error
    }
  }
  
  // Register
  const register = async (userData) => {
    try {
      await authService.register(userData)
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại')
      throw error
    }
  }
  
  // Logout
  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
    toast.info('Đã đăng xuất')
  }
  
  // Check if user has specific role
  const hasRole = (role) => {
    return user?.roles?.includes(role)
  }
  
  const value = {
    user,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated: !!user
  }
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## API Service Layer

### 1. `api.js` - Axios Instance

```javascript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Thêm JWT token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

### 2. `authService.js` - Authentication API Calls

```javascript
import api from './api'

const authService = {
  // Login
  login: (credentials) => {
    return api.post('/auth/login', credentials)
  },
  
  // Register
  register: (userData) => {
    return api.post('/auth/register', userData)
  },
  
  // Get current user
  getCurrentUser: () => {
    return api.get('/auth/me')
  }
}

export default authService
```

---

### 3. `userService.js` - User API Calls

```javascript
import api from './api'

const userService = {
  // Get all users (Admin only)
  getAllUsers: () => {
    return api.get('/users')
  },
  
  // Get user by ID
  getUserById: (id) => {
    return api.get(`/users/${id}`)
  },
  
  // Update user profile
  updateProfile: (id, userData) => {
    return api.put(`/users/${id}`, userData)
  },
  
  // Delete user (Admin only)
  deleteUser: (id) => {
    return api.delete(`/users/${id}`)
  }
}

export default userService
```

---

### 4. Các Service Khác

Tạo tương tự:
- `packageService.js`: CRUD packages
- `subscriptionService.js`: Đăng ký gói, xem subscriptions
- `learningProgressService.js`: Xem tiến độ, thêm session

---

## Components

### 1. `ProtectedRoute.jsx` - Route Bảo Vệ

```jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth()
  
  // Chưa đăng nhập → redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // Kiểm tra role nếu có yêu cầu
  if (roles && roles.length > 0) {
    const hasRequiredRole = roles.some(role => user.roles.includes(role))
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />
    }
  }
  
  return children
}

export default ProtectedRoute
```

---

### 2. `Header.jsx` - Navigation Bar

```jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
  }
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          AESP
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                
                {user.roles.includes('ROLE_LEARNER') && (
                  <Nav.Link as={Link} to="/learner">Dashboard</Nav.Link>
                )}
                
                {user.roles.includes('ROLE_MENTOR') && (
                  <Nav.Link as={Link} to="/mentor">Dashboard</Nav.Link>
                )}
                
                {user.roles.includes('ROLE_ADMIN') && (
                  <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
                )}
                
                <NavDropdown title={user.username} id="user-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
```

---

### 3. `Loader.jsx` - Loading Spinner

```jsx
import React from 'react'
import { Spinner } from 'react-bootstrap'

const Loader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  )
}

export default Loader
```

---

## Pages

### 1. `LoginPage.jsx`

```jsx
import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(credentials)
    } catch (error) {
      // Error được xử lý trong AuthContext
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h3 className="text-center mb-4">Đăng Nhập</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default LoginPage
```

---

### 2. `RegisterPage.jsx`

```jsx
import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'LEARNER' // Default role
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords không khớp')
      return
    }
    
    setLoading(true)
    try {
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
    } catch (error) {
      // Error được xử lý trong AuthContext
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h3 className="text-center mb-4">Đăng Ký</h3>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username *</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password *</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password *</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Bạn là:</Form.Label>
                  <Form.Select 
                    name="role" 
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="LEARNER">Learner (Học viên)</option>
                    <option value="MENTOR">Mentor (Giảng viên)</option>
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default RegisterPage
```

---

### 3. `LearnerDashboard.jsx`

```jsx
import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import subscriptionService from '../../services/subscriptionService'
import learningProgressService from '../../services/learningProgressService'
import ProgressChart from '../../components/learner/ProgressChart'
import SessionHistory from '../../components/learner/SessionHistory'

const LearnerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeSubscription: null,
    totalSessions: 0,
    averageScore: 0
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      // Fetch subscription
      const subResponse = await subscriptionService.getMySubscriptions()
      const activeSub = subResponse.data.find(sub => sub.status === 'ACTIVE')
      
      // Fetch learning progress
      const progressResponse = await learningProgressService.getMyProgress()
      const sessions = progressResponse.data
      
      const avgScore = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.overallScore, 0) / sessions.length
        : 0
      
      setStats({
        activeSubscription: activeSub,
        totalSessions: sessions.length,
        averageScore: avgScore.toFixed(2)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <Loader />
  
  return (
    <Container className="mt-4">
      <h2>Welcome back, {user.fullName}!</h2>
      
      <Row className="mt-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <h5>Active Package</h5>
              <p>{stats.activeSubscription?.packageName || 'No active package'}</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <h5>Total Sessions</h5>
              <h3>{stats.totalSessions}</h3>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <h5>Average Score</h5>
              <h3>{stats.averageScore}%</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={6}>
          <ProgressChart />
        </Col>
        <Col md={6}>
          <SessionHistory />
        </Col>
      </Row>
    </Container>
  )
}

export default LearnerDashboard
```

---

## Styling với Bootstrap

### `index.css` - Global Styles

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 50px;
}

/* Custom card styles */
.card {
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

/* Button customization */
.btn {
  border-radius: 5px;
  padding: 10px 20px;
}

/* Dashboard stats cards */
.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
}
```

---

## State Management

### Khi Nào Cần Redux?
- **Context API đủ dùng** cho app nhỏ/vừa (< 20 components)
- **Redux** khi:
  - App phức tạp (> 50 components)
  - Nhiều levels nesting
  - Cần time-travel debugging

### Setup Redux Toolkit (Optional)

```bash
npm install @reduxjs/toolkit react-redux
```

---

## Testing và Deployment

### 1. Build Production

```bash
# Build app
npm run build

# Output: dist/ folder
```

---

### 2. Preview Build

```bash
npm run preview
```

---

### 3. Deploy

**Options:**
- **Vercel**: Free hosting, tự động deploy từ GitHub
- **Netlify**: Tương tự Vercel
- **GitHub Pages**: Free cho static sites
- **AWS S3 + CloudFront**: Production-grade

---

## 📝 Checklist - Hoàn Thành Frontend

- [ ] Setup React project với Vite
- [ ] Install dependencies (react-router-dom, axios, react-bootstrap)
- [ ] Cấu hình `vite.config.js` với proxy
- [ ] Tạo `.env` file với API URL
- [ ] Implement `AuthContext` cho authentication
- [ ] Tạo `api.js` và các service files
- [ ] Implement `ProtectedRoute` component
- [ ] Tạo `Header`, `Footer` components
- [ ] Implement `LoginPage`, `RegisterPage`
- [ ] Tạo dashboards cho Learner, Mentor, Admin
- [ ] Test integration với Backend API
- [ ] Build và deploy

---

## 🎯 Bước Tiếp Theo

1. ✅ Hoàn thành Database
2. ✅ Hoàn thành Backend
3. ✅ Hoàn thành Frontend
4. ➡️ **Integration Testing**: Test toàn bộ flow Login → Dashboard → API calls
5. ➡️ **Deployment**: Deploy Backend (Heroku/Railway) + Frontend (Vercel/Netlify)

---

**File:** `docs/huong-dan/06-FRONTEND.md`  
**Tác giả:** AESP Development Team  
**Cập nhật:** 2024-01-01
