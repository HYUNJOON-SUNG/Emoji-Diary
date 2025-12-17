package com.p_project.p_project_backend.backend_user.dto.stats;

import com.p_project.p_project_backend.entity.Diary.Emotion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 감정 추이 정보 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmotionTrendResponse {
    private LocalDate date;
    private Emotion primaryEmotion;
    private long count;
}
