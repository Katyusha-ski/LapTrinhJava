package com.aesp.repository;

import com.aesp.entity.PracticeSession;
import com.aesp.entity.Learner;
import com.aesp.entity.Mentor;
import com.aesp.enums.SessionStatus;
import com.aesp.enums.SessionType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {
       // Find by learner
       List<PracticeSession> findByLearner(Learner learner);
    
       // Find by learner id
       List<PracticeSession> findByLearnerId(Long learnerId);
    
       List<PracticeSession> findByLearnerIdAndSessionStatus(Long learnerId, SessionStatus status);
    
       Long countByLearnerId(Long learnerId);
    
       Long countByLearnerIdAndSessionStatus(Long learnerId, SessionStatus status);

       // Find by mentor
       List<PracticeSession> findByMentor(Mentor mentor);
    
       List<PracticeSession> findByMentorId(Long mentorId);
    
       List<PracticeSession> findByMentorIdAndSessionStatus(Long mentorId, SessionStatus status);
    
       List<PracticeSession> findByMentorIsNull();
    
       List<PracticeSession> findByMentorIsNotNull();
    
       Long countByMentorId(Long mentorId);

       // Session type
       List<PracticeSession> findBySessionType(SessionType sessionType);
    
       List<PracticeSession> findBySessionTypeAndSessionStatus(SessionType type, SessionStatus status);
    
       Long countBySessionType(SessionType sessionType);

       // Status
       List<PracticeSession> findBySessionStatus(SessionStatus status);
    
       Long countBySessionStatus(SessionStatus status);

       // Time-based queries
       List<PracticeSession> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    
       List<PracticeSession> findByStartTimeAfter(LocalDateTime time);
    
       List<PracticeSession> findByStartTimeBefore(LocalDateTime time);
    
       List<PracticeSession> findByLearnerIdAndStartTimeBetween(
        Long learnerId, 
        LocalDateTime start, 
        LocalDateTime end
    );
    
       List<PracticeSession> findByMentorIdAndStartTimeBetween(
        Long mentorId, 
        LocalDateTime start, 
        LocalDateTime end
    );

       // Topic search
          List<PracticeSession> findByTopic_NameContainingIgnoreCase(String keyword);

          default List<PracticeSession> findByTopicContainingIgnoreCase(String keyword) {
                 return findByTopic_NameContainingIgnoreCase(keyword);
          }
    
       List<PracticeSession> findByTopicIsNotNull();

       // Cost queries
       List<PracticeSession> findByCost(BigDecimal cost);
    
       List<PracticeSession> findByCostBetween(BigDecimal minCost, BigDecimal maxCost);

       // Upcoming sessions
       @Query("SELECT ps FROM PracticeSession ps WHERE ps.learner.id = :learnerId " +
           "AND ps.sessionStatus = 'SCHEDULED' " +
           "AND ps.startTime > :now " +
           "ORDER BY ps.startTime ASC")
    List<PracticeSession> findUpcomingSessionsByLearner(@Param("learnerId") Long learnerId,
                                                          @Param("now") LocalDateTime now);
    
       @Query("SELECT ps FROM PracticeSession ps WHERE ps.mentor.id = :mentorId " +
           "AND ps.sessionStatus = 'SCHEDULED' " +
           "AND ps.startTime > :now " +
           "ORDER BY ps.startTime ASC")
    List<PracticeSession> findUpcomingSessionsByMentor(@Param("mentorId") Long mentorId,
                                                         @Param("now") LocalDateTime now);
    
       @Query("SELECT ps FROM PracticeSession ps WHERE ps.learner.id = :learnerId " +
           "AND ps.sessionStatus = 'SCHEDULED' " +
           "AND ps.startTime > :now " +
           "ORDER BY ps.startTime ASC")
    Optional<PracticeSession> findNextSessionByLearner(@Param("learnerId") Long learnerId,
                                                         @Param("now") LocalDateTime now);

       // Completed sessions
       @Query("SELECT ps FROM PracticeSession ps WHERE ps.learner.id = :learnerId " +
           "AND ps.sessionStatus = 'COMPLETED' " +
           "ORDER BY ps.startTime DESC")
    List<PracticeSession> findCompletedSessionsByLearner(@Param("learnerId") Long learnerId);
    
       @Query("SELECT ps FROM PracticeSession ps WHERE ps.mentor.id = :mentorId " +
           "AND ps.sessionStatus = 'COMPLETED' " +
           "ORDER BY ps.startTime DESC")
    List<PracticeSession> findCompletedSessionsByMentor(@Param("mentorId") Long mentorId);
    
    @Query("SELECT COUNT(ps) FROM PracticeSession ps WHERE ps.learner.id = :learnerId " +
           "AND ps.sessionStatus = 'COMPLETED'")
    Long countCompletedSessionsByLearner(@Param("learnerId") Long learnerId);
    
    @Query("SELECT COUNT(ps) FROM PracticeSession ps WHERE ps.mentor.id = :mentorId " +
           "AND ps.sessionStatus = 'COMPLETED'")
    Long countCompletedSessionsByMentor(@Param("mentorId") Long mentorId);

    // Statistics
    @Query("SELECT SUM(ps.durationMinutes) FROM PracticeSession ps " +
           "WHERE ps.learner.id = :learnerId AND ps.sessionStatus = 'COMPLETED'")
    Integer getTotalPracticeMinutesByLearner(@Param("learnerId") Long learnerId);
    
    @Query("SELECT SUM(ps.cost) FROM PracticeSession ps " +
           "WHERE ps.learner.id = :learnerId AND ps.sessionStatus = 'COMPLETED'")
    BigDecimal getTotalCostByLearner(@Param("learnerId") Long learnerId);
    
    @Query("SELECT SUM(ps.cost) FROM PracticeSession ps " +
           "WHERE ps.mentor.id = :mentorId AND ps.sessionStatus = 'COMPLETED'")
    BigDecimal getTotalEarningsByMentor(@Param("mentorId") Long mentorId);
    
    @Query("SELECT AVG(ps.durationMinutes) FROM PracticeSession ps " +
           "WHERE ps.sessionStatus = 'COMPLETED'")
    Double getAverageSessionDuration();

    // Conflict checks
    @Query("SELECT ps FROM PracticeSession ps WHERE ps.mentor.id = :mentorId " +
           "AND ps.sessionStatus = 'SCHEDULED' " +
           "AND ((ps.startTime BETWEEN :startTime AND :endTime) " +
           "OR (ps.endTime BETWEEN :startTime AND :endTime) " +
           "OR (:startTime BETWEEN ps.startTime AND ps.endTime))")
    List<PracticeSession> findConflictingSessionsForMentor(@Param("mentorId") Long mentorId,
                                                             @Param("startTime") LocalDateTime startTime,
                                                             @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT ps FROM PracticeSession ps WHERE ps.learner.id = :learnerId " +
           "AND ps.sessionStatus = 'SCHEDULED' " +
           "AND ((ps.startTime BETWEEN :startTime AND :endTime) " +
           "OR (ps.endTime BETWEEN :startTime AND :endTime) " +
           "OR (:startTime BETWEEN ps.startTime AND ps.endTime))")
    List<PracticeSession> findConflictingSessionsForLearner(@Param("learnerId") Long learnerId,
                                                              @Param("startTime") LocalDateTime startTime,
                                                              @Param("endTime") LocalDateTime endTime);

    // Cancellation & overdue
    @Query("SELECT ps FROM PracticeSession ps WHERE ps.sessionStatus = 'SCHEDULED' " +
           "AND ps.startTime < :now")
    List<PracticeSession> findOverdueSessions(@Param("now") LocalDateTime now);
    
    @Query("SELECT ps FROM PracticeSession ps WHERE ps.sessionStatus = 'SCHEDULED' " +
           "AND ps.endTime IS NOT NULL " +
           "AND ps.endTime < :now")
    List<PracticeSession> findSessionsToAutoComplete(@Param("now") LocalDateTime now);

    // Reports
    @Query("SELECT ps.topic, COUNT(ps) FROM PracticeSession ps " +
           "WHERE ps.topic IS NOT NULL " +
           "GROUP BY ps.topic " +
           "ORDER BY COUNT(ps) DESC")
    List<Object[]> findMostPopularTopics();
    
    @Query("SELECT MONTH(ps.startTime), COUNT(ps) FROM PracticeSession ps " +
           "WHERE YEAR(ps.startTime) = :year " +
           "GROUP BY MONTH(ps.startTime) " +
           "ORDER BY MONTH(ps.startTime)")
    List<Object[]> countSessionsByMonth(@Param("year") Integer year);
    
    @Query("SELECT MONTH(ps.startTime), SUM(ps.cost) FROM PracticeSession ps " +
           "WHERE YEAR(ps.startTime) = :year AND ps.sessionStatus = 'COMPLETED' " +
           "GROUP BY MONTH(ps.startTime) " +
           "ORDER BY MONTH(ps.startTime)")
    List<Object[]> calculateMonthlyRevenue(@Param("year") Integer year);

       // Count sessions starting after a given time (used for recent sessions/statistics)
       Long countByStartTimeAfter(java.time.LocalDateTime start);

       // History & sorting
       List<PracticeSession> findByLearnerIdOrderByStartTimeDesc(Long learnerId);
    
       List<PracticeSession> findByMentorIdOrderByStartTimeDesc(Long mentorId);
    
       List<PracticeSession> findTop10ByLearnerIdOrderByStartTimeDesc(Long learnerId);
}
