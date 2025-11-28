package com.aesp.repository;

import com.aesp.entity.MentorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorReviewRepository extends JpaRepository<MentorReview, Long> {
    List<MentorReview> findByMentorId(Long mentorId);
    List<MentorReview> findByLearnerId(Long learnerId);
    List<MentorReview> findBySessionId(Long sessionId);
    Optional<MentorReview> findBySessionIdAndLearnerId(Long sessionId, Long learnerId);
    boolean existsBySessionIdAndLearnerId(Long sessionId, Long learnerId);

    @Query("SELECT AVG(r.rating) FROM MentorReview r WHERE r.mentor.id = :mentorId")
    Double getAverageRatingForMentor(@Param("mentorId") Long mentorId);
}
