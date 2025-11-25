package com.aesp.service.ai;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenAiPronunciationClient {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${huggingface.api.key}")
    private String huggingfaceApiKey;

    private final ObjectMapper objectMapper;

    // Groq API endpoints
    private static final String GROQ_API_BASE = "https://api.groq.com/openai/v1";
    private static final String GROQ_CHAT_ENDPOINT = GROQ_API_BASE + "/chat/completions";

    // Hugging Face API endpoints
    private static final String HF_API_BASE = "https://api-inference.huggingface.co/models";
    private static final String HF_WHISPER_MODEL = HF_API_BASE + "/openai/whisper-large-v3";
    private static final String HF_TTS_MODEL = HF_API_BASE + "/espnet/kan-bayashi_ljspeech_vits";

    public boolean isEnabled() {
        return StringUtils.hasText(groqApiKey) && StringUtils.hasText(huggingfaceApiKey);
    }

    /**
     * Call Groq API for chat/text generation
     */
    public String callOpenAiApi(String prompt) {
        if (!isEnabled()) {
            throw new AiServiceException("Groq/Hugging Face integration is disabled or missing credentials");
        }

        Map<String, Object> body = buildGroqRequestBody(prompt);

        try {
            String response = callGroqApi(GROQ_CHAT_ENDPOINT, body);
            JsonNode rootNode = objectMapper.readTree(response);
            
            if (rootNode.has("choices") && rootNode.get("choices").isArray() && rootNode.get("choices").size() > 0) {
                String content = rootNode.get("choices").get(0).get("message").get("content").asText();
                if (StringUtils.hasText(content)) {
                    return content;
                }
            }
            throw new AiServiceException("Groq returned an empty response");
        } catch (Exception e) {
            log.error("Failed to call Groq API", e);
            throw new AiServiceException("Unable to call Groq API", e);
        }
    }

    /**
     * Transcribe audio using Hugging Face Whisper
     */
    public String transcribeAudio(byte[] audioData, String fileName) {
        if (!isEnabled()) {
            throw new AiServiceException("Hugging Face integration is disabled or missing credentials");
        }

        try {
            HttpClient httpClient = HttpClients.createDefault();
            HttpPost httpPost = new HttpPost(HF_WHISPER_MODEL);
            httpPost.setHeader("Authorization", "Bearer " + huggingfaceApiKey);
            httpPost.setEntity(new org.apache.hc.core5.http.io.entity.ByteArrayEntity(
                    audioData, 
                    ContentType.create("audio/wav")
            ));

            return httpClient.execute(httpPost, response -> {
                int statusCode = response.getCode();
                if (statusCode != 200) {
                    throw new AiServiceException("Hugging Face Whisper API returned status " + statusCode);
                }
                
                String responseBody = new String(response.getEntity().getContent().readAllBytes(), StandardCharsets.UTF_8);
                JsonNode resultNode = objectMapper.readTree(responseBody);
                
                if (resultNode.has("text")) {
                    return resultNode.get("text").asText("");
                }
                return "";
            });
        } catch (IOException e) {
            log.error("Failed to transcribe audio with Hugging Face", e);
            throw new AiServiceException("Failed to transcribe audio", e);
        }
    }

    /**
     * Generate speech audio using Hugging Face TTS
     */
    public byte[] textToSpeech(String text) {
        if (!isEnabled()) {
            throw new AiServiceException("Hugging Face integration is disabled or missing credentials");
        }

        try {
            HttpClient httpClient = HttpClients.createDefault();
            HttpPost httpPost = new HttpPost(HF_TTS_MODEL);
            httpPost.setHeader("Authorization", "Bearer " + huggingfaceApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("inputs", text);
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            
            httpPost.setEntity(new StringEntity(jsonBody, ContentType.APPLICATION_JSON));

            return httpClient.execute(httpPost, response -> {
                int statusCode = response.getCode();
                if (statusCode != 200) {
                    throw new AiServiceException("Hugging Face TTS API returned status " + statusCode);
                }
                
                return response.getEntity().getContent().readAllBytes();
            });
        } catch (IOException e) {
            log.error("Failed to generate speech with Hugging Face", e);
            throw new AiServiceException("Failed to generate speech", e);
        }
    }

    /**
     * Analyze pronunciation using Groq
     */
    public PronunciationAnalysisResult analyzePronunciation(PronunciationAnalysisInput input) {
        if (!isEnabled()) {
            throw new AiServiceException("Groq/Hugging Face integration is disabled or missing credentials");
        }

        String prompt = buildAnalysisPrompt(input);
        Map<String, Object> body = buildGroqAnalysisRequestBody(prompt);

        try {
            String response = callGroqApi(GROQ_CHAT_ENDPOINT, body);
            JsonNode rootNode = objectMapper.readTree(response);
            
            if (rootNode.has("choices") && rootNode.get("choices").isArray() && rootNode.get("choices").size() > 0) {
                String content = rootNode.get("choices").get(0).get("message").get("content").asText();
                JsonNode analysisNode = objectMapper.readTree(content);
                
                Map<String, Object> feedback = analysisNode.has("detailedFeedback") && analysisNode.get("detailedFeedback").isObject()
                        ? objectMapper.convertValue(analysisNode.get("detailedFeedback"), new TypeReference<Map<String, Object>>() {})
                        : Map.of();

                return new PronunciationAnalysisResult(
                        analysisNode.path("normalizedTranscript").asText(null),
                        readScore(analysisNode, "accuracyScore"),
                        readScore(analysisNode, "fluencyScore"),
                        readScore(analysisNode, "pronunciationScore"),
                        feedback);
            }
            throw new AiServiceException("Groq returned an empty analysis response");
        } catch (Exception e) {
            log.error("Failed to analyze pronunciation with Groq", e);
            throw new AiServiceException("Unable to analyze pronunciation", e);
        }
    }

    /**
     * Call Groq API via HTTP
     */
    private String callGroqApi(String endpoint, Map<String, Object> requestBody) throws IOException {
        HttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost(endpoint);
        httpPost.setHeader("Authorization", "Bearer " + groqApiKey);
        httpPost.setHeader("Content-Type", "application/json");

        String jsonBody = objectMapper.writeValueAsString(requestBody);
        httpPost.setEntity(new StringEntity(jsonBody, ContentType.APPLICATION_JSON));

        return httpClient.execute(httpPost, response -> {
            int statusCode = response.getCode();
            if (statusCode != 200) {
                log.error("Groq API error: Status {}", statusCode);
                throw new AiServiceException("Groq API returned status " + statusCode);
            }
            return new String(response.getEntity().getContent().readAllBytes(), StandardCharsets.UTF_8);
        });
    }

    /**
     * Build request body for Groq chat API
     */
    private Map<String, Object> buildGroqRequestBody(String prompt) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", "mixtral-8x7b-32768"); // Groq's fast model
        body.put("temperature", 0.7);
        body.put("messages", List.of(
                Map.of("role", "system", "content",
                        "You are a helpful English conversation partner and speaking coach."),
                Map.of("role", "user", "content", prompt)));
        return body;
    }

    /**
     * Build request body for Groq analysis API
     */
    private Map<String, Object> buildGroqAnalysisRequestBody(String prompt) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", "mixtral-8x7b-32768");
        body.put("temperature", 0.1);
        body.put("messages", List.of(
                Map.of("role", "system", "content",
                        "You are an English pronunciation coach. Return JSON only."),
                Map.of("role", "user", "content", prompt)));
        return body;
    }

    /**
     * Build prompt for pronunciation analysis
     */
    private String buildAnalysisPrompt(PronunciationAnalysisInput input) {
        StringBuilder builder = new StringBuilder();
        builder.append("Target text: \"").append(input.referenceText()).append("\"\n");
        if (StringUtils.hasText(input.learnerTranscript())) {
            builder.append("Learner transcript: \"").append(input.learnerTranscript()).append("\"\n");
        }
        if (StringUtils.hasText(input.audioUrl())) {
            builder.append("Audio URL: ").append(input.audioUrl()).append("\n");
        }
        input.languageCode().ifPresent(code -> builder.append("Language code: ").append(code).append("\n"));
        builder.append("Evaluate pronunciation accuracy, fluency, and overall clarity on a 0-100 scale. Return as JSON with fields: normalizedTranscript, accuracyScore, fluencyScore, pronunciationScore, detailedFeedback (object with specific issue feedback).");
        return builder.toString();
    }

    /**
     * Read integer score from JSON node
     */
    private Integer readScore(JsonNode node, String fieldName) {
        JsonNode scoreNode = node.path(fieldName);
        return scoreNode.isNumber() ? scoreNode.intValue() : null;
    }
}
