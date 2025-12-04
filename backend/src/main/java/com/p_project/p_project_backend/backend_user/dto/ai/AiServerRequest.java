package com.p_project.p_project_backend.backend_user.dto.ai;

import com.p_project.p_project_backend.entity.Diary;
import com.p_project.p_project_backend.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class AiServerRequest {
    private LocalDate date;
    private String title;
    private String content;
    private String mood;
    private Diary.Weather weather;
    private List<String> activities;
    private List<String> images;
    private User.Persona persona;
}
