package com.aesp.controller;

import com.aesp.dto.request.MentorRequest;
import com.aesp.dto.response.MentorResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.service.MentorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class MentorController {

    private final MentorService mentorService;

    /** CREATE */
    @PostMapping
    public ResponseEntity<MentorResponse> createMentor(
            @Valid @RequestBody MentorRequest request) {
        MentorResponse response = mentorService.createMentor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** GET ALL */
    @GetMapping
    public ResponseEntity<List<MentorResponse>> getAllMentors() {
        return ResponseEntity.ok(mentorService.getAllMentors());
    }

    /** GET ONE */
    @GetMapping("/{id}")
    public ResponseEntity<MentorResponse> getMentorById(@PathVariable Long id) {
        return ResponseEntity.ok(mentorService.getMentorById(id));
    }

    /** UPDATE */
    @PutMapping("/{id}")
    public ResponseEntity<MentorResponse> updateMentor(
            @PathVariable Long id,
            @Valid @RequestBody MentorRequest request) {

        MentorResponse response = mentorService.updateMentor(id, request);
        return ResponseEntity.ok(response);
    }

    /** DELETE (soft delete or hard delete tùy service) */
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteMentor(@PathVariable Long id) {
        mentorService.deleteMentor(id);
        return ResponseEntity.ok(new MessageResponse(true, "Xóa mentor thành công"));
    }

    /** TOGGLE AVAILABILITY */
    @PatchMapping("/{id}/availability")
    public ResponseEntity<MentorResponse> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(mentorService.toggleAvailability(id));
    }
}
