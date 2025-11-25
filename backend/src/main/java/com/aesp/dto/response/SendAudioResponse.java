package com.aesp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SendAudioResponse {
    
    private Long conversationId;
    private String aiResponse;
    private String feedback;
    private Integer pronunciationScore;
    private Integer fluencyScore;
    private Integer accuracyScore;
    private String audioUrl;
}
