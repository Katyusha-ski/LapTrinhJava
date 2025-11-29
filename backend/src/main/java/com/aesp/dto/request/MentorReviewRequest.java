package com.aesp.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentorReviewRequest {

    @NotNull(message = "Session ID không được null")
    private Long sessionId;

    @NotNull(message = "Learner ID không được null")
    private Long learnerId;

    @NotNull(message = "Mentor ID không được null")
    private Long mentorId;

    @NotNull(message = "Rating không được null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rating phải lớn hơn 0")
    @DecimalMax(value = "5.0", message = "Rating không được vượt quá 5")
    private BigDecimal rating;

    private String reviewText;
}
