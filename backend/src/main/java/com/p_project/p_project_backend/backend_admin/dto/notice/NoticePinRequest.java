package com.p_project.p_project_backend.backend_admin.dto.notice;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticePinRequest {

    @NotNull(message = "고정 여부는 필수입니다")
    private Boolean isPinned;
}

