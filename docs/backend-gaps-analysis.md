# Phân tích Backend - Tóm tắt gọn

## 📋 File THIẾU (cần tạo)

### Controllers
- `AuthController` — login/register
- `MentorController` — CRUD mentor
- `LearnerController` — CRUD learner
- `PackageController` — CRUD package

### Services
- `AuthService` — register/login logic
- `PracticeSessionService` — CRUD session

### DTOs Request
- `PracticeSessionRequest` — learnerId, mentorId, type, scheduledAt, durationMinutes, notes
- `MentorRequest` — userId, bio, experienceYears, hourlyRate, isAvailable
- `LearnerRequest` — userId, mentorId, englishLevel, learningGoals
- `PackageRequest` — name, description, price, durationDays, features, isActive
- `UpdateProfileRequest` — email, fullName, phone, avatarUrl

### DTOs Response
- `PracticeSessionResponse` — id, learnerId, mentorId, type, status, scheduledAt, durationMinutes, notes, createdAt, updatedAt
- `MentorResponse` — id, userId, fullName, bio, experienceYears, hourlyRate, rating, isAvailable
- `LearnerResponse` — id, userId, mentorId, englishLevel, scores, createdAt
- `PackageResponse` — id, name, description, price, durationDays, features, isActive

---

## ❌ Lỗi cần sửa

### UserController.java
1. **Duplicate package declaration** — Xóa dòng package thứ 2
2. **Type mismatch List<User> → List<UserResponse>**
   ```java
   // Sửa từ
   return userService.getAllUsers();
   // Thành
   return userService.getAllUsers().stream()
       .map(userService::toResponse)
       .collect(Collectors.toList());
   ```
3. **Missing deleteUser() in UserService**
   ```java
   @Transactional
   public void deleteUser(Long id) {
       User user = getUserById(id); // throws exception nếu không tồn tại
       user.setIsActive(false);
       userRepository.save(user);
   }
   ```

### PracticeSessionController.java
- Tạo DTOs và Service sẽ fix lỗi imports tự động

### JwtService.java
- Thay API jjwt cũ sang mới:
  ```java
  private SecretKey getSigningKey() {
      return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
  }
  
  public String getUsernameFromToken(String token) {
      Claims claims = Jwts.parserBuilder()
          .setSigningKey(getSigningKey())
          .build()
          .parseClaimsJws(token)
          .getBody();
      return claims.getSubject();
  }
  ```

---

## 📌 Repository methods cần thêm

```java
// PracticeSessionRepository
List<PracticeSession> findByLearnerId(Long learnerId);
List<PracticeSession> findByMentorId(Long mentorId);

// MentorRepository
Optional<Mentor> findByUserId(Long userId);
List<Mentor> findByIsAvailableTrue();

// LearnerRepository
Optional<Learner> findByUserId(Long userId);
List<Learner> findByMentorId(Long mentorId);

// PackageRepository
boolean existsByName(String name);
List<Package> findByPriceBetween(BigDecimal min, BigDecimal max);
```

---

## ✅ Ưu tiên sửa

1. Fix UserController (duplicate package + mapping)
2. Add deleteUser() to UserService
3. Fix JwtService API
4. Tạo DTOs + Services
5. Run `mvn compile` để check lỗi tiếp theo

---

# 📝 CODE CÁC FILE THIẾU

## 1️⃣ PracticeSessionRequest.java

```java
package com.aesp.dto.request;

import com.aesp.enums.SessionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionRequest {
    @NotNull(message = "Learner ID không được null")
    private Long learnerId;

    private Long mentorId;

    private String topic;

    @NotNull(message = "Session type không được null")
    private SessionType type;

    @NotNull(message = "Scheduled time không được null")
    private LocalDateTime scheduledAt;

    @NotNull(message = "Duration không được null")
    @Min(value = 1, message = "Duration phải lớn hơn 0")
    private Integer durationMinutes;

    private String notes;
}
```

## 2️⃣ PracticeSessionResponse.java

```java
package com.aesp.dto.response;

import com.aesp.enums.SessionStatus;
import com.aesp.enums.SessionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionResponse {
    private Long id;
    private Long learnerId;
    private Long mentorId;
    private SessionType type;
    private SessionStatus status;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String topic;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## 3️⃣ MentorRequest.java

```java
package com.aesp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentorRequest {
    @NotNull(message = "User ID không được null")
    private Long userId;

    private String bio;

    @Min(value = 0, message = "Experience years không được âm")
    private Integer experienceYears;

    @Min(value = 0, message = "Hourly rate không được âm")
    private BigDecimal hourlyRate;

    private BigDecimal rating;

    @Min(value = 0, message = "Total students không được âm")
    private Integer totalStudents;

    private Boolean isAvailable = true;
}
```

## 4️⃣ MentorResponse.java

```java
package com.aesp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentorResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private BigDecimal rating;
    private Integer totalStudents;
    private Boolean isAvailable;
}
```

## 5️⃣ LearnerRequest.java

```java
package com.aesp.dto.request;

