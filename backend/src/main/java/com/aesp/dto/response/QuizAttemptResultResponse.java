package com.aesp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuizAttemptResultResponse {

    private List<QuestionEvaluationDto> evaluations;
    private int correctAnswers;
    private int totalQuestions;
    private double accuracy;
}
