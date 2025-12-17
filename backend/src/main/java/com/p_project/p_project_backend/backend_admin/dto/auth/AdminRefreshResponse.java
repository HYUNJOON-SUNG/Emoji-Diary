package com.p_project.p_project_backend.backend_admin.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 관리자 토큰 재발급 성공 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRefreshResponse {
    private String accessToken;
    private String refreshToken;
}
