package com.aesp.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MentorReviewUpdateRequest {

    @DecimalMin(value = "0.0", inclusive = false, message = "Rating phải lớn hơn 0")
    @DecimalMax(value = "5.0", message = "Rating không được vượt quá 5")
    private BigDecimal rating;

    private String reviewText;
}
