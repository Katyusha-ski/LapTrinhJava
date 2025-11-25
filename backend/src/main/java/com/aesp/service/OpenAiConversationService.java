package com.aesp.service;

import com.aesp.entity.AIConversation;
import com.aesp.entity.ConversationTopic;
import com.aesp.entity.PracticeSession;
import com.aesp.repository.AIConversationRepository;
import com.aesp.repository.PracticeSessionRepository;
import com.aesp.service.ai.OpenAiPronunciationClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenAiConversationService {

    private final OpenAiPronunciationClient openAiClient;
    private final AIConversationRepository aiConversationRepository;
    private final ConversationTopicService topicService;
    private final PracticeSessionRepository sessionRepository;

    public String generateFirstQuestion(Long topicId) {
        try{
            ConversationTopic topic = topicService.getTopicEntityById(topicId);
            String prompt =  buildFirstQuestionPrompt(topic);
            String response = openAiClient.callOpenAiApi(prompt);
            log.info("Generated first question: {}", topicId);
            return response;
            
        } catch (Exception e) {
            log.error("Error generating first question: {}", e.getMessage());
            throw new RuntimeException("Failed to generate first question", e);
        }
    }

    public String generateResponse(Long sessionId, String userMessage) {
        try {
            PracticeSession session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            
            ConversationTopic topic = session.getTopic();
            
            List<AIConversation> conversationHistory = aiConversationRepository
                    .findBySessionOrderByTimestampAsc(session);
            
            String prompt = buildResponsePrompt(
                    topic, 
                    userMessage, 
                    conversationHistory
            );
            
            String response = openAiClient.callOpenAiApi(prompt);
            
            log.info("Generated response for session: {}", sessionId);
            return response;
            
        } catch (Exception e) {
            log.error("Error generating response: {}", e.getMessage());
            throw new RuntimeException("Failed to generate response", e);
        }
    }

    public String generateFeedback(String userMessage, String correctMessage) {
        try {
            String prompt = buildFeedbackPrompt(userMessage, correctMessage);
            
            String feedback = openAiClient.callOpenAiApi(prompt);
            
            log.info("Generated feedback for user message");
            return feedback;
            
        } catch (Exception e) {
            log.error("Error generating feedback: {}", e.getMessage());
            throw new RuntimeException("Failed to generate feedback", e);
        }
    }

    private String buildFirstQuestionPrompt(ConversationTopic topic) {
        return String.format(
            "You are an English speaking tutor. " +
            "The user wants to practice English conversation. " +
            "Topic: %s (Level: %s). " +
            "Generate an opening question to start the conversation. " +
            "Keep it simple and encouraging. " +
            "Response should be 1-2 sentences only.",
            topic.getName(),
            topic.getLevel()
        );
    }

    private String buildResponsePrompt(
            ConversationTopic topic,
            String userMessage,
            List<AIConversation> history) {
        
        String historyContext = history.stream()
                .limit(5)
                .map(conv -> conv.getSpeaker() + ": " + conv.getMessage())
                .collect(Collectors.joining("\n"));
        
        return String.format(
            "You are an English speaking tutor. " +
            "Topic: %s (Level: %s). " +
            "Previous conversation:\n%s\n\n" +
            "User just said: %s\n\n" +
            "Generate a natural response to continue the conversation. " +
            "Keep it 1-2 sentences. " +
            "Ask follow-up questions when appropriate.",
            topic.getName(),
            topic.getLevel(),
            historyContext,
            userMessage
        );
    }

    private String buildFeedbackPrompt(String userMessage, String correctMessage) {
        return String.format(
            "You are an English pronunciation and grammar tutor. " +
            "User said: \"%s\"\n\n" +
            "Should be: \"%s\"\n\n" +
            "Provide brief, constructive feedback on grammar and pronunciation. " +
            "Be encouraging. " +
            "Keep feedback to 1-2 sentences.",
            userMessage,
            correctMessage
        );
    }
}
