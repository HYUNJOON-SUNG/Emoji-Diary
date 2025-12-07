package com.p_project.p_project_backend.backend_user.dto.diary;

import com.p_project.p_project_backend.entity.Diary.Weather;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class DiaryUpdateRequest {

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    @NotBlank(message = "본문은 필수입니다")
    private String content;

    private String mood; // "행복, 평온" (자유 텍스트)

    private Weather weather; // ENUM

    private List<String> activities; // ["운동", "독서"]

    private List<String> images; // ["url1", "url2"]
}
