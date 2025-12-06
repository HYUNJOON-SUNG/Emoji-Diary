package com.p_project.p_project_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiConfig {

    @Bean
    public WebClient aiWebClient() {
        // AI 서버(FastAPI)가 실행될 주소 (로컬 테스트 기준)
        // Base64 이미지 수신을 위해 버퍼 크기를 10MB로 설정
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();

        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .exchangeStrategies(strategies)
                .build();
    }
}
