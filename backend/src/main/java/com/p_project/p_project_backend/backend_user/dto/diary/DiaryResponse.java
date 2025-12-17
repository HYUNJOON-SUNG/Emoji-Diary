package com.p_project.p_project_backend.backend_user.dto.diary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 일기 상세 정보 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryResponse {
    private Long id;
    private LocalDate date;
    private String title;
    private String content;
    private String emotion;
    private String mood;
    private String weather;
    private List<String> activities;
    private List<String> images;
    private String imageUrl;
    private String aiComment;
    private String persona;
    private Object recommendedFood;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
