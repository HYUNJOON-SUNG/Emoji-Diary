package com.p_project.p_project_backend.backend_user.dto.diary;

import com.p_project.p_project_backend.entity.Diary;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class DiaryRequest {

    @NotNull(message = "날짜는 필수입니다")
    private LocalDate date;

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    @NotBlank(message = "본문은 필수입니다")
    private String content;

    private String mood; // "행복, 평온" (자유 텍스트)

    private Diary.Weather weather; // ENUM

    private List<String> activities; // ["운동", "독서"]

    private List<String> images; // ["url1", "url2"]
}
