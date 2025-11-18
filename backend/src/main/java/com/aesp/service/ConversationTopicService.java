package com.aesp.service;

import com.aesp.dto.response.ConversationTopicResponse;
import com.aesp.entity.ConversationTopic;
import com.aesp.enums.EnglishLevel;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.ConversationTopicRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConversationTopicService {

    private final ConversationTopicRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ConversationTopicResponse> getAllActiveTopics() {
        return repository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ConversationTopicResponse> getAllTopics() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ConversationTopicResponse getTopicById(Long id) {
        ConversationTopic topic = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));
        return toResponse(topic);
    }

    public List<ConversationTopicResponse> getTopicsByLevel(EnglishLevel level) {
        return repository.findByLevelAndIsActiveTrue(level).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ConversationTopicResponse> getTopicsByCategory(String category) {
        return repository.findByCategoryAndIsActiveTrue(category).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ConversationTopicResponse> getTopicsByCategoryAndLevel(String category, EnglishLevel level) {
        return repository.findByCategoryAndLevelAndIsActiveTrue(category, level).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ConversationTopicResponse toResponse(ConversationTopic topic) {
        ConversationTopicResponse response = new ConversationTopicResponse();
        response.setId(topic.getId());
        response.setName(topic.getName());
        response.setCategory(topic.getCategory());
        response.setLevel(topic.getLevel() != null ? topic.getLevel().name() : null);
        response.setDescription(topic.getDescription());
        response.setIsActive(topic.getIsActive());

        // Parse JSON to List<String>
        if (topic.getSampleQuestions() != null && !topic.getSampleQuestions().isEmpty()) {
            try {
                @SuppressWarnings("unchecked")
                List<String> questions = objectMapper.readValue(topic.getSampleQuestions(), List.class);
                response.setSampleQuestions(questions);
            } catch (JsonProcessingException e) {
                response.setSampleQuestions(new ArrayList<>());
            }
        } else {
            response.setSampleQuestions(new ArrayList<>());
        }

        if (topic.getDifficultyKeywords() != null && !topic.getDifficultyKeywords().isEmpty()) {
            try {
                @SuppressWarnings("unchecked")
                List<String> keywords = objectMapper.readValue(topic.getDifficultyKeywords(), List.class);
                response.setDifficultyKeywords(keywords);
            } catch (JsonProcessingException e) {
                response.setDifficultyKeywords(new ArrayList<>());
            }
        } else {
            response.setDifficultyKeywords(new ArrayList<>());
        }

        return response;
    }
}
