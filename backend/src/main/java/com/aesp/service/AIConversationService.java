package com.aesp.service;

import com.aesp.dto.request.AIConversationRequest;
import com.aesp.dto.response.AIConversationResponse;
import com.aesp.entity.AIConversation;
import com.aesp.entity.PracticeSession;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.AIConversationRepository;
import com.aesp.repository.PracticeSessionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AIConversationService {

    private final AIConversationRepository repository;
    private final PracticeSessionRepository sessionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public AIConversationResponse saveMessage(AIConversationRequest request) {
        PracticeSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + request.getSessionId()));

        AIConversation.Speaker speaker = AIConversation.Speaker.valueOf(request.getSpeaker().toUpperCase());

        // Convert Lists to JSON strings
        String grammarErrorsJson = null;
        if (request.getGrammarErrors() != null && !request.getGrammarErrors().isEmpty()) {
            try {
                grammarErrorsJson = objectMapper.writeValueAsString(request.getGrammarErrors());
            } catch (JsonProcessingException e) {
                grammarErrorsJson = null;
            }
        }

        String vocabSuggestionsJson = null;
        if (request.getVocabularySuggestions() != null && !request.getVocabularySuggestions().isEmpty()) {
            try {
                vocabSuggestionsJson = objectMapper.writeValueAsString(request.getVocabularySuggestions());
            } catch (JsonProcessingException e) {
                vocabSuggestionsJson = null;
            }
        }

        AIConversation conversation = AIConversation.builder()
                .session(session)
                .speaker(speaker)
                .message(request.getMessage())
                .correctedMessage(request.getCorrectedMessage())
                .grammarErrors(grammarErrorsJson)
                .vocabularySuggestions(vocabSuggestionsJson)
                .build();

        AIConversation saved = repository.save(conversation);
        return toResponse(saved);
    }

    public List<AIConversationResponse> getConversationsBySession(Long sessionId) {
        return repository.findBySessionIdOrderByTimestampAsc(sessionId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AIConversationResponse> getRecentMessages(Long sessionId, int limit) {
        List<AIConversation> conversations = repository.findBySessionIdOrderByTimestampAsc(sessionId);
        List<AIConversationResponse> allResponses = conversations.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        Collections.reverse(allResponses);
        return allResponses.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    public AIConversationResponse getMessageById(Long id) {
        AIConversation conversation = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation message not found with id: " + id));
        return toResponse(conversation);
    }

    private AIConversationResponse toResponse(AIConversation conversation) {
        AIConversationResponse response = new AIConversationResponse();
        response.setId(conversation.getId());
        response.setSessionId(conversation.getSession().getId());
        response.setSpeaker(conversation.getSpeaker() != null ? conversation.getSpeaker().name() : null);
        response.setMessage(conversation.getMessage());
        response.setCorrectedMessage(conversation.getCorrectedMessage());
        response.setCreatedAt(conversation.getTimestamp());

        // Parse JSON to Lists
        if (conversation.getGrammarErrors() != null && !conversation.getGrammarErrors().isEmpty()) {
            try {
                @SuppressWarnings("unchecked")
                List<String> errors = objectMapper.readValue(conversation.getGrammarErrors(), List.class);
                response.setGrammarErrors(errors);
            } catch (JsonProcessingException e) {
                response.setGrammarErrors(new ArrayList<>());
            }
        } else {
            response.setGrammarErrors(new ArrayList<>());
        }

        if (conversation.getVocabularySuggestions() != null && !conversation.getVocabularySuggestions().isEmpty()) {
            try {
                @SuppressWarnings("unchecked")
                List<String> suggestions = objectMapper.readValue(conversation.getVocabularySuggestions(), List.class);
                response.setVocabularySuggestions(suggestions);
            } catch (JsonProcessingException e) {
                response.setVocabularySuggestions(new ArrayList<>());
            }
        } else {
            response.setVocabularySuggestions(new ArrayList<>());
        }

        return response;
    }
}
