package com.p_project.p_project_backend.backend_user.dto.stats;

import com.p_project.p_project_backend.entity.Diary.Emotion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 감정 통계 정보 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmotionStatResponse {
    private Emotion emotion;
    private long count;
    private double percentage;
}
