package com.aesp.service;

import com.aesp.dto.request.LearnerRequest;
import com.aesp.dto.response.LearnerResponse;
import com.aesp.entity.Learner;
import com.aesp.entity.Mentor;
import com.aesp.entity.User;
import com.aesp.enums.EnglishLevel;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LearnerService {

    private final LearnerRepository learnerRepository;
    private final UserRepository userRepository;
    private final MentorRepository mentorRepository;

    public List<LearnerResponse> getAllLearners() {
        return learnerRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public LearnerResponse getLearnerById(Long id) {
        Objects.requireNonNull(id, "Learner id must not be null");
        Learner learner = learnerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Learner with id %d not found".formatted(id)));
        return toResponse(learner);
    }

    private Learner getLearnerEntityById(Long id) {
        Objects.requireNonNull(id, "Learner id must not be null");
        return learnerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Learner with id %d not found".formatted(id)));
    }

    public Learner getLearnerByUserId(Long userId) {
        Objects.requireNonNull(userId, "User id must not be null");
        return learnerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Learner with user id %d not found".formatted(userId)));
    }

    public LearnerResponse getLearnerProfileByUserId(Long userId) {
        Learner learner = getLearnerByUserId(userId);
        return toResponse(learner);
    }

    public List<Learner> getLearnersByMentor(Long mentorId) {
        Objects.requireNonNull(mentorId, "Mentor id must not be null");
        ensureMentorExists(mentorId);
        return learnerRepository.findByMentorId(mentorId);
    }

    public List<Learner> getLearnersWithoutMentor() {
        return learnerRepository.findByMentorIsNull();
    }

    public List<Learner> getLearnersByLevel(EnglishLevel level) {
        Objects.requireNonNull(level, "English level must not be null");
        return learnerRepository.findByEnglishLevel(level);
    }

    public List<Learner> searchLearners(EnglishLevel level, BigDecimal minScore, Boolean hasMentor) {
        if (minScore != null && minScore.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Minimum score must be greater than or equal to zero");
        }
        return learnerRepository.findLearnersWithFilters(level, minScore, hasMentor);
    }

    public List<Learner> getTopLearners() {
        return learnerRepository.findTopLearnersByScore();
    }

    public List<Learner> getLearnersNeedingImprovement(BigDecimal threshold) {
        Objects.requireNonNull(threshold, "Threshold must not be null");
        if (threshold.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Threshold must be greater than or equal to zero");
        }
        return learnerRepository.findLearnersNeedingImprovement(threshold);
    }

    public List<Learner> getRecentlyActiveLearners(LocalDateTime cutoffDate) {
        Objects.requireNonNull(cutoffDate, "Cutoff date must not be null");
        return learnerRepository.findActiveLearners(cutoffDate);
    }

    @Transactional
    public LearnerResponse createLearner(LearnerRequest request) {
        Objects.requireNonNull(request, "Learner request must not be null");

        Long userId = request.getUserId();
        User user = getUser(userId);

        if (learnerRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("Learner for user id %d already exists".formatted(userId));
        }

        Mentor mentor = null;
        if (request.getMentorId() != null) {
            mentor = getMentor(request.getMentorId());
        }

        Learner learner = Learner.builder()
                .user(user)
                .mentor(mentor)
                .englishLevel(request.getEnglishLevel() != null ? request.getEnglishLevel() : EnglishLevel.A1)
                .learningGoals(request.getLearningGoals())
                .currentStreak(request.getCurrentStreak() != null ? request.getCurrentStreak() : 0)
                .totalPracticeHours(request.getTotalPracticeHours() != null ? request.getTotalPracticeHours() : BigDecimal.ZERO)
                .averagePronunciationScore(request.getAveragePronunciationScore() != null ? request.getAveragePronunciationScore() : BigDecimal.ZERO)
                .build();

        Learner saved = learnerRepository.save(learner);
        return toResponse(saved);
    }

    @Transactional
    public LearnerResponse updateLearner(Long id, LearnerRequest request) {
        Objects.requireNonNull(request, "Learner request must not be null");
        Learner existing = getLearnerEntityById(id);

        if (request.getEnglishLevel() != null) {
            existing.setEnglishLevel(request.getEnglishLevel());
        }
        if (request.getLearningGoals() != null) {
            existing.setLearningGoals(request.getLearningGoals());
        }
        if (request.getCurrentStreak() != null) {
            existing.setCurrentStreak(request.getCurrentStreak());
        }
        if (request.getTotalPracticeHours() != null) {
            existing.setTotalPracticeHours(request.getTotalPracticeHours());
        }
        if (request.getAveragePronunciationScore() != null) {
            existing.setAveragePronunciationScore(request.getAveragePronunciationScore());
        }

        if (request.getMentorId() != null) {
            Mentor mentor = getMentor(request.getMentorId());
            existing.setMentor(mentor);
        }

        Learner saved = learnerRepository.save(existing);
        return toResponse(saved);
    }

    @Transactional
    public void deleteLearner(Long id) {
        Learner existing = getLearnerEntityById(id);
        learnerRepository.delete(existing);
    }

    @Transactional
    public LearnerResponse assignMentor(Long learnerId, Long mentorId) {
        Learner learner = learnerRepository.findById(learnerId)
                .orElseThrow(() -> new EntityNotFoundException("Learner not found"));
        Mentor mentor = getMentor(mentorId);
        learner.setMentor(mentor);
        Learner saved = learnerRepository.save(learner);
        return toResponse(saved);
    }

    @Transactional
    public Learner unassignMentor(Long learnerId) {
        Learner learner = getLearnerEntityById(learnerId);
        learner.setMentor(null);
        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    @Transactional
    public Learner updateAveragePronunciationScore(Long learnerId, BigDecimal averageScore) {
        Learner learner = getLearnerEntityById(learnerId);
        if (averageScore != null) {
            learner.setAveragePronunciationScore(nonNegativeOrThrow(averageScore, "Average pronunciation score"));
        }
        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    @Transactional
    public Learner incrementPracticeHours(Long learnerId, BigDecimal hoursToAdd) {
        Objects.requireNonNull(hoursToAdd, "Hours to add must not be null");
        if (hoursToAdd.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Hours to add must be greater than zero");
        }

        Learner learner = getLearnerEntityById(learnerId);
        BigDecimal current = defaultBigDecimal(learner.getTotalPracticeHours());
        learner.setTotalPracticeHours(current.add(hoursToAdd));

        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    @Transactional
    public Learner incrementCurrentStreak(Long learnerId) {
        Learner learner = getLearnerEntityById(learnerId);
        int current = defaultStreak(learner.getCurrentStreak());
        learner.setCurrentStreak(current + 1);
        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    @Transactional
    public Learner resetCurrentStreak(Long learnerId) {
        Learner learner = getLearnerEntityById(learnerId);
        learner.setCurrentStreak(0);
        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    private User getUser(Long userId) {
        Objects.requireNonNull(userId, "User id must not be null");
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User with id %d not found".formatted(userId)));
    }

    private Mentor getMentor(Long mentorId) {
        Objects.requireNonNull(mentorId, "Mentor id must not be null");
        return mentorRepository.findById(mentorId)
                .orElseThrow(() -> new EntityNotFoundException("Mentor with id %d not found".formatted(mentorId)));
    }

    private void ensureMentorExists(Long mentorId) {
        Objects.requireNonNull(mentorId, "Mentor id must not be null");
        if (!mentorRepository.existsById(mentorId)) {
            throw new EntityNotFoundException("Mentor with id %d not found".formatted(mentorId));
        }
    }

    private void validateNonNegative(BigDecimal value, String fieldName) {
        if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than or equal to zero");
        }
    }

    private BigDecimal nonNegativeOrThrow(BigDecimal value, String fieldName) {
        validateNonNegative(value, fieldName);
        return value;
    }

    private BigDecimal defaultBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private int defaultStreak(Integer streak) {
        return streak != null ? streak : 0;
    }
    
    // Mapper method
    private LearnerResponse toResponse(Learner learner) {
        LearnerResponse response = new LearnerResponse();
        response.setId(learner.getId());
        response.setUserId(learner.getUser() != null ? learner.getUser().getId() : null);
        response.setMentorId(learner.getMentor() != null ? learner.getMentor().getId() : null);
        response.setFullName(learner.getUser() != null ? learner.getUser().getFullName() : null);
        response.setAvatarUrl(learner.getUser() != null ? learner.getUser().getAvatarUrl() : null);
        response.setEnglishLevel(learner.getEnglishLevel());
        response.setLearningGoals(learner.getLearningGoals());
        response.setCurrentStreak(learner.getCurrentStreak());
        response.setTotalPracticeHours(learner.getTotalPracticeHours());
        response.setAveragePronunciationScore(learner.getAveragePronunciationScore());
        response.setCreatedAt(learner.getJoinedAt());
        return response;
    }
}