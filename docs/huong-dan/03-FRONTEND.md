# 03 - HƯỚNG DẪN FRONTEND REACT + OPENAI INTEGRATION

## 📋 Mục Lục
1. [Tổng Quan](#1-tổng-quan)
2. [Setup Project](#2-setup-project)
3. [Cấu Trúc Thư Mục](#3-cấu-trúc-thư-mục)
4. [Configuration Files](#4-configuration-files)
5. [TypeScript Types](#5-typescript-types)
6. [API Service Layer](#6-api-service-layer)
7. [Context & Hooks](#7-context--hooks)
8. [Components](#8-components)
9. [Pages](#9-pages)
10. [OpenAI Integration](#10-openai-integration)
11. [Audio Recording & TTS](#11-audio-recording--tts)
12. [Deployment](#12-deployment)

---

## 1. Tổng Quan

### Tech Stack
- **Framework**: React 18.3+ với TypeScript
- **Build Tool**: Vite 5.0+
- **Routing**: React Router DOM 6.20+
- **HTTP Client**: Axios
- **UI**: Tailwind CSS 3.4+
- **State Management**: Context API + React Hooks
- **AI**: OpenAI API (GPT-4, Whisper, TTS)
- **Forms**: React Hook Form + Zod
- **Notifications**: React Toastify

### Kiến Trúc Backend-Frontend
```
┌─────────────────────────────────────────┐
│         Frontend (React + TS)           │
│  ┌───────────────────────────────────┐  │
│  │  Pages (Login, Dashboard, etc.)   │  │
│  └───────────┬───────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │  Context (Auth, AI)               │  │
│  └───────────┬───────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │  Services (API Calls)             │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼─────────────────────────┘
               │ HTTP (Axios)
               ↓
┌─────────────────────────────────────────┐
│      Backend (Spring Boot)              │
│  ┌───────────────────────────────────┐  │
│  │  Controllers (10 endpoints)       │  │
│  │  - AuthController                 │  │
│  │  - UserController                 │  │
│  │  - LearnerController              │  │
│  │  - MentorController               │  │
│  │  - PackageController              │  │
│  │  - SubscriptionController         │  │
│  │  - PracticeSessionController      │  │
│  │  - AIConversationController       │  │
│  │  - ConversationTopicController    │  │
│  │  - PronunciationScoreController   │  │
│  └───────────┬───────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │  Services (Business Logic)        │  │
│  └───────────┬───────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │  Repositories (JPA)               │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼─────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Database (MySQL)                │
│  - users, roles                         │
│  - learners, mentors                    │
│  - packages, subscriptions              │
│  - practice_sessions                    │
│  - ai_conversations                     │
│  - pronunciation_scores                 │
└─────────────────────────────────────────┘
```

---

## 2. Setup Project

### Bước 1: Kiểm Tra Project Hiện Tại

```bash
cd frontend
ls -la
# Nên thấy: vite.config.ts, tsconfig.json, tailwind.config.cjs
```

### Bước 2: Install Dependencies

```bash
npm install
```

### Bước 3: Install Thêm Packages

```bash
# Core libraries
npm install react-router-dom axios

# UI & Styling (Tailwind đã có)
npm install @headlessui/react @heroicons/react react-icons

# Notifications
npm install react-toastify

# OpenAI Integration
npm install openai

# Audio Recording
npm install recordrtc

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Utilities
npm install date-fns clsx
```

---

## 3. Cấu Trúc Thư Mục

```
frontend/
├── src/
│   ├── types/              # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── learner.types.ts
│   │   ├── mentor.types.ts
│   │   ├── package.types.ts
│   │   ├── session.types.ts
│   │   └── ai.types.ts
│   ├── services/           # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── learnerService.ts
│   │   ├── mentorService.ts
│   │   ├── packageService.ts
│   │   ├── subscriptionService.ts
│   │   ├── practiceSessionService.ts
│   │   ├── aiConversationService.ts
│   │   ├── pronunciationScoreService.ts
│   │   ├── conversationTopicService.ts
│   │   └── openaiService.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AIContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAI.ts
│   │   └── useAudioRecorder.ts
│   ├── components/
│   │   ├── common/
│   │   ├── auth/
│   │   ├── learner/
│   │   ├── mentor/
│   │   └── ai/
│   ├── pages/
│   │   ├── auth/
│   │   ├── learner/
│   │   ├── mentor/
│   │   └── admin/
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .env.example
├── vite.config.ts
├── tailwind.config.cjs
└── tsconfig.json
```

---

## 4. Configuration Files

### 4.1. `.env`

```env
# Backend API
VITE_API_URL=http://localhost:8080/api

# OpenAI (CHỈ CHO DEV - PRODUCTION DÙNG BACKEND)
VITE_OPENAI_API_KEY=sk-your-key-here

# App Config
VITE_APP_NAME=AESP
VITE_ENV=development
```

### 4.2. `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

---

## 5. TypeScript Types

### 5.1. `types/auth.types.ts`

```typescript
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface JwtResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}
```

### 5.2. `types/session.types.ts`

```typescript
export enum SessionType {
  AI_ASSISTED = 'AI_ASSISTED',
  MENTOR_LED = 'MENTOR_LED'
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface PracticeSession {
  id: number;
  learnerId: number;
  mentorId?: number;
  sessionType: SessionType;
  sessionStatus: SessionStatus;
  startTime: string;
  endTime?: string;
  topic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeSessionRequest {
  learnerId: number;
  mentorId?: number;
  sessionType: SessionType;
  startTime: string;
  endTime?: string;
  topic?: string;
}
```

### 5.3. `types/ai.types.ts`

```typescript
export interface AIMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: number;
  practiceSessionId: number;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface PronunciationScore {
  id: number;
  learnerId: number;
  practiceSessionId?: number;
  text: string;
  audioUrl?: string;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  overallScore: number;
  feedback: string;
  createdAt: string;
}

export interface ConversationTopic {
  id: number;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  isActive: boolean;
}
```

---

## 6. API Service Layer

### 6.1. `services/api.ts` - Axios Instance

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 6.2. `services/authService.ts`

```typescript
import api from './api';
import { LoginRequest, RegisterRequest, JwtResponse } from '@/types/auth.types';

export const authService = {
  login: (credentials: LoginRequest) => 
    api.post<JwtResponse>('/auth/login', credentials),
  
  register: (userData: RegisterRequest) => 
    api.post('/auth/register', userData),
  
  getCurrentUser: () => 
    api.get('/users/me')
};
```

### 6.3. `services/practiceSessionService.ts`

```typescript
import api from './api';
import { PracticeSession, PracticeSessionRequest, SessionStatus } from '@/types/session.types';

export const practiceSessionService = {
  createSession: (data: PracticeSessionRequest) =>
    api.post<PracticeSession>('/practice-sessions', data),
  
  getAllSessions: () =>
    api.get<PracticeSession[]>('/practice-sessions'),
  
  getSessionsByLearner: (learnerId: number) =>
    api.get<PracticeSession[]>(`/practice-sessions/learner/${learnerId}`),
  
  getSessionsByMentor: (mentorId: number) =>
    api.get<PracticeSession[]>(`/practice-sessions/mentor/${mentorId}`),
  
  getSessionById: (id: number) =>
    api.get<PracticeSession>(`/practice-sessions/${id}`),
  
  updateSessionStatus: (id: number, status: SessionStatus) =>
    api.patch(`/practice-sessions/${id}/status`, null, { params: { status } }),
  
  deleteSession: (id: number) =>
    api.delete(`/practice-sessions/${id}`)
};
```

### 6.4. `services/aiConversationService.ts`

```typescript
import api from './api';
import { AIConversation, AIMessage } from '@/types/ai.types';

export const aiConversationService = {
  // Lấy conversation của session
  getConversationBySession: (sessionId: number) =>
    api.get<AIConversation>(`/ai-conversations/session/${sessionId}`),
  
  // Tạo conversation mới
  createConversation: (sessionId: number) =>
    api.post<AIConversation>('/ai-conversations', { sessionId }),
  
  // Gửi message và nhận response từ AI (qua backend)
  sendMessage: (conversationId: number, message: string) =>
    api.post<AIMessage>(`/ai-conversations/${conversationId}/message`, { 
      content: message 
    }),
  
  // Lấy lịch sử chat
  getMessages: (conversationId: number) =>
    api.get<AIMessage[]>(`/ai-conversations/${conversationId}/messages`)
};
```

### 6.5. `services/pronunciationScoreService.ts`

```typescript
import api from './api';
import { PronunciationScore } from '@/types/ai.types';

export const pronunciationScoreService = {
  // Đánh giá phát âm (gửi audio file)
  evaluatePronunciation: (learnerId: number, audioBlob: Blob, text: string) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('text', text);
    formData.append('learnerId', learnerId.toString());
    
    return api.post<PronunciationScore>('/pronunciation-scores/evaluate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Lấy scores của learner
  getScoresByLearner: (learnerId: number) =>
    api.get<PronunciationScore[]>(`/pronunciation-scores/learner/${learnerId}`),
  
  // Lấy score theo ID
  getScoreById: (id: number) =>
    api.get<PronunciationScore>(`/pronunciation-scores/${id}`)
};
```

### 6.6. `services/conversationTopicService.ts`

```typescript
import api from './api';
import { ConversationTopic } from '@/types/ai.types';

export const conversationTopicService = {
  getAllTopics: () =>
    api.get<ConversationTopic[]>('/conversation-topics'),
  
  getActiveTopics: () =>
    api.get<ConversationTopic[]>('/conversation-topics/active'),
  
  getTopicById: (id: number) =>
    api.get<ConversationTopic>(`/conversation-topics/${id}`),
  
  createTopic: (data: Partial<ConversationTopic>) =>
    api.post<ConversationTopic>('/conversation-topics', data),
  
  updateTopic: (id: number, data: Partial<ConversationTopic>) =>
    api.put<ConversationTopic>(`/conversation-topics/${id}`, data)
};
```

---

## 7. Context & Hooks

### 7.1. `context/AuthContext.tsx`

```typescript
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { LoginRequest, RegisterRequest, JwtResponse } from '@/types/auth.types';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: JwtResponse | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<JwtResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      const userData = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      setUser(userData);
      
      // Redirect dựa vào role
      const role = userData.roles[0];
      if (role.includes('ADMIN')) navigate('/admin');
      else if (role.includes('MENTOR')) navigate('/mentor');
      else navigate('/learner');
      
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
      throw error;
    }
  };
  
  const register = async (userData: RegisterRequest) => {
    try {
      await authService.register(userData);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
      throw error;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    toast.info('Đã đăng xuất');
  };
  
  const hasRole = (role: string) => {
    return user?.roles?.some(r => r.includes(role)) || false;
  };
  
  const value = {
    user,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated: !!user
  };
  
  if (loading) return <div>Loading...</div>;
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### 7.2. `hooks/useAuth.ts`

```typescript
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 7.3. `hooks/useAudioRecorder.ts`

```typescript
import { useState, useRef } from 'react';
import RecordRTC from 'recordrtc';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000
      });
      
      recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  };
  
  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (recorderRef.current) {
        recorderRef.current.stopRecording(() => {
          const blob = recorderRef.current!.getBlob();
          setAudioBlob(blob);
          setIsRecording(false);
          
          // Stop all tracks
          recorderRef.current!.getInternalRecorder().stream.getTracks().forEach(track => track.stop());
          
          resolve(blob);
        });
      }
    });
  };
  
  const resetRecording = () => {
    setAudioBlob(null);
  };
  
  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording
  };
};
```

---

## 8. Components

### 8.1. `components/common/ProtectedRoute.tsx`

```typescript
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && roles.length > 0) {
    const hasRequiredRole = roles.some(role => 
      user?.roles?.some(userRole => userRole.includes(role))
    );
    
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};
```

### 8.2. `components/ai/VoiceRecorder.tsx`

```typescript
import React, { useState } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { pronunciationScoreService } from '@/services/pronunciationScoreService';
import { toast } from 'react-toastify';
import { FaMicrophone, FaStop, FaPaperPlane } from 'react-icons/fa';

interface VoiceRecorderProps {
  learnerId: number;
  targetText: string;
  onScoreReceived?: (score: any) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  learnerId, 
  targetText, 
  onScoreReceived 
}) => {
  const { isRecording, audioBlob, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const handleStartRecording = async () => {
    try {
      await startRecording();
      toast.info('Bắt đầu ghi âm...');
    } catch (error) {
      toast.error('Không thể truy cập microphone');
    }
  };
  
  const handleStopRecording = async () => {
    await stopRecording();
    toast.success('Đã dừng ghi âm');
  };
  
  const handleSubmit = async () => {
    if (!audioBlob) return;
    
    setIsEvaluating(true);
    try {
      const response = await pronunciationScoreService.evaluatePronunciation(
        learnerId,
        audioBlob,
        targetText
      );
      
      toast.success('Đã đánh giá phát âm!');
      onScoreReceived?.(response.data);
      resetRecording();
    } catch (error) {
      toast.error('Lỗi khi đánh giá phát âm');
    } finally {
      setIsEvaluating(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Luyện phát âm</h3>
      
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600 mb-2">Hãy đọc câu sau:</p>
        <p className="text-lg font-medium">{targetText}</p>
      </div>
      
      <div className="flex items-center gap-4">
        {!isRecording && !audioBlob && (
          <button
            onClick={handleStartRecording}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <FaMicrophone /> Bắt đầu ghi
          </button>
        )}
        
        {isRecording && (
          <button
            onClick={handleStopRecording}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 animate-pulse"
          >
            <FaStop /> Dừng ghi
          </button>
        )}
        
        {audioBlob && !isRecording && (
          <>
            <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1" />
            <button
              onClick={handleSubmit}
              disabled={isEvaluating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <FaPaperPlane />
              {isEvaluating ? 'Đang đánh giá...' : 'Gửi đánh giá'}
            </button>
            <button
              onClick={resetRecording}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Ghi lại
            </button>
          </>
        )}
      </div>
    </div>
  );
};
```

### 8.3. `components/ai/ChatInterface.tsx`

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { aiConversationService } from '@/services/aiConversationService';
import { AIMessage } from '@/types/ai.types';
import { toast } from 'react-toastify';
import { FaPaperPlane } from 'react-icons/fa';

interface ChatInterfaceProps {
  sessionId: number;
  conversationId?: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, conversationId }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    loadConversation();
  }, [sessionId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const loadConversation = async () => {
    try {
      const response = await aiConversationService.getConversationBySession(sessionId);
      setCurrentConversationId(response.data.id);
      setMessages(response.data.messages);
    } catch (error) {
      // Nếu chưa có conversation, tạo mới
      try {
        const createResponse = await aiConversationService.createConversation(sessionId);
        setCurrentConversationId(createResponse.data.id);
        setMessages([]);
      } catch (createError) {
        toast.error('Không thể tạo conversation');
      }
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentConversationId) return;
    
    const userMessage: AIMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    
    try {
      const response = await aiConversationService.sendMessage(currentConversationId, inputMessage);
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      toast.error('Lỗi khi gửi tin nhắn');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">AI Conversation</h3>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <FaPaperPlane /> Gửi
          </button>
        </div>
      </form>
    </div>
  );
};
```

---

## 9. Pages

### 9.1. `pages/learner/AIPracticePage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { conversationTopicService } from '@/services/conversationTopicService';
import { practiceSessionService } from '@/services/practiceSessionService';
import { ConversationTopic } from '@/types/ai.types';
import { SessionType } from '@/types/session.types';
import { ChatInterface } from '@/components/ai/ChatInterface';
import { VoiceRecorder } from '@/components/ai/VoiceRecorder';
import { toast } from 'react-toastify';

export const AIPracticePage: React.FC = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ConversationTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [learnerId, setLearnerId] = useState<number | null>(null);
  
  useEffect(() => {
    loadTopics();
    // TODO: Fetch learner ID from user
  }, []);
  
  const loadTopics = async () => {
    try {
      const response = await conversationTopicService.getActiveTopics();
      setTopics(response.data);
    } catch (error) {
      toast.error('Không thể tải topics');
    }
  };
  
  const handleStartPractice = async (topic: ConversationTopic) => {
    if (!learnerId) {
      toast.error('Không tìm thấy learner ID');
      return;
    }
    
    try {
      // Tạo practice session mới
      const sessionResponse = await practiceSessionService.createSession({
        learnerId: learnerId,
        sessionType: SessionType.AI_ASSISTED,
        startTime: new Date().toISOString(),
        topic: topic.title
      });
      
      setSessionId(sessionResponse.data.id);
      setSelectedTopic(topic);
      toast.success('Bắt đầu session luyện tập!');
    } catch (error) {
      toast.error('Không thể tạo session');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Practice Session</h1>
      
      {!sessionId ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map(topic => (
            <div key={topic.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
              <p className="text-gray-600 mb-4">{topic.description}</p>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded text-sm ${
                  topic.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                  topic.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {topic.difficulty}
                </span>
                <button
                  onClick={() => handleStartPractice(topic)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Bắt đầu
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <ChatInterface sessionId={sessionId} />
          </div>
          <div>
            {learnerId && (
              <VoiceRecorder
                learnerId={learnerId}
                targetText="Hello, how are you today?"
                onScoreReceived={(score) => {
                  toast.success(`Score: ${score.overallScore}/100`);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 10. OpenAI Integration

### 10.1. Backend Implementation (Recommended)

**⚠️ LƯU Ý:** Để bảo mật API key, nên implement OpenAI integration ở **backend**.

**Backend Controller Example:**

```java
@RestController
@RequestMapping("/api/ai-conversations")
public class AIConversationController {
    
    @Autowired
    private OpenAIService openAIService;
    
    @PostMapping("/{id}/message")
    public ResponseEntity<AIMessage> sendMessage(
        @PathVariable Long id,
        @RequestBody MessageRequest request
    ) {
        // 1. Lưu user message vào DB
        // 2. Gọi OpenAI API
        String aiResponse = openAIService.chat(request.getContent());
        // 3. Lưu AI response vào DB
        // 4. Return response
        return ResponseEntity.ok(aiMessage);
    }
}
```

### 10.2. Frontend-Only Implementation (Development Only)

Nếu muốn test nhanh ở frontend:

```typescript
// services/openaiService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // CHỈ CHO DEV!
});

export const openaiService = {
  async chat(messages: Array<{ role: string; content: string }>) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response.choices[0].message.content;
  },
  
  async transcribeAudio(audioBlob: Blob) {
    const file = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
    
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en'
    });
    
    return response.text;
  },
  
  async textToSpeech(text: string) {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text
    });
    
    return response.blob();
  }
};
```

---

## 11. Audio Recording & TTS

### 11.1. Web Speech API (Alternative)

```typescript
// utils/speechRecognition.ts
export class SpeechRecognitionService {
  private recognition: any;
  
  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
  }
  
  start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      
      this.recognition.onerror = (event: any) => {
        reject(event.error);
      };
      
      this.recognition.start();
    });
  }
  
  stop() {
    this.recognition.stop();
  }
}

// Text-to-Speech
export const speak = (text: string, lang: string = 'en-US') => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};
```

---

## 12. Deployment

### 12.1. Build Production

```bash
npm run build
# Output: dist/
```

### 12.2. Environment Variables cho Production

```env
VITE_API_URL=https://api.your-domain.com/api
VITE_APP_NAME=AESP
VITE_ENV=production
# KHÔNG có OPENAI_API_KEY - backend sẽ xử lý
```

### 12.3. Deploy Options

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist/` folder
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket

---

## 📝 Checklist Implementation

### Phase 1: Core Setup
- [ ] Install dependencies
- [ ] Setup environment variables
- [ ] Configure TypeScript types
- [ ] Implement API service layer
- [ ] Create AuthContext

### Phase 2: Basic Features
- [ ] Login/Register pages
- [ ] Protected routes
- [ ] Learner Dashboard
- [ ] Mentor Dashboard
- [ ] Package listing

### Phase 3: AI Features
- [ ] Conversation topics
- [ ] Chat interface với backend
- [ ] Voice recording
- [ ] Pronunciation evaluation
- [ ] Practice session management

### Phase 4: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Toast notifications
- [ ] Testing

### Phase 5: Deployment
- [ ] Build optimization
- [ ] Environment setup
- [ ] Deploy frontend
- [ ] Connect to production backend

---

**Tác giả:** AESP Development Team  
**Cập nhật:** November 2025  
**Version:** 2.0 (Updated with OpenAI Integration)
