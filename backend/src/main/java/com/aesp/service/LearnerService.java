package com.aesp.service;

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

    public List<Learner> getAllLearners() {
        return learnerRepository.findAll();
    }

    public Learner getLearnerById(Long id) {
        Objects.requireNonNull(id, "Learner id must not be null");
        return learnerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Learner with id %d not found".formatted(id)));
    }

    public Learner getLearnerByUserId(Long userId) {
        Objects.requireNonNull(userId, "User id must not be null");
        return learnerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Learner with user id %d not found".formatted(userId)));
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
    public Learner createLearner(Learner request) {
        Objects.requireNonNull(request, "Learner request must not be null");

        Long userId = extractUserId(request);
        User user = getUser(userId);

        if (learnerRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("Learner for user id %d already exists".formatted(userId));
        }

        Mentor mentor = null;
        if (request.getMentor() != null) {
            Long mentorId = request.getMentor().getId();
            if (mentorId != null) {
                mentor = getMentor(mentorId);
            }
        }

        validateLearnerMetrics(request);

        Learner learner = Learner.builder()
                .user(user)
                .mentor(mentor)
                .englishLevel(defaultEnglishLevel(request.getEnglishLevel()))
                .learningGoals(request.getLearningGoals())
                .currentStreak(defaultStreak(request.getCurrentStreak()))
                .totalPracticeHours(defaultBigDecimal(request.getTotalPracticeHours()))
                .pronunciationScore(defaultBigDecimal(request.getPronunciationScore()))
                .grammarScore(defaultBigDecimal(request.getGrammarScore()))
                .vocabularyScore(defaultBigDecimal(request.getVocabularyScore()))
                .overallScore(defaultBigDecimal(request.getOverallScore()))
                .build();

        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    @Transactional
    public Learner updateLearner(Long id, Learner request) {
        Objects.requireNonNull(request, "Learner request must not be null");
        Learner existing = getLearnerById(id);

        validateLearnerMetrics(request);

        if (request.getEnglishLevel() != null) {
            existing.setEnglishLevel(request.getEnglishLevel());
        }
        existing.setLearningGoals(request.getLearningGoals());
        if (request.getCurrentStreak() != null) {
            existing.setCurrentStreak(nonNegativeOrThrow(request.getCurrentStreak(), "Current streak"));
        }
        if (request.getTotalPracticeHours() != null) {
            existing.setTotalPracticeHours(nonNegativeOrThrow(request.getTotalPracticeHours(), "Total practice hours"));
        }
        if (request.getPronunciationScore() != null) {
            existing.setPronunciationScore(nonNegativeOrThrow(request.getPronunciationScore(), "Pronunciation score"));
        }
        if (request.getGrammarScore() != null) {
            existing.setGrammarScore(nonNegativeOrThrow(request.getGrammarScore(), "Grammar score"));
        }
        if (request.getVocabularyScore() != null) {
            existing.setVocabularyScore(nonNegativeOrThrow(request.getVocabularyScore(), "Vocabulary score"));
        }
        if (request.getOverallScore() != null) {
            existing.setOverallScore(nonNegativeOrThrow(request.getOverallScore(), "Overall score"));
        }

        if (request.getMentor() != null) {
            Long mentorId = request.getMentor().getId();
            Mentor mentor = mentorId == null ? null : getMentor(mentorId);
            existing.setMentor(mentor);
        }

        if (request.getUser() != null && request.getUser().getId() != null) {
            Long userId = request.getUser().getId();
            User user = getUser(userId);
            existing.setUser(user);
        }

        return Objects.requireNonNull(learnerRepository.save(existing));
    }

    @Transactional
    public void deleteLearner(Long id) {
        Learner existing = getLearnerById(id);
        learnerRepository.delete(existing);
    }

    @Transactional
    public Learner assignMentor(Long learnerId, Long mentorId) {
        Learner learner = getLearnerById(learnerId);
        Mentor mentor = getMentor(mentorId);
        learner.setMentor(mentor);
        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    @Transactional
    public Learner unassignMentor(Long learnerId) {
        Learner learner = getLearnerById(learnerId);
        learner.setMentor(null);
        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    @Transactional
    public Learner updatePerformanceScores(Long learnerId,
                                           BigDecimal pronunciationScore,
                                           BigDecimal grammarScore,
                                           BigDecimal vocabularyScore,
                                           BigDecimal overallScore) {
        Learner learner = getLearnerById(learnerId);

        if (pronunciationScore != null) {
            learner.setPronunciationScore(nonNegativeOrThrow(pronunciationScore, "Pronunciation score"));
        }
        if (grammarScore != null) {
            learner.setGrammarScore(nonNegativeOrThrow(grammarScore, "Grammar score"));
        }
        if (vocabularyScore != null) {
            learner.setVocabularyScore(nonNegativeOrThrow(vocabularyScore, "Vocabulary score"));
        }
        if (overallScore != null) {
            learner.setOverallScore(nonNegativeOrThrow(overallScore, "Overall score"));
        }

        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    @Transactional
    public Learner incrementPracticeHours(Long learnerId, BigDecimal hoursToAdd) {
        Objects.requireNonNull(hoursToAdd, "Hours to add must not be null");
        if (hoursToAdd.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Hours to add must be greater than zero");
        }

        Learner learner = getLearnerById(learnerId);
        BigDecimal current = defaultBigDecimal(learner.getTotalPracticeHours());
        learner.setTotalPracticeHours(current.add(hoursToAdd));

        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    @Transactional
    public Learner incrementCurrentStreak(Long learnerId) {
        Learner learner = getLearnerById(learnerId);
        int current = defaultStreak(learner.getCurrentStreak());
        learner.setCurrentStreak(current + 1);
        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    @Transactional
    public Learner resetCurrentStreak(Long learnerId) {
        Learner learner = getLearnerById(learnerId);
        learner.setCurrentStreak(0);
        return Objects.requireNonNull(learnerRepository.save(learner));
    }

    private Long extractUserId(Learner request) {
        User user = Objects.requireNonNull(request.getUser(), "Learner user must not be null");
        Long userId = Objects.requireNonNull(user.getId(), "User id must not be null");
        return userId;
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

    private void validateLearnerMetrics(Learner learner) {
        if (learner.getCurrentStreak() != null && learner.getCurrentStreak() < 0) {
            throw new IllegalArgumentException("Current streak must be greater than or equal to zero");
        }
        validateNonNegative(learner.getTotalPracticeHours(), "Total practice hours");
        validateNonNegative(learner.getPronunciationScore(), "Pronunciation score");
        validateNonNegative(learner.getGrammarScore(), "Grammar score");
        validateNonNegative(learner.getVocabularyScore(), "Vocabulary score");
        validateNonNegative(learner.getOverallScore(), "Overall score");
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

    private Integer nonNegativeOrThrow(Integer value, String fieldName) {
        if (value == null) {
            return null;
        }
        if (value < 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than or equal to zero");
        }
        return value;
    }

    private EnglishLevel defaultEnglishLevel(EnglishLevel level) {
        return level != null ? level : EnglishLevel.BEGINNER;
    }

    private BigDecimal defaultBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private int defaultStreak(Integer streak) {
        return streak != null ? streak : 0;
    }
}