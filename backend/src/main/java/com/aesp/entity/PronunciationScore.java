package com.aesp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pronunciation_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"session", "learner"})
@EqualsAndHashCode(of = "id")
public class PronunciationScore {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private PracticeSession session;

    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    private Learner learner;

    @Column(name = "text_to_read", nullable = false, columnDefinition = "TEXT")
    private String textToRead;

    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @Column(name = "transcribed_text", columnDefinition = "TEXT")
    private String transcribedText;

    @Column(name = "accuracy_score")
    private Integer accuracyScore; // 0-100

    @Column(name = "fluency_score")
    private Integer fluencyScore; // 0-100

    @Column(name = "pronunciation_score")
    private Integer pronunciationScore; // 0-100

    @Column(name = "detailed_feedback", columnDefinition = "JSON")
    private String detailedFeedback; // JSON with word-level scores

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
