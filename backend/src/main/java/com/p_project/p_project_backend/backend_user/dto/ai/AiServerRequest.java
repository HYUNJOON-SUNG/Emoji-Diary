package com.p_project.p_project_backend.backend_user.dto.ai;

import com.p_project.p_project_backend.entity.Diary.Weather;
import com.p_project.p_project_backend.entity.User.Persona;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiServerRequest {
    private String content;
    private Weather weather;
    private Persona persona;
    private com.p_project.p_project_backend.entity.User.Gender gender;
}
