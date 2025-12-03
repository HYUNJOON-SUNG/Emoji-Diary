package com.p_project.p_project_backend.backend_user.controller;

import com.p_project.p_project_backend.backend_user.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    // 클라이언트 -> 스프링부트 -> AI 서버 -> 스프링부트 -> 클라이언트
    @PostMapping("/connect")
    public String testConnection(@RequestBody Map<String, Object> requestData) {
        // 1. 요청 받음
        System.out.println("Client Request: " + requestData);

        // 2. AI 서버로 위임 및 응답 수신
        String aiResponse = aiService.sendToAiServer(requestData);

        // 3. 결과 반환
        return "AI Server Response: " + aiResponse;
    }
}