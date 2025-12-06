package com.p_project.p_project_backend.backend_user.dto.stats;

import com.p_project.p_project_backend.entity.Diary.Emotion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmotionStatResponse {
    private Emotion emotion;
    private long count;
    private double percentage;
}
