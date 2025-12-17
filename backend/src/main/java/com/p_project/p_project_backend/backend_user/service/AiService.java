package com.p_project.p_project_backend.backend_user.service;

import com.p_project.p_project_backend.backend_user.dto.ai.AiServerRequest;
import com.p_project.p_project_backend.backend_user.dto.ai.AiServerResponse;
import com.p_project.p_project_backend.backend_user.dto.ai.AiServiceResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiService {

    // AI 생성 이미지 저장 경로
    private static final String IMAGE_UPLOAD_DIR = "images/ai_generates/";
    private final WebClient aiWebClient;

    /**
     * AI 서버로 요청 전송
     */
    public String sendToAiServer(Map<String, Object> requestData) {
        return aiWebClient.post()
                .uri("/ai/test")
                .bodyValue(requestData)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    /**
     * 일기 분석 및 이미지 생성 요청
     */
    public AiServiceResult analyzeDiary(AiServerRequest request) {
        // 1. AI 서버 요청
        AiServerResponse response = aiWebClient.post()
                .uri("/api/ai/diary")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AiServerResponse.class)
                .block();

        if (response == null) {
            throw new RuntimeException("AI Server returned null response");
        }

        // 2. 이미지 저장
        String base64Image = response.getImage();
        String imageUrl = "";

        if (base64Image != null && !base64Image.isEmpty()) {
            imageUrl = saveImage(base64Image);
        }

        // 3. 결과 반환
        return AiServiceResult.builder()
                .aiComment(response.getAiComment())
                .emotion(response.getEmotion())
                .recommendedFood(response.getRecommendedFood())
                .imageUrl(imageUrl)
                .build();
    }

    private String saveImage(String base64Image) {
        try {
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            String uuid = UUID.randomUUID().toString();
            String fileName = uuid + ".jpg";

            File directory = new File(IMAGE_UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            File outputFile = new File(IMAGE_UPLOAD_DIR + fileName);
            try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                fos.write(imageBytes);
            }

            return "/images/ai_generates/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to save AI image", e);
        }
    }
}
