package com.aesp.service;

import com.aesp.dto.request.PronunciationScoreRequest;
import com.aesp.dto.response.PronunciationScoreResponse;
import com.aesp.entity.Learner;
import com.aesp.entity.PracticeSession;
import com.aesp.entity.PronunciationScore;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.PracticeSessionRepository;
import com.aesp.repository.PronunciationScoreRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.aesp.service.ai.AiEvaluationService;
import com.aesp.service.ai.PronunciationAnalysisResult;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PronunciationScoreService {

    private final PronunciationScoreRepository repository;
    private final LearnerRepository learnerRepository;
    private final PracticeSessionRepository sessionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AiEvaluationService aiEvaluationService;

    @Transactional
    public PronunciationScoreResponse submitScore(PronunciationScoreRequest request) {
        Long sessionId = Objects.requireNonNull(request.getSessionId(), "sessionId must not be null");
        PracticeSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        Long learnerId = Objects.requireNonNull(request.getLearnerId(), "learnerId must not be null");
        Learner learner = learnerRepository.findById(learnerId)
            .orElseThrow(() -> new ResourceNotFoundException("Learner not found with id: " + learnerId));

        // Allow AI to enrich missing scores when available
        if ((request.getAccuracyScore() == null || request.getFluencyScore() == null || request.getPronunciationScore() == null)
                && aiEvaluationService.isEnabled()) {
            aiEvaluationService.evaluatePronunciation(request).ifPresent(result -> applyAiResult(request, result));
        }

        // Validate score ranges (0-100)
        validateScore(request.getAccuracyScore(), "Accuracy");
        validateScore(request.getFluencyScore(), "Fluency");
        validateScore(request.getPronunciationScore(), "Pronunciation");

        // Convert Map to JSON string
        String feedbackJson = null;
        if (request.getDetailedFeedback() != null && !request.getDetailedFeedback().isEmpty()) {
            try {
                feedbackJson = objectMapper.writeValueAsString(request.getDetailedFeedback());
            } catch (JsonProcessingException e) {
                feedbackJson = null;
            }
        }

        PronunciationScore score = PronunciationScore.builder()
                .session(session)
                .learner(learner)
                .textToRead(request.getTextToRead())
                .audioUrl(request.getAudioUrl())
                .transcribedText(request.getTranscribedText())
                .accuracyScore(request.getAccuracyScore())
                .fluencyScore(request.getFluencyScore())
                .pronunciationScore(request.getPronunciationScore())
                .detailedFeedback(feedbackJson)
                .build();

        PronunciationScore saved = repository.save(Objects.requireNonNull(score));

        // Update learner's average pronunciation score
        updateLearnerAverageScore(learnerId);

        return toResponse(saved);
    }

    private void applyAiResult(PronunciationScoreRequest request, PronunciationAnalysisResult result) {
        if (result == null) {
            return;
        }
        if (result.accuracyScore() != null) {
            request.setAccuracyScore(result.accuracyScore());
        }
        if (result.fluencyScore() != null) {
            request.setFluencyScore(result.fluencyScore());
        }
        if (result.pronunciationScore() != null) {
            request.setPronunciationScore(result.pronunciationScore());
        }
        if (StringUtils.hasText(result.normalizedTranscript())) {
            request.setTranscribedText(result.normalizedTranscript());
        }
        if (result.detailedFeedback() != null && !result.detailedFeedback().isEmpty()) {
            request.setDetailedFeedback(result.detailedFeedback());
        }
    }

    public List<PronunciationScoreResponse> getScoresByLearner(Long learnerId) {
        return repository.findByLearnerIdOrderByCreatedAtDesc(learnerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PronunciationScoreResponse> getScoresBySession(Long sessionId) {
        return repository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PronunciationScoreResponse getScoreById(Long id) {
        Long scoreId = Objects.requireNonNull(id, "score id must not be null");
        PronunciationScore score = repository.findById(scoreId)
            .orElseThrow(() -> new ResourceNotFoundException("Pronunciation score not found with id: " + scoreId));
        return toResponse(score);
    }

    public BigDecimal calculateAverageScore(Long learnerId) {
        Double average = repository.calculateAveragePronunciationScore(learnerId);
        return average != null ? BigDecimal.valueOf(average).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    @Transactional
    public void updateLearnerAverageScore(Long learnerId) {
        Long targetLearnerId = Objects.requireNonNull(learnerId, "learnerId must not be null");
        BigDecimal averageScore = calculateAverageScore(targetLearnerId);
        Learner learner = learnerRepository.findById(targetLearnerId)
            .orElseThrow(() -> new ResourceNotFoundException("Learner not found with id: " + targetLearnerId));
        learner.setAveragePronunciationScore(averageScore);
        learnerRepository.save(Objects.requireNonNull(learner));
    }

    public Map<String, BigDecimal> getDetailedAverageScores(Long learnerId) {
        Map<String, BigDecimal> averages = new HashMap<>();
        
        Double accuracyAvg = repository.calculateAverageAccuracyScore(learnerId);
        Double fluencyAvg = repository.calculateAverageFluencyScore(learnerId);
        Double pronunciationAvg = repository.calculateAveragePronunciationScore(learnerId);
        
        averages.put("accuracy", accuracyAvg != null ? BigDecimal.valueOf(accuracyAvg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        averages.put("fluency", fluencyAvg != null ? BigDecimal.valueOf(fluencyAvg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        averages.put("pronunciation", pronunciationAvg != null ? BigDecimal.valueOf(pronunciationAvg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        averages.put("overall", calculateAverageScore(learnerId));
        
        return averages;
    }

    private PronunciationScoreResponse toResponse(PronunciationScore score) {
        PronunciationScoreResponse response = new PronunciationScoreResponse();
        response.setId(score.getId());
        response.setSessionId(score.getSession().getId());
        response.setLearnerId(score.getLearner().getId());
        
        // Get learner name
        if (score.getLearner().getUser() != null) {
            response.setLearnerName(score.getLearner().getUser().getFullName());
        }

        response.setTextToRead(score.getTextToRead());
        response.setAudioUrl(score.getAudioUrl());
        response.setTranscribedText(score.getTranscribedText());
        response.setAccuracyScore(score.getAccuracyScore());
        response.setFluencyScore(score.getFluencyScore());
        response.setPronunciationScore(score.getPronunciationScore());
        response.setCreatedAt(score.getCreatedAt());

        // Parse JSON to Map
        if (score.getDetailedFeedback() != null && !score.getDetailedFeedback().isEmpty()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> feedback = objectMapper.readValue(score.getDetailedFeedback(), Map.class);
                response.setDetailedFeedback(feedback);
            } catch (JsonProcessingException e) {
                response.setDetailedFeedback(new HashMap<>());
            }
        } else {
            response.setDetailedFeedback(new HashMap<>());
        }

        return response;
    }
    
    /**
     * Validate score is between 0 and 100
     */
    private void validateScore(Integer score, String scoreName) {
        if (score != null && (score < 0 || score > 100)) {
            throw new IllegalArgumentException(scoreName + " score must be between 0 and 100, got: " + score);
        }
    }
}
