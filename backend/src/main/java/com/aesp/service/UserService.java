package com.aesp.service;

import com.aesp.dto.response.UserResponse;
import com.aesp.entity.Role;
import com.aesp.entity.User;
import com.aesp.exception.BadRequestException;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.RoleRepository;
import com.aesp.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    // Read-only operations
    public UserResponse getById(Long id) {
        if (id == null) {
            throw new BadRequestException("User id không được null");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        return toResponse(user);
    }

    public List<UserResponse> listAllActive() {
        return userRepository.findByIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    public Page<UserResponse> listAll(int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        Page<User> p = userRepository.findAll(pageable);
        List<UserResponse> content = p.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new PageImpl<UserResponse>(content, pageable, p.getTotalElements());
    }

    // Write operations
    @Transactional
    @SuppressWarnings("null")
    public UserResponse updateProfile(Long id, String fullName, String phone, String avatarUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        if (StringUtils.hasText(fullName)) {
            user.setFullName(fullName.trim());
        }
        if (phone != null) {
            user.setPhone(phone.trim());
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl.trim());
        }
        return toResponse(Objects.requireNonNull(userRepository.save(user)));
    }

    @Transactional
    @SuppressWarnings("null")
    public UserResponse setActive(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        user.setIsActive(active);
        return toResponse(Objects.requireNonNull(userRepository.save(user)));
    }

    @Transactional
    @SuppressWarnings("null")
    public UserResponse assignRole(Long userId, String roleName) {
        if (!StringUtils.hasText(roleName)) {
            throw new BadRequestException("Role không hợp lệ");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        Role role = roleRepository.findByName(roleName.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Role không tồn tại"));

        // Kiểm tra role đã tồn tại chưa (tránh duplicate)
        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
        }
        return toResponse(Objects.requireNonNull(userRepository.save(user)));
    }

    @Transactional
    @SuppressWarnings("null")
    public UserResponse removeRole(Long userId, String roleName) {
        if (!StringUtils.hasText(roleName)) {
            throw new BadRequestException("Role không hợp lệ");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        Role role = roleRepository.findByName(roleName.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Role không tồn tại"));

        user.getRoles().remove(role);
        return toResponse(Objects.requireNonNull(userRepository.save(user)));
    }

    // Mapper
    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .avatarURL(u.getAvatarUrl())
                .isActive(Boolean.TRUE.equals(u.getIsActive()))
                .roles(u.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toList()))
                .createdAt(u.getCreatedAt() == null ? null : u.getCreatedAt().toLocalDate())
                .build();
    }
}

