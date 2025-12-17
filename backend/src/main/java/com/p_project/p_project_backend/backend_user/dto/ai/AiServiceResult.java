package com.p_project.p_project_backend.backend_user.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * AI 서비스 분석 결과 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiServiceResult {
    private String aiComment;
    private String emotion;
    private RecommendedFood recommendedFood;
    private String imageUrl; // Saved image URL
}
