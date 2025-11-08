package com.aesp.controller;

import com.aesp.dto.request.PracticeSessionRequest;
import com.aesp.dto.response.PracticeSessionResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.service.PracticeSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/practice-sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PracticeSessionController {

    private final PracticeSessionService practiceSessionService;

    // Tạo session mới
    @PostMapping
    @PreAuthorize("hasAnyRole('LEARNER', 'MENTOR')")
    public ResponseEntity<PracticeSessionResponse> createSession(
            @Valid @RequestBody PracticeSessionRequest request) {
        PracticeSessionResponse response = practiceSessionService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Lấy sessions của learner
    @GetMapping("/learner/{learnerId}")
    @PreAuthorize("hasAnyRole('LEARNER', 'MENTOR', 'ADMIN')")
    public ResponseEntity<List<PracticeSessionResponse>> getLearnerSessions(@PathVariable Long learnerId) {
        return ResponseEntity.ok(practiceSessionService.getSessionsByLearner(learnerId));
    }

    // Lấy sessions của mentor
    @GetMapping("/mentor/{mentorId}")
    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN')")
    public ResponseEntity<List<PracticeSessionResponse>> getMentorSessions(@PathVariable Long mentorId) {
        return ResponseEntity.ok(practiceSessionService.getSessionsByMentor(mentorId));
    }

    // Cập nhật session status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LEARNER', 'MENTOR')")
    public ResponseEntity<MessageResponse> updateSessionStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        practiceSessionService.updateSessionStatus(id, status);
        return ResponseEntity.ok(new MessageResponse("Cập nhật trạng thái session thành công"));
    }

    // Xóa session
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN')")
    public ResponseEntity<MessageResponse> deleteSession(@PathVariable Long id) {
        practiceSessionService.deleteSession(id);
        return ResponseEntity.ok(new MessageResponse("Xóa session thành công"));
    }

    // Lấy session chi tiết theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LEARNER', 'MENTOR', 'ADMIN')")
    public ResponseEntity<PracticeSessionResponse> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(practiceSessionService.getSessionById(id));
    }

    // Lấy tất cả sessions (chỉ ADMIN)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PracticeSessionResponse>> getAllSessions() {
        return ResponseEntity.ok(practiceSessionService.getAllSessions());
    }
}
