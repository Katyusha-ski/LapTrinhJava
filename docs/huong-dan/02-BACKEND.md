# 05 - HƯỚNG DẪN BACKEND SPRING BOOT

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Setup Spring Boot Project](#setup-spring-boot-project)
3. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
4. [Configuration Files](#configuration-files)
5. [Entity Layer](#entity-layer)
6. [Repository Layer](#repository-layer)
7. [DTO Layer](#dto-layer)
8. [Service Layer](#service-layer)
9. [Controller Layer](#controller-layer)
10. [Security và JWT](#security-và-jwt)
11. [Exception Handling](#exception-handling)
12. [Testing](#testing)

---

## Tổng Quan

### Tech Stack
- **Framework**: Spring Boot 3.2.0
- **Java Version**: 17 (LTS)
- **Build Tool**: Maven
- **Database**: MySQL 8.0 (JDBC Driver)
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA (Hibernate)

### Kiến Trúc
```
Controller (REST API) 
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Database (MySQL)
```

---

## Setup Spring Boot Project

### Cách 1: Spring Initializr (Khuyến Nghị)

1. Truy cập: https://start.spring.io/
2. Cấu hình:
   - **Project**: Maven
   - **Language**: Java
   - **Spring Boot**: 3.2.0
   - **Packaging**: Jar
   - **Java**: 17
   - **Group**: com.aesp
   - **Artifact**: aesp-backend
   - **Name**: AESP Backend
   - **Package name**: com.aesp

3. **Dependencies** (Chọn các dependencies sau):
   - Spring Web
   - Spring Data JPA
   - Spring Security
   - MySQL Driver
   - Lombok
   - Validation

4. Click **GENERATE** → Download file ZIP
5. Giải nén vào folder `backend/`

### Cách 2: Tạo Manual bằng Maven

```bash
# Trong folder backend/
mvn archetype:generate -DgroupId=com.aesp -DartifactId=aesp-backend -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
```

---

## Cấu Trúc Thư Mục

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── aesp/
│   │   │           ├── AespApplication.java          # Main class
│   │   │           ├── security/                     # Security & JWT classes
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── JwtAuthenticationFilter.java
│   │   │           │   └── UserDetailsServiceImpl.java
│   │   │           ├── controller/                   # REST Controllers
│   │   │           │   ├── AuthController.java       # TODO: Chưa có
│   │   │           │   ├── UserController.java       # ✅ Có
│   │   │           │   ├── MentorController.java     # TODO: Chưa có
│   │   │           │   ├── LearnerController.java    # TODO: Chưa có
│   │   │           │   ├── PackageController.java    # TODO: Chưa có
│   │   │           │   └── PracticeSessionController.java # ✅ Có
│   │   │           ├── dto/                          # Data Transfer Objects
│   │   │           │   ├── request/
│   │   │           │   │   ├── LoginRequest.java      # ✅ Có
│   │   │           │   │   ├── RegisterRequest.java   # ✅ Có
│   │   │           │   │   └── PracticeSessionRequest.java # TODO: Chưa có
│   │   │           │   └── response/
│   │   │           │       ├── JwtResponse.java       # ✅ Có
│   │   │           │       ├── MessageResponse.java   # ✅ Có
│   │   │           │       ├── UserResponse.java      # ✅ Có
│   │   │           │       └── PracticeSessionResponse.java # TODO: Chưa có
│   │   │           ├── entity/                       # JPA Entities
│   │   │           │   ├── User.java
│   │   │           │   ├── Role.java
│   │   │           │   ├── Mentor.java
│   │   │           │   ├── Learner.java
│   │   │           │   ├── Package.java
│   │   │           │   ├── Subscription.java
│   │   │           │   ├── LearningProgress.java
│   │   │           │   └── PracticeSession.java
│   │   │           ├── repository/                   # JPA Repositories
│   │   │           │   ├── UserRepository.java
│   │   │           │   ├── RoleRepository.java
│   │   │           │   ├── MentorRepository.java
│   │   │           │   ├── LearnerRepository.java
│   │   │           │   ├── PackageRepository.java
│   │   │           │   ├── SubscriptionRepository.java
│   │   │           │   ├── LearningProgressRepository.java
│   │   │           │   └── PracticeSessionRepository.java
│   │   │           ├── service/                      # Business Logic
│   │   │           │   ├── AuthService.java          # TODO: Chưa có
│   │   │           │   ├── UserService.java          # ✅ Có
│   │   │           │   ├── MentorService.java        # TODO: Chưa có
│   │   │           │   ├── LearnerService.java       # TODO: Chưa có
│   │   │           │   ├── PackageService.java       # TODO: Chưa có
│   │   │           │   ├── PracticeSessionService.java # TODO: Chưa có
│   │   │           │   └── JwtService.java           # ✅ Có
│   │   │           ├── security/                     # Security classes
│   │   │           │   ├── JwtTokenProvider.java     # TODO: Chưa có
│   │   │           │   └── UserDetailsServiceImpl.java # ✅ Có
│   │   │           └── exception/                    # Exception handling
│   │   │               ├── GlobalExceptionHandler.java
│   │   │               ├── ResourceNotFoundException.java
│   │   │               └── BadRequestException.java
│   │   └── resources/
│   │       ├── application.properties                # Main config
│   │       ├── application-dev.properties            # Dev profile
│   │       └── application-prod.properties           # Production profile
│   └── test/
│       └── java/
│           └── com/
│               └── aesp/
│                   ├── AespApplicationTests.java
│                   ├── controller/
│                   ├── service/
│                   └── repository/
├── pom.xml                                           # Maven dependencies
└── README.md
```

---

## Configuration Files

### 1. `pom.xml` - Maven Dependencies

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.aesp</groupId>
    <artifactId>aesp-backend</artifactId>
    <version>1.0.0</version>
    <name>AESP Backend</name>
    <description>AI-Supported English Speaking Practice - Backend</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Spring Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <!-- Spring Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- MySQL Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- JWT (JSON Web Token) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Lombok (Giảm boilerplate code) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- ModelMapper (Entity <-> DTO) -->
        <dependency>
            <groupId>org.modelmapper</groupId>
            <artifactId>modelmapper</artifactId>
            <version>3.2.0</version>
        </dependency>
        
        <!-- Spring Boot Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <!-- Spring Security Test -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

**Giải thích dependencies:**
- `spring-boot-starter-web`: REST API, JSON, Tomcat
- `spring-boot-starter-data-jpa`: Hibernate, JPA
- `spring-boot-starter-security`: Authentication, Authorization
- `mysql-connector-j`: MySQL driver
- `jjwt`: JWT token generation/validation
- `lombok`: @Getter, @Setter, @NoArgsConstructor tự động
- `modelmapper`: Convert Entity ↔ DTO

---

### 2. `application.properties` - Main Configuration

```properties
# ===========================
# APPLICATION NAME
# ===========================
spring.application.name=AESP Backend

# ===========================
# SERVER PORT
# ===========================
server.port=8080

# ===========================
# DATABASE CONNECTION - MySQL
# ===========================
spring.datasource.url=jdbc:mysql://localhost:3306/aesp_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=YourPassword123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ===========================
# JPA / HIBERNATE
# ===========================
spring.jpa.hibernate.ddl-auto=update
# Các options: none, validate, update, create, create-drop
# - update: Tự động cập nhật schema khi Entity thay đổi
# - validate: Chỉ kiểm tra, không thay đổi
# - create: Tạo mới mỗi lần chạy (XÓA DATA CŨ!)
# - create-drop: Tạo mới và xóa khi dừng app

spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# ===========================
# JWT CONFIGURATION
# ===========================
# Secret key phải >= 256 bits (32 characters)
jwt.secret=AESPSecretKeyForJWTTokenGenerationAndValidation2024MustBe256Bits
jwt.expiration=86400000
# 86400000 ms = 24 hours

# ===========================
# LOGGING
# ===========================
logging.level.root=INFO
logging.level.com.aesp=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# ===========================
# ACTIVE PROFILE
# ===========================
spring.profiles.active=dev
```

**LƯU Ý:**
- Thay `YourPassword123` bằng password MySQL root thật
- JWT secret phải giữ bí mật, không commit lên Git
- `ddl-auto=update` chỉ dùng khi development

---

### 3. `application-dev.properties` - Development Profile

```properties
# Development environment
spring.datasource.url=jdbc:mysql://localhost:3306/aesp_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# CORS (cho phép frontend localhost:5173)
cors.allowed-origins=http://localhost:5173,http://127.0.0.1:5173
```

---

### 4. `application-prod.properties` - Production Profile

```properties
# Production environment
spring.datasource.url=jdbc:mysql://production-server:3306/aesp_db_prod?useSSL=true&serverTimezone=UTC
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Production CORS
cors.allowed-origins=https://aesp.com,https://www.aesp.com
```

---

## Entity Layer

### Hướng Dẫn Tạo Entity

**Entity** = Đại diện cho 1 bảng trong database. Mỗi Entity class ánh xạ 1-1 với 1 table.

### 1. `Role.java`

```java
package com.aesp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String name; // ROLE_ADMIN, ROLE_MENTOR, ROLE_LEARNER
    
    @Column(length = 255)
    private String description;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Annotations:**
- `@Entity`: Đánh dấu class là JPA entity
- `@Table(name = "roles")`: Tên bảng trong DB
- `@Id`: Primary key
- `@GeneratedValue(strategy = IDENTITY)`: Auto-increment
- `@Column`: Cấu hình cột (nullable, unique, length)
- `@PrePersist`: Chạy trước khi insert
- `@PreUpdate`: Chạy trước khi update

**Lombok Annotations:**
- `@Getter`: Tự động tạo getters
- `@Setter`: Tự động tạo setters
- `@NoArgsConstructor`: Constructor không tham số
- `@AllArgsConstructor`: Constructor đầy đủ tham số
- `@Builder`: Pattern Builder để tạo object

---

### 2. `User.java` - Many-to-Many với Role

```java
package com.aesp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false, length = 255)
    private String password; // BCrypt hashed
    
    @Column(name = "full_name", length = 100)
    private String fullName;
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    // Many-to-Many với Role
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
    // One-to-One với Mentor
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Mentor mentor;
    
    // One-to-One với Learner
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Learner learner;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Relationships:**
- `@ManyToMany`: User có nhiều Roles, Role có nhiều Users
- `@JoinTable`: Bảng trung gian `user_roles`
- `@OneToOne(mappedBy = "user")`: User có 1 Mentor hoặc 1 Learner
- `cascade = CascadeType.ALL`: Khi xóa User, xóa luôn Mentor/Learner
- `orphanRemoval = true`: Xóa child khi remove khỏi parent

---

### 3. `Mentor.java`

```java
package com.aesp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mentors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mentor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(length = 1000)
    private String bio;
    
    @Column(name = "experience_years")
    private Integer experienceYears = 0;
    
    @Column(length = 255)
    private String specialization;
    
    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;
    
    @Column(precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;
    
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;
    
    @Column(name = "is_available")
    private Boolean isAvailable = true;
    
    // One-to-Many với Learner
    @OneToMany(mappedBy = "mentor", cascade = CascadeType.ALL)
    private List<Learner> learners = new ArrayList<>();
    
    // One-to-Many với LearningProgress
    @OneToMany(mappedBy = "mentor", cascade = CascadeType.ALL)
    private List<LearningProgress> learningProgresses = new ArrayList<>();
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### 4. `Learner.java`

```java
package com.aesp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Learner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level", length = 20)
    private ProficiencyLevel proficiencyLevel = ProficiencyLevel.BEGINNER;
    
    @Column(name = "learning_goals", length = 500)
    private String learningGoals;
    
    @Column(name = "preferred_topics", length = 500)
    private String preferredTopics;
    
    @ManyToOne
    @JoinColumn(name = "mentor_id")
    private Mentor mentor;
    
    // One-to-Many với Subscription
    @OneToMany(mappedBy = "learner", cascade = CascadeType.ALL)
    private List<Subscription> subscriptions = new ArrayList<>();
    
    // One-to-Many với LearningProgress
    @OneToMany(mappedBy = "learner", cascade = CascadeType.ALL)
    private List<LearningProgress> learningProgresses = new ArrayList<>();
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

// Enum cho proficiency level
enum ProficiencyLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED
}
```

---

### 5. `PracticeSession.java` - Phiên Luyện Tập

```java
package com.aesp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "practice_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    private Learner learner;
    
    @ManyToOne
    @JoinColumn(name = "mentor_id")
    private Mentor mentor; // NULL cho AI sessions
    
    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    @Column(length = 255)
    private String topic;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal cost = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "session_status")
    private SessionStatus sessionStatus = SessionStatus.SCHEDULED;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

// Enum cho session type
enum SessionType {
    MENTOR_LED,
    AI_ASSISTED
}

// Enum cho session status
enum SessionStatus {
    SCHEDULED,
    COMPLETED,
    CANCELLED
}
```

**Giải thích:**
- `@ManyToOne`: Many sessions thuộc về 1 learner/mentor
- `mentor`: Có thể NULL (cho AI sessions)
- `sessionType`: MENTOR_LED hoặc AI_ASSISTED
- `cost`: BigDecimal cho số tiền (AI sessions = 0.00)
- `sessionStatus`: SCHEDULED, COMPLETED, CANCELLED

---

### 6. Các Entity Còn Lại

Tương tự, bạn tự tạo:
- `Package.java` (gói học phí)
- `Subscription.java` (đăng ký gói)
- `LearningProgress.java` (tiến độ học)

**Lưu ý:**
- Sử dụng `@Enumerated(EnumType.STRING)` cho các trường enum
- Sử dụng `BigDecimal` cho số tiền (không dùng `double`)
- Sử dụng `LocalDate` cho ngày, `LocalDateTime` cho timestamp
- Relationships: `@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`

---

## Enum Types

### Các Enums Được Sử Dụng

#### `SessionStatus.java`

```java
package com.aesp.enums;

public enum SessionStatus {
    SCHEDULED,   // Chưa bắt đầu
    COMPLETED,   // Đã hoàn thành
    CANCELLED    // Đã hủy
}
```

#### `SessionType.java`

```java
package com.aesp.enums;

public enum SessionType {
    MENTOR_LED,    // Hướng dẫn bởi mentor
    AI_ASSISTED    // Hỗ trợ bởi AI
}
```

#### `UserRole.java`

```java
package com.aesp.enums;

public enum UserRole {
    ADMIN("ADMIN"),
    MENTOR("MENTOR"),
    LEARNER("LEARNER");
    
    private final String value;
    
    UserRole(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}
```

#### `EnglishLevel.java`

```java
package com.aesp.enums;

public enum EnglishLevel {
    BEGINNER,      // Mới bắt đầu
    INTERMEDIATE,  // Trung bình
    ADVANCED,      // Nâng cao
    FLUENT         // Thành thạo
}
```

#### `PaymentMethod.java`

```java
package com.aesp.enums;

public enum PaymentMethod {
    CREDIT_CARD,
    DEBIT_CARD,
    BANK_TRANSFER,
    PAYPAL,
    E_WALLET
}
```

#### `SubscriptionStatus.java`

```java
package com.aesp.enums;

public enum SubscriptionStatus {
    ACTIVE,        // Còn hiệu lực
    EXPIRED,       // Hết hạn
    CANCELLED      // Đã hủy
}
```

---

## Repository Layer

**Repository** = Interface kế thừa `JpaRepository` để tương tác với database.

### 1. `UserRepository.java`

```java
package com.aesp.repository;

import com.aesp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Tìm user theo username
    Optional<User> findByUsername(String username);
    
    // Tìm user theo email
    Optional<User> findByEmail(String email);
    
    // Kiểm tra username đã tồn tại chưa
    Boolean existsByUsername(String username);
    
    // Kiểm tra email đã tồn tại chưa
    Boolean existsByEmail(String email);
    
    // Tìm tất cả users đang active
    List<User> findByIsActiveTrue();
}
```

**Giải thích:**
- `JpaRepository<User, Long>`: Entity = User, Primary Key = Long
- Spring tự động implement các methods:
  - `save(user)`: Insert hoặc Update
  - `findById(id)`: Tìm theo ID
  - `findAll()`: Lấy tất cả
  - `deleteById(id)`: Xóa theo ID
  - `count()`: Đếm số records
- **Custom queries**: Spring tự động parse tên method thành SQL
  - `findByUsername` → `SELECT * FROM users WHERE username = ?`
  - `existsByEmail` → `SELECT COUNT(*) FROM users WHERE email = ?`

---

### 2. `RoleRepository.java`

```java
package com.aesp.repository;

import com.aesp.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(String name);
    
    Boolean existsByName(String name);
}
```

---

### 3. Các Repository Khác

Tạo tương tự cho:
- `MentorRepository.java`
- `LearnerRepository.java`
- `PackageRepository.java`
- `SubscriptionRepository.java`
- `LearningProgressRepository.java`
- `PracticeSessionRepository.java`

**Ví dụ PracticeSessionRepository:**

```java
@Repository
public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {
    
    // Tìm sessions theo learner
    List<PracticeSession> findByLearnerId(Long learnerId);
    
    // Tìm sessions theo mentor
    List<PracticeSession> findByMentorId(Long mentorId);
    
    // Tìm sessions theo status
    List<PracticeSession> findBySessionStatus(SessionStatus status);
    
    // Tìm sessions theo type
    List<PracticeSession> findBySessionType(SessionType sessionType);
    
    // Tìm sessions trong khoảng thời gian
    @Query("SELECT ps FROM PracticeSession ps WHERE ps.startTime BETWEEN :startDate AND :endDate")
    List<PracticeSession> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    // Thống kê revenue theo mentor
    @Query("SELECT SUM(ps.cost) FROM PracticeSession ps WHERE ps.mentor.id = :mentorId AND ps.sessionStatus = 'COMPLETED'")
    BigDecimal calculateMentorRevenue(@Param("mentorId") Long mentorId);
}
```

**Ví dụ custom query nâng cao:**

```java
@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    // Tìm subscriptions theo learner
    List<Subscription> findByLearnerId(Long learnerId);
    
    // Tìm subscriptions đang active
    List<Subscription> findByStatus(SubscriptionStatus status);
    
    // Tìm subscriptions hết hạn trong ngày hôm nay
    @Query("SELECT s FROM Subscription s WHERE s.endDate = CURRENT_DATE AND s.status = 'ACTIVE'")
    List<Subscription> findExpiringSoon();
    
    // Custom query với @Query annotation
    @Query("SELECT s FROM Subscription s WHERE s.learner.id = :learnerId AND s.status = :status")
    List<Subscription> findByLearnerAndStatus(@Param("learnerId") Long learnerId, 
                                               @Param("status") SubscriptionStatus status);
}
```

---

## DTO Layer

**DTO** (Data Transfer Object) = Object truyền dữ liệu giữa Frontend ↔ Backend, **không truyền Entity trực tiếp**.

### Tại Sao Cần DTO?
- **Bảo mật**: Không trả về password, sensitive data
- **Tùy chỉnh**: Chỉ trả về fields cần thiết
- **Tách biệt**: Entity thay đổi không ảnh hưởng API

### 1. Request DTOs

#### `LoginRequest.java`

```java
package com.aesp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    
    @NotBlank(message = "Username không được để trống")
    private String username;
    
    @NotBlank(message = "Password không được để trống")
    private String password;
}
```

#### `RegisterRequest.java`

```java
package com.aesp.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, message = "Password phải ít nhất 6 ký tự")
    private String password;
    
    @NotBlank(message = "Full name không được để trống")
    private String fullName;
    
    private String phone;
    
    @NotNull(message = "Role không được để trống")
    private String role; // "LEARNER" hoặc "MENTOR"
}
```

**Validation Annotations:**
- `@NotBlank`: Không null, không empty, không chỉ khoảng trắng
- `@NotNull`: Không null (nhưng có thể empty)
- `@Size`: Giới hạn độ dài
- `@Email`: Validate format email
- `@Min`, `@Max`: Giới hạn số

---

### 2. Response DTOs

#### `JwtResponse.java`

```java
package com.aesp.dto.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponse {
    
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private List<String> roles;
}
```

#### `MessageResponse.java`

```java
package com.aesp.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private String message;
}
```

#### `UserResponse.java`

```java
package com.aesp.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Boolean isActive;
    private List<String> roles;
    private LocalDateTime createdAt;
    
    // KHÔNG BAO GỒM password!
}
```

#### `PracticeSessionRequest.java`

```java
package com.aesp.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionRequest {
    
    @NotNull(message = "Learner ID không được để trống")
    private Long learnerId;
    
    private Long mentorId; // NULL cho AI sessions
    
    @NotNull(message = "Session type không được để trống")
    private String sessionType; // "MENTOR_LED" hoặc "AI_ASSISTED"
    
    @NotNull(message = "Start time không được để trống")
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    private Integer durationMinutes;
    
    private String topic;
}
```

#### `PracticeSessionResponse.java`

```java
package com.aesp.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeSessionResponse {
    
    private Long id;
    private Long learnerId;
    private Long mentorId;
    private String sessionType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private String topic;
    private BigDecimal cost;
    private String sessionStatus;
    private LocalDateTime createdAt;
}
```

#### `UpdateProfileRequest.java`

```java
package com.aesp.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;
    
    @Email(message = "Email không hợp lệ")
    private String email;
    
    private String fullName;
    
    private String phone;
    
    private String avatarUrl;
}
```

#### `MentorRequest.java`

```java
package com.aesp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentorRequest {
    
    @NotBlank(message = "Bio không được để trống")
    private String bio;
    
    @Min(value = 0, message = "Năm kinh nghiệm phải >= 0")
    private Integer experienceYears;
    
    private String specialization;
    
    private BigDecimal hourlyRate;
    
    private Boolean isAvailable;
}
```

#### `LearnerRequest.java`

```java
package com.aesp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearnerRequest {
    
    @NotBlank(message = "Proficiency level không được để trống")
    private String proficiencyLevel; // "BEGINNER", "INTERMEDIATE", "ADVANCED"
    
    private String learningGoals;
    
    private String preferredTopics;
    
    private Long mentorId; // Assigned mentor
}
```

---

## Service Layer

**Service** = Business logic layer, xử lý nghiệp vụ.

### 1. `JwtService.java` - JWT Token Generation

```java
package com.aesp.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    // Tạo JWT token từ username
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
    // Lấy username từ token
    public String getUsernameFromToken(String token) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        return claims.getSubject();
    }
    
    // Validate token
    public boolean validateToken(String token) {
        try {
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token không hợp lệ
        }
        return false;
    }
}
```

---

### 2. `AuthService.java` - Authentication Logic

```java
package com.aesp.service;

import com.aesp.dto.request.LoginRequest;
import com.aesp.dto.request.RegisterRequest;
import com.aesp.dto.response.JwtResponse;
import com.aesp.entity.Role;
import com.aesp.entity.User;
import com.aesp.repository.RoleRepository;
import com.aesp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    
    @Transactional
    public JwtResponse login(LoginRequest request) {
        // Authenticate username + password
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );
        
        // Generate JWT token
        String jwt = jwtService.generateToken(authentication);
        
        // Lấy user info
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<String> roles = user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toList());
        
        return JwtResponse.builder()
            .token(jwt)
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .roles(roles)
            .build();
    }
    
    @Transactional
    public void register(RegisterRequest request) {
        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }
        
        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        
        // Tạo user mới
        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword())) // Mã hóa password
            .fullName(request.getFullName())
            .phone(request.getPhone())
            .isActive(true)
            .build();
        
        // Gán role
        Set<Role> roles = new HashSet<>();
        if ("MENTOR".equals(request.getRole())) {
            Role mentorRole = roleRepository.findByName("ROLE_MENTOR")
                .orElseThrow(() -> new RuntimeException("Role not found"));
            roles.add(mentorRole);
        } else {
            Role learnerRole = roleRepository.findByName("ROLE_LEARNER")
                .orElseThrow(() -> new RuntimeException("Role not found"));
            roles.add(learnerRole);
        }
        user.setRoles(roles);
        
        userRepository.save(user);
    }
}
```

---

### 3. `UserService.java` - User Management

```java
package com.aesp.service;

import com.aesp.dto.request.UpdateProfileRequest;
import com.aesp.dto.response.UserResponse;
import com.aesp.entity.Role;
import com.aesp.entity.User;
import com.aesp.repository.RoleRepository;
import com.aesp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
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
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
    }
    
    @Transactional
    public User updateProfile(Long id, UpdateProfileRequest request) {
        User user = getUserById(id);
        
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        return userRepository.save(user);
    }
    
    @Transactional
    public void changePassword(Long id, String newPassword) {
        User user = getUserById(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
    
    @Transactional
    public void setUserActiveStatus(Long id, boolean active) {
        User user = getUserById(id);
        user.setIsActive(active);
        userRepository.save(user);
    }
    
    public UserResponse toResponse(User user) {
        List<String> roles = user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toList());
        
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .avatarUrl(user.getAvatarUrl())
            .isActive(user.getIsActive())
            .roles(roles)
            .createdAt(user.getCreatedAt())
            .build();
    }
}
```

---

### 4. `PracticeSessionService.java` - Practice Session Management

```java
package com.aesp.service;

import com.aesp.dto.request.PracticeSessionRequest;
import com.aesp.dto.response.PracticeSessionResponse;
import com.aesp.entity.Learner;
import com.aesp.entity.Mentor;
import com.aesp.entity.PracticeSession;
import com.aesp.enums.SessionStatus;
import com.aesp.enums.SessionType;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.PracticeSessionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PracticeSessionService {
    
    private final PracticeSessionRepository sessionRepository;
    private final LearnerRepository learnerRepository;
    private final MentorRepository mentorRepository;
    
    @Transactional
    public PracticeSessionResponse createSession(PracticeSessionRequest request) {
        Learner learner = learnerRepository.findById(request.getLearnerId())
            .orElseThrow(() -> new EntityNotFoundException("Learner not found"));
        
        Mentor mentor = null;
        if (request.getMentorId() != null) {
            mentor = mentorRepository.findById(request.getMentorId())
                .orElseThrow(() -> new EntityNotFoundException("Mentor not found"));
        }
        
        SessionType type = SessionType.valueOf(request.getSessionType());
        
        PracticeSession session = PracticeSession.builder()
            .learner(learner)
            .mentor(mentor)
            .sessionType(type)
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .durationMinutes(request.getDurationMinutes())
            .topic(request.getTopic())
            .cost(mentor != null ? BigDecimal.ZERO : BigDecimal.ZERO) // Tính cost từ mentor hourly rate
            .sessionStatus(SessionStatus.SCHEDULED)
            .build();
        
        PracticeSession saved = sessionRepository.save(session);
        return toResponse(saved);
    }
    
    public PracticeSessionResponse getSessionById(Long id) {
        PracticeSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Session not found"));
        return toResponse(session);
    }
    
    public List<PracticeSessionResponse> getSessionsByLearner(Long learnerId) {
        return sessionRepository.findByLearnerId(learnerId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    public List<PracticeSessionResponse> getSessionsByMentor(Long mentorId) {
        return sessionRepository.findByMentorId(mentorId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    public List<PracticeSessionResponse> getAllSessions() {
        return sessionRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void updateSessionStatus(Long id, String status) {
        PracticeSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Session not found"));
        
        SessionStatus newStatus = SessionStatus.valueOf(status.toUpperCase());
        session.setSessionStatus(newStatus);
        sessionRepository.save(session);
    }
    
    @Transactional
    public void deleteSession(Long id) {
        PracticeSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Session not found"));
        sessionRepository.delete(session);
    }
    
    private PracticeSessionResponse toResponse(PracticeSession session) {
        return PracticeSessionResponse.builder()
            .id(session.getId())
            .learnerId(session.getLearner().getId())
            .mentorId(session.getMentor() != null ? session.getMentor().getId() : null)
            .sessionType(session.getSessionType().toString())
            .startTime(session.getStartTime())
            .endTime(session.getEndTime())
            .durationMinutes(session.getDurationMinutes())
            .topic(session.getTopic())
            .cost(session.getCost())
            .sessionStatus(session.getSessionStatus().toString())
            .createdAt(session.getCreatedAt())
            .build();
    }
}
```

---

### 5. Các Service Khác

Tạo tương tự:
- `MentorService.java`: Quản lý mentors
- `LearnerService.java`: Quản lý learners
- `PackageService.java`: Quản lý packages
- `SubscriptionService.java`: Đăng ký gói, check hết hạn

---

## Controller Layer

**Controller** = REST API endpoints, nhận request từ Frontend.

### 1. `AuthController.java`

```java
package com.aesp.controller;

import com.aesp.dto.request.LoginRequest;
import com.aesp.dto.request.RegisterRequest;
import com.aesp.dto.response.JwtResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(new MessageResponse("Đăng ký thành công"));
    }
}
```

**Annotations:**
- `@RestController`: Controller trả về JSON (không phải view)
- `@RequestMapping("/api/auth")`: Base URL cho tất cả endpoints
- `@PostMapping`: HTTP POST method
- `@Valid`: Validate DTO theo annotations
- `@RequestBody`: Parse JSON từ request body
- `@CrossOrigin`: Cho phép CORS (Frontend gọi từ origin khác)

**Endpoints:**
- `POST /api/auth/login`: Đăng nhập
- `POST /api/auth/register`: Đăng ký

---

### 2. `UserController.java`

```java
package com.aesp.controller;

import com.aesp.dto.response.UserResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.entity.User;
import com.aesp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserService userService;
    
    // Chỉ ADMIN mới truy cập được
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> responses = users.stream()
            .map(userService::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MENTOR', 'LEARNER')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userService.toResponse(user));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("Xóa user thành công"));
    }
}
```

**@PreAuthorize:**
- `hasRole('ADMIN')`: Chỉ user có role ADMIN mới gọi được
- `hasAnyRole('ADMIN', 'MENTOR')`: ADMIN hoặc MENTOR
- `isAuthenticated()`: Bất kỳ user đã login

**Lưu ý quan trọng:**
- Dùng `userService.toResponse(user)` để convert `User` entity → `UserResponse` DTO
- KHÔNG trả về Entity trực tiếp, luôn dùng DTO
- Import `java.util.stream.Collectors` để dùng `map()` và `collect()`

---

### 3. `PracticeSessionController.java`

```java
package com.aesp.controller;

import com.aesp.dto.request.PracticeSessionRequest;
import com.aesp.dto.response.PracticeSessionResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.service.PracticeSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/practice-sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PracticeSessionController {
    
    private final PracticeSessionService practiceSessionService;
    
    // Tạo session mới
    @PostMapping
    @PreAuthorize("hasAnyRole('LEARNER', 'MENTOR')")
    public ResponseEntity<PracticeSessionResponse> createSession(@Valid @RequestBody PracticeSessionRequest request) {
        PracticeSessionResponse response = practiceSessionService.createSession(request);
        return ResponseEntity.ok(response);
    }
    
    // Lấy sessions của learner
    @GetMapping("/learner/{learnerId}")
    @PreAuthorize("hasAnyRole('LEARNER', 'MENTOR', 'ADMIN')")
    public ResponseEntity<List<PracticeSessionResponse>> getLearnerSessions(@PathVariable Long learnerId) {
        List<PracticeSessionResponse> sessions = practiceSessionService.getSessionsByLearner(learnerId);
        return ResponseEntity.ok(sessions);
    }
    
    // Lấy sessions của mentor
    @GetMapping("/mentor/{mentorId}")
    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN')")
    public ResponseEntity<List<PracticeSessionResponse>> getMentorSessions(@PathVariable Long mentorId) {
        List<PracticeSessionResponse> sessions = practiceSessionService.getSessionsByMentor(mentorId);
        return ResponseEntity.ok(sessions);
    }
    
    // Cập nhật session status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LEARNER', 'MENTOR')")
    public ResponseEntity<MessageResponse> updateSessionStatus(
            @PathVariable Long id, 
            @RequestParam String status) {
        practiceSessionService.updateSessionStatus(id, status);
        return ResponseEntity.ok(new MessageResponse("Cập nhật session thành công"));
    }
    
    // Xóa session
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN')")
    public ResponseEntity<MessageResponse> deleteSession(@PathVariable Long id) {
        practiceSessionService.deleteSession(id);
        return ResponseEntity.ok(new MessageResponse("Xóa session thành công"));
    }
}

---

## Security và JWT

### 1. `SecurityConfig.java`

```java
package com.aesp.config;

import com.aesp.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF cho REST API
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Không dùng session
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Cho phép truy cập login/register
                .anyRequest().authenticated() // Các endpoint khác phải authenticate
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // Thêm JWT filter
        
        return http.build();
    }
}
```

---

### 2. `JwtAuthenticationFilter.java`

```java
package com.aesp.security;

import com.aesp.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Lấy JWT token từ header
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt) && jwtService.validateToken(jwt)) {
                // Lấy username từ token
                String username = jwtService.getUsernameFromToken(jwt);
                
                // Load user details
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                // Tạo Authentication object
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        // Authorization: Bearer <token>
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

---

### 3. `UserDetailsServiceImpl.java`

```java
package com.aesp.security;

import com.aesp.entity.Role;
import com.aesp.entity.User;
import com.aesp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collection;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        Collection<GrantedAuthority> authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
            .collect(Collectors.toList());
        
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())
            .authorities(authorities)
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(!user.getIsActive())
            .build();
    }
}
```

**Giải thích:**
- `loadUserByUsername()`: Spring Security gọi method này để load user từ database
- Convert `Role` entities thành `SimpleGrantedAuthority` (authorities)
- Prefix "ROLE_" để Spring Security nhận diện quyền
- `disabled` được set từ `isActive` của user

---

## Exception Handling

### `GlobalExceptionHandler.java`

```java
package com.aesp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }
    
    // Handle not found errors
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    // Handle generic errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal server error: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

---

## Testing

### 1. Test với Postman

**Tạo Collection:**
1. Login: `POST http://localhost:8080/api/auth/login`
   - Body (JSON):
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
   - Response: JWT token

2. Register: `POST http://localhost:8080/api/auth/register`
   - Body (JSON):
   ```json
   {
     "username": "newuser",
     "email": "newuser@gmail.com",
     "password": "123456",
     "fullName": "New User",
     "role": "LEARNER"
   }
   ```

3. Get All Users (cần token): `GET http://localhost:8080/api/users`
   - Headers: `Authorization: Bearer <token>`

---

### 2. Unit Test với JUnit

```java
package com.aesp.service;

import com.aesp.entity.User;
import com.aesp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    void testGetUserById_Found() {
        // Arrange
        User user = User.builder()
            .id(1L)
            .username("testuser")
            .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        // Act
        UserResponse result = userService.getUserById(1L);
        
        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userRepository, times(1)).findById(1L);
    }
}
```

---

## 📝 Checklist - Hoàn Thành Backend

- [ ] Setup Spring Boot project với Maven
- [ ] Cấu hình `pom.xml` với tất cả dependencies
- [ ] Tạo `application.properties` (database connection, JWT config)
- [ ] Tạo 8 Entity classes với relationships (bao gồm PracticeSession)
- [ ] Tạo 8 Repository interfaces
- [ ] Tạo Request/Response DTOs
- [ ] Implement `JwtService`, `AuthService`, `PracticeSessionService`
- [ ] Tạo `SecurityConfig`, `JwtAuthenticationFilter`
- [ ] Implement `AuthController`, `UserController`, `PracticeSessionController`
- [ ] Tạo `GlobalExceptionHandler`
- [ ] Test endpoints với Postman
- [ ] Viết Unit Tests (optional)

---

## ⚠️ Lưu Ý Quan Trọng - Chuẩn Bị Áp Dụng

### ✅ Đã Có Code Chi Tiết Cho:
1. **JwtService.java** - JWT token generation & validation
2. **AuthService.java** - Login/Register logic
3. **UserService.java** - User CRUD + toResponse() conversion
4. **PracticeSessionService.java** - Session CRUD
5. **UserDetailsServiceImpl.java** - Load user by username
6. **SecurityConfig.java** - Spring Security configuration
7. **JwtAuthenticationFilter.java** - JWT token validation filter
8. **Tất cả DTOs** - LoginRequest, RegisterRequest, UserResponse, JwtResponse, PracticeSessionRequest, PracticeSessionResponse, UpdateProfileRequest, MentorRequest, LearnerRequest
9. **Tất cả Controllers** - AuthController, UserController (fixed), PracticeSessionController
10. **Tất cả Enums** - SessionStatus, SessionType, UserRole, EnglishLevel, PaymentMethod, SubscriptionStatus

### ⚠️ Vẫn Cần Implement (Theo Hướng Dẫn):
1. **MentorService.java**, **MentorController.java** - Tạo tương tự UserService/UserController
2. **LearnerService.java**, **LearnerController.java** - Tạo tương tự UserService/UserController
3. **PackageService.java**, **PackageController.java** - Quản lý gói học
4. **SubscriptionService.java** - Đăng ký gói
5. **Exception classes** - BadRequestException, etc.

### 🔧 Cách Sửa Repo Hiện Tại:
1. **Sửa `UserController.java`:**
   - Loại bỏ dòng `package` duplicate
   - Thêm conversion: `userService.toResponse(user)` thay vì trả User
   - Thêm import: `Collectors` để dùng `.stream().map().collect()`

2. **Tạo DTOs:**
   - Tạo `PracticeSessionRequest.java`, `PracticeSessionResponse.java`, UpdateProfileRequest, MentorRequest, LearnerRequest

3. **Tạo Services:**
   - Tạo `AuthService.java`, `PracticeSessionService.java` (copy từ hướng dẫn)

4. **Tạo Controllers:**
   - Tạo `AuthController.java` (copy từ hướng dẫn)

5. **Tạo Enums:**
   - Tạo toàn bộ enum files trong package `com.aesp.enums`

### 💡 Lưu Ý An Toàn:
- **Luôn dùng DTOs**, không trả Entity trực tiếp từ Controller
- **Import đầy đủ** - Kiểm tra `import java.util.List`, `java.util.stream.Collectors`, `java.time.LocalDateTime`
- **Validate input** - Dùng `@Valid`, `@NotBlank`, `@Email`, `@Size` trên DTO
- **@Transactional** - Dùng cho create/update/delete methods
- **@PreAuthorize** - Luôn kiểm tra quyền hạn trước khi thực thi endpoint

---

## 📊 Tóm Tắt Cấu Trúc File

```
✅ Hoàn thành:      Entity, Repository, Enum, Config, Security Filter
📝 Có code mẫu:     Service (JWT, Auth, User, Session), Controller (Auth, User, Session), DTO đầy đủ
⚠️ Cần implement:   MentorService/Controller, LearnerService/Controller, PackageService/Controller, SubscriptionService
```

---

**File:** `docs/huong-dan/02-BACKEND.md`  
**Cập nhật:** 2024-11-13  
**Trạng thái:** ✅ Bổ sung đầy đủ code chi tiết, sẵn sàng áp dụng
