package com.p_project.p_project_backend.backend_user.dto.auth;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PasswordResetVerifyRequest {
    private String email;
    private String code;
}
