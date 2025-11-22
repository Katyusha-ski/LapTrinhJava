package com.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.aesp.entity.Mentor;
import com.aesp.entity.User;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.aesp.enums.EnglishLevel;

@Repository
public interface MentorRepository extends JpaRepository<Mentor, Long> {
    
    // Find by availability
    List<Mentor> findByIsAvailableTrue();
    
    // Find by user
    Optional<Mentor> findByUser(User user);
    Optional<Mentor> findByUserId(Long userId);
    
    // Find by experience
    List<Mentor> findByExperienceYearsGreaterThanEqual(Integer years);
    List<Mentor> findByExperienceYearsBetween(Integer minYears, Integer maxYears);
    
    // Find by rating
    List<Mentor> findByRatingGreaterThanEqual(BigDecimal minRating);
    List<Mentor> findByRatingBetween(BigDecimal minRating, BigDecimal maxRating);
    
    // Find by hourly rate
    List<Mentor> findByHourlyRateLessThanEqual(BigDecimal maxRate);
    List<Mentor> findByHourlyRateBetween(BigDecimal minRate, BigDecimal maxRate);
    
    // Find by certification
    List<Mentor> findByCertificationContainingIgnoreCase(String certification);
    List<Mentor> findByCertificationIsNotNull();
    
    // Find by total students
    List<Mentor> findByTotalStudentsGreaterThanEqual(Integer minStudents);
    
    // Complex queries with custom JPQL
    @Query("SELECT m FROM Mentor m WHERE m.isAvailable = true AND m.rating >= :minRating ORDER BY m.rating DESC")
    List<Mentor> findAvailableMentorsWithMinRating(@Param("minRating") BigDecimal minRating);
    
    @Query("SELECT m FROM Mentor m WHERE m.isAvailable = true AND m.hourlyRate <= :maxRate ORDER BY m.rating DESC, m.hourlyRate ASC")
    List<Mentor> findAvailableMentorsWithinBudget(@Param("maxRate") BigDecimal maxRate);
    
    @Query("SELECT m FROM Mentor m WHERE m.isAvailable = true AND m.experienceYears >= :minYears ORDER BY m.experienceYears DESC, m.rating DESC")
    List<Mentor> findExperiencedAvailableMentors(@Param("minYears") Integer minYears);
    
    @Query("SELECT m FROM Mentor m WHERE m.isAvailable = true AND " +
           "(:minRating IS NULL OR m.rating >= :minRating) AND " +
           "(:maxRate IS NULL OR m.hourlyRate <= :maxRate) AND " +
           "(:minExperience IS NULL OR m.experienceYears >= :minExperience) " +
           "ORDER BY m.rating DESC, m.hourlyRate ASC")
    List<Mentor> findMentorsWithFilters(@Param("minRating") BigDecimal minRating,
                                       @Param("maxRate") BigDecimal maxRate,
                                       @Param("minExperience") Integer minExperience);

            @Query("SELECT DISTINCT m FROM Mentor m " +
                "LEFT JOIN m.skills s " +
                "LEFT JOIN m.supportedLevels l " +
                "WHERE (:skill IS NULL OR LOWER(s) = LOWER(:skill)) " +
                "AND (:level IS NULL OR l = :level) " +
                "AND (:minRating IS NULL OR m.rating >= :minRating) " +
                "AND (:maxRate IS NULL OR m.hourlyRate <= :maxRate) " +
                "AND (:onlyAvailable = false OR m.isAvailable = true) " +
                "ORDER BY m.rating DESC, m.hourlyRate ASC")
        List<Mentor> searchMentorsAdvanced(@Param("skill") String skill,
                            @Param("level") EnglishLevel level,
                            @Param("minRating") BigDecimal minRating,
                            @Param("maxRate") BigDecimal maxRate,
                            @Param("onlyAvailable") boolean onlyAvailable);
    
    // Statistics queries
    @Query("SELECT COUNT(m) FROM Mentor m WHERE m.isAvailable = true")
    Long countAvailableMentors();
    
    @Query("SELECT AVG(m.rating) FROM Mentor m WHERE m.rating > 0")
    Double getAverageRating();
    
    @Query("SELECT AVG(m.hourlyRate) FROM Mentor m WHERE m.hourlyRate > 0")
    BigDecimal getAverageHourlyRate();
}