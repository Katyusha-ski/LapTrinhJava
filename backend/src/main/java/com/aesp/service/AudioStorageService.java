package com.aesp.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class AudioStorageService {

    @Value("${audio.storage.path:./uploads/audio/}")
    private String audioStoragePath;

    @Value("${audio.base.url:http://localhost:8080/audio/}")
    private String baseUrl;

    public String saveAudio(byte[] audioData, String originalFileName) {
        try {
            Path storageDirPath = Paths.get(audioStoragePath);
            Files.createDirectories(storageDirPath);

            String fileName = generateFileName(originalFileName);
            Path filePath = storageDirPath.resolve(fileName);

            try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                fos.write(audioData);
            }

            log.info("Audio file saved: {}", filePath);
            return baseUrl + fileName;

        } catch (IOException e) {
            log.error("Error saving audio file: {}", e.getMessage());
            throw new RuntimeException("Failed to save audio file", e);
        }
    }

    public boolean deleteAudio(String fileName) {
        try {
            Path filePath = Paths.get(audioStoragePath, fileName);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Audio file deleted: {}", filePath);
                return true;
            } else {
                log.warn("Audio file not found for deletion: {}", filePath);
                return false;
            }
        } catch (IOException e) {
            log.error("Error deleting audio file: {}", e.getMessage());
            return false;
        }
    }

    public boolean audioExists(String fileName) {
        Path filePath = Paths.get(audioStoragePath, fileName);
        return Files.exists(filePath);
    }

    private String generateFileName(String originalFileName) {
        String timestamp = System.currentTimeMillis() + "_";
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String extension = originalFileName != null && originalFileName.contains(".")
                ? originalFileName.substring(originalFileName.lastIndexOf("."))
                : ".wav";
        return timestamp + uuid + extension;
    }
}
