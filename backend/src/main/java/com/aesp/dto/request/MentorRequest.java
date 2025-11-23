package com.aesp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.Set;

import com.aesp.enums.EnglishLevel;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentorRequest {
    @NotNull(message = "User ID không được null")
    private Long userId;

    private String bio;

    @Min(value = 0, message = "Experience years không được âm")
    private Integer experienceYears;

    @Min(value = 0, message = "Hourly rate không được âm")
    private BigDecimal hourlyRate;

    private BigDecimal rating;

    @Min(value = 0, message = "Total students không được âm")
    private Integer totalStudents;

    private Boolean isAvailable = true;

    private Set<String> skills;

    private Set<EnglishLevel> supportedLevels;
}
