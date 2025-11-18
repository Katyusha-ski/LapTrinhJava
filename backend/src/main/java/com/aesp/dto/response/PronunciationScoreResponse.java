package com.aesp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PronunciationScoreResponse {
    private Long id;
    private Long sessionId;
    private Long learnerId;
    private String learnerName;
    private String textToRead;
    private String audioUrl;
    private String transcribedText;
    private Integer accuracyScore;
    private Integer fluencyScore;
    private Integer pronunciationScore;
    private Map<String, Object> detailedFeedback;
    private LocalDateTime createdAt;
}
