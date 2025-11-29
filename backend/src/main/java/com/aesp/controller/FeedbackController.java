package com.aesp.controller;

import com.aesp.dto.request.FeedbackRequest;
import com.aesp.dto.response.FeedbackResponse;
import com.aesp.entity.FeedbackStatus;
import com.aesp.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;


@RestController
@RequestMapping
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    private final com.aesp.service.MentorService mentorService;
    private final com.aesp.service.LearnerService learnerService;
    private final com.aesp.repository.UserRepository userRepository;

    // Public: submit feedback
    @PostMapping("/api/feedback")
    public ResponseEntity<FeedbackResponse> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        FeedbackResponse resp = feedbackService.createFeedback(request);
        return ResponseEntity.ok(resp);
    }

    // Admin: list feedbacks with optional status filter and pagination
    @GetMapping("/api/admin/feedbacks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<FeedbackResponse>> listAll(@RequestParam(required = false) FeedbackStatus status, Pageable pageable) {
        Page<FeedbackResponse> page;
        if (status == null) {
            page = feedbackService.listAll(pageable);
        } else {
            page = feedbackService.listByStatus(status, pageable);
        }
        return ResponseEntity.ok(page);
    }

    // Mentor: list feedbacks for learners assigned to the authenticated mentor
    @GetMapping("/api/mentor/feedbacks")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<Page<FeedbackResponse>> listForMentor(@RequestParam(required = false) Long learnerId, Pageable pageable, java.security.Principal principal) {
        // resolve current user
        String username = principal == null ? null : principal.getName();
        if (username == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        com.aesp.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.aesp.exception.ResourceNotFoundException("User not found: " + username));

        com.aesp.entity.Mentor mentor = mentorService.getMentorByUserId(user.getId());

        // if specific learnerId provided, validate it's assigned to this mentor
        if (learnerId != null) {
            com.aesp.dto.response.LearnerResponse learner = learnerService.getLearnerById(learnerId);
            if (learner.getMentorId() == null || !learner.getMentorId().equals(mentor.getId())) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.ok(feedbackService.listByLearnerId(learnerId, pageable));
        }

        // otherwise list for all learners assigned to this mentor
        java.util.List<com.aesp.entity.Learner> learners = learnerService.getLearnersByMentor(mentor.getId());
        java.util.List<Long> learnerIds = learners.stream().map(com.aesp.entity.Learner::getId).toList();
        if (learnerIds.isEmpty()) {
            return ResponseEntity.ok(org.springframework.data.domain.Page.empty(pageable));
        }
        return ResponseEntity.ok(feedbackService.listByLearnerIds(learnerIds, pageable));
    }

    @PatchMapping("/api/admin/feedbacks/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponse> moderateFeedback(@PathVariable Long id, @RequestParam FeedbackStatus status, Principal principal) {
        FeedbackResponse updated = feedbackService.moderateAsResponse(id, status, principal == null ? "SYSTEM" : principal.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/admin/feedbacks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id, Principal principal) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
