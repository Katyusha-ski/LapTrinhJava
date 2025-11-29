package com.aesp.service.ai;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class OpenAiPronunciationClient {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${huggingface.api.key}")
    private String huggingfaceApiKey;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public OpenAiPronunciationClient(ObjectMapper objectMapper, RestTemplate restTemplate) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
    }

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
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.set("Authorization", "Bearer " + huggingfaceApiKey);

            HttpEntity<byte[]> request = new HttpEntity<>(audioData, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(HF_WHISPER_MODEL, request, String.class);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new AiServiceException("Hugging Face Whisper API returned status " + response.getStatusCode());
            }
            
            JsonNode resultNode = objectMapper.readTree(response.getBody());
            
            if (resultNode.has("text")) {
                return resultNode.get("text").asText("");
            }
            return "";
        } catch (Exception e) {
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
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + huggingfaceApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("inputs", text);
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            
            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);
            ResponseEntity<byte[]> response = restTemplate.postForEntity(HF_TTS_MODEL, request, byte[].class);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new AiServiceException("Hugging Face TTS API returned status " + response.getStatusCode());
            }
            
            return response.getBody();
        } catch (Exception e) {
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
    private String callGroqApi(String endpoint, Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + groqApiKey);

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, request, String.class);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("Groq API error: Status {}", response.getStatusCode());
                throw new AiServiceException("Groq API returned status " + response.getStatusCode());
            }
            return response.getBody();
        } catch (Exception e) {
            log.error("Groq API call failed", e);
            throw new AiServiceException("Failed to call Groq API", e);
        }
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
