package com.aesp.service;

import com.aesp.dto.response.AdminMetricsResponse;
import com.aesp.entity.FeedbackStatus;
import com.aesp.repository.FeedbackRepository;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.PracticeSessionRepository;
import com.aesp.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final LearnerRepository learnerRepository;
    private final MentorRepository mentorRepository;
    private final PracticeSessionRepository practiceSessionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final FeedbackRepository feedbackRepository;

    public AdminMetricsResponse getPlatformMetrics() {
        // Define "active" as learners whose associated user is currently active
        Long activeLearners = 0L;
        Long certifiedMentors = 0L;
        Long sessions30d = 0L;
        Long totalSubscriptions = 0L;
        Double totalRevenue = 0.0;
        Long pendingFeedbackCount = 0L;

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

        try {
            totalSubscriptions = subscriptionRepository.count();
        } catch (Exception ex) {
            totalSubscriptions = 0L;
        }

        try {
            Double rev = subscriptionRepository.getTotalActiveRevenue();
            totalRevenue = rev == null ? 0.0 : rev;
        } catch (Exception ex) {
            totalRevenue = 0.0;
        }

        try {
            pendingFeedbackCount = feedbackRepository.countByStatus(FeedbackStatus.PENDING);
        } catch (Exception ex) {
            pendingFeedbackCount = 0L;
        }

        AdminMetricsResponse resp = new AdminMetricsResponse();
        resp.setActiveLearners(activeLearners);
        resp.setCertifiedMentors(certifiedMentors);
        resp.setSessionsBooked30d(sessions30d);
        resp.setTotalSubscriptions(totalSubscriptions);
        resp.setTotalRevenue(totalRevenue);
        resp.setPendingFeedbackCount(pendingFeedbackCount);

        return resp;
    }
}
