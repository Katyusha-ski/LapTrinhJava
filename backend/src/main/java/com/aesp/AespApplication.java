package com.aesp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Application Class for AESP (AI-Supported English Speaking Practice)
 * 
 * This is the entry point of the Spring Boot application.
 * 
 * @SpringBootApplication combines:
 * - @Configuration: Tags the class as a source of bean definitions
 * - @EnableAutoConfiguration: Enables Spring Boot's auto-configuration
 * - @ComponentScan: Enables component scanning in com.aesp package
 */
@SpringBootApplication
public class AespApplication {

    public static void main(String[] args) {
        SpringApplication.run(AespApplication.class, args);
        System.out.println("==============================================");
        System.out.println("AESP Backend is running on http://localhost:8080");
        System.out.println("==============================================");
    }
}