import com.aesp.enums.EnglishLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearnerRequest {
    @NotNull(message = "User ID không được null")
    private Long userId;

    private Long mentorId;

    private EnglishLevel englishLevel;

    private String learningGoals;

    private Integer currentStreak = 0;

    private BigDecimal totalPracticeHours = BigDecimal.ZERO;

    private BigDecimal pronunciationScore = BigDecimal.ZERO;

    private BigDecimal grammarScore = BigDecimal.ZERO;

    private BigDecimal vocabularyScore = BigDecimal.ZERO;

    private BigDecimal overallScore = BigDecimal.ZERO;
}
```

## 6️⃣ LearnerResponse.java

```java
package com.aesp.dto.response;

import com.aesp.enums.EnglishLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearnerResponse {
    private Long id;
    private Long userId;
    private Long mentorId;
    private String fullName;
    private String avatarUrl;
    private EnglishLevel englishLevel;
    private String learningGoals;
    private Integer currentStreak;
    private BigDecimal totalPracticeHours;
    private BigDecimal pronunciationScore;
    private BigDecimal grammarScore;
    private BigDecimal vocabularyScore;
    private BigDecimal overallScore;
    private LocalDateTime createdAt;
}
```

## 7️⃣ PackageRequest.java

```java
package com.aesp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageRequest {
    @NotBlank(message = "Package name không được null")
    private String name;

    private String description;

    @NotNull(message = "Price không được null")
    @Min(value = 0, message = "Price không được âm")
    private BigDecimal price;

    @NotNull(message = "Duration không được null")
    @Min(value = 1, message = "Duration phải lớn hơn 0")
    private Integer durationDays;

    private List<String> features;

    private Boolean isActive = true;
}
```

## 8️⃣ PackageResponse.java

```java
package com.aesp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationDays;
    private List<String> features;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## 9️⃣ UpdateProfileRequest.java

```java
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
```

## 🔟 PracticeSessionService.java

```java
package com.aesp.service;

import com.aesp.dto.request.PracticeSessionRequest;
import com.aesp.dto.response.PracticeSessionResponse;
import com.aesp.entity.Learner;
import com.aesp.entity.Mentor;
import com.aesp.entity.PracticeSession;
import com.aesp.enums.SessionStatus;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.PracticeSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PracticeSessionService {

    private final PracticeSessionRepository sessionRepository;
    private final LearnerRepository learnerRepository;
    private final MentorRepository mentorRepository;

    @Transactional
    public PracticeSessionResponse createSession(PracticeSessionRequest request) {
        Learner learner = learnerRepository.findById(request.getLearnerId())
            .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));

        Mentor mentor = null;
        if (request.getMentorId() != null) {
            mentor = mentorRepository.findById(request.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        }

        PracticeSession session = new PracticeSession();
        session.setLearner(learner);
        session.setMentor(mentor);
        session.setType(request.getType());
        session.setStatus(SessionStatus.PENDING);
        session.setScheduledAt(request.getScheduledAt());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setTopic(request.getTopic());
        session.setNotes(request.getNotes());
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());

        PracticeSession saved = sessionRepository.save(session);
        return toResponse(saved);
    }

    public List<PracticeSessionResponse> getSessionsByLearner(Long learnerId) {
        return sessionRepository.findByLearnerId(learnerId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public List<PracticeSessionResponse> getSessionsByMentor(Long mentorId) {
        return sessionRepository.findByMentorId(mentorId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public List<PracticeSessionResponse> getAllSessions() {
        return sessionRepository.findAll()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public PracticeSessionResponse getSessionById(Long id) {
        PracticeSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        return toResponse(session);
    }

    @Transactional
    public void updateSessionStatus(Long sessionId, SessionStatus status) {
        PracticeSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        session.setStatus(status);
        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }

    @Transactional
    public void deleteSession(Long id) {
        PracticeSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        sessionRepository.delete(session);
    }

    private PracticeSessionResponse toResponse(PracticeSession session) {
        return new PracticeSessionResponse(
            session.getId(),
            session.getLearner().getId(),
            session.getMentor() != null ? session.getMentor().getId() : null,
            session.getType(),
            session.getStatus(),
            session.getScheduledAt(),
            session.getDurationMinutes(),
            session.getTopic(),
            session.getNotes(),
            session.getCreatedAt(),
            session.getUpdatedAt()
        );
    }
}
```

