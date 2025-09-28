package com.example.app;

/**
 * Main class for the Java application
 */
public class Main {
    
    /**
     * Main method - entry point of the application
     * @param args command line arguments
     */
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to your Java application!");
        
        // Example of using command line arguments
        if (args.length > 0) {
            System.out.println("Arguments provided:");
            for (int i = 0; i < args.length; i++) {
                System.out.println("  " + (i + 1) + ": " + args[i]);
            }
        } else {
            System.out.println("No arguments provided.");
        }
    }
}

