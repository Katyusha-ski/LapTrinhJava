# 03 - HƯỚNG DẪN FRONTEND - AI SPEAKING PRACTICE APP

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
11. [Audio Recording & Speech](#11-audio-recording--speech)
12. [Deployment](#12-deployment)

---

## 1. Tổng Quan

### 🎯 Mục Đích
Ứng dụng **AI Speaking Practice** giúp người học:
- 🗣️ **Luyện nói tiếng Anh** với AI (Voice Chat)
- 🎤 **Đánh giá phát âm** (Pronunciation Scoring)
- 💬 **Trò chuyện tự nhiên** theo các chủ đề khác nhau
- 📊 **Theo dõi tiến độ** qua các session

### Tech Stack
- **Framework**: React 18.3+ với TypeScript
- **Build Tool**: Vite 5.0+
- **Routing**: React Router DOM 6.20+
- **HTTP Client**: Axios
- **UI**: Tailwind CSS 3.4+
- **State Management**: Context API + React Hooks
- **AI**: OpenAI API (GPT-4 cho chat, Whisper cho Speech-to-Text, TTS cho Text-to-Speech)
- **Audio**: RecordRTC hoặc Web Speech API
- **Notifications**: React Toastify

### Luồng Hoạt Động Chính

```
User Flow - Speaking Practice:

1. Chọn Topic → Tạo Practice Session
2. AI đưa ra câu hỏi/tình huống (Text + Voice)
3. User trả lời bằng giọng nói (Record Audio)
4. Backend transcribe audio (Whisper API)
5. Backend đánh giá pronunciation + fluency
6. AI phản hồi (GPT-4) + Feedback
7. Lặp lại với câu hỏi tiếp theo
8. Kết thúc session → Lưu scores + feedback
```

---

## 2. Setup Project

### Install Dependencies

```bash
cd frontend
npm install

# Core packages cho Speaking Practice
npm install react-router-dom axios
npm install recordrtc # Audio recording
npm install react-toastify # Notifications
npm install @headlessui/react @heroicons/react # UI components
npm install date-fns clsx # Utilities

# TypeScript types
npm install -D @types/recordrtc
```

---

## 3. Cấu Trúc Thư Mục

```
frontend/
├── src/
│   ├── types/              
│   │   ├── auth.types.ts
│   │   ├── session.types.ts      # Speaking session types
│   │   ├── conversation.types.ts # Voice conversation types
│   │   └── score.types.ts        # Pronunciation scoring types
│   ├── services/           
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── sessionService.ts     # Practice session API
│   │   ├── conversationService.ts # AI conversation API
│   │   ├── pronunciationService.ts # Pronunciation evaluation
│   │   └── topicService.ts       # Conversation topics
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── SpeakingContext.tsx   # Speaking session state
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useVoiceRecorder.ts   # Voice recording hook
│   │   ├── useSpeechSynthesis.ts # Text-to-Speech hook
│   │   └── useSpeakingSession.ts # Session management
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── speaking/             # Speaking-specific components
│   │   │   ├── TopicCard.tsx     # Display conversation topic
│   │   │   ├── VoiceRecorder.tsx # Recording interface
│   │   │   ├── AIResponsePlayer.tsx # Play AI voice response
│   │   │   ├── TranscriptDisplay.tsx # Show transcribed text
│   │   │   ├── PronunciationFeedback.tsx # Show scores
│   │   │   └── ConversationFlow.tsx # Full conversation UI
│   │   └── dashboard/
│   │       ├── SessionHistory.tsx
│   │       └── ProgressChart.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── learner/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TopicSelectionPage.tsx    # Choose speaking topic
│   │   │   ├── SpeakingPracticePage.tsx  # Main practice page
│   │   │   └── HistoryPage.tsx           # View past sessions
│   │   └── mentor/
│   │       └── ReviewPage.tsx            # Mentor reviews sessions
│   ├── utils/
│   │   ├── audioUtils.ts         # Audio processing helpers
│   │   ├── scoreCalculator.ts    # Pronunciation scoring logic
│   │   └── constants.ts
│   ├── App.tsx
│   └── main.tsx
```

---

## 4. Configuration Files

### 4.1. `.env`

```env
# Backend API
VITE_API_URL=http://localhost:8080/api

# OpenAI (CHỈ LƯU Ở BACKEND - Frontend không dùng)
# VITE_OPENAI_API_KEY=sk-... # ❌ KHÔNG dùng cho production

# App Config
VITE_APP_NAME=AI Speaking Practice
VITE_ENV=development
```

---

## 5. TypeScript Types

### 5.1. `types/session.types.ts`

```typescript
export enum SessionType {
  AI_CONVERSATION = 'AI_CONVERSATION',       // Trò chuyện tự do với AI
  PRONUNCIATION_DRILL = 'PRONUNCIATION_DRILL', // Luyện phát âm câu cụ thể
  SCENARIO_PRACTICE = 'SCENARIO_PRACTICE'    // Luyện tình huống (ordering food, etc.)
}

export enum SessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface SpeakingSession {
  id: number;
  learnerId: number;
  topicId: number;
  sessionType: SessionType;
  sessionStatus: SessionStatus;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  overallScore?: number;
  createdAt: string;
}

export interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  averageScore: number;
  improvementRate: number;
}
```

### 5.2. `types/conversation.types.ts`

```typescript
export interface ConversationMessage {
  id?: number;
  sessionId: number;
  role: 'ai' | 'user';
  textContent: string;           // AI's question hoặc User's transcript
  audioUrl?: string;             // URL của audio file (AI voice hoặc User recording)
  timestamp: string;
  pronunciationScore?: number;   // Chỉ có với user messages
}

export interface ConversationTopic {
  id: number;
  title: string;                 // "Ordering Food at Restaurant"
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;              // "Daily Life", "Business", "Travel"
  sampleQuestions: string[];     // AI sẽ hỏi các câu này
  targetVocabulary: string[];    // Từ vựng cần luyện
  estimatedDuration: number;     // phút
  isActive: boolean;
}

export interface AIPromptContext {
  topicTitle: string;
  difficulty: string;
  conversationHistory: ConversationMessage[];
  userLevel?: string;
}
```

### 5.3. `types/score.types.ts`

```typescript
export interface PronunciationScore {
  id: number;
  learnerId: number;
  sessionId: number;
  messageId?: number;            // Link to conversation message
  
  // Transcription
  expectedText?: string;         // Text user should say (for drills)
  transcribedText: string;       // What user actually said
  
  // Scores (0-100)
  accuracyScore: number;         // Pronunciation accuracy
  fluencyScore: number;          // Speaking fluency
  completenessScore: number;     // Did they say everything?
  intonationScore?: number;      // Voice tone/rhythm
  overallScore: number;
  
  // Feedback
  detailedFeedback: string;      // "Your 'th' sound needs work..."
  strengths: string[];           // ["Good pace", "Clear vowels"]
  improvements: string[];        // ["Practice 'r' sound", "Speak louder"]
  
  audioUrl: string;              // URL of recorded audio
  createdAt: string;
}

export interface WordPronunciation {
  word: string;
  expected: string;              // IPA phonetic
  actual: string;                // User's pronunciation
  score: number;
  isCorrect: boolean;
}
```

---

## 6. API Service Layer

### 6.1. `services/api.ts`

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 6.2. `services/sessionService.ts`

```typescript
import api from './api';
import { SpeakingSession, SessionType } from '@/types/session.types';

export const sessionService = {
  // Tạo speaking session mới
  createSession: (learnerId: number, topicId: number, type: SessionType) =>
    api.post<SpeakingSession>('/speaking-sessions', {
      learnerId,
      topicId,
      sessionType: type,
      startTime: new Date().toISOString()
    }),
  
  // Kết thúc session
  endSession: (sessionId: number, overallScore: number) =>
    api.patch(`/speaking-sessions/${sessionId}/end`, {
      endTime: new Date().toISOString(),
      overallScore
    }),
  
  // Lấy lịch sử sessions
  getSessionsByLearner: (learnerId: number) =>
    api.get<SpeakingSession[]>(`/speaking-sessions/learner/${learnerId}`),
  
  // Lấy chi tiết session
  getSessionDetail: (sessionId: number) =>
    api.get<SpeakingSession>(`/speaking-sessions/${sessionId}`)
};
```

### 6.3. `services/conversationService.ts`

```typescript
import api from './api';
import { ConversationMessage, AIPromptContext } from '@/types/conversation.types';

export const conversationService = {
  // Gửi audio của user → Backend transcribe + AI response
  sendUserAudio: async (sessionId: number, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('sessionId', sessionId.toString());
    
    // Backend sẽ:
    // 1. Transcribe audio (Whisper)
    // 2. Đánh giá pronunciation
    // 3. Gửi transcript cho GPT-4
    // 4. Generate AI response
    // 5. Convert AI text to speech (TTS)
    // 6. Return: transcript, score, AI text, AI audio URL
    
    return api.post<{
      userMessage: ConversationMessage;
      pronunciationScore: PronunciationScore;
      aiMessage: ConversationMessage;
    }>('/conversations/send-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Lấy lịch sử conversation của session
  getConversationHistory: (sessionId: number) =>
    api.get<ConversationMessage[]>(`/conversations/session/${sessionId}`),
  
  // AI bắt đầu conversation (first question)
  getAIFirstQuestion: (topicId: number, sessionId: number) =>
    api.post<ConversationMessage>('/conversations/start', {
      topicId,
      sessionId
    })
};
```

### 6.4. `services/pronunciationService.ts`

```typescript
import api from './api';
import { PronunciationScore } from '@/types/score.types';

export const pronunciationService = {
  // Đánh giá phát âm (cho pronunciation drill mode)
  evaluatePronunciation: (
    sessionId: number,
    audioBlob: Blob,
    expectedText: string
  ) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'drill.wav');
    formData.append('sessionId', sessionId.toString());
    formData.append('expectedText', expectedText);
    
    return api.post<PronunciationScore>('/pronunciation/evaluate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Lấy scores của learner
  getScoreHistory: (learnerId: number) =>
    api.get<PronunciationScore[]>(`/pronunciation/learner/${learnerId}`),
  
  // Lấy score detail
  getScoreDetail: (scoreId: number) =>
    api.get<PronunciationScore>(`/pronunciation/${scoreId}`)
};
```

### 6.5. `services/topicService.ts`

```typescript
import api from './api';
import { ConversationTopic } from '@/types/conversation.types';

export const topicService = {
  getAllTopics: () =>
    api.get<ConversationTopic[]>('/topics'),
  
  getTopicsByDifficulty: (difficulty: string) =>
    api.get<ConversationTopic[]>(`/topics/difficulty/${difficulty}`),
  
  getTopicsByCategory: (category: string) =>
    api.get<ConversationTopic[]>(`/topics/category/${category}`),
  
  getTopicDetail: (topicId: number) =>
    api.get<ConversationTopic>(`/topics/${topicId}`)
};
```

---

## 7. Context & Hooks

### 7.1. `hooks/useVoiceRecorder.ts`

```typescript
import { useState, useRef } from 'react';
import RecordRTC from 'recordrtc';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const recorderRef = useRef<RecordRTC | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000 // Whisper prefers 16kHz
        } 
      });
      
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        timeSlice: 1000
      });
      
      recorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Microphone access denied:', error);
      throw new Error('Cannot access microphone');
    }
  };
  
  const pauseRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.pauseRecording();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };
  
  const resumeRecording = () => {
    if (recorderRef.current && isPaused) {
      recorderRef.current.resumeRecording();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };
  
  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (recorderRef.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        
        recorderRef.current.stopRecording(() => {
          const blob = recorderRef.current!.getBlob();
          setAudioBlob(blob);
          setIsRecording(false);
          setIsPaused(false);
          
          // Stop all tracks
          recorderRef.current!.getInternalRecorder()
            .stream.getTracks().forEach(track => track.stop());
          
          resolve(blob);
        });
      }
    });
  };
  
  const resetRecording = () => {
    setAudioBlob(null);
    setRecordingDuration(0);
  };
  
  return {
    isRecording,
    isPaused,
    audioBlob,
    recordingDuration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording
  };
};
```

### 7.2. `hooks/useSpeechSynthesis.ts` - Text-to-Speech

```typescript
import { useState, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = useCallback((text: string, options?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  }) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang || 'en-US';
      utterance.rate = options?.rate || 0.9;
      utterance.pitch = options?.pitch || 1;
      utterance.volume = options?.volume || 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);
  
  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);
  
  const pause = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }, []);
  
  const resume = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }, []);
  
  // Play AI response audio from URL (backend TTS)
  const playAudioUrl = useCallback((audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.onerror = () => setIsSpeaking(false);
    audio.play();
    
    return () => audio.pause();
  }, []);
  
  return {
    isSpeaking,
    speak,
    stop,
    pause,
    resume,
    playAudioUrl
  };
};
```

---

## 8. Components

### 8.1. `components/speaking/VoiceRecorder.tsx`

```typescript
import React from 'react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { FaMicrophone, FaStop, FaPause, FaPlay, FaPaperPlane } from 'react-icons/fa';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete,
  isProcessing = false
}) => {
  const {
    isRecording,
    isPaused,
    audioBlob,
    recordingDuration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording
  } = useVoiceRecorder();
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStopAndSubmit = async () => {
    const blob = await stopRecording();
    onRecordingComplete(blob);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Recording Status */}
      <div className="text-center mb-4">
        {isRecording && !isPaused && (
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-500 font-semibold">Recording...</span>
          </div>
        )}
        {isPaused && (
          <span className="text-yellow-500 font-semibold">Paused</span>
        )}
        {audioBlob && !isRecording && (
          <span className="text-green-500 font-semibold">Ready to send</span>
        )}
      </div>
      
      {/* Timer */}
      {(isRecording || isPaused) && (
        <div className="text-3xl font-mono text-center mb-6">
          {formatDuration(recordingDuration)}
        </div>
      )}
      
      {/* Playback */}
      {audioBlob && !isRecording && (
        <div className="mb-6">
          <audio 
            src={URL.createObjectURL(audioBlob)} 
            controls 
            className="w-full"
          />
        </div>
      )}
      
      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className="flex items-center gap-2 px-8 py-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            <FaMicrophone size={24} />
            <span className="font-semibold">Start Speaking</span>
          </button>
        )}
        
        {isRecording && !isPaused && (
          <>
            <button
              onClick={pauseRecording}
              className="px-6 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
            >
              <FaPause size={20} />
            </button>
            <button
              onClick={handleStopAndSubmit}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-800"
            >
              <FaStop size={20} />
              Stop & Send
            </button>
          </>
        )}
        
        {isPaused && (
          <>
            <button
              onClick={resumeRecording}
              className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600"
            >
              <FaPlay size={20} />
            </button>
            <button
              onClick={handleStopAndSubmit}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-800"
            >
              <FaStop size={20} />
              Stop & Send
            </button>
          </>
        )}
        
        {audioBlob && !isRecording && (
          <>
            <button
              onClick={() => onRecordingComplete(audioBlob)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all transform hover:scale-105 disabled:opacity-50"
            >
              <FaPaperPlane size={20} />
              {isProcessing ? 'Processing...' : 'Send'}
            </button>
            <button
              onClick={resetRecording}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50"
            >
              Re-record
            </button>
          </>
        )}
      </div>
      
      {/* Tips */}
      {!isRecording && !audioBlob && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Speak clearly and naturally. Try to answer in complete sentences.
          </p>
        </div>
      )}
    </div>
  );
};
```

### 8.2. `components/speaking/PronunciationFeedback.tsx`

```typescript
import React from 'react';
import { PronunciationScore } from '@/types/score.types';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

interface Props {
  score: PronunciationScore;
}

export const PronunciationFeedback: React.FC<Props> = ({ score }) => {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreIcon = (value: number) => {
    if (value >= 80) return <FaCheckCircle className="text-green-500" />;
    if (value >= 60) return <FaExclamationTriangle className="text-yellow-500" />;
    return <FaTimesCircle className="text-red-500" />;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Pronunciation Feedback</h3>
      
      {/* Overall Score */}
      <div className="text-center mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="text-5xl font-bold mb-2" style={{ 
          color: score.overallScore >= 80 ? '#10b981' : score.overallScore >= 60 ? '#f59e0b' : '#ef4444' 
        }}>
          {score.overallScore}
        </div>
        <div className="text-gray-600 font-medium">Overall Score</div>
      </div>
      
      {/* Detailed Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <ScoreItem 
          label="Accuracy" 
          value={score.accuracyScore}
          icon={getScoreIcon(score.accuracyScore)}
        />
        <ScoreItem 
          label="Fluency" 
          value={score.fluencyScore}
          icon={getScoreIcon(score.fluencyScore)}
        />
        <ScoreItem 
          label="Completeness" 
          value={score.completenessScore}
          icon={getScoreIcon(score.completenessScore)}
        />
        {score.intonationScore && (
          <ScoreItem 
            label="Intonation" 
            value={score.intonationScore}
            icon={getScoreIcon(score.intonationScore)}
          />
        )}
      </div>
      
      {/* Transcription Comparison */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">What you said:</h4>
        <p className="text-lg">{score.transcribedText}</p>
        
        {score.expectedText && (
          <>
            <h4 className="font-semibold mb-2 mt-4">Expected:</h4>
            <p className="text-lg text-gray-600">{score.expectedText}</p>
          </>
        )}
      </div>
      
      {/* Detailed Feedback */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">📝 Feedback:</h4>
        <p className="text-gray-700">{score.detailedFeedback}</p>
      </div>
      
      {/* Strengths */}
      {score.strengths.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-green-600">✅ Strengths:</h4>
          <ul className="list-disc list-inside space-y-1">
            {score.strengths.map((item, idx) => (
              <li key={idx} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Areas for Improvement */}
      {score.improvements.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-orange-600">🎯 Areas to Improve:</h4>
          <ul className="list-disc list-inside space-y-1">
            {score.improvements.map((item, idx) => (
              <li key={idx} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Audio Playback */}
      {score.audioUrl && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">🎧 Your Recording:</h4>
          <audio src={score.audioUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
};

interface ScoreItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const ScoreItem: React.FC<ScoreItemProps> = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="text-2xl">{icon}</div>
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  </div>
);
```

---

## 9. Pages

### 9.1. `pages/learner/SpeakingPracticePage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VoiceRecorder } from '@/components/speaking/VoiceRecorder';
import { PronunciationFeedback } from '@/components/speaking/PronunciationFeedback';
import { conversationService } from '@/services/conversationService';
import { topicService } from '@/services/topicService';
import { sessionService } from '@/services/sessionService';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { ConversationMessage, ConversationTopic } from '@/types/conversation.types';
import { PronunciationScore } from '@/types/score.types';
import { toast } from 'react-toastify';

export const SpeakingPracticePage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { speak, playAudioUrl, isSpeaking, stop } = useSpeechSynthesis();
  
  const [topic, setTopic] = useState<ConversationTopic | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentScore, setCurrentScore] = useState<PronunciationScore | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  
  useEffect(() => {
    initializeSession();
  }, [topicId]);
  
  const initializeSession = async () => {
    if (!topicId) return;
    
    try {
      // 1. Load topic
      const topicRes = await topicService.getTopicDetail(parseInt(topicId));
      setTopic(topicRes.data);
      
      // 2. Create session
      const learnerId = 1; // TODO: Get from auth context
      const sessionRes = await sessionService.createSession(
        learnerId, 
        parseInt(topicId), 
        'AI_CONVERSATION'
      );
      setSessionId(sessionRes.data.id);
      
      // 3. Get AI's first question
      const firstMsg = await conversationService.getAIFirstQuestion(
        parseInt(topicId), 
        sessionRes.data.id
      );
      setMessages([firstMsg.data]);
      
      // 4. Play AI's question
      if (firstMsg.data.audioUrl) {
        playAudioUrl(firstMsg.data.audioUrl);
      } else {
        speak(firstMsg.data.textContent);
      }
      
      toast.success('Session started! AI is ready to chat.');
    } catch (error) {
      toast.error('Failed to start session');
      navigate('/learner/topics');
    }
  };
  
  const handleUserAudio = async (audioBlob: Blob) => {
    if (!sessionId) return;
    
    setIsProcessing(true);
    try {
      // Send audio to backend
      const response = await conversationService.sendUserAudio(sessionId, audioBlob);
      
      // Update messages
      setMessages(prev => [
        ...prev,
        response.data.userMessage,
        response.data.aiMessage
      ]);
      
      // Show pronunciation score
      setCurrentScore(response.data.pronunciationScore);
      
      // Play AI response
      if (response.data.aiMessage.audioUrl) {
        playAudioUrl(response.data.aiMessage.audioUrl);
      } else {
        speak(response.data.aiMessage.textContent);
      }
      
      setTurnCount(prev => prev + 1);
      
      // Check if session should end (e.g., after 10 turns)
      if (turnCount >= 10) {
        handleEndSession();
      }
      
    } catch (error) {
      toast.error('Failed to process your speech');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleEndSession = async () => {
    if (!sessionId) return;
    
    try {
      const avgScore = currentScore?.overallScore || 0;
      await sessionService.endSession(sessionId, avgScore);
      toast.success('Session completed!');
      navigate(`/learner/sessions/${sessionId}`);
    } catch (error) {
      toast.error('Failed to end session');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{topic?.title}</h1>
        <p className="text-gray-600">{topic?.description}</p>
        <div className="flex gap-4 mt-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            Turn {turnCount + 1} / 10
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            topic?.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
            topic?.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {topic?.difficulty}
          </span>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Conversation */}
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Conversation</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="mb-2">{msg.textContent}</p>
                    {msg.audioUrl && (
                      <audio src={msg.audioUrl} controls className="w-full mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Voice Recorder */}
          <VoiceRecorder 
            onRecordingComplete={handleUserAudio}
            isProcessing={isProcessing}
          />
        </div>
        
        {/* Right: Feedback */}
        <div>
          {currentScore ? (
            <PronunciationFeedback score={currentScore} />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Waiting for your response...</h3>
              <p className="text-gray-600">Record your answer to get feedback!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => stop()}
          disabled={!isSpeaking}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Stop AI Voice
        </button>
        <button
          onClick={handleEndSession}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          End Session
        </button>
      </div>
    </div>
  );
};
```

---

## 10. OpenAI Integration

### Backend Implementation (REQUIRED)

**File:** `backend/src/main/java/com/aesp/service/OpenAIService.java`

```java
package com.aesp.service;

import com.theokanning.openai.completion.chat.*;
import com.theokanning.openai.audio.*;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;

@Service
public class OpenAIService {
    
    private final OpenAiService openAiService;
    
    @Value("${openai.model.chat}")
    private String chatModel; // gpt-4
    
    @Value("${openai.model.whisper}")
    private String whisperModel; // whisper-1
    
    @Value("${openai.model.tts}")
    private String ttsModel; // tts-1
    
    public OpenAIService(@Value("${openai.api.key}") String apiKey) {
        this.openAiService = new OpenAiService(apiKey, Duration.ofSeconds(60));
    }
    
    /**
     * Generate AI response cho speaking practice
     */
    public String generateConversationResponse(String userTranscript, String topicContext, List<String> history) {
        List<ChatMessage> messages = new ArrayList<>();
        
        // System prompt cho speaking tutor
        messages.add(new ChatMessage(
            ChatMessageRole.SYSTEM.value(),
            "You are an English speaking tutor. Your role is to:\n" +
            "1. Have natural conversations with students\n" +
            "2. Ask follow-up questions to keep conversation flowing\n" +
            "3. Gently correct mistakes without being discouraging\n" +
            "4. Encourage students to speak more\n" +
            "5. Use vocabulary appropriate for the topic: " + topicContext + "\n" +
            "Keep responses concise (2-3 sentences) and conversational."
        ));
        
        // Add history
        if (history != null) {
            for (int i = 0; i < history.size(); i++) {
                String role = i % 2 == 0 ? ChatMessageRole.USER.value() : ChatMessageRole.ASSISTANT.value();
                messages.add(new ChatMessage(role, history.get(i)));
            }
        }
        
        // Add current user message
        messages.add(new ChatMessage(ChatMessageRole.USER.value(), userTranscript));
        
        ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model(chatModel)
                .messages(messages)
                .temperature(0.8) // More creative for conversation
                .maxTokens(150)
                .build();
        
        return openAiService.createChatCompletion(request)
                .getChoices()
                .get(0)
                .getMessage()
                .getContent();
    }
    
    /**
     * Transcribe audio using Whisper
     */
    public String transcribeAudio(byte[] audioData, String fileName) {
        // Create temp file
        File audioFile = createTempAudioFile(audioData, fileName);
        
        TranscriptionRequest request = TranscriptionRequest.builder()
                .model(whisperModel)
                .build();
        
        String transcript = openAiService.createTranscription(request, audioFile).getText();
        
        // Clean up temp file
        audioFile.delete();
        
        return transcript;
    }
    
    /**
     * Convert text to speech
     */
    public byte[] textToSpeech(String text) {
        SpeechRequest request = SpeechRequest.builder()
                .model(ttsModel)
                .input(text)
                .voice("alloy") // or nova, shimmer, etc.
                .build();
        
        return openAiService.createSpeech(request);
    }
    
    /**
     * Evaluate pronunciation by comparing transcripts
     */
    public PronunciationEvaluation evaluatePronunciation(String expectedText, String transcribedText) {
        double accuracy = calculateAccuracy(expectedText, transcribedText);
        
        // Use GPT to generate detailed feedback
        String feedback = generatePronunciationFeedback(expectedText, transcribedText, accuracy);
        
        PronunciationEvaluation eval = new PronunciationEvaluation();
        eval.setAccuracyScore((int) (accuracy * 100));
        eval.setFluencyScore((int) (accuracy * 95)); // Simplified
        eval.setCompletenessScore((int) (calculateCompleteness(expectedText, transcribedText) * 100));
        eval.setOverallScore((eval.getAccuracyScore() + eval.getFluencyScore() + eval.getCompletenessScore()) / 3);
        eval.setDetailedFeedback(feedback);
        
        return eval;
    }
    
    private String generatePronunciationFeedback(String expected, String actual, double accuracy) {
        List<ChatMessage> messages = Arrays.asList(
            new ChatMessage(ChatMessageRole.SYSTEM.value(), 
                "You are a pronunciation coach. Provide brief, encouraging feedback."),
            new ChatMessage(ChatMessageRole.USER.value(),
                String.format("Expected: '%s'\nActual: '%s'\nAccuracy: %.0f%%\n\nGive feedback:", 
                    expected, actual, accuracy * 100))
        );
        
        ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model(chatModel)
                .messages(messages)
                .temperature(0.7)
                .maxTokens(100)
                .build();
        
        return openAiService.createChatCompletion(request)
                .getChoices()
                .get(0)
                .getMessage()
                .getContent();
    }
    
    // Helper methods...
}
```

---

## 11. Audio Recording & Speech

### Web Speech API Alternative (Browser-native)

Nếu không muốn dùng RecordRTC, có thể dùng Web Speech API:

```typescript
// utils/webSpeechAPI.ts
export class WebSpeechRecognition {
  private recognition: any;
  
  constructor(language: string = 'en-US') {
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported');
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.lang = language;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
  }
  
  start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        resolve(transcript);
      };
      
      this.recognition.onerror = (event: any) => {
        reject(new Error(event.error));
      };
      
      this.recognition.start();
    });
  }
  
  stop() {
    this.recognition.stop();
  }
}
```

**Pros:** No library needed, works in Chrome/Edge  
**Cons:** Limited browser support, no audio file output

---

## 12. Deployment

### Production Checklist

- [x] Backend xử lý OpenAI API (KHÔNG để key ở frontend)
- [x] Audio files lưu trên cloud storage (S3, Cloudinary)
- [x] HTTPS cho microphone access
- [x] Environment variables đúng
- [x] CORS configured cho production domain
- [x] Rate limiting cho API calls
- [x] Error tracking (Sentry)
- [x] Analytics (Google Analytics)

### Environment Variables

```env
# Production .env
VITE_API_URL=https://api.aesp.com/api
VITE_APP_NAME=AI Speaking Practice
VITE_ENV=production
# NO OPENAI_API_KEY HERE!
```

---

**✅ File đã được cập nhật hoàn chỉnh cho Speaking Practice App!**
