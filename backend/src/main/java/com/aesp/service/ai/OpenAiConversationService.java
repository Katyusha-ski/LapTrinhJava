package com.aesp.service.ai;

import com.aesp.entity.AIConversation;
import com.aesp.entity.ConversationTopic;
import com.aesp.entity.PracticeSession;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.AIConversationRepository;
import com.aesp.repository.PracticeSessionRepository;
import com.aesp.service.ConversationTopicService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenAiConversationService {

    private final OpenAiPronunciationClient openAiClient;
    private final ConversationTopicService topicService;
    private final AIConversationRepository conversationRepository;
    private final PracticeSessionRepository sessionRepository;

    public String generateFirstQuestion(Long topicId) {
        try {
            ConversationTopic topic = topicService.getTopicEntityById(topicId);
            String prompt = buildFirstQuestionPrompt(topic);
            String response = openAiClient.callOpenAiApi(prompt);

            log.info("Generated first question for topic: {}", topic.getName());
            return response;
        } catch (ResourceNotFoundException e) {
            log.error("Topic not found with id: {}", topicId);
            throw e;
        } catch (Exception e) {
            log.error("Error generating first question", e);
            throw new RuntimeException("Failed to generate first question", e);
        }
    }

    public String generateResponse(Long sessionId, String userMessage) {
        try {
            PracticeSession session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

            List<AIConversation> conversationHistory = conversationRepository
                    .findBySessionOrderByTimestampAsc(session);

            ConversationTopic topic = session.getTopic();
            String prompt = buildResponsePrompt(topic, userMessage, conversationHistory);
            String response = openAiClient.callOpenAiApi(prompt);

            log.info("Generated response for session: {}", sessionId);
            return response;
        } catch (Exception e) {
            log.error("Error generating response for session: {}", sessionId, e);
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
            log.error("Error generating feedback", e);
            throw new RuntimeException("Failed to generate feedback", e);
        }
    }

    private String buildFirstQuestionPrompt(ConversationTopic topic) {
        return String.format(
                """
                You are an English speaking coach. Generate an opening question for a %s level conversation about "%s".
                The question should be engaging, clear, and encourage the student to speak naturally.
                Format: Just the question, no additional text.
                """,
                topic.getLevel(),
                topic.getName()
        );
    }

    private String buildResponsePrompt(ConversationTopic topic, String userMessage, List<AIConversation> history) {
        StringBuilder historyContext = new StringBuilder();

        // Lấy 5 tin nhắn gần nhất từ history
        history.stream()
                .limit(5)
                .forEach(conv -> historyContext.append("- ").append(conv.getSpeaker()).append(": ").append(conv.getMessage()).append("\n"));

        return String.format(
                """
                You are an English speaking coach. The conversation is about "%s" at %s level.
                
                Recent conversation history:
                %s
                
                Student's latest message: "%s"
                
                Respond naturally as a coach, providing encouragement and guidance.
                Keep your response concise (1-2 sentences).
                Format: Just your response, no meta-text.
                """,
                topic.getName(),
                topic.getLevel(),
                historyContext.toString(),
                userMessage
        );
    }

    private String buildFeedbackPrompt(String userMessage, String correctMessage) {
        return String.format(
                """
                Provide constructive feedback for this English speech practice:
                
                What the student said: "%s"
                Target phrase: "%s"
                
                Feedback should include:
                1. Pronunciation assessment (correct/needs work)
                2. Grammar assessment if applicable
                3. One specific tip for improvement
                
                Keep it encouraging and concise (3-4 sentences).
                """,
                userMessage,
                correctMessage
        );
    }
}
