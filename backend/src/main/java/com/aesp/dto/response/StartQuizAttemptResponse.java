package com.aesp.dto.response;

import com.aesp.enums.EnglishLevel;
import com.aesp.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StartQuizAttemptResponse {

    private EnglishLevel targetLevel;
    private QuestionType questionType;
    private int questionCount;
    private List<QuestionItem> questions;

    @Data
    @AllArgsConstructor
    public static class QuestionItem {
        private Long id;
        private String text;
        private EnglishLevel level;
        private String topicArea;
        private List<AnswerOption> answers;
    }

    @Data
    @AllArgsConstructor
    public static class AnswerOption {
        private Long id;
        private String text;
    }
}
