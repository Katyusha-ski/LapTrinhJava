package com.aesp.service.ai;

/**
 * Runtime exception thrown when AI provider calls fail or return unreadable data.
 */
public class AiServiceException extends RuntimeException {

    public AiServiceException(String message) {
        super(message);
    }

    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