## 1️⃣1️⃣ AuthService.java

```java
package com.aesp.service;

import com.aesp.dto.request.LoginRequest;
import com.aesp.dto.request.RegisterRequest;
import com.aesp.dto.response.JwtResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.entity.Role;
import com.aesp.entity.User;
import com.aesp.enums.UserRole;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.RoleRepository;
import com.aesp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return new MessageResponse(false, "Username đã tồn tại");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return new MessageResponse(false, "Email đã tồn tại");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(UserRole.ROLE_USER.toString())
            .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        roles.add(userRole);
        user.setRoles(roles);

        userRepository.save(user);
        return new MessageResponse(true, "Đăng ký thành công");
    }

    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(user.getUsername());
        String roleStr = user.getRoles().stream()
            .map(r -> r.getName())
            .findFirst()
            .orElse("ROLE_USER");

        return new JwtResponse(
            token,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            roleStr
        );
    }
}
```

## 1️⃣2️⃣ AuthController.java

```java
package com.aesp.controller;

import com.aesp.dto.request.LoginRequest;
import com.aesp.dto.request.RegisterRequest;
import com.aesp.dto.response.JwtResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        MessageResponse response = authService.register(request);
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
}
```

## 1️⃣3️⃣ MentorController.java

```java
package com.aesp.controller;

import com.aesp.dto.request.MentorRequest;
import com.aesp.dto.response.MentorResponse;
import com.aesp.service.MentorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/mentors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class MentorController {

    private final MentorService mentorService;

    @PostMapping
    public ResponseEntity<MentorResponse> createMentor(@Valid @RequestBody MentorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mentorService.createMentor(request));
    }

    @GetMapping
    public ResponseEntity<List<MentorResponse>> getAllMentors() {
        return ResponseEntity.ok(mentorService.getAllMentors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorResponse> getMentorById(@PathVariable Long id) {
        return ResponseEntity.ok(mentorService.getMentorById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MentorResponse> updateMentor(@PathVariable Long id, @Valid @RequestBody MentorRequest request) {
        return ResponseEntity.ok(mentorService.updateMentor(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMentor(@PathVariable Long id) {
        mentorService.deleteMentor(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<MentorResponse> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(mentorService.toggleAvailability(id));
    }
}
```

## 1️⃣4️⃣ MentorService.java

```java
package com.aesp.service;

import com.aesp.dto.request.MentorRequest;
import com.aesp.dto.response.MentorResponse;
import com.aesp.entity.Mentor;
import com.aesp.entity.User;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorService {

    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;

    @Transactional
    public MentorResponse createMentor(MentorRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Mentor mentor = new Mentor();
        mentor.setUser(user);
        mentor.setBio(request.getBio());
        mentor.setExperienceYears(request.getExperienceYears());
        mentor.setHourlyRate(request.getHourlyRate());
        mentor.setRating(request.getRating());
        mentor.setTotalStudents(request.getTotalStudents());
        mentor.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);

        Mentor saved = mentorRepository.save(mentor);
        return toResponse(saved);
    }

    public List<MentorResponse> getAllMentors() {
        return mentorRepository.findAll()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public MentorResponse getMentorById(Long id) {
        Mentor mentor = mentorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        return toResponse(mentor);
    }

    @Transactional
    public MentorResponse updateMentor(Long id, MentorRequest request) {
        Mentor mentor = mentorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));

        if (request.getBio() != null) mentor.setBio(request.getBio());
        if (request.getExperienceYears() != null) mentor.setExperienceYears(request.getExperienceYears());
        if (request.getHourlyRate() != null) mentor.setHourlyRate(request.getHourlyRate());
        if (request.getRating() != null) mentor.setRating(request.getRating());
        if (request.getTotalStudents() != null) mentor.setTotalStudents(request.getTotalStudents());
        if (request.getIsAvailable() != null) mentor.setIsAvailable(request.getIsAvailable());

        Mentor updated = mentorRepository.save(mentor);
        return toResponse(updated);
    }

    @Transactional
    public void deleteMentor(Long id) {
        Mentor mentor = mentorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        mentorRepository.delete(mentor);
    }

    @Transactional
    public MentorResponse toggleAvailability(Long id) {
        Mentor mentor = mentorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        mentor.setIsAvailable(!mentor.getIsAvailable());
        Mentor updated = mentorRepository.save(mentor);
        return toResponse(updated);
    }

    private MentorResponse toResponse(Mentor mentor) {
        return new MentorResponse(
            mentor.getId(),
            mentor.getUser().getId(),
            mentor.getUser().getFullName(),
            mentor.getUser().getAvatarUrl(),
            mentor.getBio(),
            mentor.getExperienceYears(),
            mentor.getHourlyRate(),
            mentor.getRating(),
            mentor.getTotalStudents(),
            mentor.getIsAvailable()
        );
    }
}
```

