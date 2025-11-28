package com.aesp.controller;

import com.aesp.dto.request.MentorRequest;
import com.aesp.dto.response.MentorResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.enums.EnglishLevel;
import com.aesp.service.MentorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/mentors")
@RequiredArgsConstructor
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

    @GetMapping("/search")
    public ResponseEntity<List<MentorResponse>> searchMentors(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) EnglishLevel level,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) BigDecimal maxRate,
            @RequestParam(defaultValue = "false") boolean onlyAvailable) {
        return ResponseEntity.ok(mentorService.searchAdvanced(skill, level, minRating, maxRate, onlyAvailable));
    }

    /** GET ONE */
    @GetMapping("/{id}")
    public ResponseEntity<MentorResponse> getMentorById(@PathVariable Long id) {
        return ResponseEntity.ok(mentorService.getMentorById(id));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<MentorResponse> getMentorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(mentorService.getMentorProfileByUserId(userId));
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
