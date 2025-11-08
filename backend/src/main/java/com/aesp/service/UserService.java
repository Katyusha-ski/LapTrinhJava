package com.aesp.service;

import com.aesp.dto.response.UserResponse;
import com.aesp.entity.Role;
import com.aesp.entity.User;
import com.aesp.enums.UserRole;
import com.aesp.repository.RoleRepository;
import com.aesp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }

    public User getUserById(Long id) {
        Objects.requireNonNull(id, "User id must not be null");
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User with id %d not found".formatted(id)));
    }

    public User getUserByUsername(String username) {
        String normalized = requireText(username, "Username must not be blank");
        return userRepository.findByUsername(normalized)
                .orElseThrow(() -> new EntityNotFoundException("User with username '%s' not found".formatted(normalized)));
    }

    public User getUserByEmail(String email) {
        String normalized = requireText(email, "Email must not be blank");
        return userRepository.findByEmail(normalized)
                .orElseThrow(() -> new EntityNotFoundException("User with email '%s' not found".formatted(normalized)));
    }

    @Transactional
    public User createUser(User request, String rawPassword, Collection<UserRole> roles) {
        Objects.requireNonNull(request, "User request must not be null");
        String username = requireText(request.getUsername(), "Username must not be blank");
        String email = requireText(request.getEmail(), "Email must not be blank");
        String fullName = requireText(request.getFullName(), "Full name must not be blank");
        String password = requireText(rawPassword, "Password must not be blank");

        if (Boolean.TRUE.equals(userRepository.existsByUsername(username))) {
            throw new IllegalArgumentException("Username '%s' already exists".formatted(username));
        }
        if (Boolean.TRUE.equals(userRepository.existsByEmail(email))) {
            throw new IllegalArgumentException("Email '%s' already exists".formatted(email));
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .fullName(fullName)
                .phone(trimToNull(request.getPhone()))
                .avatarUrl(trimToNull(request.getAvatarUrl()))
                .isActive(request.getIsActive() != null ? request.getIsActive() : Boolean.TRUE)
                .emailVerified(Boolean.TRUE.equals(request.getEmailVerified()))
                .build();

        if (request.getCreatedAt() != null) {
            user.setCreatedAt(request.getCreatedAt());
        }
        if (request.getUpdatedAt() != null) {
            user.setUpdatedAt(request.getUpdatedAt());
        }

        Set<Role> resolvedRoles = resolveRoles(roles);
        if (!resolvedRoles.isEmpty()) {
            user.setRoles(resolvedRoles);
        }

        return saveUser(user);
    }

    @Transactional
    public User updateUser(Long id, User request) {
        Objects.requireNonNull(request, "User request must not be null");
        User existing = getUserById(id);

        if (request.getUsername() != null) {
            String newUsername = requireText(request.getUsername(), "Username must not be blank");
            if (!newUsername.equals(existing.getUsername()) && Boolean.TRUE.equals(userRepository.existsByUsername(newUsername))) {
                throw new IllegalArgumentException("Username '%s' already exists".formatted(newUsername));
            }
            existing.setUsername(newUsername);
        }

        if (request.getEmail() != null) {
            String newEmail = requireText(request.getEmail(), "Email must not be blank");
            if (!newEmail.equalsIgnoreCase(existing.getEmail()) && Boolean.TRUE.equals(userRepository.existsByEmail(newEmail))) {
                throw new IllegalArgumentException("Email '%s' already exists".formatted(newEmail));
            }
            existing.setEmail(newEmail);
        }

        if (request.getFullName() != null) {
            existing.setFullName(requireText(request.getFullName(), "Full name must not be blank"));
        }

        if (request.getPhone() != null) {
            existing.setPhone(trimToNull(request.getPhone()));
        }

        if (request.getAvatarUrl() != null) {
            existing.setAvatarUrl(trimToNull(request.getAvatarUrl()));
        }

        if (request.getIsActive() != null) {
            existing.setIsActive(request.getIsActive());
        }

        if (request.getEmailVerified() != null) {
            existing.setEmailVerified(request.getEmailVerified());
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> resolvedRoles = request.getRoles().stream()
                    .map(role -> {
                        Long roleId = role.getId();
                        if (roleId == null) {
                            throw new IllegalArgumentException("Role id must not be null");
                        }
                        return roleRepository.findById(roleId)
                                .orElseThrow(() -> new EntityNotFoundException("Role with id %d not found".formatted(roleId)));
                    })
                    .collect(Collectors.toSet());
            existing.setRoles(resolvedRoles);
        }

        return saveUser(existing);
    }

    @Transactional
    public User changePassword(Long id, String newRawPassword) {
        String password = requireText(newRawPassword, "New password must not be blank");
        User user = getUserById(id);
        user.setPasswordHash(passwordEncoder.encode(password));
        return saveUser(user);
    }

    @Transactional
    public User setUserActiveStatus(Long id, boolean active) {
        User user = getUserById(id);
        user.setIsActive(active);
        return saveUser(user);
    }

    @Transactional
    public User updateRoles(Long userId, Collection<UserRole> roles) {
        User user = getUserById(userId);
        Set<Role> resolvedRoles = resolveRoles(roles);
        user.setRoles(resolvedRoles);
        return saveUser(user);
    }

    public UserResponse toResponse(User user) {
        Objects.requireNonNull(user, "User must not be null");
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarURL(user.getAvatarUrl())
                .isActive(Boolean.TRUE.equals(user.getIsActive()))
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .createdAt(convertCreatedAt(user.getCreatedAt()))
                .build();
    }

    private Set<Role> resolveRoles(Collection<UserRole> roles) {
        if (roles == null || roles.isEmpty()) {
            return Set.of();
        }
        return roles.stream()
                .filter(Objects::nonNull)
                .map(role -> roleRepository.findByName(role.getValue())
                        .orElseThrow(() -> new EntityNotFoundException("Role '%s' not found".formatted(role.getValue()))))
                .collect(Collectors.toSet());
    }

    private User saveUser(User user) {
        Objects.requireNonNull(user, "User must not be null");
        return Objects.requireNonNull(userRepository.save(user), "User repository returned null after save");
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private java.time.LocalDate convertCreatedAt(LocalDateTime createdAt) {
        return createdAt == null ? null : createdAt.toLocalDate();
    }
}