## 1️⃣5️⃣ LearnerController.java

```java
package com.aesp.controller;

import com.aesp.dto.request.LearnerRequest;
import com.aesp.dto.response.LearnerResponse;
import com.aesp.service.LearnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/learners")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class LearnerController {

    private final LearnerService learnerService;

    @PostMapping
    public ResponseEntity<LearnerResponse> createLearner(@Valid @RequestBody LearnerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(learnerService.createLearner(request));
    }

    @GetMapping
    public ResponseEntity<List<LearnerResponse>> getAllLearners() {
        return ResponseEntity.ok(learnerService.getAllLearners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearnerResponse> getLearnerById(@PathVariable Long id) {
        return ResponseEntity.ok(learnerService.getLearnerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearnerResponse> updateLearner(@PathVariable Long id, @Valid @RequestBody LearnerRequest request) {
        return ResponseEntity.ok(learnerService.updateLearner(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearner(@PathVariable Long id) {
        learnerService.deleteLearner(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign-mentor/{mentorId}")
    public ResponseEntity<LearnerResponse> assignMentor(@PathVariable Long id, @PathVariable Long mentorId) {
        return ResponseEntity.ok(learnerService.assignMentor(id, mentorId));
    }
}
```

## 1️⃣6️⃣ LearnerService.java

```java
package com.aesp.service;

import com.aesp.dto.request.LearnerRequest;
import com.aesp.dto.response.LearnerResponse;
import com.aesp.entity.Learner;
import com.aesp.entity.Mentor;
import com.aesp.entity.User;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearnerService {

    private final LearnerRepository learnerRepository;
    private final UserRepository userRepository;
    private final MentorRepository mentorRepository;

    @Transactional
    public LearnerResponse createLearner(LearnerRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Learner learner = new Learner();
        learner.setUser(user);
        learner.setEnglishLevel(request.getEnglishLevel());
        learner.setLearningGoals(request.getLearningGoals());
        learner.setCurrentStreak(request.getCurrentStreak() != null ? request.getCurrentStreak() : 0);
        learner.setTotalPracticeHours(request.getTotalPracticeHours());
        learner.setPronunciationScore(request.getPronunciationScore());
        learner.setGrammarScore(request.getGrammarScore());
        learner.setVocabularyScore(request.getVocabularyScore());
        learner.setOverallScore(request.getOverallScore());
        learner.setCreatedAt(LocalDateTime.now());
        learner.setUpdatedAt(LocalDateTime.now());

        if (request.getMentorId() != null) {
            Mentor mentor = mentorRepository.findById(request.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
            learner.setMentor(mentor);
        }

        Learner saved = learnerRepository.save(learner);
        return toResponse(saved);
    }

    public List<LearnerResponse> getAllLearners() {
        return learnerRepository.findAll()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public LearnerResponse getLearnerById(Long id) {
        Learner learner = learnerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));
        return toResponse(learner);
    }

    @Transactional
    public LearnerResponse updateLearner(Long id, LearnerRequest request) {
        Learner learner = learnerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));

        if (request.getEnglishLevel() != null) learner.setEnglishLevel(request.getEnglishLevel());
        if (request.getLearningGoals() != null) learner.setLearningGoals(request.getLearningGoals());
        if (request.getCurrentStreak() != null) learner.setCurrentStreak(request.getCurrentStreak());
        if (request.getTotalPracticeHours() != null) learner.setTotalPracticeHours(request.getTotalPracticeHours());
        if (request.getPronunciationScore() != null) learner.setPronunciationScore(request.getPronunciationScore());
        if (request.getGrammarScore() != null) learner.setGrammarScore(request.getGrammarScore());
        if (request.getVocabularyScore() != null) learner.setVocabularyScore(request.getVocabularyScore());
        if (request.getOverallScore() != null) learner.setOverallScore(request.getOverallScore());
        learner.setUpdatedAt(LocalDateTime.now());

        Learner updated = learnerRepository.save(learner);
        return toResponse(updated);
    }

    @Transactional
    public void deleteLearner(Long id) {
        Learner learner = learnerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));
        learnerRepository.delete(learner);
    }

    @Transactional
    public LearnerResponse assignMentor(Long learnerId, Long mentorId) {
        Learner learner = learnerRepository.findById(learnerId)
            .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));
        
        Mentor mentor = mentorRepository.findById(mentorId)
            .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));

        learner.setMentor(mentor);
        learner.setUpdatedAt(LocalDateTime.now());
        Learner updated = learnerRepository.save(learner);
        return toResponse(updated);
    }

    private LearnerResponse toResponse(Learner learner) {
        return new LearnerResponse(
            learner.getId(),
            learner.getUser().getId(),
            learner.getMentor() != null ? learner.getMentor().getId() : null,
            learner.getUser().getFullName(),
            learner.getUser().getAvatarUrl(),
            learner.getEnglishLevel(),
            learner.getLearningGoals(),
            learner.getCurrentStreak(),
            learner.getTotalPracticeHours(),
            learner.getPronunciationScore(),
            learner.getGrammarScore(),
            learner.getVocabularyScore(),
            learner.getOverallScore(),
            learner.getCreatedAt()
        );
    }
}
```

