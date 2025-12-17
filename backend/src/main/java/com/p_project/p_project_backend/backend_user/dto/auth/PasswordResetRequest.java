package com.p_project.p_project_backend.backend_user.dto.auth;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 비밀번호 재설정 인증 코드 발송 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetRequest {
    private String email;
}
