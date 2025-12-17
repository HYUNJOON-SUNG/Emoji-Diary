package com.p_project.p_project_backend.backend_admin.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
/**
 * 관리자 토큰 재발급 요청 DTO
 */
@NoArgsConstructor
public class AdminRefreshRequest {
    @NotBlank(message = "리프레시 토큰을 입력해주세요")
    private String refreshToken;
}
