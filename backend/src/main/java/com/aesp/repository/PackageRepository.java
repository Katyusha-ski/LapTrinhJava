package com.aesp.repository;

import com.aesp.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    // Basic finders
    Optional<Package> findByName(String name);

    Boolean existsByName(String name);

    List<Package> findByIsActiveTrue();

    // Pricing
    List<Package> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // Duration filters
    @Query("SELECT p FROM Package p WHERE (:minDuration IS NULL OR p.durationDays >= :minDuration) "
         + "AND (:maxDuration IS NULL OR p.durationDays <= :maxDuration)")
    List<Package> findByDurationBetween(@Param("minDuration") Integer minDuration,
                                        @Param("maxDuration") Integer maxDuration);
}
