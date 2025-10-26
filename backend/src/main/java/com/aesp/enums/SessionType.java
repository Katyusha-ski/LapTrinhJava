package com.aesp.enums;

/**
 * Types of practice sessions
 * Maps to SQL: ENUM('MENTOR_LED', 'AI_ASSISTED')
 */
public enum SessionType {
    MENTOR_LED("Mentor Led", "One-on-one session with human mentor", true),
    AI_ASSISTED("AI Assisted", "AI-powered practice session", false);
    
    private final String displayName;
    private final String description;
    private final boolean requiresMentor;
    
    SessionType(String displayName, String description, boolean requiresMentor) {
        this.displayName = displayName;
        this.description = description;
        this.requiresMentor = requiresMentor;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean requiresMentor() {
        return requiresMentor;
    }
    
    public boolean isAiAssisted() {
        return this == AI_ASSISTED;
    }
}