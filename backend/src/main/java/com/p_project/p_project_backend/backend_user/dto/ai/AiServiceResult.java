package com.p_project.p_project_backend.backend_user.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

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
