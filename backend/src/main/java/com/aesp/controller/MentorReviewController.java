package com.aesp.controller;

import com.aesp.dto.request.MentorReviewRequest;
import com.aesp.dto.request.MentorReviewUpdateRequest;
import com.aesp.dto.response.MentorReviewResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.service.MentorReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentor-reviews")
@RequiredArgsConstructor
public class MentorReviewController {

    private final MentorReviewService mentorReviewService;

    @PostMapping
    public ResponseEntity<MentorReviewResponse> createReview(@Valid @RequestBody MentorReviewRequest request) {
        MentorReviewResponse response = mentorReviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorReviewResponse> getReview(@PathVariable Long id) {
        return ResponseEntity.ok(mentorReviewService.getReviewById(id));
    }

    @GetMapping("/mentors/{mentorId}")
    public ResponseEntity<List<MentorReviewResponse>> getReviewsByMentor(@PathVariable Long mentorId) {
        return ResponseEntity.ok(mentorReviewService.getReviewsByMentor(mentorId));
    }

    @GetMapping("/learners/{learnerId}")
    public ResponseEntity<List<MentorReviewResponse>> getReviewsByLearner(@PathVariable Long learnerId) {
        return ResponseEntity.ok(mentorReviewService.getReviewsByLearner(learnerId));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<List<MentorReviewResponse>> getReviewsBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(mentorReviewService.getReviewsBySession(sessionId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MentorReviewResponse> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody MentorReviewUpdateRequest request) {
        MentorReviewResponse response = mentorReviewService.updateReview(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteReview(@PathVariable Long id) {
        mentorReviewService.deleteReview(id);
        return ResponseEntity.ok(new MessageResponse(true, "Xóa đánh giá mentor thành công"));
    }
}
