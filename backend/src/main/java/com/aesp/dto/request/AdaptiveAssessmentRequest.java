package com.aesp.dto.request;

import com.aesp.dto.response.QuestionEvaluationDto;
import com.aesp.enums.EnglishLevel;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AdaptiveAssessmentRequest {

    @NotNull
    private EnglishLevel startingLevel;

    @NotNull
    @Valid
    private AttemptResultPayload attemptResult;

    @Data
    public static class AttemptResultPayload {
        @NotEmpty
        @Valid
        private List<QuestionEvaluationDto> evaluations;

        @Min(0)
        private int correctAnswers;

        @Min(1)
        private int totalQuestions;

        @DecimalMin(value = "0.0")
        @DecimalMax(value = "1.0")
        private double accuracy;
    }
}
