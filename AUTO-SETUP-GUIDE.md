# 🚀 Hướng dẫn tự động tạo dự án Java

Bây giờ bạn có thể tạo dự án Java tự động thay vì làm thủ công!

## 🎯 Các cách tạo dự án tự động:

### 1. **Sử dụng VS Code Tasks (Dễ nhất)**

1. Mở **Command Palette** (`Ctrl+Shift+P`)
2. Gõ `Tasks: Run Task`
3. Chọn:
   - **"Create New Java Project"** - Tạo dự án Maven
   - **"Create Java Project with Gradle"** - Tạo dự án Gradle
4. Nhập thông tin:
   - Tên dự án
   - Package name (mặc định: com.example.app)
   - Java version (8, 11, 17, 21)

### 2. **Sử dụng PowerShell Script**

```powershell
# Tạo dự án Maven cơ bản
.\create-java-project.ps1 -ProjectName "MyApp"

# Tạo dự án với package tùy chỉnh
.\create-java-project.ps1 -ProjectName "MyApp" -PackageName "com.mycompany.myapp"

# Tạo dự án với Java 21
.\create-java-project.ps1 -ProjectName "MyApp" -JavaVersion "21"

# Tạo dự án Gradle
.\create-java-project.ps1 -ProjectName "MyApp" -UseGradle
```

### 3. **Sử dụng Maven Archetype (Chuyên nghiệp)**

```bash
# Tạo dự án Maven từ archetype
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false

# Tạo dự án Spring Boot
mvn archetype:generate -DgroupId=com.example -DartifactId=my-spring-app -DarchetypeArtifactId=spring-boot-starter-parent -DinteractiveMode=false
```

### 4. **Sử dụng Gradle Init**

```bash
# Tạo dự án Gradle
gradle init --type java-application --dsl groovy --test-framework junit-jupiter --package com.example --project-name my-app
```

## 📁 Cấu trúc dự án được tạo:

```
MyProject/
├── src/
│   ├── main/
│   │   ├── java/com/example/app/
│   │   │   └── Main.java
│   │   └── resources/
│   └── test/
│       ├── java/com/example/app/
│       │   └── MainTest.java
│       └── resources/
├── .vscode/
│   ├── settings.json
│   ├── launch.json
│   └── tasks.json
├── pom.xml (hoặc build.gradle)
├── .gitignore
└── README.md
```

## ⚡ Các lệnh nhanh sau khi tạo dự án:

```bash
# Maven
mvn compile          # Biên dịch
mvn test            # Chạy test
mvn package         # Tạo JAR
mvn exec:java       # Chạy ứng dụng

# Gradle
gradle build        # Build
gradle test         # Test
gradle run          # Chạy ứng dụng
gradle jar          # Tạo JAR
```

## 🔧 Tùy chỉnh thêm:

### Thêm dependencies vào Maven:
```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>5.3.21</version>
</dependency>
```

### Thêm dependencies vào Gradle:
```gradle
dependencies {
    implementation 'org.springframework:spring-core:5.3.21'
}
```

## 🎉 Kết quả:

- ✅ Cấu trúc thư mục chuẩn
- ✅ File cấu hình Maven/Gradle
- ✅ Class Main với method main()
- ✅ Test class với JUnit 5
- ✅ VS Code config sẵn sàng
- ✅ Gitignore đầy đủ
- ✅ README hướng dẫn

**Bây giờ bạn chỉ cần 1 click để tạo dự án Java hoàn chỉnh!** 🚀
