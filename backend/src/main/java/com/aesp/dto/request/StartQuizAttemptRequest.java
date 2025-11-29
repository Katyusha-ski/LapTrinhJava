package com.aesp.dto.request;

import com.aesp.enums.EnglishLevel;
import com.aesp.enums.QuestionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.Set;

@Data
public class StartQuizAttemptRequest {

    private Long learnerId;

    private EnglishLevel targetLevel;

    private QuestionType questionType;

    @Min(1)
    @Max(50)
    private Integer questionCount;

    private Set<Long> excludeQuestionIds;
}
