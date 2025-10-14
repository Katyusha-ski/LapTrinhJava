# AESP Backend - Spring Boot REST API

## 📁 Cấu Trúc Thư Mục

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/aesp/
│   │   │   ├── AespApplication.java          # Main class
│   │   │   ├── config/                       # Configuration classes
│   │   │   ├── controller/                   # REST Controllers
│   │   │   ├── dto/                          # Data Transfer Objects
│   │   │   │   ├── request/
│   │   │   │   └── response/
│   │   │   ├── entity/                       # JPA Entities
│   │   │   ├── repository/                   # JPA Repositories
│   │   │   ├── service/                      # Business Logic
│   │   │   ├── security/                     # Security classes
│   │   │   └── exception/                    # Exception handling
│   │   └── resources/
│   │       └── application.properties        # Configuration
│   └── test/                                 # Unit tests
├── pom.xml                                   # Maven dependencies
└── README.md
```

## 🚀 Chạy Backend

### Bước 1: Cài Đặt Dependencies
```bash
mvn clean install
```

### Bước 2: Cấu Hình Database
Mở `src/main/resources/application.properties` và thay đổi:
- `spring.datasource.password`: Password MySQL root của bạn

### Bước 3: Chạy Application
```bash
mvn spring-boot:run
```

Backend sẽ chạy tại: **http://localhost:8080**

## 📝 TODO: Các Thành Phần Cần Code

### 1. Entity Layer (src/main/java/com/aesp/entity/)
- [ ] User.java
- [ ] Role.java
- [ ] Mentor.java
- [ ] Learner.java
- [ ] Package.java
- [ ] Subscription.java
- [ ] LearningProgress.java

### 2. Repository Layer (src/main/java/com/aesp/repository/)
- [ ] UserRepository.java
- [ ] RoleRepository.java
- [ ] MentorRepository.java
- [ ] LearnerRepository.java
- [ ] PackageRepository.java
- [ ] SubscriptionRepository.java
- [ ] LearningProgressRepository.java

### 3. DTO Layer (src/main/java/com/aesp/dto/)
- [ ] LoginRequest.java
- [ ] RegisterRequest.java
- [ ] JwtResponse.java
- [ ] MessageResponse.java
- [ ] UserResponse.java

### 4. Service Layer (src/main/java/com/aesp/service/)
- [ ] AuthService.java
- [ ] JwtService.java
- [ ] UserService.java
- [ ] MentorService.java
- [ ] LearnerService.java
- [ ] PackageService.java

### 5. Controller Layer (src/main/java/com/aesp/controller/)
- [ ] AuthController.java
- [ ] UserController.java
- [ ] MentorController.java
- [ ] LearnerController.java
- [ ] PackageController.java

### 6. Security Layer (src/main/java/com/aesp/security/)
- [ ] SecurityConfig.java
- [ ] JwtAuthenticationFilter.java
- [ ] UserDetailsServiceImpl.java

### 7. Exception Handling (src/main/java/com/aesp/exception/)
- [ ] GlobalExceptionHandler.java
- [ ] ResourceNotFoundException.java

## 📚 Hướng Dẫn Chi Tiết

Xem file: `docs/huong-dan/05-BACKEND.md`
