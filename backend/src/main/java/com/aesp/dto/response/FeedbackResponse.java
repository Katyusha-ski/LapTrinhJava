package com.aesp.dto.response;

import com.aesp.entity.FeedbackStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class FeedbackResponse {
    private Long id;
    private Long learnerId;
    private String learnerName;
    private String content;
    private FeedbackStatus status;
    private String moderatedBy;
    private LocalDateTime moderatedAt;
    private LocalDateTime createdAt;
}
