package com.aesp.service;

import com.aesp.dto.request.PackageRequest;
import com.aesp.dto.response.PackageResponse;
import com.aesp.entity.Package;
import com.aesp.repository.PackageRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PackageService {

    private final PackageRepository packageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<PackageResponse> getAllPackages() {
        return packageRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public PackageResponse getPackageById(Long id) {
        Objects.requireNonNull(id, "Package id must not be null");
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Package with id %d not found".formatted(id)));
        return toResponse(pkg);
    }

    private Package getPackageEntityById(Long id) {
        Objects.requireNonNull(id, "Package id must not be null");
        return packageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Package with id %d not found".formatted(id)));
    }

    public List<Package> getActivePackages() {
        return packageRepository.findByIsActiveTrue();
    }

    public List<Package> findPackagesByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        Objects.requireNonNull(minPrice, "minPrice must not be null");
        Objects.requireNonNull(maxPrice, "maxPrice must not be null");
        if (minPrice.compareTo(BigDecimal.ZERO) < 0 || maxPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price values must be greater than or equal to zero");
        }
        if (minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException("minPrice must be less than or equal to maxPrice");
        }
        return packageRepository.findByPriceBetween(minPrice, maxPrice);
    }

    public List<Package> findPackagesByDuration(Integer minDuration, Integer maxDuration) {
        if (minDuration != null && minDuration < 0) {
            throw new IllegalArgumentException("minDuration must be greater than or equal to zero");
        }
        if (maxDuration != null && maxDuration < 0) {
            throw new IllegalArgumentException("maxDuration must be greater than or equal to zero");
        }
        if (minDuration != null && maxDuration != null && minDuration > maxDuration) {
            throw new IllegalArgumentException("minDuration must be less than or equal to maxDuration");
        }
        return packageRepository.findByDurationBetween(minDuration, maxDuration);
    }

    @Transactional
    public PackageResponse createPackage(PackageRequest request) {
        validateRequest(request);
        if (packageRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Package with name '%s' already exists".formatted(request.getName()));
        }
        
        String featuresJson = null;
        if (request.getFeatures() != null && !request.getFeatures().isEmpty()) {
            try {
                featuresJson = objectMapper.writeValueAsString(request.getFeatures());
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Failed to convert features to JSON", e);
            }
        }
        
        Package pkg = Package.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .durationDays(request.getDurationDays())
                .features(featuresJson)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        
        Package saved = packageRepository.save(pkg);
        return toResponse(saved);
    }

    @Transactional
    public PackageResponse updatePackage(Long id, PackageRequest request) {
        validateRequest(request);
        Package existing = getPackageEntityById(id);

        if (!existing.getName().equalsIgnoreCase(request.getName())
                && packageRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Package with name '%s' already exists".formatted(request.getName()));
        }

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setDurationDays(request.getDurationDays());
        
        if (request.getFeatures() != null) {
            try {
                existing.setFeatures(objectMapper.writeValueAsString(request.getFeatures()));
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Failed to convert features to JSON", e);
            }
        }
        
        existing.setIsActive(request.getIsActive());

        Package saved = packageRepository.save(existing);
        return toResponse(saved);
    }

    @Transactional
    public void deletePackage(Long id) {
        Package existing = getPackageEntityById(id);
        packageRepository.delete(existing);
    }

    @Transactional
    public PackageResponse updateStatus(Long id, Boolean isActive) {
        Package existing = getPackageEntityById(id);
        existing.setIsActive(isActive);
        Package saved = packageRepository.save(existing);
        return toResponse(saved);
    }

    private void validateRequest(PackageRequest request) {
        Objects.requireNonNull(request, "Package request must not be null");
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Package name must not be blank");
        }
        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Package price must be greater than or equal to zero");
        }
        if (request.getDurationDays() == null || request.getDurationDays() <= 0) {
            throw new IllegalArgumentException("Package duration must be greater than zero");
        }
    }

    private PackageResponse toResponse(Package pkg) {
        PackageResponse response = new PackageResponse();
        response.setId(pkg.getId());
        response.setName(pkg.getName());
        response.setDescription(pkg.getDescription());
        response.setPrice(pkg.getPrice());
        response.setDurationDays(pkg.getDurationDays());
        
        // Convert JSON string to List<String>
        if (pkg.getFeatures() != null && !pkg.getFeatures().isEmpty()) {
            try {
                @SuppressWarnings("unchecked")
                List<String> featuresList = objectMapper.readValue(pkg.getFeatures(), List.class);
                response.setFeatures(featuresList);
            } catch (JsonProcessingException e) {
                response.setFeatures(new ArrayList<>());
            }
        } else {
            response.setFeatures(new ArrayList<>());
        }
        
        response.setIsActive(pkg.getIsActive());
        return response;
    }
}
