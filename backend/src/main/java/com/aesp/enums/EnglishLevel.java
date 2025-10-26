package com.aesp.enums;

/**
 * English proficiency levels for learners
 * Maps to SQL: ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED')
 */
public enum EnglishLevel {
    BEGINNER("Beginner Level", "Basic English skills"),
    INTERMEDIATE("Intermediate Level", "Good conversational skills"), 
    ADVANCED("Advanced Level", "Near-native proficiency");
    
    private final String displayName;
    private final String description;
    
    EnglishLevel(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}