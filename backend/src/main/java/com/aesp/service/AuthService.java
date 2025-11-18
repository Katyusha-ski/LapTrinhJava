package com.aesp.service;

import com.aesp.dto.request.LoginRequest;
import com.aesp.dto.request.RegisterRequest;
import com.aesp.dto.response.JwtResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.dto.response.UserResponse;
import com.aesp.entity.Role;
import com.aesp.entity.User;
import com.aesp.enums.UserRole;
import com.aesp.exception.BadRequestException;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.RoleRepository;
import com.aesp.repository.UserRepository;
import com.aesp.security.JwtProvider;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder; // Injected via @Configuration bean
    private final JwtProvider jwtProvider;         // JWT generator/validator

    @Transactional
    public MessageResponse register(@Valid RegisterRequest request) {
        // @Valid đã handle validation, không cần validateRegisterRequest() nữa
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .isActive(true)
                .emailVerified(false)
                .build();

        Role role = resolveOrCreateRole(request.getRole());
        user.getRoles().add(role);

        userRepository.save(user);
        return MessageResponse.builder().message("Đăng ký thành công").build();
    }

    public JwtResponse login(@Valid LoginRequest request) {
        // @Valid đã handle validation cơ bản
        
        // Security: Luôn throw cùng message để tránh leak thông tin (user tồn tại hay không)
        String username = request.getUsername().trim();
        String password = request.getPassword();
        
        User user = userRepository.findByUsername(username)
                .orElse(null); // Không throw ngay, check password trước
        
        // Security: Check password ngay cả khi user không tồn tại
        // Dummy hash check để tránh timing attack (constant-time comparison)
        String dummyHash = "$2a$10$dummyHashToPreventTimingAttack1234567890123456789012";
        
        if (user == null) {
            // Dummy check để tốn thời gian tương đương với password check thật
            passwordEncoder.matches(password, dummyHash);
            throw new BadRequestException("Sai username hoặc password");
        }
        
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadRequestException("Sai username hoặc password");
        }
        
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản đã bị vô hiệu hóa");
        }

        String token = jwtProvider.generateToken(user);

        return JwtResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .build();
    }

    public UserResponse me(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        return toUserResponse(user);
    }

    // --- Helper methods ---

    private Role resolveOrCreateRole(UserRole roleEnum) {
        String roleName = roleEnum.getValue();
        Optional<Role> existing = roleRepository.findByName(roleName);
        if (existing.isPresent()) {
            return existing.get();
        }
        Role role = Role.builder()
                .name(roleName)
                .description("System role: " + roleName)
                .build();
        return Objects.requireNonNull(roleRepository.save(role));
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .avatarURL(u.getAvatarUrl())
                .isActive(Boolean.TRUE.equals(u.getIsActive()))
                .roles(u.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .createdAt(u.getCreatedAt() == null ? null : u.getCreatedAt().toLocalDate())
                .build();
    }
}
