package com.p_project.p_project_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiConfig {

    @Bean
    public WebClient aiWebClient() {
        // AI 서버(FastAPI)가 실행될 주소 (로컬 테스트 기준)
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }
}