package com.aesp.service;

import com.aesp.dto.response.AdminMetricsResponse;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.PracticeSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final LearnerRepository learnerRepository;
    private final MentorRepository mentorRepository;
    private final PracticeSessionRepository practiceSessionRepository;

    public AdminMetricsResponse getPlatformMetrics() {
        // Define "active" as learners whose associated user is currently active
        Long activeLearners = 0L;
        Long certifiedMentors = 0L;
        Long sessions30d = 0L;

        try {
            activeLearners = learnerRepository.countByUserIsActiveTrue();
        } catch (Exception ex) {
            activeLearners = 0L;
        }

        try {
            // count total mentors (considered certified for the dashboard)
            certifiedMentors = mentorRepository.count();
        } catch (Exception ex) {
            certifiedMentors = 0L;
        }

        try {
            // sessions in last 30 days
            java.time.LocalDateTime cutoff = java.time.LocalDateTime.now().minusDays(30);
            sessions30d = practiceSessionRepository.countByStartTimeAfter(cutoff);
        } catch (Exception ex) {
            sessions30d = 0L;
        }

        return new AdminMetricsResponse(activeLearners, certifiedMentors, sessions30d);
    }
}
