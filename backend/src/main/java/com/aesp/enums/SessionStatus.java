package com.aesp.enums;

/**
 * Status of practice sessions
 * Maps to SQL enum values
 */
public enum SessionStatus {
    PENDING("Pending", "Waiting for mentor confirmation"),
    SCHEDULED("Scheduled", "Session is scheduled and confirmed"),
    IN_PROGRESS("In progress", "Session is currently taking place"),
    COMPLETED("Completed", "Session has been completed successfully"),
    CANCELLED("Cancelled", "Session was cancelled"),
    REJECTED("Rejected", "Session request was rejected by mentor");
    
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
        return this == SCHEDULED || this == PENDING;
    }
}