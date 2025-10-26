package com.aesp.enums;

/**
 * Payment methods for subscriptions
 * Maps to SQL: ENUM('CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH', 'VISA', 'MOMO')
 */
public enum PaymentMethod {
    CREDIT_CARD("Credit Card", "Credit card payment", true),
    PAYPAL("PayPal", "PayPal online payment", true),
    BANK_TRANSFER("Bank Transfer", "Direct bank transfer", false),
    CASH("Cash", "Cash payment", false),
    VISA("Visa", "Visa card payment", true),
    MOMO("MoMo", "MoMo e-wallet payment", true);
    
    private final String displayName;
    private final String description;
    private final boolean isOnline;
    
    PaymentMethod(String displayName, String description, boolean isOnline) {
        this.displayName = displayName;
        this.description = description;
        this.isOnline = isOnline;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean isOnline() {
        return isOnline;
    }
    
    public boolean isOffline() {
        return !isOnline;
    }
}