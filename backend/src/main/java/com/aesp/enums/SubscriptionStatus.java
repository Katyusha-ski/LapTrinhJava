package com.aesp.enums;

/**
 * Status of subscription
 * Maps to SQL: ENUM('ACTIVE', 'EXPIRED', 'CANCELLED')
 */
public enum SubscriptionStatus {
    ACTIVE("Active", "Subscription is currently active"),
    EXPIRED("Expired", "Subscription has expired"),
    CANCELLED("Cancelled", "Subscription was cancelled by user");
    
    private final String displayName;
    private final String description;
    
    SubscriptionStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean isActive() {
        return this == ACTIVE;
    }
}