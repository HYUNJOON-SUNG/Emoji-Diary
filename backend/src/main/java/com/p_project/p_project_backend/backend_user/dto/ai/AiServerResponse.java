package com.p_project.p_project_backend.backend_user.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * AI 서버 분석 결과 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiServerResponse {
    private String emotion;
    private String aiComment;
    private RecommendedFood recommendedFood;
    private String image; // Base64 string from AI Server
}
