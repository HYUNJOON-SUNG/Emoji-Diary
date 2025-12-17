package com.p_project.p_project_backend.backend_user.dto.risk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 세션 상태 응답 DTO
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SessionStatusResponse {
    private boolean alreadyShown;
}
