# 04 - HƯỚNG DẪN SETUP AI CONVERSATION - BACKEND

## 📋 Mục Lục
1. [Tổng Quan](#1-tổng-quan)
2. [Dependencies Setup](#2-dependencies-setup)
3. [Configuration](#3-configuration)
4. [Database Schema](#4-database-schema)
5. [OpenAI Service](#5-openai-service)
6. [Controllers](#6-controllers)
7. [Services](#7-services)
8. [DTOs & Entities](#8-dtos--entities)
9. [Audio Storage](#9-audio-storage)
10. [Testing](#10-testing)

---

## 1. Tổng Quan

### 🎯 Mục Đích
Backend cung cấp API cho chức năng **AI Speaking Practice**, bao gồm:
- 🎙️ **Speech-to-Text**: Chuyển audio thành text (Whisper API)
- 🤖 **AI Conversation**: Chat với GPT-4
- 🔊 **Text-to-Speech**: Chuyển text thành audio (TTS)
- 📊 **Pronunciation Scoring**: Đánh giá phát âm
- 💾 **Audio Storage**: Lưu trữ file audio

### Luồng Hoạt Động

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Request                         │
│            POST /api/conversations/send-audio                │
│                  (Multipart: audio file)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 ConversationController                       │
│  1. Nhận audio file từ frontend                             │
│  2. Gọi OpenAIService để transcribe                         │
│  3. Lưu user message vào DB                                 │
│  4. Gọi GPT-4 để generate response                          │
│  5. Gọi TTS để convert AI text → audio                      │
│  6. Lưu audio files                                         │
│  7. Return response với URLs                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     OpenAI Service                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  transcribeAudio(byte[] audio)                      │   │
│  │    → Whisper API → return transcript                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  generateResponse(transcript, context, history)     │   │
│  │    → GPT-4 Chat API → return AI response            │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  textToSpeech(text)                                 │   │
│  │    → TTS API → return audio bytes                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Dependencies Setup

### 2.1. Thêm vào `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.aesp</groupId>
    <artifactId>aesp-backend</artifactId>
    <version>1.0.0</version>
    <name>AESP Backend</name>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <!-- Database -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- OpenAI Java SDK -->
        <dependency>
            <groupId>com.theokanning.openai-gpt3-java</groupId>
            <artifactId>service</artifactId>
            <version>0.18.2</version>
        </dependency>
        
        <!-- File Upload -->
        <dependency>
            <groupId>commons-fileupload</groupId>
            <artifactId>commons-fileupload</artifactId>
            <version>1.5</version>
        </dependency>
        
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.15.0</version>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 2.2. Install Dependencies

```bash
cd backend
mvn clean install
```

---

## 3. Configuration

### 3.1. `application.properties`

```properties
# Server Configuration
server.port=8080
spring.application.name=aesp-backend

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/aesp_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# OpenAI Configuration
openai.api.key=${OPENAI_API_KEY}
openai.model.chat=gpt-4
openai.model.whisper=whisper-1
openai.model.tts=tts-1

# File Upload
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
spring.servlet.multipart.file-size-threshold=2KB

# Audio Storage
audio.storage.path=./uploads/audio
audio.base.url=http://localhost:8080/audio

# JWT
jwt.secret=${JWT_SECRET:mySecretKey123456789012345678901234567890}
jwt.expiration=86400000

# CORS
cors.allowed.origins=http://localhost:5173,http://localhost:3000
```

### 3.2. Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```bash
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
JWT_SECRET=your-jwt-secret-key-at-least-256-bits
```

**⚠️ Lưu ý:** Thêm `.env` vào `.gitignore`!

```bash
# .gitignore
.env
*.env
application-prod.properties
```

---

## 4. Database Schema

### 4.1. Conversation Topics Table

```sql
CREATE TABLE conversation_topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
    category VARCHAR(100),
    estimated_duration INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO conversation_topics (title, description, difficulty, category) VALUES
('Ordering Food at Restaurant', 'Practice ordering food, asking about menu items, and requesting the bill', 'BEGINNER', 'Daily Life'),
('Job Interview', 'Practice common interview questions and professional responses', 'ADVANCED', 'Business'),
('Travel at Airport', 'Learn to check-in, ask for directions, and handle travel situations', 'INTERMEDIATE', 'Travel');
```

### 4.2. AI Conversations Table

```sql
CREATE TABLE ai_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    practice_session_id BIGINT NOT NULL,
    speaker ENUM('USER', 'AI') NOT NULL,
    message TEXT NOT NULL,
    audio_url VARCHAR(500),
    pronunciation_score DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (practice_session_id) REFERENCES practice_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (practice_session_id),
    INDEX idx_timestamp (timestamp)
);
```

### 4.3. Pronunciation Scores Table

```sql
CREATE TABLE pronunciation_scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    practice_session_id BIGINT,
    conversation_id BIGINT,
    
    expected_text TEXT,
    transcribed_text TEXT NOT NULL,
    
    accuracy_score INT NOT NULL,
    fluency_score INT NOT NULL,
    completeness_score INT NOT NULL,
    intonation_score INT,
    overall_score INT NOT NULL,
    
    detailed_feedback TEXT,
    strengths JSON,
    improvements JSON,
    
    audio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (learner_id) REFERENCES learners(id),
    FOREIGN KEY (practice_session_id) REFERENCES practice_sessions(id),
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id),
    INDEX idx_learner (learner_id),
    INDEX idx_session (practice_session_id)
);
```

---

## 5. OpenAI Service

### 5.1. `OpenAIService.java`

```java
package com.aesp.service;

import com.theokanning.openai.completion.chat.*;
import com.theokanning.openai.audio.*;
import com.theokanning.openai.service.OpenAiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Duration;
import java.util.*;

@Slf4j
@Service
public class OpenAIService {
    
    private final OpenAiService openAiService;
    
    @Value("${openai.model.chat}")
    private String chatModel;
    
    @Value("${openai.model.whisper}")
    private String whisperModel;
    
    @Value("${openai.model.tts}")
    private String ttsModel;
    
    public OpenAIService(@Value("${openai.api.key}") String apiKey) {
        this.openAiService = new OpenAiService(apiKey, Duration.ofSeconds(60));
        log.info("OpenAI Service initialized with models: chat={}, whisper={}, tts={}", 
                 chatModel, whisperModel, ttsModel);
    }
    
    /**
     * Transcribe audio to text using Whisper
     */
    public String transcribeAudio(byte[] audioData, String fileName) {
        try {
            File audioFile = createTempFile(audioData, fileName);
            
            TranscriptionRequest request = TranscriptionRequest.builder()
                    .model(whisperModel)
                    .build();
            
            String transcript = openAiService.createTranscription(request, audioFile).getText();
            
            audioFile.delete();
            
            log.info("Audio transcribed successfully: {} characters", transcript.length());
            return transcript;
            
        } catch (Exception e) {
            log.error("Error transcribing audio: {}", e.getMessage());
            throw new RuntimeException("Failed to transcribe audio", e);
        }
    }
    
    /**
     * Generate AI conversation response
     */
    public String generateConversationResponse(String userMessage, String topicContext, List<String> conversationHistory) {
        try {
            List<ChatMessage> messages = new ArrayList<>();
            
            // System prompt
            messages.add(new ChatMessage(
                ChatMessageRole.SYSTEM.value(),
                buildSystemPrompt(topicContext)
            ));
            
            // Add conversation history
            if (conversationHistory != null && !conversationHistory.isEmpty()) {
                for (int i = 0; i < conversationHistory.size(); i++) {
                    String role = i % 2 == 0 ? ChatMessageRole.USER.value() : ChatMessageRole.ASSISTANT.value();
                    messages.add(new ChatMessage(role, conversationHistory.get(i)));
                }
            }
            
            // Add current user message
            messages.add(new ChatMessage(ChatMessageRole.USER.value(), userMessage));
            
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model(chatModel)
                    .messages(messages)
                    .temperature(0.8)
                    .maxTokens(150)
                    .build();
            
            String response = openAiService.createChatCompletion(request)
                    .getChoices()
                    .get(0)
                    .getMessage()
                    .getContent();
            
            log.info("AI response generated: {} characters", response.length());
            return response;
            
        } catch (Exception e) {
            log.error("Error generating AI response: {}", e.getMessage());
            throw new RuntimeException("Failed to generate AI response", e);
        }
    }
    
    /**
     * Generate first AI question for topic
     */
    public String generateFirstQuestion(String topicTitle, String topicDescription, String difficulty) {
        try {
            List<ChatMessage> messages = Arrays.asList(
                new ChatMessage(ChatMessageRole.SYSTEM.value(),
                    "You are an English conversation tutor. Start a conversation about the topic: " + topicTitle +
                    "\nDifficulty: " + difficulty +
                    "\nDescription: " + topicDescription +
                    "\n\nStart with a friendly greeting and an opening question (2-3 sentences)."),
                new ChatMessage(ChatMessageRole.USER.value(), "Start the conversation")
            );
            
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model(chatModel)
                    .messages(messages)
                    .temperature(0.8)
                    .maxTokens(100)
                    .build();
            
            return openAiService.createChatCompletion(request)
                    .getChoices()
                    .get(0)
                    .getMessage()
                    .getContent();
                    
        } catch (Exception e) {
            log.error("Error generating first question: {}", e.getMessage());
            throw new RuntimeException("Failed to generate first question", e);
        }
    }
    
    /**
     * Text to Speech conversion
     */
    public byte[] textToSpeech(String text) {
        try {
            SpeechRequest request = SpeechRequest.builder()
                    .model(ttsModel)
                    .input(text)
                    .voice("alloy") // Options: alloy, echo, fable, onyx, nova, shimmer
                    .build();
            
            byte[] audioData = openAiService.createSpeech(request);
            
            log.info("TTS generated: {} bytes", audioData.length);
            return audioData;
            
        } catch (Exception e) {
            log.error("Error in TTS: {}", e.getMessage());
            throw new RuntimeException("Failed to generate speech", e);
        }
    }
    
    /**
     * Evaluate pronunciation
     */
    public PronunciationEvaluation evaluatePronunciation(String expectedText, String transcribedText) {
        double accuracy = calculateAccuracy(expectedText, transcribedText);
        
        String feedback = generatePronunciationFeedback(expectedText, transcribedText, accuracy);
        
        PronunciationEvaluation eval = new PronunciationEvaluation();
        eval.setAccuracyScore((int) (accuracy * 100));
        eval.setFluencyScore((int) (accuracy * 95)); // Simplified
        eval.setCompletenessScore((int) (calculateCompleteness(expectedText, transcribedText) * 100));
        eval.setOverallScore((eval.getAccuracyScore() + eval.getFluencyScore() + eval.getCompletenessScore()) / 3);
        eval.setDetailedFeedback(feedback);
        
        // Extract strengths and improvements
        eval.setStrengths(extractStrengths(accuracy));
        eval.setImprovements(extractImprovements(accuracy));
        
        return eval;
    }
    
    /**
     * Generate pronunciation feedback using AI
     */
    private String generatePronunciationFeedback(String expected, String actual, double accuracy) {
        try {
            List<ChatMessage> messages = Arrays.asList(
                new ChatMessage(ChatMessageRole.SYSTEM.value(), 
                    "You are a pronunciation coach. Provide brief, encouraging feedback in 2-3 sentences."),
                new ChatMessage(ChatMessageRole.USER.value(),
                    String.format("Expected: '%s'\nActual: '%s'\nAccuracy: %.0f%%\n\nProvide feedback:", 
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
                    
        } catch (Exception e) {
            log.error("Error generating feedback: {}", e.getMessage());
            return "Good effort! Keep practicing to improve your pronunciation.";
        }
    }
    
    // Helper methods
    
    private String buildSystemPrompt(String topicContext) {
        return "You are an English speaking tutor. Your role is to:\n" +
               "1. Have natural conversations with students about: " + topicContext + "\n" +
               "2. Ask follow-up questions to keep the conversation flowing\n" +
               "3. Gently correct mistakes without being discouraging\n" +
               "4. Encourage students to speak more\n" +
               "5. Use vocabulary appropriate for the topic\n" +
               "6. Keep responses concise (2-3 sentences) and conversational\n" +
               "7. Be friendly and supportive";
    }
    
    private double calculateAccuracy(String expected, String actual) {
        if (expected == null || actual == null) return 0.0;
        
        String exp = expected.toLowerCase().trim();
        String act = actual.toLowerCase().trim();
        
        int distance = levenshteinDistance(exp, act);
        int maxLen = Math.max(exp.length(), act.length());
        
        return maxLen == 0 ? 1.0 : 1.0 - ((double) distance / maxLen);
    }
    
    private double calculateCompleteness(String expected, String actual) {
        if (expected == null || actual == null) return 0.0;
        
        String[] expectedWords = expected.toLowerCase().split("\\s+");
        String[] actualWords = actual.toLowerCase().split("\\s+");
        
        Set<String> expectedSet = new HashSet<>(Arrays.asList(expectedWords));
        Set<String> actualSet = new HashSet<>(Arrays.asList(actualWords));
        
        int matchCount = 0;
        for (String word : expectedSet) {
            if (actualSet.contains(word)) {
                matchCount++;
            }
        }
        
        return expectedSet.isEmpty() ? 0.0 : (double) matchCount / expectedSet.size();
    }
    
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + (s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1)
                    );
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
    }
    
    private List<String> extractStrengths(double accuracy) {
        List<String> strengths = new ArrayList<>();
        if (accuracy > 0.9) {
            strengths.add("Excellent pronunciation");
            strengths.add("Clear speech");
        } else if (accuracy > 0.7) {
            strengths.add("Good clarity");
            strengths.add("Understandable pronunciation");
        } else {
            strengths.add("You're making progress");
        }
        return strengths;
    }
    
    private List<String> extractImprovements(double accuracy) {
        List<String> improvements = new ArrayList<>();
        if (accuracy < 0.9) {
            improvements.add("Practice difficult sounds more");
            improvements.add("Speak more slowly for clarity");
        }
        if (accuracy < 0.7) {
            improvements.add("Focus on word pronunciation");
        }
        return improvements;
    }
    
    private File createTempFile(byte[] data, String fileName) throws IOException {
        File tempFile = File.createTempFile("audio_", "_" + fileName);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(data);
        }
        return tempFile;
    }
    
    // Inner class for pronunciation evaluation result
    @lombok.Data
    public static class PronunciationEvaluation {
        private int accuracyScore;
        private int fluencyScore;
        private int completenessScore;
        private int overallScore;
        private String detailedFeedback;
        private List<String> strengths;
        private List<String> improvements;
    }
}
```

---

## 6. Controllers

### 6.1. `ConversationController.java`

```java
package com.aesp.controller;

import com.aesp.dto.response.ConversationResponse;
import com.aesp.entity.AIConversation;
import com.aesp.entity.ConversationTopic;
import com.aesp.entity.PracticeSession;
import com.aesp.service.AIConversationService;
import com.aesp.service.AudioStorageService;
import com.aesp.service.ConversationTopicService;
import com.aesp.service.OpenAIService;
import com.aesp.service.PracticeSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed.origins}")
public class ConversationController {
    
    private final OpenAIService openAIService;
    private final AIConversationService conversationService;
    private final AudioStorageService audioStorage;
    private final PracticeSessionService sessionService;
    private final ConversationTopicService topicService;
    
    /**
     * AI bắt đầu conversation với câu hỏi đầu tiên
     */
    @PostMapping("/start")
    public ResponseEntity<ConversationResponse> startConversation(@RequestBody Map<String, Object> payload) {
        try {
            Long topicId = ((Number) payload.get("topicId")).longValue();
            Long sessionId = ((Number) payload.get("sessionId")).longValue();
            
            // Get topic info
            ConversationTopic topic = topicService.getTopicById(topicId)
                    .orElseThrow(() -> new RuntimeException("Topic not found"));
            
            // Generate AI's first question
            String aiMessage = openAIService.generateFirstQuestion(
                    topic.getTitle(),
                    topic.getDescription(),
                    topic.getDifficulty().toString()
            );
            
            // Convert to speech
            byte[] audioData = openAIService.textToSpeech(aiMessage);
            String audioUrl = audioStorage.saveAudio(audioData, "ai_intro_" + sessionId + ".mp3");
            
            // Save to database
            AIConversation conversation = new AIConversation();
            conversation.setPracticeSession(sessionService.getSessionById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found")));
            conversation.setSpeaker("AI");
            conversation.setMessage(aiMessage);
            conversation.setAudioUrl(audioUrl);
            
            AIConversation saved = conversationService.saveConversation(conversation);
            
            // Build response
            ConversationResponse response = new ConversationResponse();
            response.setId(saved.getId());
            response.setTextContent(aiMessage);
            response.setAudioUrl(audioUrl);
            response.setRole("ai");
            response.setTimestamp(saved.getTimestamp().toString());
            
            log.info("Conversation started for session {}", sessionId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error starting conversation: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * User gửi audio → Backend transcribe → AI response
     */
    @PostMapping("/send-audio")
    public ResponseEntity<Map<String, Object>> sendAudio(
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam("sessionId") Long sessionId) {
        
        try {
            log.info("Received audio from session {}: {} bytes", sessionId, audioFile.getSize());
            
            // 1. Transcribe user audio
            byte[] audioBytes = audioFile.getBytes();
            String userTranscript = openAIService.transcribeAudio(audioBytes, audioFile.getOriginalFilename());
            
            log.info("Transcribed: {}", userTranscript);
            
            // 2. Save user audio file
            String userAudioUrl = audioStorage.saveAudio(audioBytes, "user_" + sessionId + "_" + System.currentTimeMillis() + ".wav");
            
            // 3. Save user message to DB
            PracticeSession session = sessionService.getSessionById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            
            AIConversation userMessage = new AIConversation();
            userMessage.setPracticeSession(session);
            userMessage.setSpeaker("USER");
            userMessage.setMessage(userTranscript);
            userMessage.setAudioUrl(userAudioUrl);
            
            AIConversation savedUserMsg = conversationService.saveConversation(userMessage);
            
            // 4. Get conversation history
            List<AIConversation> history = conversationService.getConversationsBySession(sessionId);
            List<String> historyTexts = history.stream()
                    .map(AIConversation::getMessage)
                    .collect(Collectors.toList());
            
            // 5. Get topic context
            ConversationTopic topic = session.getTopic();
            String topicContext = topic.getTitle() + " - " + topic.getDescription();
            
            // 6. Generate AI response
            String aiResponse = openAIService.generateConversationResponse(
                    userTranscript,
                    topicContext,
                    historyTexts
            );
            
            log.info("AI response: {}", aiResponse);
            
            // 7. Convert AI response to speech
            byte[] aiAudioData = openAIService.textToSpeech(aiResponse);
            String aiAudioUrl = audioStorage.saveAudio(aiAudioData, "ai_" + sessionId + "_" + System.currentTimeMillis() + ".mp3");
            
            // 8. Save AI message to DB
            AIConversation aiMessage = new AIConversation();
            aiMessage.setPracticeSession(session);
            aiMessage.setSpeaker("AI");
            aiMessage.setMessage(aiResponse);
            aiMessage.setAudioUrl(aiAudioUrl);
            
            AIConversation savedAiMsg = conversationService.saveConversation(aiMessage);
            
            // 9. Evaluate pronunciation (optional, simple version)
            OpenAIService.PronunciationEvaluation evaluation = 
                    openAIService.evaluatePronunciation(null, userTranscript);
            
            // 10. Build response
            Map<String, Object> result = new HashMap<>();
            
            result.put("userMessage", Map.of(
                    "id", savedUserMsg.getId(),
                    "textContent", userTranscript,
                    "audioUrl", userAudioUrl,
                    "role", "user",
                    "timestamp", savedUserMsg.getTimestamp().toString()
            ));
            
            result.put("aiMessage", Map.of(
                    "id", savedAiMsg.getId(),
                    "textContent", aiResponse,
                    "audioUrl", aiAudioUrl,
                    "role", "ai",
                    "timestamp", savedAiMsg.getTimestamp().toString()
            ));
            
            result.put("pronunciationScore", Map.of(
                    "accuracyScore", evaluation.getAccuracyScore(),
                    "fluencyScore", evaluation.getFluencyScore(),
                    "completenessScore", evaluation.getCompletenessScore(),
                    "overallScore", evaluation.getOverallScore(),
                    "detailedFeedback", evaluation.getDetailedFeedback(),
                    "strengths", evaluation.getStrengths(),
                    "improvements", evaluation.getImprovements()
            ));
            
            log.info("Successfully processed conversation turn for session {}", sessionId);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error processing audio: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Lấy lịch sử conversation của session
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<ConversationResponse>> getConversationHistory(@PathVariable Long sessionId) {
        try {
            List<AIConversation> conversations = conversationService.getConversationsBySession(sessionId);
            
            List<ConversationResponse> responses = conversations.stream()
                    .map(conv -> {
                        ConversationResponse resp = new ConversationResponse();
                        resp.setId(conv.getId());
                        resp.setTextContent(conv.getMessage());
                        resp.setAudioUrl(conv.getAudioUrl());
                        resp.setRole(conv.getSpeaker().toLowerCase());
                        resp.setTimestamp(conv.getTimestamp().toString());
                        resp.setPronunciationScore(conv.getPronunciationScore());
                        return resp;
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error fetching conversation history: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
```

### 6.2. `ConversationTopicController.java`

```java
package com.aesp.controller;

import com.aesp.entity.ConversationTopic;
import com.aesp.service.ConversationTopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed.origins}")
public class ConversationTopicController {
    
    private final ConversationTopicService topicService;
    
    @GetMapping
    public ResponseEntity<List<ConversationTopic>> getAllTopics() {
        return ResponseEntity.ok(topicService.getAllTopics());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<ConversationTopic>> getActiveTopics() {
        return ResponseEntity.ok(topicService.getActiveTopics());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ConversationTopic> getTopicById(@PathVariable Long id) {
        return topicService.getTopicById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<ConversationTopic>> getTopicsByDifficulty(@PathVariable String difficulty) {
        return ResponseEntity.ok(topicService.getTopicsByDifficulty(difficulty));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ConversationTopic>> getTopicsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(topicService.getTopicsByCategory(category));
    }
    
    @PostMapping
    public ResponseEntity<ConversationTopic> createTopic(@RequestBody ConversationTopic topic) {
        return ResponseEntity.ok(topicService.saveTopic(topic));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ConversationTopic> updateTopic(@PathVariable Long id, @RequestBody ConversationTopic topic) {
        topic.setId(id);
        return ResponseEntity.ok(topicService.saveTopic(topic));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.ok().build();
    }
}
```

---

## 7. Services

### 7.1. `AudioStorageService.java`

```java
package com.aesp.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
public class AudioStorageService {
    
    @Value("${audio.storage.path}")
    private String storagePath;
    
    @Value("${audio.base.url}")
    private String baseUrl;
    
    public String saveAudio(byte[] audioData, String fileName) {
        try {
            // Create directory if not exists
            Path directory = Paths.get(storagePath);
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
                log.info("Created audio storage directory: {}", storagePath);
            }
            
            // Generate unique filename
            String uniqueFileName = System.currentTimeMillis() + "_" + fileName;
            File file = new File(storagePath, uniqueFileName);
            
            // Save file
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(audioData);
            }
            
            String url = baseUrl + "/" + uniqueFileName;
            log.info("Audio saved: {} ({} bytes)", url, audioData.length);
            
            return url;
            
        } catch (IOException e) {
            log.error("Failed to save audio file: {}", e.getMessage());
            throw new RuntimeException("Failed to save audio file", e);
        }
    }
    
    public boolean deleteAudio(String fileName) {
        try {
            File file = new File(storagePath, fileName);
            boolean deleted = file.delete();
            log.info("Audio deleted: {} (success: {})", fileName, deleted);
            return deleted;
        } catch (Exception e) {
            log.error("Failed to delete audio: {}", e.getMessage());
            return false;
        }
    }
}
```

### 7.2. `AIConversationService.java`

```java
package com.aesp.service;

import com.aesp.entity.AIConversation;
import com.aesp.repository.AIConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AIConversationService {
    
    private final AIConversationRepository conversationRepository;
    
    public AIConversation saveConversation(AIConversation conversation) {
        return conversationRepository.save(conversation);
    }
    
    public List<AIConversation> getConversationsBySession(Long sessionId) {
        return conversationRepository.findByPracticeSessionIdOrderByTimestampAsc(sessionId);
    }
    
    public void deleteConversation(Long id) {
        conversationRepository.deleteById(id);
    }
}
```

### 7.3. `ConversationTopicService.java`

```java
package com.aesp.service;

import com.aesp.entity.ConversationTopic;
import com.aesp.repository.ConversationTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConversationTopicService {
    
    private final ConversationTopicRepository topicRepository;
    
    public List<ConversationTopic> getAllTopics() {
        return topicRepository.findAll();
    }
    
    public List<ConversationTopic> getActiveTopics() {
        return topicRepository.findByIsActiveTrue();
    }
    
    public Optional<ConversationTopic> getTopicById(Long id) {
        return topicRepository.findById(id);
    }
    
    public List<ConversationTopic> getTopicsByDifficulty(String difficulty) {
        return topicRepository.findByDifficulty(difficulty);
    }
    
    public List<ConversationTopic> getTopicsByCategory(String category) {
        return topicRepository.findByCategory(category);
    }
    
    public ConversationTopic saveTopic(ConversationTopic topic) {
        return topicRepository.save(topic);
    }
    
    public void deleteTopic(Long id) {
        topicRepository.deleteById(id);
    }
}
```

---

## 8. DTOs & Entities

### 8.1. `ConversationResponse.java`

```java
package com.aesp.dto.response;

import lombok.Data;

@Data
public class ConversationResponse {
    private Long id;
    private String textContent;
    private String audioUrl;
    private String role; // "ai" or "user"
    private String timestamp;
    private Double pronunciationScore;
}
```

### 8.2. `AIConversation.java` (Entity)

```java
package com.aesp.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_conversations")
@Data
public class AIConversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "practice_session_id", nullable = false)
    private PracticeSession practiceSession;
    
    @Column(nullable = false)
    private String speaker; // "USER" or "AI"
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "audio_url", length = 500)
    private String audioUrl;
    
    @Column(name = "pronunciation_score")
    private Double pronunciationScore;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
```

### 8.3. `ConversationTopic.java` (Entity)

```java
package com.aesp.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_topics")
@Data
public class ConversationTopic {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;
    
    @Column(length = 100)
    private String category;
    
    @Column(name = "estimated_duration")
    private Integer estimatedDuration = 10;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum Difficulty {
        BEGINNER, INTERMEDIATE, ADVANCED
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

---

## 9. Audio Storage

### 9.1. `WebConfig.java` - Serve Static Audio Files

```java
package com.aesp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${audio.storage.path}")
    private String audioPath;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/audio/**")
                .addResourceLocations("file:" + audioPath + "/");
    }
}
```

### 9.2. Create Uploads Directory

```bash
mkdir -p backend/uploads/audio
```

---

## 10. Testing

### 10.1. Test OpenAI Service

```java
package com.aesp.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OpenAIServiceTest {
    
    @Autowired
    private OpenAIService openAIService;
    
    @Test
    void testGenerateResponse() {
        String response = openAIService.generateConversationResponse(
            "Hello, how are you?",
            "Daily conversation",
            null
        );
        
        assertNotNull(response);
        assertFalse(response.isEmpty());
        System.out.println("AI Response: " + response);
    }
    
    @Test
    void testTextToSpeech() {
        byte[] audio = openAIService.textToSpeech("Hello, this is a test.");
        
        assertNotNull(audio);
        assertTrue(audio.length > 0);
        System.out.println("Audio size: " + audio.length + " bytes");
    }
}
```

### 10.2. Test with Postman

**Request: Start Conversation**
```
POST http://localhost:8080/api/conversations/start
Content-Type: application/json

{
  "topicId": 1,
  "sessionId": 1
}
```

**Request: Send Audio**
```
POST http://localhost:8080/api/conversations/send-audio
Content-Type: multipart/form-data

audio: [audio file]
sessionId: 1
```

---

## 📝 Checklist Implementation

### Phase 1: Setup
- [x] Add OpenAI dependency to pom.xml
- [x] Configure application.properties
- [x] Setup environment variables (.env)
- [x] Create database tables
- [x] Create uploads directory

### Phase 2: Core Services
- [x] OpenAIService (Whisper, GPT-4, TTS)
- [x] AudioStorageService
- [x] AIConversationService
- [x] ConversationTopicService

### Phase 3: Controllers
- [x] ConversationController (/start, /send-audio)
- [x] ConversationTopicController
- [x] WebConfig for serving audio files

### Phase 4: Testing
- [ ] Unit tests cho OpenAIService
- [ ] Integration tests cho Controllers
- [ ] Test với Postman
- [ ] Test với Frontend

### Phase 5: Production Ready
- [ ] Error handling & logging
- [ ] Rate limiting
- [ ] Audio file cleanup (cron job)
- [ ] Cloud storage integration (S3)
- [ ] Performance optimization

---

## 🚀 Quick Start

```bash
# 1. Clone và setup
cd backend
cp .env.example .env
# Edit .env và thêm OPENAI_API_KEY

# 2. Install dependencies
mvn clean install

# 3. Run database migrations
# (JPA sẽ tự tạo tables nếu ddl-auto=update)

# 4. Start application
mvn spring-boot:run

# 5. Test API
curl http://localhost:8080/api/topics
```

---

**✅ Backend đã sẵn sàng cho AI Speaking Practice!**

**Next:** Tích hợp với Frontend React theo hướng dẫn trong `03-FRONTEND.md`
