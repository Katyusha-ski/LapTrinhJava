package com.aesp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

import com.aesp.enums.EnglishLevel;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentorResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private BigDecimal rating;
    private Integer totalStudents;
    private Boolean isAvailable;
    private Set<String> skills;
    private Set<EnglishLevel> supportedLevels;
}
