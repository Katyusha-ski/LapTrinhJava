package com.aesp.dto.response;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageResponse {
    private boolean success;
    private String message;
    
    public MessageResponse(String message) {
        this.success = true;
        this.message = message;
    }
    
    public boolean isSuccess() {
        return success;
    }
}