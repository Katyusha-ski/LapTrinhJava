package com.aesp.dto.response;

import com.aesp.enums.EnglishLevel;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdaptiveAssessmentResponse {

    private EnglishLevel startingLevel;
    private EnglishLevel baselineLevel;
    private EnglishLevel recommendedLevel;
    private int totalQuestions;
    private int correctAnswers;
    private double accuracy;
}
