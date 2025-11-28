package com.aesp.entity;

import com.aesp.enums.SessionStatus;
import com.aesp.enums.SessionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "practice_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"learner", "mentor", "mentorReviews"})
@EqualsAndHashCode(of = "id")
public class PracticeSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    private Learner learner;
    
    @ManyToOne
    @JoinColumn(name = "mentor_id")
    private Mentor mentor; // NULL cho AI sessions
    
    @ManyToOne
    @JoinColumn(name = "topic_id")
    private ConversationTopic topic;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal cost = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "session_status")
    @Builder.Default
    private SessionStatus sessionStatus = SessionStatus.SCHEDULED;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    @Builder.Default
    private List<MentorReview> mentorReviews = new ArrayList<>();
    
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

