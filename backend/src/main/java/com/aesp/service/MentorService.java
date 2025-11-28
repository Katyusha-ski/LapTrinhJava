package com.aesp.service;

import com.aesp.dto.request.MentorRequest;
import com.aesp.dto.response.MentorResponse;
import com.aesp.entity.Mentor;
import com.aesp.entity.User;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.MentorRepository;
import com.aesp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import com.aesp.enums.EnglishLevel;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MentorService {

    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;
    private final LearnerRepository learnerRepository;

    public List<MentorResponse> getAllMentors() {
        return mentorRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public MentorResponse getMentorById(Long id) {
        Objects.requireNonNull(id, "Mentor id must not be null");
        Mentor mentor = mentorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mentor with id %d not found".formatted(id)));
        return toResponse(mentor);
    }

    private Mentor getMentorEntityById(Long id) {
        Objects.requireNonNull(id, "Mentor id must not be null");
        return mentorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mentor with id %d not found".formatted(id)));
    }

    public Mentor getMentorByUserId(Long userId) {
        Objects.requireNonNull(userId, "User id must not be null");
        return mentorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor with user id %d not found".formatted(userId)));
    }

    public MentorResponse getMentorProfileByUserId(Long userId) {
        Mentor mentor = getMentorByUserId(userId);
        return toResponse(mentor);
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
    public MentorResponse createMentor(MentorRequest request) {
        Objects.requireNonNull(request, "Mentor request must not be null");

        Long userId = request.getUserId();
        User user = getUser(userId);

        if (mentorRepository.findByUserId(userId).isPresent()) {
            throw new IllegalArgumentException("Mentor for user id %d already exists".formatted(userId));
        }

        Mentor mentor = Mentor.builder()
            .user(user)
            .bio(request.getBio())
            .experienceYears(defaultInteger(request.getExperienceYears()))
            .hourlyRate(defaultBigDecimal(request.getHourlyRate()))
            .rating(defaultBigDecimal(request.getRating()))
            .totalStudents(defaultInteger(request.getTotalStudents()))
            .isAvailable(defaultBoolean(request.getIsAvailable()))
            .skills(normalizeSkills(request.getSkills()))
            .supportedLevels(normalizeLevels(request.getSupportedLevels()))
            .build();

        Mentor saved = mentorRepository.save(Objects.requireNonNull(mentor));
        return toResponse(saved);
    }

    @Transactional
    public MentorResponse updateMentor(Long id, MentorRequest request) {
        Objects.requireNonNull(request, "Mentor request must not be null");
        Mentor existing = getMentorEntityById(id);

        if (request.getBio() != null) {
            existing.setBio(request.getBio());
        }
        if (request.getExperienceYears() != null) {
            existing.setExperienceYears(nonNegativeOrThrow(request.getExperienceYears(), "Experience years"));
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
        if (request.getSkills() != null) {
            existing.setSkills(normalizeSkills(request.getSkills()));
        }
        if (request.getSupportedLevels() != null) {
            existing.setSupportedLevels(normalizeLevels(request.getSupportedLevels()));
        }

        Mentor saved = mentorRepository.save(Objects.requireNonNull(existing));
        return toResponse(saved);
    }

    @Transactional
    public void deleteMentor(Long id) {
        Mentor existing = getMentorEntityById(id);
        mentorRepository.delete(Objects.requireNonNull(existing));
    }

    @Transactional
    public Mentor updateAvailability(Long mentorId, Boolean isAvailable) {
        Objects.requireNonNull(isAvailable, "Availability status must not be null");
        Mentor mentor = getMentorEntityById(mentorId);
        mentor.setIsAvailable(isAvailable);
        return Objects.requireNonNull(mentorRepository.save(mentor));
    }

    @Transactional
    public Mentor updateRating(Long mentorId, BigDecimal rating) {
        Objects.requireNonNull(rating, "Rating must not be null");
        if (rating.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Rating must be greater than or equal to zero");
        }
        Mentor mentor = getMentorEntityById(mentorId);
        mentor.setRating(rating);
        return Objects.requireNonNull(mentorRepository.save(mentor));
    }

    @Transactional
    public Mentor updateHourlyRate(Long mentorId, BigDecimal hourlyRate) {
        Objects.requireNonNull(hourlyRate, "Hourly rate must not be null");
        if (hourlyRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Hourly rate must be greater than or equal to zero");
        }
        Mentor mentor = getMentorEntityById(mentorId);
        mentor.setHourlyRate(hourlyRate);
        return Objects.requireNonNull(mentorRepository.save(mentor));
    }

    @Transactional
    public Mentor incrementTotalStudents(Long mentorId) {
        Mentor mentor = getMentorEntityById(mentorId);
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
        Mentor mentor = getMentorEntityById(mentorId);
        int current = defaultInteger(mentor.getExperienceYears());
        mentor.setExperienceYears(current + yearsToAdd);
        return Objects.requireNonNull(mentorRepository.save(mentor));
    }

    private User getUser(Long userId) {
        Objects.requireNonNull(userId, "User id must not be null");
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User with id %d not found".formatted(userId)));
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

    private BigDecimal defaultBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private Integer defaultInteger(Integer value) {
        return value != null ? value : 0;
    }

    private Boolean defaultBoolean(Boolean value) {
        return value != null ? value : true;
    }

    @Transactional
    public MentorResponse toggleAvailability(Long id) {
        Mentor mentor = getMentorEntityById(id);
        mentor.setIsAvailable(!mentor.getIsAvailable());
        Mentor saved = mentorRepository.save(mentor);
        return toResponse(saved);
    }

    private MentorResponse toResponse(Mentor mentor) {
        MentorResponse response = new MentorResponse();
        response.setId(mentor.getId());
        response.setUserId(mentor.getUser() != null ? mentor.getUser().getId() : null);
        response.setFullName(mentor.getUser() != null ? mentor.getUser().getFullName() : null);
        response.setAvatarUrl(mentor.getUser() != null ? mentor.getUser().getAvatarUrl() : null);
        response.setBio(mentor.getBio());
        response.setExperienceYears(mentor.getExperienceYears());
        response.setHourlyRate(mentor.getHourlyRate());
        response.setRating(mentor.getRating());
        response.setTotalStudents(calculateAssignedLearners(mentor));
        response.setIsAvailable(mentor.getIsAvailable());
        response.setSkills(mentor.getSkills() != null ? new HashSet<>(mentor.getSkills()) : Set.of());
        response.setSupportedLevels(mentor.getSupportedLevels() != null ? new HashSet<>(mentor.getSupportedLevels()) : Set.of());
        return response;
    }

    private Integer calculateAssignedLearners(Mentor mentor) {
        if (mentor.getId() == null) {
            return mentor.getTotalStudents();
        }
        Long counted = learnerRepository.countByMentorId(mentor.getId());
        if (counted == null) {
            return 0;
        }
        if (counted > Integer.MAX_VALUE) {
            return Integer.MAX_VALUE;
        }
        return counted.intValue();
    }

    public List<MentorResponse> searchAdvanced(String skill,
                                               EnglishLevel level,
                                               BigDecimal minRating,
                                               BigDecimal maxRate,
                                               boolean onlyAvailable) {
        return mentorRepository.searchMentorsAdvanced(
                        skill != null && !skill.isBlank() ? skill.trim() : null,
                        level,
                        minRating,
                        maxRate,
                        onlyAvailable)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Set<String> normalizeSkills(Set<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return new HashSet<>();
        }
        return skills.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(HashSet::new,
                        (set, value) -> set.add(value),
                        (left, right) -> left.addAll(right));
    }

    private Set<EnglishLevel> normalizeLevels(Set<EnglishLevel> levels) {
        if (levels == null || levels.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(levels);
    }
}

