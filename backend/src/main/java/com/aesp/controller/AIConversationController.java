package com.aesp.controller;

import com.aesp.dto.request.AIConversationRequest;
import com.aesp.dto.request.StartConversationRequest;
import com.aesp.dto.response.AIConversationResponse;
import com.aesp.dto.response.SendAudioResponse;
import com.aesp.service.AIConversationService;
import com.aesp.service.AudioStorageService;
import com.aesp.service.OpenAiConversationService;
import com.aesp.service.PracticeSessionService;
import com.aesp.service.ai.OpenAiPronunciationClient;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Slf4j
public class AIConversationController {

    private final AIConversationService conversationService;
    private final OpenAiConversationService openAiConversationService;
    private final AudioStorageService audioStorageService;
    private final PracticeSessionService practiceSessionService;
    private final OpenAiPronunciationClient openAiClient;

    @PostMapping
    public ResponseEntity<AIConversationResponse> saveMessage(@Valid @RequestBody AIConversationRequest request) {
        return ResponseEntity.ok(conversationService.saveMessage(request));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<AIConversationResponse>> getConversationsBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(conversationService.getConversationsBySession(sessionId));
    }

    @GetMapping("/session/{sessionId}/recent")
    public ResponseEntity<List<AIConversationResponse>> getRecentMessages(
            @PathVariable Long sessionId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(conversationService.getRecentMessages(sessionId, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AIConversationResponse> getMessageById(@PathVariable Long id) {
        return ResponseEntity.ok(conversationService.getMessageById(id));
    }

    @PostMapping("/start")
    public ResponseEntity<String> startConversation(@Valid @RequestBody StartConversationRequest request) {
        String firstQuestion = openAiConversationService.generateFirstQuestion(request.getTopicId());
        return ResponseEntity.ok(firstQuestion);
    }

    @PostMapping("/send-message")
    public ResponseEntity<SendAudioResponse> sendMessage(
            @RequestParam Long sessionId,
            @RequestParam(required = false) MultipartFile audio,
            @RequestParam(required = false) String userMessage) {
        
        try {
            log.info("Received message for session: {}", sessionId);
            
            String transcript = userMessage;
            
            // 1. Nếu có audio file, transcribe nó
            if (audio != null && !audio.isEmpty()) {
                log.info("Transcribing audio: {} bytes", audio.getSize());
                byte[] audioBytes = audio.getBytes();
                transcript = openAiClient.transcribeAudio(audioBytes, audio.getOriginalFilename());
                log.info("Transcribed: {}", transcript);
            }
            
            if (transcript == null || transcript.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // 2. Generate AI response
            String aiResponse = openAiConversationService.generateResponse(sessionId, transcript);
            
            // 3. Generate feedback
            String feedback = openAiConversationService.generateFeedback(transcript, transcript);
            
            // 4. Save user message to database (verify session exists)
            practiceSessionService.getSessionEntityById(sessionId);
            
            conversationService.saveMessage(com.aesp.dto.request.AIConversationRequest.builder()
                    .sessionId(sessionId)
                    .speaker("USER")
                    .message(transcript)
                    .build());
            
            log.info("User message saved");
            
            // 5. Convert AI response to speech
            String aiAudioUrl = null;
            try {
                byte[] aiAudio = openAiClient.textToSpeech(aiResponse);
                if (aiAudio != null && aiAudio.length > 0) {
                    aiAudioUrl = audioStorageService.saveAudio(aiAudio, "ai_response_" + sessionId + "_" + System.currentTimeMillis() + ".mp3");
                    log.info("AI audio saved: {}", aiAudioUrl);
                }
            } catch (Exception e) {
                log.warn("Failed to generate TTS: {}", e.getMessage());
                // Continue without audio
            }
            
            // 6. Save AI response to database
            conversationService.saveMessage(com.aesp.dto.request.AIConversationRequest.builder()
                    .sessionId(sessionId)
                    .speaker("AI")
                    .message(aiResponse)
                    .build());
            
            log.info("AI message saved");
            
            // 7. Build response
            SendAudioResponse response = SendAudioResponse.builder()
                    .aiResponse(aiResponse)
                    .feedback(feedback)
                    .audioUrl(aiAudioUrl)
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing message for session {}: {}", sessionId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
