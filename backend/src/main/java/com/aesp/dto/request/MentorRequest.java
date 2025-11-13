package com.aesp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentorRequest {
    @NotBlank(message = "User ID không được null")
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
}
