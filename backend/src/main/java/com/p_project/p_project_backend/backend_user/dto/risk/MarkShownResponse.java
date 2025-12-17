package com.p_project.p_project_backend.backend_user.dto.risk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 위험 알림 노출 결과 응답 DTO
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MarkShownResponse {
    private String message;
}
