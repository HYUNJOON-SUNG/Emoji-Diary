package com.p_project.p_project_backend.backend_user.dto.auth;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 이메일 인증 코드 검증 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class VerificationCodeRequest {
    private String email;
    private String code;
}
