package com.aesp.service.quiz;

import com.aesp.enums.EnglishLevel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class AdaptiveTestingService {

    private static final double HIGH_ACCURACY_THRESHOLD = 0.80;
    private static final double MEDIUM_ACCURACY_THRESHOLD = 0.50;

    public AdaptiveAssessmentResult estimateLevel(EnglishLevel startingLevel,
                                                  QuizAttemptService.QuizAttemptResult attemptResult) {
        Objects.requireNonNull(startingLevel, "Starting level must not be null");
        Objects.requireNonNull(attemptResult, "Attempt result must not be null");

        EnglishLevel baselineLevel = simulateAdaptivePath(startingLevel, attemptResult.evaluations());
        EnglishLevel recommended = adjustLevelWithAccuracy(baselineLevel, attemptResult.accuracy());

        return new AdaptiveAssessmentResult(
                startingLevel,
                baselineLevel,
                recommended,
                attemptResult.totalQuestions(),
                attemptResult.correctAnswers(),
                attemptResult.accuracy()
        );
    }

    private EnglishLevel simulateAdaptivePath(EnglishLevel startingLevel,
                                              List<QuizAttemptService.QuestionEvaluation> evaluations) {
        EnglishLevel current = startingLevel;
        if (evaluations == null || evaluations.isEmpty()) {
            return current;
        }

        for (QuizAttemptService.QuestionEvaluation evaluation : evaluations) {
            if (evaluation.correct()) {
                current = levelUp(current);
            } else {
                current = levelDown(current);
            }
        }
        return current;
    }

    private EnglishLevel adjustLevelWithAccuracy(EnglishLevel baseline, double accuracy) {
        if (accuracy >= HIGH_ACCURACY_THRESHOLD) {
            return levelUp(baseline);
        }
        if (accuracy >= MEDIUM_ACCURACY_THRESHOLD) {
            return baseline;
        }
        return levelDown(baseline);
    }

    private EnglishLevel levelUp(EnglishLevel level) {
        return switch (level) {
            case A1 -> EnglishLevel.A2;
            case A2 -> EnglishLevel.B1;
            case B1 -> EnglishLevel.B2;
            case B2 -> EnglishLevel.C1;
            case C1, C2 -> EnglishLevel.C2;
        };
    }

    private EnglishLevel levelDown(EnglishLevel level) {
        return switch (level) {
            case A1, A2 -> EnglishLevel.A1;
            case B1 -> EnglishLevel.A2;
            case B2 -> EnglishLevel.B1;
            case C1 -> EnglishLevel.B2;
            case C2 -> EnglishLevel.C1;
        };
    }

    public record AdaptiveAssessmentResult(EnglishLevel startingLevel,
                                           EnglishLevel baselineLevel,
                                           EnglishLevel recommendedLevel,
                                           int totalQuestions,
                                           int correctAnswers,
                                           double accuracy) {}
}
