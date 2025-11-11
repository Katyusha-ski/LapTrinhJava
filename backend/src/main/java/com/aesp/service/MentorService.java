package com.aesp.service;

import com.aesp.entity.Mentor;
import com.aesp.entity.User;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MentorService {

    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;

    public List<Mentor> getAllMentors() {
        return mentorRepository.findAll();
    }

    public Mentor getMentorById(Long id) {
        Objects.requireNonNull(id, "Mentor id must not be null");
        return mentorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mentor with id %d not found".formatted(id)));
    }

    public Mentor getMentorByUserId(Long userId) {
        Objects.requireNonNull(userId, "User id must not be null");
        return mentorRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Mentor with user id %d not found".formatted(userId)));
    }

    public List<Mentor> getAvailableMentors() {
        return mentorRepository.findByIsAvailableTrue();
    }

    public List<Mentor> getMentorsByExperience(Integer minYears) {
        Objects.requireNonNull(minYears, "Minimum years must not be null");
        if (minYears < 0) {
            throw new IllegalArgumentException("Minimum years must be greater than or equal to zero");
        }
        return mentorRepository.findByExperienceYearsGreaterThanEqual(minYears);
    }

    public List<Mentor> getMentorsByExperienceRange(Integer minYears, Integer maxYears) {
        Objects.requireNonNull(minYears, "Minimum years must not be null");
        Objects.requireNonNull(maxYears, "Maximum years must not be null");
        if (minYears < 0 || maxYears < 0) {
            throw new IllegalArgumentException("Years must be greater than or equal to zero");
        }
        if (minYears > maxYears) {
            throw new IllegalArgumentException("Minimum years must be less than or equal to maximum years");
        }
        return mentorRepository.findByExperienceYearsBetween(minYears, maxYears);
    }

    public List<Mentor> getMentorsByRating(BigDecimal minRating) {
        Objects.requireNonNull(minRating, "Minimum rating must not be null");
        if (minRating.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Minimum rating must be greater than or equal to zero");
        }
        return mentorRepository.findByRatingGreaterThanEqual(minRating);
    }

    public List<Mentor> getMentorsByRatingRange(BigDecimal minRating, BigDecimal maxRating) {
        Objects.requireNonNull(minRating, "Minimum rating must not be null");
        Objects.requireNonNull(maxRating, "Maximum rating must not be null");
        if (minRating.compareTo(BigDecimal.ZERO) < 0 || maxRating.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Rating must be greater than or equal to zero");
        }
        if (minRating.compareTo(maxRating) > 0) {
            throw new IllegalArgumentException("Minimum rating must be less than or equal to maximum rating");
        }
        return mentorRepository.findByRatingBetween(minRating, maxRating);
    }

    public List<Mentor> getMentorsByHourlyRate(BigDecimal maxRate) {
        Objects.requireNonNull(maxRate, "Maximum rate must not be null");
        if (maxRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Maximum rate must be greater than or equal to zero");
        }
        return mentorRepository.findByHourlyRateLessThanEqual(maxRate);
    }

    public List<Mentor> getMentorsByHourlyRateRange(BigDecimal minRate, BigDecimal maxRate) {
        Objects.requireNonNull(minRate, "Minimum rate must not be null");
        Objects.requireNonNull(maxRate, "Maximum rate must not be null");
        if (minRate.compareTo(BigDecimal.ZERO) < 0 || maxRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Rate must be greater than or equal to zero");
        }
        if (minRate.compareTo(maxRate) > 0) {
            throw new IllegalArgumentException("Minimum rate must be less than or equal to maximum rate");
        }
        return mentorRepository.findByHourlyRateBetween(minRate, maxRate);
    }

    public List<Mentor> getMentorsByCertification(String certification) {
        Objects.requireNonNull(certification, "Certification must not be null");
        if (certification.isBlank()) {
            throw new IllegalArgumentException("Certification must not be blank");
        }
        return mentorRepository.findByCertificationContainingIgnoreCase(certification);
    }

    public List<Mentor> getMentorsWithCertification() {
        return mentorRepository.findByCertificationIsNotNull();
    }

    public List<Mentor> getMentorsByTotalStudents(Integer minStudents) {
        Objects.requireNonNull(minStudents, "Minimum students must not be null");
        if (minStudents < 0) {
            throw new IllegalArgumentException("Minimum students must be greater than or equal to zero");
        }
        return mentorRepository.findByTotalStudentsGreaterThanEqual(minStudents);
    }

    public List<Mentor> searchMentors(BigDecimal minRating, BigDecimal maxRate, Integer minExperience) {
        return mentorRepository.findMentorsWithFilters(minRating, maxRate, minExperience);
    }

    public List<Mentor> getAvailableMentorsWithMinRating(BigDecimal minRating) {
        Objects.requireNonNull(minRating, "Minimum rating must not be null");
        if (minRating.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Minimum rating must be greater than or equal to zero");
        }
        return mentorRepository.findAvailableMentorsWithMinRating(minRating);
    }

    public List<Mentor> getAvailableMentorsWithinBudget(BigDecimal maxRate) {
        Objects.requireNonNull(maxRate, "Maximum rate must not be null");
        if (maxRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Maximum rate must be greater than or equal to zero");
        }
        return mentorRepository.findAvailableMentorsWithinBudget(maxRate);
    }

    public List<Mentor> getExperiencedAvailableMentors(Integer minYears) {
        Objects.requireNonNull(minYears, "Minimum years must not be null");
        if (minYears < 0) {
            throw new IllegalArgumentException("Minimum years must be greater than or equal to zero");
        }
        return mentorRepository.findExperiencedAvailableMentors(minYears);
    }

    public Long countAvailableMentors() {
        return mentorRepository.countAvailableMentors();
    }

    public Double getAverageRating() {
        return mentorRepository.getAverageRating();
    }

    public BigDecimal getAverageHourlyRate() {
        return mentorRepository.getAverageHourlyRate();
    }

    @Transactional
    public Mentor createMentor(Mentor request) {
        Objects.requireNonNull(request, "Mentor request must not be null");

        Long userId = extractUserId(request);
        User user = getUser(userId);

        if (mentorRepository.findByUserId(userId).isPresent()) {
            throw new IllegalArgumentException("Mentor for user id %d already exists".formatted(userId));
        }

        validateMentorMetrics(request);

        Mentor mentor = Mentor.builder()
                .user(user)
                .bio(request.getBio())
                .experienceYears(defaultInteger(request.getExperienceYears()))
                .certification(request.getCertification())
                .hourlyRate(defaultBigDecimal(request.getHourlyRate()))
                .rating(defaultBigDecimal(request.getRating()))
                .totalStudents(defaultInteger(request.getTotalStudents()))
                .isAvailable(defaultBoolean(request.getIsAvailable()))
                .build();

        return Objects.requireNonNull(mentorRepository.save(mentor));
    }

    @Transactional
    public Mentor updateMentor(Long id, Mentor request) {
        Objects.requireNonNull(request, "Mentor request must not be null");
        Mentor existing = getMentorById(id);

        validateMentorMetrics(request);

        if (request.getBio() != null) {
            existing.setBio(request.getBio());
        }
        if (request.getExperienceYears() != null) {
            existing.setExperienceYears(nonNegativeOrThrow(request.getExperienceYears(), "Experience years"));
        }
        if (request.getCertification() != null) {
            existing.setCertification(request.getCertification());
        }
        if (request.getHourlyRate() != null) {
            existing.setHourlyRate(nonNegativeOrThrow(request.getHourlyRate(), "Hourly rate"));
        }
        if (request.getRating() != null) {
            existing.setRating(nonNegativeOrThrow(request.getRating(), "Rating"));
        }
        if (request.getTotalStudents() != null) {
            existing.setTotalStudents(nonNegativeOrThrow(request.getTotalStudents(), "Total students"));
        }
        if (request.getIsAvailable() != null) {
            existing.setIsAvailable(request.getIsAvailable());
        }

        if (request.getUser() != null && request.getUser().getId() != null) {
            Long userId = request.getUser().getId();
            User user = getUser(userId);
            existing.setUser(user);
        }

        return Objects.requireNonNull(mentorRepository.save(existing));
    }

    @Transactional
    public void deleteMentor(Long id) {
        Mentor existing = getMentorById(id);
        mentorRepository.delete(existing);
    }

    @Transactional
    public Mentor updateAvailability(Long mentorId, Boolean isAvailable) {
        Objects.requireNonNull(isAvailable, "Availability status must not be null");
        Mentor mentor = getMentorById(mentorId);
        mentor.setIsAvailable(isAvailable);
        return Objects.requireNonNull(mentorRepository.save(mentor));
    }

    @Transactional
    public Mentor updateRating(Long mentorId, BigDecimal rating) {
        Objects.requireNonNull(rating, "Rating must not be null");
        if (rating.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Rating must be greater than or equal to zero");
        }
        Mentor mentor = getMentorById(mentorId);
        mentor.setRating(rating);
        return Objects.requireNonNull(mentorRepository.save(mentor));
    }

    @Transactional
    public Mentor updateHourlyRate(Long mentorId, BigDecimal hourlyRate) {
        Objects.requireNonNull(hourlyRate, "Hourly rate must not be null");
        if (hourlyRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Hourly rate must be greater than or equal to zero");
        }
        Mentor mentor = getMentorById(mentorId);
        mentor.setHourlyRate(hourlyRate);
        return Objects.requireNonNull(mentorRepository.save(mentor));
    }

    @Transactional
    public Mentor incrementTotalStudents(Long mentorId) {
        Mentor mentor = getMentorById(mentorId);
        int current = defaultInteger(mentor.getTotalStudents());
        mentor.setTotalStudents(current + 1);
        return Objects.requireNonNull(mentorRepository.save(mentor));
    }

    @Transactional
    public Mentor incrementExperienceYears(Long mentorId, Integer yearsToAdd) {
        Objects.requireNonNull(yearsToAdd, "Years to add must not be null");
        if (yearsToAdd <= 0) {
            throw new IllegalArgumentException("Years to add must be greater than zero");
        }
        Mentor mentor = getMentorById(mentorId);
        int current = defaultInteger(mentor.getExperienceYears());
        mentor.setExperienceYears(current + yearsToAdd);
        return Objects.requireNonNull(mentorRepository.save(mentor));
    }

    private Long extractUserId(Mentor request) {
        User user = Objects.requireNonNull(request.getUser(), "Mentor user must not be null");
        Long userId = Objects.requireNonNull(user.getId(), "User id must not be null");
        return userId;
    }

    private User getUser(Long userId) {
        Objects.requireNonNull(userId, "User id must not be null");
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User with id %d not found".formatted(userId)));
    }

    private void validateMentorMetrics(Mentor mentor) {
        validateNonNegative(mentor.getExperienceYears(), "Experience years");
        validateNonNegative(mentor.getHourlyRate(), "Hourly rate");
        validateNonNegative(mentor.getRating(), "Rating");
        validateNonNegative(mentor.getTotalStudents(), "Total students");
    }

    private void validateNonNegative(BigDecimal value, String fieldName) {
        if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than or equal to zero");
        }
    }

    private void validateNonNegative(Integer value, String fieldName) {
        if (value != null && value < 0) {
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

    private BigDecimal defaultBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private Integer defaultInteger(Integer value) {
        return value != null ? value : 0;
    }

    private Boolean defaultBoolean(Boolean value) {
        return value != null ? value : true;
    }
}