## 1️⃣7️⃣ PackageController.java

```java
package com.aesp.controller;

import com.aesp.dto.request.PackageRequest;
import com.aesp.dto.response.PackageResponse;
import com.aesp.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PackageController {

    private final PackageService packageService;

    @PostMapping
    public ResponseEntity<PackageResponse> createPackage(@Valid @RequestBody PackageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(packageService.createPackage(request));
    }

    @GetMapping
    public ResponseEntity<List<PackageResponse>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackageResponse> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PackageResponse> updatePackage(@PathVariable Long id, @Valid @RequestBody PackageRequest request) {
        return ResponseEntity.ok(packageService.updatePackage(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PackageResponse> updateStatus(@PathVariable Long id, @RequestParam Boolean active) {
        return ResponseEntity.ok(packageService.updateStatus(id, active));
    }
}
```

## 1️⃣8️⃣ PackageService.java

```java
package com.aesp.service;

import com.aesp.dto.request.PackageRequest;
import com.aesp.dto.response.PackageResponse;
import com.aesp.entity.Package;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;

    @Transactional
    public PackageResponse createPackage(PackageRequest request) {
        Package pkg = new Package();
        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationDays(request.getDurationDays());
        pkg.setFeatures(request.getFeatures());
        pkg.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        pkg.setCreatedAt(LocalDateTime.now());
        pkg.setUpdatedAt(LocalDateTime.now());

        Package saved = packageRepository.save(pkg);
        return toResponse(saved);
    }

    public List<PackageResponse> getAllPackages() {
        return packageRepository.findAll()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public PackageResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
        return toResponse(pkg);
    }

    @Transactional
    public PackageResponse updatePackage(Long id, PackageRequest request) {
        Package pkg = packageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Package not found"));

        if (request.getName() != null) pkg.setName(request.getName());
        if (request.getDescription() != null) pkg.setDescription(request.getDescription());
        if (request.getPrice() != null) pkg.setPrice(request.getPrice());
        if (request.getDurationDays() != null) pkg.setDurationDays(request.getDurationDays());
        if (request.getFeatures() != null) pkg.setFeatures(request.getFeatures());
        if (request.getIsActive() != null) pkg.setIsActive(request.getIsActive());
        pkg.setUpdatedAt(LocalDateTime.now());

        Package updated = packageRepository.save(pkg);
        return toResponse(updated);
    }

    @Transactional
    public void deletePackage(Long id) {
        Package pkg = packageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
        packageRepository.delete(pkg);
    }

    @Transactional
    public PackageResponse updateStatus(Long id, Boolean active) {
        Package pkg = packageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
        pkg.setIsActive(active);
        pkg.setUpdatedAt(LocalDateTime.now());
        Package updated = packageRepository.save(pkg);
        return toResponse(updated);
    }

    private PackageResponse toResponse(Package pkg) {
        return new PackageResponse(
            pkg.getId(),
            pkg.getName(),
            pkg.getDescription(),
            pkg.getPrice(),
            pkg.getDurationDays(),
            pkg.getFeatures(),
            pkg.getIsActive(),
            pkg.getCreatedAt(),
            pkg.getUpdatedAt()
        );
    }
}
```
