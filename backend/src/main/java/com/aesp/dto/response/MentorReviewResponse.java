package com.aesp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentorReviewResponse {
    private Long id;
    private Long sessionId;
    private Long learnerId;
    private Long mentorId;
    private String learnerName;
    private String mentorName;
    private BigDecimal rating;
    private String reviewText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
