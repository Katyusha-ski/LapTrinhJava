package com.aesp.repository;

import com.aesp.entity.Learner;
import com.aesp.entity.User;
import com.aesp.entity.Mentor;
import com.aesp.enums.EnglishLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LearnerRepository extends JpaRepository<Learner, Long> {
    
    // Basic finders
    Optional<Learner> findByUser(User user);
    Optional<Learner> findByUserId(Long userId);
    
    List<Learner> findByMentor(Mentor mentor);
    List<Learner> findByMentorId(Long mentorId);
    List<Learner> findByMentorIsNull();
    
    // Find by level
    List<Learner> findByEnglishLevel(EnglishLevel level);
    
    // Find by scores
    List<Learner> findByOverallScoreGreaterThanEqual(BigDecimal minScore);
    List<Learner> findByOverallScoreBetween(BigDecimal minScore, BigDecimal maxScore);
    List<Learner> findByPronunciationScoreGreaterThan(BigDecimal minScore);
    List<Learner> findByGrammarScoreGreaterThan(BigDecimal minScore);
    List<Learner> findByVocabularyScoreGreaterThan(BigDecimal minScore);
    
    // Find by practice data
    List<Learner> findByTotalPracticeHoursGreaterThanEqual(BigDecimal minHours);
    List<Learner> findByTotalPracticeHoursBetween(BigDecimal minHours, BigDecimal maxHours);
    List<Learner> findByCurrentStreakGreaterThanEqual(Integer minStreak);
    List<Learner> findByCurrentStreakBetween(Integer minStreak, Integer maxStreak);
    
    // Find by learning goals
    List<Learner> findByLearningGoalsContainingIgnoreCase(String keyword);
    List<Learner> findByLearningGoalsIsNotNull();
    List<Learner> findByLearningGoalsIsNull();
    
    // Find by date
    List<Learner> findByJoinedAtAfter(LocalDateTime date);
    List<Learner> findByJoinedAtBefore(LocalDateTime date);
    List<Learner> findByJoinedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Custom queries
    @Query("SELECT l FROM Learner l WHERE l.overallScore > 0 ORDER BY l.overallScore DESC")
    List<Learner> findTopLearnersByScore();
    
    @Query("SELECT l FROM Learner l WHERE l.overallScore < :threshold ORDER BY l.overallScore ASC")
    List<Learner> findLearnersNeedingImprovement(@Param("threshold") BigDecimal threshold);
    
    @Query("SELECT l FROM Learner l WHERE l.updatedAt >= :cutoffDate ORDER BY l.updatedAt DESC")
    List<Learner> findActiveLearners(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    @Query("SELECT l FROM Learner l WHERE l.englishLevel = :level AND l.mentor IS NOT NULL")
    List<Learner> findLearnersByLevelWithMentor(@Param("level") EnglishLevel level);
    
    @Query("SELECT l FROM Learner l WHERE " +
           "(:level IS NULL OR l.englishLevel = :level) AND " +
           "(:minScore IS NULL OR l.overallScore >= :minScore) AND " +
           "(:hasMentor IS NULL OR " +
           " (:hasMentor = true AND l.mentor IS NOT NULL) OR " +
           " (:hasMentor = false AND l.mentor IS NULL)) " +
           "ORDER BY l.overallScore DESC")
    List<Learner> findLearnersWithFilters(@Param("level") EnglishLevel level,
                                         @Param("minScore") BigDecimal minScore,
                                         @Param("hasMentor") Boolean hasMentor);
    
    // Statistics
    Long countByEnglishLevel(EnglishLevel level);
    
    @Query("SELECT AVG(l.overallScore) FROM Learner l WHERE l.overallScore > 0")
    Double getAverageOverallScore();
    
    @Query("SELECT AVG(l.totalPracticeHours) FROM Learner l WHERE l.totalPracticeHours > 0")
    BigDecimal getAveragePracticeHours();
    
    @Query("SELECT MAX(l.currentStreak) FROM Learner l")
    Integer getMaxStreak();
    
    // Existence & deletion
    Boolean existsByUser(User user);
    Boolean existsByUserId(Long userId);
    
    void deleteByUser(User user);
    Long deleteByMentorIsNull();
}
