package com.aesp.dto.request;

import com.aesp.enums.EnglishLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearnerRequest {
    @NotNull(message = "User ID không được null")
    private Long userId;

    private Long mentorId;

    private EnglishLevel englishLevel;

    private String learningGoals;

    private Integer currentStreak = 0;

    private BigDecimal totalPracticeHours = BigDecimal.ZERO;

    private BigDecimal averagePronunciationScore = BigDecimal.ZERO;
}
