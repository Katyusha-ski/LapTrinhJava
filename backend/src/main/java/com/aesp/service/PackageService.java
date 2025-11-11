package com.aesp.service;

import com.aesp.entity.Package;
import com.aesp.repository.PackageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PackageService {

    private final PackageRepository packageRepository;

    public List<Package> getAllPackages() {
        return packageRepository.findAll();
    }

    public Package getPackageById(Long id) {
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
    public Package createPackage(Package request) {
        validateRequest(request);
        if (packageRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Package with name '%s' already exists".formatted(request.getName()));
        }
        request.setId(null);
        return packageRepository.save(request);
    }

    @Transactional
    public Package updatePackage(Long id, Package request) {
        validateRequest(request);
        Package existing = getPackageById(id);

        if (!existing.getName().equalsIgnoreCase(request.getName())
                && packageRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Package with name '%s' already exists".formatted(request.getName()));
        }

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setDurationDays(request.getDurationDays());
        existing.setFeatures(request.getFeatures());
        existing.setIsActive(request.getIsActive());

        return packageRepository.save(existing);
    }

    @Transactional
    public void deletePackage(Long id) {
        Package existing = getPackageById(id);
        Long packageId = Objects.requireNonNull(existing.getId(), "Package id must not be null when deleting");
        packageRepository.deleteById(packageId);
    }

    @Transactional
    public Package changePackageStatus(Long id, boolean isActive) {
        Package existing = getPackageById(id);
        existing.setIsActive(isActive);
        return packageRepository.save(existing);
    }

    private void validateRequest(Package request) {
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
}
