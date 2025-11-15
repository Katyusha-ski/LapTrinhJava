package com.aesp.dto.response;

import com.aesp.enums.EnglishLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearnerResponse {
    private Long id;
    private Long userId;
    private Long mentorId;
    private String fullName;
    private String avatarUrl;
    private EnglishLevel englishLevel;
    private String learningGoals;
    private Integer currentStreak;
    private BigDecimal totalPracticeHours;
    private BigDecimal pronunciationScore;
    private BigDecimal grammarScore;
    private BigDecimal vocabularyScore;
    private BigDecimal overallScore;
    private LocalDateTime createdAt;
}
