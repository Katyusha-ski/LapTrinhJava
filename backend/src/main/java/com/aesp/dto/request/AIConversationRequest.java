package com.aesp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIConversationRequest {
    @NotNull(message = "Session ID không được null")
    private Long sessionId;

    @NotBlank(message = "Speaker không được rỗng")
    private String speaker; // "USER" or "AI"

    @NotBlank(message = "Message không được rỗng")
    private String message;

    private String correctedMessage;
    private List<String> grammarErrors;
    private List<String> vocabularySuggestions;
}
