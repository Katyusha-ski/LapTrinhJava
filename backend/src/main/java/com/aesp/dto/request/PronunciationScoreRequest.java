package com.aesp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PronunciationScoreRequest {
    @NotNull(message = "Session ID không được null")
    private Long sessionId;

    @NotNull(message = "Learner ID không được null")
    private Long learnerId;

    @NotBlank(message = "Text to read không được rỗng")
    private String textToRead;

    private String audioUrl;
    private String transcribedText;
    private Integer accuracyScore;
    private Integer fluencyScore;
    private Integer pronunciationScore;
    private Map<String, Object> detailedFeedback;
}
