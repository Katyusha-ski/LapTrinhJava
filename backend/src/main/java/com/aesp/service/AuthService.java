package com.aesp.service;

import com.aesp.dto.request.LoginRequest;
import com.aesp.dto.request.RegisterRequest;
import com.aesp.dto.response.JwtResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.entity.Learner;
import com.aesp.entity.Mentor;
import com.aesp.entity.Role;
import com.aesp.entity.User;
import com.aesp.enums.UserRole;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.RoleRepository;
import com.aesp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LearnerRepository learnerRepository;
    private final MentorRepository mentorRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public JwtResponse login(LoginRequest request) {
        try {
            // Authenticate username + password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String jwt = jwtService.generateToken(authentication);

            // Get user info
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + request.getUsername()));

            // Check if user is active
            if (Boolean.FALSE.equals(user.getIsActive())) {
                throw new BadCredentialsException("User account is inactive");
            }

            // Get user roles
            List<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());

            return JwtResponse.builder()
                    .token(jwt)
                    .type("Bearer")
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .roles(roles)
                    .build();
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        // Check if username already exists
        if (Boolean.TRUE.equals(userRepository.existsByUsername(request.getUsername()))) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (Boolean.TRUE.equals(userRepository.existsByEmail(request.getEmail()))) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        // Get role from repository
        Role role = roleRepository.findByName(request.getRole().getValue())
                .orElseThrow(() -> new EntityNotFoundException("Role not found: " + request.getRole().getValue()));

        // Create user entity
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone() != null && !request.getPhone().isEmpty() ? request.getPhone() : null)
                .isActive(true)
                .emailVerified(false)
                .roles(Collections.singleton(role))
                .build();

        // Save user
        User savedUser = userRepository.save(user);

        // Create profile based on role
        if (request.getRole() == UserRole.LEARNER) {
            Learner learner = Learner.builder()
                    .user(savedUser)
                    .build();
            learnerRepository.save(learner);
        } else if (request.getRole() == UserRole.MENTOR) {
            Mentor mentor = Mentor.builder()
                    .user(savedUser)
                    .isAvailable(true)
                    .build();
            mentorRepository.save(mentor);
        }
        // ADMIN role doesn't need a profile

        return new MessageResponse("Đăng ký thành công");
    }
}

