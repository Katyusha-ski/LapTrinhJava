package com.aesp.repository;

import com.aesp.entity.ConversationTopic;
import com.aesp.enums.EnglishLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationTopicRepository extends JpaRepository<ConversationTopic, Long> {
    
    /**
     * Find all active topics
     */
    List<ConversationTopic> findByIsActiveTrue();
    
    /**
     * Find topics by category
     */
    List<ConversationTopic> findByCategoryAndIsActiveTrue(String category);
    
    /**
     * Find topics by level
     */
    List<ConversationTopic> findByLevelAndIsActiveTrue(EnglishLevel level);
    
    /**
     * Find topics by category and level
     */
    List<ConversationTopic> findByCategoryAndLevelAndIsActiveTrue(String category, EnglishLevel level);
    
    /**
     * Search topics by name or description
     */
    @Query("SELECT t FROM ConversationTopic t WHERE t.isActive = true AND " +
           "(LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<ConversationTopic> searchByKeyword(@Param("keyword") String keyword);
    
    /**
     * Get all distinct categories
     */
    @Query("SELECT DISTINCT t.category FROM ConversationTopic t WHERE t.isActive = true ORDER BY t.category")
    List<String> findAllCategories();
}
