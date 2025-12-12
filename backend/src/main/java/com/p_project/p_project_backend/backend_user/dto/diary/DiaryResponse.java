package com.p_project.p_project_backend.backend_user.dto.diary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
    private String emotion; // "행복" (Korean label or Enum name)
    private String mood;
    private String weather;
    private List<String> activities; // Not directly in Diary entity, might need separate table or JSON
    private List<String> images; // User images
    private String imageUrl; // AI Image
    private String aiComment;
    private String persona; // Snapshot Persona
    private Object recommendedFood; // JSON parsed object
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
