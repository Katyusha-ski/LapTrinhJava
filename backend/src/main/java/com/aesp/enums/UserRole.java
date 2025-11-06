package com.aesp.enums;

public enum UserRole {
    LEARNER("LEARNER", "Học viên"),
    MENTOR("MENTOR", "Giáo viên"),
    ADMIN("ADMIN", "Quản trị viên");

    private final String value;
    private final String displayName;

    UserRole(String value, String displayName) {
        this.value = value;
        this.displayName = displayName;
    }

    public String getValue() {
        return value;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Get enum by value (case-insensitive)
     */
    public static UserRole fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (UserRole role : UserRole.values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role value: " + value);
    }
}
