package com.aesp.dto.response;

import com.aesp.enums.SessionStatus;
import com.aesp.enums.SessionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionResponse {
    private Long id;
    private Long learnerId;
    private Long mentorId;
    private SessionType type;
    private SessionStatus status;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String topic;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
