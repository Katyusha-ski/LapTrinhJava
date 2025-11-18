package com.aesp.enums;

/**
 * English proficiency levels based on CEFR (Common European Framework of Reference)
 * Maps to SQL: ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
 */
public enum EnglishLevel {
    A1("Beginner", "Basic phrases and simple conversations"),
    A2("Elementary", "Simple daily interactions"), 
    B1("Intermediate", "Can handle most travel situations"),
    B2("Upper-Intermediate", "Effective communication in work settings"),
    C1("Advanced", "Fluent and spontaneous expression"),
    C2("Proficient", "Near-native proficiency");
    
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