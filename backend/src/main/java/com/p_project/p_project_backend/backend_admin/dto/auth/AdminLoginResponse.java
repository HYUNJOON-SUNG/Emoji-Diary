package com.p_project.p_project_backend.backend_admin.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
/**
 * 관리자 로그인 성공 응답 DTO
 */
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLoginResponse {
    private String accessToken;
    private String refreshToken;
    private AdminInfo admin;
}
