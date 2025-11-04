package com.aesp.repository;

import com.aesp.entity.LearningProgress;
import com.aesp.entity.Learner;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {

       // Find by learner
       // Basic finders for learning progress records
    List<LearningProgress> findByLearner(Learner learner);
    
       // Find by learner ID
    List<LearningProgress> findByLearnerId(Long learnerId);
    
       // Most recent progress for a learner
    Optional<LearningProgress> findTopByLearnerIdOrderByProgressDateDesc(Long learnerId);
    
       // Count progress records
    Long countByLearnerId(Long learnerId);

       // Find by scores
       // Queries for filtering by specific skill scores
    List<LearningProgress> findByGrammarScoreGreaterThanEqual(BigDecimal minScore);
    
       // Vocabulary score
    List<LearningProgress> findByVocabularyScoreGreaterThanEqual(BigDecimal minScore);
    
       // Listening score
    List<LearningProgress> findByListeningScoreGreaterThanEqual(BigDecimal minScore);
    
       // Speaking score
    List<LearningProgress> findBySpeakingScoreGreaterThanEqual(BigDecimal minScore);

       // Find by time
       // Time-based queries
    List<LearningProgress> findByProgressDateBetween(LocalDateTime start, LocalDateTime end);
    
       // Records after date
    List<LearningProgress> findByProgressDateAfter(LocalDateTime date);
    
       // Learner progress in a time range
    List<LearningProgress> findByLearnerIdAndProgressDateBetween(
        Long learnerId, 
        LocalDateTime start, 
        LocalDateTime end
    );

       // Statistics
       // Aggregations and averages per learner
    @Query("SELECT AVG(lp.grammarScore) FROM LearningProgress lp WHERE lp.learner.id = :learnerId")
    Double getAverageGrammarScore(@Param("learnerId") Long learnerId);
    
    @Query("SELECT AVG(lp.vocabularyScore) FROM LearningProgress lp WHERE lp.learner.id = :learnerId")
    Double getAverageVocabularyScore(@Param("learnerId") Long learnerId);
    
    @Query("SELECT AVG(lp.listeningScore) FROM LearningProgress lp WHERE lp.learner.id = :learnerId")
    Double getAverageListeningScore(@Param("learnerId") Long learnerId);
    
    @Query("SELECT AVG(lp.speakingScore) FROM LearningProgress lp WHERE lp.learner.id = :learnerId")
    Double getAverageSpeakingScore(@Param("learnerId") Long learnerId);
    
       // Max scores per skill
    @Query("SELECT MAX(lp.grammarScore) FROM LearningProgress lp WHERE lp.learner.id = :learnerId")
    BigDecimal getMaxGrammarScore(@Param("learnerId") Long learnerId);
    
    @Query("SELECT MAX(lp.vocabularyScore) FROM LearningProgress lp WHERE lp.learner.id = :learnerId")
    BigDecimal getMaxVocabularyScore(@Param("learnerId") Long learnerId);

    // Progress tracking
    // History and recent records
    @Query("SELECT lp FROM LearningProgress lp WHERE lp.learner.id = :learnerId " +
           "ORDER BY lp.progressDate DESC")
    List<LearningProgress> findProgressHistory(@Param("learnerId") Long learnerId);
    
    // Lấy N progress records gần nhất của learner
    List<LearningProgress> findTop10ByLearnerIdOrderByProgressDateDesc(Long learnerId);
    
    // Tìm progress tốt nhất của learner (điểm cao nhất mỗi kỹ năng)
    @Query("SELECT lp FROM LearningProgress lp WHERE lp.learner.id = :learnerId " +
           "AND (lp.grammarScore + lp.vocabularyScore + lp.listeningScore + lp.speakingScore) = " +
           "(SELECT MAX(lp2.grammarScore + lp2.vocabularyScore + lp2.listeningScore + lp2.speakingScore) " +
           "FROM LearningProgress lp2 WHERE lp2.learner.id = :learnerId)")
    Optional<LearningProgress> findBestProgress(@Param("learnerId") Long learnerId);

    // Improvement tracking
    // Compare progress across time ranges
    @Query("SELECT lp FROM LearningProgress lp WHERE lp.learner.id = :learnerId " +
           "AND lp.progressDate BETWEEN :startDate AND :endDate " +
           "ORDER BY lp.progressDate ASC")
    List<LearningProgress> findProgressInTimeRange(@Param("learnerId") Long learnerId,
                                                     @Param("startDate") LocalDateTime startDate,
                                                     @Param("endDate") LocalDateTime endDate);
    
    // Overall average score (4 skills)
    @Query("SELECT AVG((lp.grammarScore + lp.vocabularyScore + lp.listeningScore + lp.speakingScore) / 4) " +
           "FROM LearningProgress lp WHERE lp.learner.id = :learnerId")
    Double getOverallAverageScore(@Param("learnerId") Long learnerId);
    
    // Check if learner is improving (native query comparing two most recent records)
    @Query(value = "SELECT CASE WHEN " +
           "(SELECT (grammar_score + vocabulary_score + listening_score + speaking_score) / 4 " +
           "FROM learning_progress WHERE learner_id = :learnerId ORDER BY progress_date DESC LIMIT 1) > " +
           "(SELECT (grammar_score + vocabulary_score + listening_score + speaking_score) / 4 " +
           "FROM learning_progress WHERE learner_id = :learnerId ORDER BY progress_date DESC LIMIT 1 OFFSET 1) " +
           "THEN 1 ELSE 0 END AS is_improving", nativeQuery = true)
    Integer checkIfImproving(@Param("learnerId") Long learnerId);

    // Leaderboard / ranking
    // Top learners queries
    @Query("SELECT lp FROM LearningProgress lp " +
           "WHERE lp.progressDate = (SELECT MAX(lp2.progressDate) FROM LearningProgress lp2 WHERE lp2.learner.id = lp.learner.id) " +
           "ORDER BY lp.grammarScore DESC")
    List<LearningProgress> findTopByGrammarScore();
    
    // Tìm learners có tiến bộ nhanh nhất trong tháng này
    @Query("SELECT lp.learner.id, " +
           "AVG(lp.grammarScore + lp.vocabularyScore + lp.listeningScore + lp.speakingScore) as avgScore " +
           "FROM LearningProgress lp " +
           "WHERE lp.progressDate >= :startOfMonth " +
           "GROUP BY lp.learner.id " +
           "ORDER BY avgScore DESC")
    List<Object[]> findTopLearnersThisMonth(@Param("startOfMonth") LocalDateTime startOfMonth);

    // Weak-points analysis
    // Find learner's weakest averaged skill
    @Query("SELECT 'grammar' as skill, AVG(lp.grammarScore) as score FROM LearningProgress lp WHERE lp.learner.id = :learnerId " +
           "UNION ALL " +
           "SELECT 'vocabulary', AVG(lp.vocabularyScore) FROM LearningProgress lp WHERE lp.learner.id = :learnerId " +
           "UNION ALL " +
           "SELECT 'listening', AVG(lp.listeningScore) FROM LearningProgress lp WHERE lp.learner.id = :learnerId " +
           "UNION ALL " +
           "SELECT 'speaking', AVG(lp.speakingScore) FROM LearningProgress lp WHERE lp.learner.id = :learnerId " +
           "ORDER BY score ASC LIMIT 1")
    Object[] findWeakestSkill(@Param("learnerId") Long learnerId);
}
