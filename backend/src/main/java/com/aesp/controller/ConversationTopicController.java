package com.aesp.controller;

import com.aesp.dto.response.ConversationTopicResponse;
import com.aesp.enums.EnglishLevel;
import com.aesp.service.ConversationTopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class ConversationTopicController {

    private final ConversationTopicService topicService;

    @GetMapping
    public ResponseEntity<List<ConversationTopicResponse>> getAllActiveTopics() {
        return ResponseEntity.ok(topicService.getAllActiveTopics());
    }

    @GetMapping("/all")
    public ResponseEntity<List<ConversationTopicResponse>> getAllTopics() {
        return ResponseEntity.ok(topicService.getAllTopics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationTopicResponse> getTopicById(@PathVariable Long id) {
        return ResponseEntity.ok(topicService.getTopicById(id));
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<ConversationTopicResponse>> getTopicsByLevel(@PathVariable String level) {
        EnglishLevel englishLevel = EnglishLevel.valueOf(level.toUpperCase());
        return ResponseEntity.ok(topicService.getTopicsByLevel(englishLevel));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ConversationTopicResponse>> getTopicsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(topicService.getTopicsByCategory(category));
    }

    @GetMapping("/category/{category}/level/{level}")
    public ResponseEntity<List<ConversationTopicResponse>> getTopicsByCategoryAndLevel(
            @PathVariable String category,
            @PathVariable String level) {
        EnglishLevel englishLevel = EnglishLevel.valueOf(level.toUpperCase());
        return ResponseEntity.ok(topicService.getTopicsByCategoryAndLevel(category, englishLevel));
    }
}
