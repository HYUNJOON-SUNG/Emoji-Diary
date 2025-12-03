package com.p_project.p_project_backend.backend_user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    private final WebClient aiWebClient;

    public String sendToAiServer(Map<String, Object> requestData) {
        // WebClient를 사용하여 AI 서버로 POST 요청 전송
        return aiWebClient.post()
                .uri("/ai/test") // FastAPI의 엔드포인트 경로
                .bodyValue(requestData) // 클라이언트로부터 받은 데이터를 그대로 전달
                .retrieve()
                .bodyToMono(String.class) // 응답을 String으로 받음
                .block(); // 테스트를 위해 동기식(Blocking)으로 처리하여 결과 반환
    }
}