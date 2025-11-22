package com.aesp.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

import lombok.Getter;
import lombok.Setter;

/**
 * Configuration holder for OpenAI integration. Set {@code ai.openai.enabled=true}
 * and provide an API key to activate outbound requests.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "ai.openai")
public class OpenAiProperties {

    /** Toggle integration without redeploying. */
    private boolean enabled = false;

    /** API key sourced from environment variables or secrets manager. */
    private String apiKey;

    /** Base URL for OpenAI endpoints. */
    private String baseUrl = "https://api.openai.com/v1";

    /** Chat model used for grammar and pronunciation evaluation prompts. */
    private String chatModel = "gpt-4o-mini";

    /** Timeout applied when waiting for OpenAI responses. */
    private Duration requestTimeout = Duration.ofSeconds(45);

    public boolean hasUsableCredentials() {
        return enabled && StringUtils.hasText(apiKey);
    }
}
