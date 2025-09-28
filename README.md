# Java Application

Đây là một dự án Java cơ bản được tạo với cấu trúc chuẩn Maven/Gradle.

## Cấu trúc dự án

```
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/app/
│   │   │       └── Main.java
│   │   └── resources/
│   └── test/
│       ├── java/
│       │   └── com/example/app/
│       │       └── MainTest.java
│       └── resources/
├── pom.xml (Maven)
├── build.gradle (Gradle)
└── README.md
```

## Yêu cầu hệ thống

- Java 17 hoặc cao hơn
- Maven 3.6+ hoặc Gradle 7.0+

## Cách chạy

### Sử dụng Maven

```bash
# Compile dự án
mvn compile

# Chạy ứng dụng
mvn exec:java -Dexec.mainClass="com.example.app.Main"

# Chạy tests
mvn test

# Tạo JAR file
mvn package

# Chạy JAR file
java -jar target/java-app-1.0.0.jar
```

### Sử dụng Gradle

```bash
# Compile dự án
gradle build

# Chạy ứng dụng
gradle run

# Chạy tests
gradle test

# Tạo JAR file
gradle jar

# Chạy JAR file
java -jar build/libs/java-app-1.0.0.jar
```

## Cách sử dụng

Chạy chương trình với hoặc không có tham số:

```bash
# Không có tham số
java -cp target/classes com.example.app.Main

# Với tham số
java -cp target/classes com.example.app.Main arg1 arg2 arg3
```

## Phát triển

1. Thêm code mới vào thư mục `src/main/java`
2. Thêm tests vào thư mục `src/test/java`
3. Thêm resources vào thư mục `src/main/resources`
4. Chạy `mvn test` hoặc `gradle test` để kiểm tra tests
