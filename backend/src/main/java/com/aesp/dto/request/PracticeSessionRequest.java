package com.aesp.dto.request;

import com.aesp.enums.SessionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionRequest {
    @NotNull(message = "Learner ID không được null")
    private Long learnerId;

    private Long mentorId;

    private Long topicId; // Reference to ConversationTopic

    @NotNull(message = "Session type không được null")
    private SessionType type;

    @NotNull(message = "Start time không được null")
    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
