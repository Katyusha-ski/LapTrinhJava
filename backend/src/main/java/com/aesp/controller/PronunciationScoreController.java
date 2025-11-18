package com.aesp.controller;

import com.aesp.dto.request.PronunciationScoreRequest;
import com.aesp.dto.response.PronunciationScoreResponse;
import com.aesp.service.PronunciationScoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pronunciation")
@RequiredArgsConstructor
public class PronunciationScoreController {

    private final PronunciationScoreService scoreService;

    @PostMapping
    public ResponseEntity<PronunciationScoreResponse> submitScore(@Valid @RequestBody PronunciationScoreRequest request) {
        return ResponseEntity.ok(scoreService.submitScore(request));
    }

    @GetMapping("/learner/{learnerId}")
    public ResponseEntity<List<PronunciationScoreResponse>> getScoresByLearner(@PathVariable Long learnerId) {
        return ResponseEntity.ok(scoreService.getScoresByLearner(learnerId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<PronunciationScoreResponse>> getScoresBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(scoreService.getScoresBySession(sessionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PronunciationScoreResponse> getScoreById(@PathVariable Long id) {
        return ResponseEntity.ok(scoreService.getScoreById(id));
    }

    @GetMapping("/learner/{learnerId}/average")
    public ResponseEntity<BigDecimal> getAverageScore(@PathVariable Long learnerId) {
        return ResponseEntity.ok(scoreService.calculateAverageScore(learnerId));
    }

    @GetMapping("/learner/{learnerId}/detailed-average")
    public ResponseEntity<Map<String, BigDecimal>> getDetailedAverageScores(@PathVariable Long learnerId) {
        return ResponseEntity.ok(scoreService.getDetailedAverageScores(learnerId));
    }

    @PutMapping("/learner/{learnerId}/update-average")
    public ResponseEntity<Void> updateLearnerAverage(@PathVariable Long learnerId) {
        scoreService.updateLearnerAverageScore(learnerId);
        return ResponseEntity.ok().build();
    }
}
