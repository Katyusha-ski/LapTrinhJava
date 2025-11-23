package com.aesp.service.ai;

import java.util.Collections;
import java.util.Map;

/**
 * Structured outcome produced by AI evaluation.
 */
public record PronunciationAnalysisResult(
        String normalizedTranscript,
        Integer accuracyScore,
        Integer fluencyScore,
        Integer pronunciationScore,
        Map<String, Object> detailedFeedback) {

    public PronunciationAnalysisResult {
        detailedFeedback = detailedFeedback != null ? detailedFeedback : Collections.emptyMap();
    }
}
