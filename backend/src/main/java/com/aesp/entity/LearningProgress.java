package com.aesp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"learner"})
@EqualsAndHashCode(of = "id")
public class LearningProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    private Learner learner;
    
    @Column(name = "lesson_type", nullable = false, length = 50)
    private String lessonType;
    
    @Column(name = "lesson_title", nullable = false, length = 200)
    private String lessonTitle;
    
    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal score = BigDecimal.ZERO;
    
    @Column(name = "time_spent_minutes")
    @Builder.Default
    private Integer timeSpentMinutes = 0;
    
    @Column
    @Builder.Default
    private Integer attempts = 1;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "grammar_score", precision = 5, scale = 2)
    private BigDecimal grammarScore;

    @Column(name = "vocabulary_score", precision = 5, scale = 2)
    private BigDecimal vocabularyScore;

    @Column(name = "listening_score", precision = 5, scale = 2)
    private BigDecimal listeningScore;

    @Column(name = "speaking_score", precision = 5, scale = 2)
    private BigDecimal speakingScore;

    @Column(name = "progress_date")
    private LocalDateTime progressDate;


    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (progressDate == null) {
            progressDate = LocalDateTime.now();
        }
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}