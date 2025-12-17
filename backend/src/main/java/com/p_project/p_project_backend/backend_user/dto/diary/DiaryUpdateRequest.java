package com.p_project.p_project_backend.backend_user.dto.diary;

import com.p_project.p_project_backend.entity.Diary.Weather;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 일기 수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class DiaryUpdateRequest {

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    @NotBlank(message = "본문은 필수입니다")
    private String content;

    private String mood;

    private Weather weather;

    private List<String> activities;

    private List<String> images;
}
