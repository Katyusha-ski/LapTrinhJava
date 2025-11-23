package com.aesp.service.ai;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.aesp.dto.request.PronunciationScoreRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiEvaluationService {

    private final OpenAiPronunciationClient openAiPronunciationClient;

    public boolean isEnabled() {
        return openAiPronunciationClient.isEnabled();
    }

    public Optional<PronunciationAnalysisResult> evaluatePronunciation(PronunciationScoreRequest request) {
        if (!isEnabled()) {
            return Optional.empty();
        }

        if (!StringUtils.hasText(request.getTextToRead())) {
            return Optional.empty();
        }

        if (!StringUtils.hasText(request.getTranscribedText()) && !StringUtils.hasText(request.getAudioUrl())) {
            return Optional.empty();
        }

        PronunciationAnalysisInput input = new PronunciationAnalysisInput(
            request.getTextToRead(),
            request.getTranscribedText(),
            request.getAudioUrl(),
            Optional.empty());

        return Optional.of(openAiPronunciationClient.analyzePronunciation(input));
    }
}
