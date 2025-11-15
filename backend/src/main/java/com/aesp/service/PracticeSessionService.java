package com.aesp.service;

import com.aesp.dto.request.PracticeSessionRequest;
import com.aesp.dto.response.PracticeSessionResponse;
import com.aesp.entity.Learner;
import com.aesp.entity.Mentor;
import com.aesp.entity.PracticeSession;
import com.aesp.enums.SessionStatus;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.PracticeSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PracticeSessionService {

    private final PracticeSessionRepository sessionRepository;
    private final LearnerRepository learnerRepository;
    private final MentorRepository mentorRepository;

    @Transactional
    public PracticeSessionResponse createSession(PracticeSessionRequest request) {
        Learner learner = learnerRepository.findById(request.getLearnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found with id: " + request.getLearnerId()));

        Mentor mentor = null;
        if (request.getMentorId() != null) {
            mentor = mentorRepository.findById(request.getMentorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mentor not found with id: " + request.getMentorId()));
        }

        // Calculate duration if endTime is provided
        Integer durationMinutes = null;
        if (request.getEndTime() != null && request.getStartTime() != null) {
            durationMinutes = (int) Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        }

        PracticeSession session = PracticeSession.builder()
                .learner(learner)
                .mentor(mentor)
                .sessionType(request.getType())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(durationMinutes)
                .topic(request.getTopic())
                .cost(mentor != null ? BigDecimal.ZERO : BigDecimal.ZERO) // TODO: Calculate cost from mentor hourly rate
                .sessionStatus(SessionStatus.SCHEDULED)
                .build();

        PracticeSession saved = sessionRepository.save(session);
        return toResponse(saved);
    }

    public PracticeSessionResponse getSessionById(Long id) {
        PracticeSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
        return toResponse(session);
    }

    public List<PracticeSessionResponse> getSessionsByLearner(Long learnerId) {
        return sessionRepository.findByLearnerId(learnerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PracticeSessionResponse> getSessionsByMentor(Long mentorId) {
        return sessionRepository.findByMentorId(mentorId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateSessionStatus(Long id, String status) {
        PracticeSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));

        try {
            SessionStatus sessionStatus = SessionStatus.valueOf(status.toUpperCase());
            session.setSessionStatus(sessionStatus);
            sessionRepository.save(session);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid session status: " + status);
        }
    }

    @Transactional
    public void deleteSession(Long id) {
        PracticeSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
        sessionRepository.delete(session);
    }

    public List<PracticeSessionResponse> getAllSessions() {
        return sessionRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PracticeSessionResponse toResponse(PracticeSession session) {
        PracticeSessionResponse response = new PracticeSessionResponse();
        response.setId(session.getId());
        response.setLearnerId(session.getLearner() != null ? session.getLearner().getId() : null);
        response.setMentorId(session.getMentor() != null ? session.getMentor().getId() : null);
        response.setType(session.getSessionType());
        response.setSessionStatus(session.getSessionStatus());
        response.setStartTime(session.getStartTime());
        response.setEndTime(session.getEndTime());
        response.setTopic(session.getTopic());
        response.setCreatedAt(session.getCreatedAt());
        response.setUpdatedAt(session.getUpdatedAt());
        return response;
    }
}

