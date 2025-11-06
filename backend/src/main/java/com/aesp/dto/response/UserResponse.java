package com.aesp.dto.response;

import java.time.LocalDate;
import java.util.List;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatarURL;
    private boolean isActive;
    private List<String> roles;
    private LocalDate createdAt;

    // Never include password in response DTOs
}
