package com.aesp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIConversationResponse {
    private Long id;
    private Long sessionId;
    private String speaker; // "USER" or "AI"
    private String message;
    private String correctedMessage;
    private List<String> grammarErrors;
    private List<String> vocabularySuggestions;
    private LocalDateTime createdAt;
}
