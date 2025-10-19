package com.aesp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "mentor", "subscriptions", "learningProgresses", "practiceSessions"})
@EqualsAndHashCode(of = "id")
public class Learner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne
    @JoinColumn(name = "mentor_id")
    private Mentor mentor;

    @Enumerated(EnumType.STRING)
    @Column(name = "english_level")
    @Builder.Default
    private EnglishLevel englishLevel = EnglishLevel.BEGINNER;

    @Column(name = "learning_goals", columnDefinition = "TEXT")
    private String learningGoals;

    @Column(name = "current_streak")
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "total_practice_hours", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal totalPracticeHours = BigDecimal.ZERO;

    @Column(name = "pronunciation_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal pronunciationScore = BigDecimal.ZERO;

    @Column(name = "grammar_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal grammarScore = BigDecimal.ZERO;

    @Column(name = "vocabulary_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal vocabularyScore = BigDecimal.ZERO;

    @Column(name = "overall_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal overallScore = BigDecimal.ZERO;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "learner", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Subscription> subscriptions = new ArrayList<>();

    @OneToMany(mappedBy = "learner", cascade = CascadeType.ALL)
    @Builder.Default
    private List<LearningProgress> learningProgresses = new ArrayList<>();

    @OneToMany(mappedBy = "learner", cascade = CascadeType.ALL)
    @Builder.Default
    private List<PracticeSession> practiceSessions = new ArrayList<>();

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

enum EnglishLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED
}


