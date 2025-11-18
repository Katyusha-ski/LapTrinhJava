package com.aesp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"session"})
@EqualsAndHashCode(of = "id")
public class AIConversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private PracticeSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Speaker speaker;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "corrected_message", columnDefinition = "TEXT")
    private String correctedMessage;

    @Column(name = "grammar_errors", columnDefinition = "JSON")
    private String grammarErrors; // JSON array of error objects

    @Column(name = "vocabulary_suggestions", columnDefinition = "JSON")
    private String vocabularySuggestions; // JSON array of suggestion objects

    @Column(name = "created_at", nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public enum Speaker {
        USER, AI
    }
}
