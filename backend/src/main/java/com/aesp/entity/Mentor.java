package com.aesp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.aesp.enums.EnglishLevel;

@Entity
@Table(name = "mentors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "learners", "practiceSessions", "mentorReviews"})
@EqualsAndHashCode(of = "id")
public class Mentor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "experience_years")
    @Builder.Default
    private Integer experienceYears = 0;
    
    @Column(name = "certification", length = 255)
    private String certification;
    
    @Column(name = "hourly_rate", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal hourlyRate = BigDecimal.ZERO;
    
    @Column(name = "rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;
    
    @Column(name = "total_students")
    @Builder.Default
    private Integer totalStudents = 0;
    
    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;
    
    // Relationships
    @OneToMany(mappedBy = "mentor", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Learner> learners = new ArrayList<>();
    
    @OneToMany(mappedBy = "mentor", cascade = CascadeType.ALL)
    @Builder.Default
    private List<PracticeSession> practiceSessions = new ArrayList<>();

    @OneToMany(mappedBy = "mentor", cascade = CascadeType.ALL)
    @Builder.Default
    private List<MentorReview> mentorReviews = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "mentor_skills", joinColumns = @JoinColumn(name = "mentor_id"))
    @Column(name = "skill")
    @Builder.Default
    private Set<String> skills = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "mentor_supported_levels", joinColumns = @JoinColumn(name = "mentor_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    @Builder.Default
    private Set<EnglishLevel> supportedLevels = new HashSet<>();
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}