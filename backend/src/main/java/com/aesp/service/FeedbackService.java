package com.aesp.service;

import com.aesp.entity.Feedback;
import com.aesp.entity.FeedbackStatus;
import com.aesp.entity.Learner;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.FeedbackRepository;
import com.aesp.repository.LearnerRepository;
import com.aesp.dto.request.FeedbackRequest;
import com.aesp.dto.response.FeedbackResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final LearnerRepository learnerRepository;

    @Transactional
    public Feedback createFeedback(Long learnerId, String content) {
        Learner learner = learnerRepository.findById(learnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));

        Feedback fb = Feedback.builder()
                .learner(learner)
                .content(content)
                .status(FeedbackStatus.PENDING)
                .build();

        return feedbackRepository.save(fb);
    }

    @Transactional
    public FeedbackResponse createFeedback(FeedbackRequest req) {
        Feedback saved = createFeedback(req.getLearnerId(), req.getContent());
        return toResponse(saved);
    }

    public List<Feedback> listAll() {
        return feedbackRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<FeedbackResponse> listAll(Pageable pageable) {
        Page<Feedback> page = feedbackRepository.findAll(pageable);
        // touch lazy associations inside transaction to avoid LazyInitializationException
        page.getContent().forEach(fb -> {
            if (fb.getLearner() != null) {
                if (fb.getLearner().getUser() != null) {
                    // access a property to initialize proxy
                    fb.getLearner().getUser().getFullName();
                }
            }
        });
        return page.map(this::toResponse);
    }

    public List<Feedback> listByStatus(FeedbackStatus status) {
        return feedbackRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public Page<FeedbackResponse> listByStatus(FeedbackStatus status, Pageable pageable) {
        Page<Feedback> page = feedbackRepository.findByStatus(status, pageable);
        page.getContent().forEach(fb -> {
            if (fb.getLearner() != null) {
                if (fb.getLearner().getUser() != null) {
                    fb.getLearner().getUser().getFullName();
                }
            }
        });
        return page.map(this::toResponse);
    }

    public Page<FeedbackResponse> listByLearnerIds(List<Long> learnerIds, Pageable pageable) {
        if (learnerIds == null || learnerIds.isEmpty()) {
            return Page.empty(pageable);
        }
        Page<Feedback> page = feedbackRepository.findByLearnerIdIn(learnerIds, pageable);
        page.getContent().forEach(fb -> {
            if (fb.getLearner() != null) {
                if (fb.getLearner().getUser() != null) {
                    fb.getLearner().getUser().getFullName();
                }
            }
        });
        return page.map(this::toResponse);
    }

    public Page<FeedbackResponse> listByLearnerId(Long learnerId, Pageable pageable) {
        Page<Feedback> page = feedbackRepository.findByLearnerId(learnerId, pageable);
        page.getContent().forEach(fb -> {
            if (fb.getLearner() != null) {
                if (fb.getLearner().getUser() != null) {
                    fb.getLearner().getUser().getFullName();
                }
            }
        });
        return page.map(this::toResponse);
    }

    @Transactional
    public Feedback moderate(Long id, FeedbackStatus status, String moderator) {
        Feedback fb = feedbackRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        fb.setStatus(status);
        fb.setModeratedBy(moderator);
        fb.setModeratedAt(java.time.LocalDateTime.now());
        Feedback saved = feedbackRepository.save(fb);
        return saved;
    }

    @Transactional
    public FeedbackResponse moderateAsResponse(Long id, FeedbackStatus status, String moderator) {
        Feedback saved = moderate(id, status, moderator);
        return toResponse(saved);
    }

    @Transactional
    public void deleteFeedback(Long id) {
        Feedback fb = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        feedbackRepository.delete(fb);
    }

    private FeedbackResponse toResponse(Feedback fb) {
        return FeedbackResponse.builder()
                .id(fb.getId())
                .learnerId(fb.getLearner() == null ? null : fb.getLearner().getId())
                .learnerName(fb.getLearner() == null ? null : fb.getLearner().getUser() == null ? null : fb.getLearner().getUser().getFullName())
                .content(fb.getContent())
                .status(fb.getStatus())
                .moderatedBy(fb.getModeratedBy())
                .moderatedAt(fb.getModeratedAt())
                .createdAt(fb.getCreatedAt())
                .build();
    }
}
