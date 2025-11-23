package com.aesp.service.ai;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.aesp.config.OpenAiProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class OpenAiPronunciationClient {

    private final WebClient openAiWebClient;
    private final OpenAiProperties properties;
    private final ObjectMapper objectMapper;

    public boolean isEnabled() {
        return properties.hasUsableCredentials();
    }

    public PronunciationAnalysisResult analyzePronunciation(PronunciationAnalysisInput input) {
        if (!isEnabled()) {
            throw new AiServiceException("OpenAI integration is disabled or missing credentials");
        }

        String prompt = buildPrompt(input);
        Map<String, Object> body = buildRequestBody(prompt);

        try {
            Duration timeout = properties.getRequestTimeout();
            OpenAiChatResponse response = openAiWebClient.post()
                    .uri("/chat/completions")
                    .body(BodyInserters.fromValue(new HashMap<>(body)))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse -> clientResponse.createException().flatMap(Mono::error))
                    .bodyToMono(OpenAiChatResponse.class)
                    .block(timeout);

            if (response == null || response.choices() == null || response.choices().isEmpty()) {
                throw new AiServiceException("OpenAI returned an empty response");
            }

            String content = response.choices().get(0).message().content();
            if (!StringUtils.hasText(content)) {
                throw new AiServiceException("OpenAI response did not contain content");
            }

            JsonNode node = objectMapper.readTree(content);
            Map<String, Object> feedback = node.has("detailedFeedback") && node.get("detailedFeedback").isObject()
                    ? objectMapper.convertValue(node.get("detailedFeedback"), new TypeReference<Map<String, Object>>() {})
                    : Map.of();

            return new PronunciationAnalysisResult(
                    node.path("normalizedTranscript").asText(null),
                    readScore(node, "accuracyScore"),
                    readScore(node, "fluencyScore"),
                    readScore(node, "pronunciationScore"),
                    feedback);
        } catch (WebClientResponseException e) {
            throw new AiServiceException("OpenAI call failed with status " + e.getStatusCode(), e);
        } catch (Exception e) {
            throw new AiServiceException("Unable to parse OpenAI response", e);
        }
    }

    private Map<String, Object> buildRequestBody(String prompt) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", properties.getChatModel());
        body.put("temperature", 0.1);
        body.put("messages", List.of(
                Map.of("role", "system", "content",
                        "You are an English pronunciation coach. Return JSON only."),
                Map.of("role", "user", "content", prompt)));
        body.put("response_format", Map.of("type", "json_object"));
        return body;
    }

    private String buildPrompt(PronunciationAnalysisInput input) {
        StringBuilder builder = new StringBuilder();
        builder.append("Target text: \"")
                .append(input.referenceText())
                .append("\"\n");
        if (StringUtils.hasText(input.learnerTranscript())) {
            builder.append("Learner transcript: \"")
                    .append(input.learnerTranscript())
                    .append("\"\n");
        }
        if (StringUtils.hasText(input.audioUrl())) {
            builder.append("Audio URL: ").append(input.audioUrl()).append("\n");
        }
        input.languageCode().ifPresent(code -> builder.append("Language code: ").append(code).append("\n"));
        builder.append("Evaluate pronunciation accuracy, fluency, and overall clarity on a 0-100 scale. Provide concise feedback per issue in detailedFeedback map.");
        return builder.toString();
    }

    private Integer readScore(JsonNode node, String fieldName) {
        JsonNode scoreNode = node.path(fieldName);
        return scoreNode.isNumber() ? scoreNode.intValue() : null;
    }

    private record OpenAiChatResponse(List<Choice> choices) {}

    private record Choice(Message message) {}

    private record Message(String content) {}
}
