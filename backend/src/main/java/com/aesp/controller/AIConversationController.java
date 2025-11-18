package com.aesp.controller;

import com.aesp.dto.request.AIConversationRequest;
import com.aesp.dto.response.AIConversationResponse;
import com.aesp.service.AIConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class AIConversationController {

    private final AIConversationService conversationService;

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
}
