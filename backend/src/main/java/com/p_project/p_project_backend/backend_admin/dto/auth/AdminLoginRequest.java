package com.p_project.p_project_backend.backend_admin.dto.auth;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 관리자 로그인 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class AdminLoginRequest {
    private String email;
    private String password;
}
