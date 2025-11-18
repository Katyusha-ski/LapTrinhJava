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
    private Long topicId;
    private String topicName; // For display
    private SessionType type;
    private SessionStatus sessionStatus;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
