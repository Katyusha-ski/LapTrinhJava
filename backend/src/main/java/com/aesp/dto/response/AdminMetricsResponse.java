package com.aesp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminMetricsResponse {
    private Long activeLearners;
    private Long certifiedMentors;
    private Long sessionsBooked30d;
    private Long totalSubscriptions;
    private Double totalRevenue;
    private Long pendingFeedbackCount;
}
