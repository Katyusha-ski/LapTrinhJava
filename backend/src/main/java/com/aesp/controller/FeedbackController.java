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
