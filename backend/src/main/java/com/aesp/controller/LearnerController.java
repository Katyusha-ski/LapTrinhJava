package com.aesp.controller;

import com.aesp.dto.request.LearnerRequest;
import com.aesp.dto.response.LearnerResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.service.LearnerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learners")
@RequiredArgsConstructor
public class LearnerController {

    private final LearnerService learnerService;
    private final com.aesp.service.UserService userService;

    /** CREATE */
    @PostMapping
    public ResponseEntity<LearnerResponse> createLearner(
            @Valid @RequestBody LearnerRequest request) {

        LearnerResponse response = learnerService.createLearner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** GET ALL */
    @GetMapping
    public ResponseEntity<List<LearnerResponse>> getAllLearners() {
        return ResponseEntity.ok(learnerService.getAllLearners());
    }

    /** GET ONE */
    @GetMapping("/{id}")
    public ResponseEntity<LearnerResponse> getLearnerById(@PathVariable Long id) {
        return ResponseEntity.ok(learnerService.getLearnerById(id));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<LearnerResponse> getLearnerByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(learnerService.getLearnerProfileByUserId(userId));
    }

    @PostMapping("/auto-create/{userId}")
    public ResponseEntity<LearnerResponse> autoCreateLearner(@PathVariable Long userId) {
        LearnerResponse response = learnerService.getOrCreateLearnerProfile(userId);
        return ResponseEntity.ok(response);
    }

    /** UPDATE */
    @PutMapping("/{id}")
    public ResponseEntity<LearnerResponse> updateLearner(
            @PathVariable Long id,
            @Valid @RequestBody LearnerRequest request) {

        LearnerResponse response = learnerService.updateLearner(id, request);
        return ResponseEntity.ok(response);
    }

    /** DELETE */
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteLearner(@PathVariable Long id) {
        learnerService.deleteLearner(id);
        return ResponseEntity.ok(new MessageResponse(true, "Xóa learner thành công"));
    }

    /** ASSIGN MENTOR → LEARNER */
    @PostMapping("/{id}/assign-mentor/{mentorId}")
    public ResponseEntity<LearnerResponse> assignMentor(
            @PathVariable Long id,
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(learnerService.assignMentor(id, mentorId));
    }

    @PatchMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setLearnerUserStatus(@PathVariable Long id, @RequestBody java.util.Map<String, Boolean> body) {
        Boolean active = body.get("active");
        if (active == null) {
            return ResponseEntity.badRequest().build();
        }
        LearnerResponse learner = learnerService.getLearnerById(id);
        if (learner.getUserId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST).body(new MessageResponse(false, "Learner không có user liên kết"));
        }
        userService.setActive(learner.getUserId(), active);
        return ResponseEntity.ok(new MessageResponse(true, "Cập nhật trạng thái tài khoản thành công"));
    }
}
