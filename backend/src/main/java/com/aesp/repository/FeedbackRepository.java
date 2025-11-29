package com.aesp.repository;

import com.aesp.entity.Feedback;
import com.aesp.entity.FeedbackStatus;
import com.aesp.entity.Learner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByLearner(Learner learner);
    List<Feedback> findByStatus(FeedbackStatus status);

    Page<Feedback> findByStatus(FeedbackStatus status, Pageable pageable);
}
