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

    private String topic;

    @NotNull(message = "Session type không được null")
    private SessionType type;

    @NotNull(message = "Scheduled time không được null")
    private LocalDateTime scheduledAt;

    @NotNull(message = "Duration không được null")
    @Min(value = 1, message = "Duration phải lớn hơn 0")
    private Integer durationMinutes;

    private String notes;
}
