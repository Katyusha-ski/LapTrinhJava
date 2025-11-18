package com.aesp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationTopicResponse {
    private Long id;
    private String name;
    private String category;
    private String level; // A1, A2, B1, B2, C1, C2
    private String description;
    private List<String> sampleQuestions;
    private List<String> difficultyKeywords;
    private Boolean isActive;
}
