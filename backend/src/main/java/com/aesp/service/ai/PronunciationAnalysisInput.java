package com.aesp.service.ai;

import java.util.Optional;

/**
 * Input payload for AI pronunciation evaluation.
 */
public record PronunciationAnalysisInput(
        String referenceText,
        String learnerTranscript,
        String audioUrl,
        Optional<String> languageCode) {

    public PronunciationAnalysisInput {
        languageCode = languageCode != null ? languageCode : Optional.empty();
    }

    public static PronunciationAnalysisInput of(String referenceText, String learnerTranscript, String audioUrl) {
        return new PronunciationAnalysisInput(referenceText, learnerTranscript, audioUrl, Optional.empty());
    }
}
