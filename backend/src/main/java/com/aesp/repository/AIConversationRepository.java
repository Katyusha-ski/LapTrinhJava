package com.aesp.repository;

import com.aesp.entity.AIConversation;
import com.aesp.entity.PracticeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AIConversationRepository extends JpaRepository<AIConversation, Long> {
    
    // Find all conversations in a session
    List<AIConversation> findBySessionOrderByTimestampAsc(PracticeSession session);
    
    List<AIConversation> findBySessionIdOrderByTimestampAsc(Long sessionId);
    
    // Find conversations by speaker
    List<AIConversation> findBySessionIdAndSpeaker(Long sessionId, AIConversation.Speaker speaker);
    
    // Find conversations with corrections
    @Query("SELECT c FROM AIConversation c WHERE c.session.id = :sessionId AND c.correctedMessage IS NOT NULL")
    List<AIConversation> findConversationsWithCorrections(@Param("sessionId") Long sessionId);
    
    // Find conversations by learner
    @Query("SELECT c FROM AIConversation c WHERE c.session.learner.id = :learnerId ORDER BY c.timestamp DESC")
    List<AIConversation> findByLearnerId(@Param("learnerId") Long learnerId);
    
    // Count messages in a session
    Long countBySessionId(Long sessionId);
    
    // Find recent conversations
    @Query("SELECT c FROM AIConversation c WHERE c.timestamp >= :since ORDER BY c.timestamp DESC")
    List<AIConversation> findRecentConversations(@Param("since") LocalDateTime since);
}
