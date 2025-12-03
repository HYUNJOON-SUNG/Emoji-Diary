package com.p_project.p_project_backend.backend_user.dto.auth;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmailCheckRequest {
    @jakarta.validation.constraints.NotBlank(message = "이메일은 필수입니다")
    @jakarta.validation.constraints.Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;
}
