package com.aesp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @Email(message = "Email không hợp lệ")
    private String email;

    private String fullName;

    private String phone;

    private String avatarUrl;

    private Boolean isActive;
}
