package com.aesp.repository;

import com.aesp.entity.PronunciationScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PronunciationScoreRepository extends JpaRepository<PronunciationScore, Long> {
    
    // Find by learner
    List<PronunciationScore> findByLearnerIdOrderByCreatedAtDesc(Long learnerId);
    
    // Find by session
    List<PronunciationScore> findBySessionIdOrderByCreatedAtAsc(Long sessionId);
    
    // Find recent scores
    @Query("SELECT ps FROM PronunciationScore ps WHERE ps.learner.id = :learnerId AND ps.createdAt >= :since ORDER BY ps.createdAt DESC")
    List<PronunciationScore> findRecentScores(@Param("learnerId") Long learnerId, @Param("since") LocalDateTime since);
    
    // Calculate average scores for a learner
    @Query("SELECT AVG(ps.pronunciationScore) FROM PronunciationScore ps WHERE ps.learner.id = :learnerId")
    Double calculateAveragePronunciationScore(@Param("learnerId") Long learnerId);
    
    @Query("SELECT AVG(ps.accuracyScore) FROM PronunciationScore ps WHERE ps.learner.id = :learnerId")
    Double calculateAverageAccuracyScore(@Param("learnerId") Long learnerId);
    
    @Query("SELECT AVG(ps.fluencyScore) FROM PronunciationScore ps WHERE ps.learner.id = :learnerId")
    Double calculateAverageFluencyScore(@Param("learnerId") Long learnerId);
    
    // Find scores above threshold
    @Query("SELECT ps FROM PronunciationScore ps WHERE ps.learner.id = :learnerId AND ps.pronunciationScore >= :minScore")
    List<PronunciationScore> findScoresAboveThreshold(@Param("learnerId") Long learnerId, @Param("minScore") Integer minScore);
    
    // Count total evaluations
    Long countByLearnerId(Long learnerId);
    
    // Find latest score
    @Query("SELECT ps FROM PronunciationScore ps WHERE ps.learner.id = :learnerId ORDER BY ps.createdAt DESC LIMIT 1")
    PronunciationScore findLatestScore(@Param("learnerId") Long learnerId);
}
