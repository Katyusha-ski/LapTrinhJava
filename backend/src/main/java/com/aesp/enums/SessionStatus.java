package com.aesp.enums;

/**
 * Status of practice sessions
 * Maps to SQL: ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED')
 */
public enum SessionStatus {
    SCHEDULED("Scheduled", "Session is scheduled but not started yet"),
    COMPLETED("Completed", "Session has been completed successfully"),
    CANCELLED("Cancelled", "Session was cancelled");
    
    private final String displayName;
    private final String description;
    
    SessionStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean isCompleted() {
        return this == COMPLETED;
    }
    
    public boolean canBeModified() {
        return this == SCHEDULED;
    }
}