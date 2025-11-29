package com.aesp.service;

import com.aesp.dto.request.MentorReviewRequest;
import com.aesp.dto.request.MentorReviewUpdateRequest;
import com.aesp.dto.response.MentorReviewResponse;
import com.aesp.entity.Learner;
import com.aesp.entity.Mentor;
import com.aesp.entity.MentorReview;
import com.aesp.entity.PracticeSession;
import com.aesp.enums.SessionStatus;
import com.aesp.exception.BadRequestException;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.MentorReviewRepository;
import com.aesp.repository.PracticeSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MentorReviewService {

    private final MentorReviewRepository mentorReviewRepository;
    private final PracticeSessionRepository sessionRepository;
    private final LearnerRepository learnerRepository;
    private final MentorRepository mentorRepository;

    public MentorReviewResponse getReviewById(Long id) {
        Objects.requireNonNull(id, "Review id must not be null");
        MentorReview review = mentorReviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor review not found with id: " + id));
        return toResponse(review);
    }

    public List<MentorReviewResponse> getReviewsByMentor(Long mentorId) {
        Objects.requireNonNull(mentorId, "Mentor id must not be null");
        return mentorReviewRepository.findByMentorId(mentorId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<MentorReviewResponse> getReviewsByLearner(Long learnerId) {
        Objects.requireNonNull(learnerId, "Learner id must not be null");
        return mentorReviewRepository.findByLearnerId(learnerId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<MentorReviewResponse> getReviewsBySession(Long sessionId) {
        Objects.requireNonNull(sessionId, "Session id must not be null");
        return mentorReviewRepository.findBySessionId(sessionId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MentorReviewResponse createReview(MentorReviewRequest request) {
        Objects.requireNonNull(request, "Mentor review request must not be null");

        Long sessionId = Objects.requireNonNull(request.getSessionId(), "Session id must not be null");
        Long learnerId = Objects.requireNonNull(request.getLearnerId(), "Learner id must not be null");
        Long mentorId = Objects.requireNonNull(request.getMentorId(), "Mentor id must not be null");
        BigDecimal rating = Objects.requireNonNull(request.getRating(), "Rating must not be null");

        if (mentorReviewRepository.existsBySessionIdAndLearnerId(sessionId, learnerId)) {
            throw new BadRequestException("Learner has already reviewed this session");
        }

        PracticeSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Practice session not found with id: " + sessionId));

        if (session.getSessionStatus() != SessionStatus.COMPLETED) {
            throw new BadRequestException("Only completed sessions can be reviewed");
        }

        Learner learner = learnerRepository.findById(learnerId)
            .orElseThrow(() -> new ResourceNotFoundException("Learner not found with id: " + learnerId));

        if (!learner.getId().equals(session.getLearner().getId())) {
            throw new BadRequestException("Learner does not belong to the specified session");
        }

        Mentor mentor = mentorRepository.findById(mentorId)
            .orElseThrow(() -> new ResourceNotFoundException("Mentor not found with id: " + mentorId));

        if (session.getMentor() == null || !mentor.getId().equals(session.getMentor().getId())) {
            throw new BadRequestException("Mentor does not belong to the specified session");
        }

        MentorReview review = MentorReview.builder()
                .session(session)
                .learner(learner)
                .mentor(mentor)
            .rating(rating)
                .reviewText(request.getReviewText())
                .build();

        MentorReview saved = mentorReviewRepository.save(Objects.requireNonNull(review));
        refreshMentorRating(mentor.getId());
        return toResponse(saved);
    }

    @Transactional
    public MentorReviewResponse updateReview(Long reviewId, MentorReviewUpdateRequest request) {
        Objects.requireNonNull(request, "Mentor review update request must not be null");
        BigDecimal newRating = request.getRating();
        String newReviewText = request.getReviewText();

        if (newRating != null && (newRating.compareTo(BigDecimal.ZERO) <= 0 || newRating.compareTo(BigDecimal.valueOf(5)) > 0)) {
            throw new BadRequestException("Rating must be between 0 and 5");
        }

        Objects.requireNonNull(reviewId, "Review id must not be null");
        MentorReview review = mentorReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor review not found with id: " + reviewId));

        if (newRating != null) {
            review.setRating(newRating);
        }
        if (newReviewText != null) {
            review.setReviewText(newReviewText);
        }

        MentorReview saved = mentorReviewRepository.save(Objects.requireNonNull(review));
        refreshMentorRating(review.getMentor().getId());
        return toResponse(saved);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Objects.requireNonNull(reviewId, "Review id must not be null");
        MentorReview review = mentorReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor review not found with id: " + reviewId));
        Long mentorId = review.getMentor().getId();
        mentorReviewRepository.delete(review);
        refreshMentorRating(mentorId);
    }

    private void refreshMentorRating(Long mentorId) {
        Objects.requireNonNull(mentorId, "Mentor id must not be null");
        Double averageRating = mentorReviewRepository.getAverageRatingForMentor(mentorId);
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found with id: " + mentorId));

        if (averageRating == null) {
            mentor.setRating(BigDecimal.ZERO);
        } else {
            mentor.setRating(BigDecimal.valueOf(averageRating).setScale(2, RoundingMode.HALF_UP));
        }
        mentorRepository.save(mentor);
    }

    private MentorReviewResponse toResponse(MentorReview review) {
        MentorReviewResponse response = new MentorReviewResponse();
        response.setId(review.getId());
        response.setSessionId(review.getSession() != null ? review.getSession().getId() : null);
        response.setLearnerId(review.getLearner() != null ? review.getLearner().getId() : null);
        response.setMentorId(review.getMentor() != null ? review.getMentor().getId() : null);
        response.setLearnerName(review.getLearner() != null && review.getLearner().getUser() != null
                ? review.getLearner().getUser().getFullName() : null);
        response.setMentorName(review.getMentor() != null && review.getMentor().getUser() != null
                ? review.getMentor().getUser().getFullName() : null);
        response.setRating(review.getRating());
        response.setReviewText(review.getReviewText());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        return response;
    }
}
