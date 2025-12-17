package com.p_project.p_project_backend.backend_user.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 회원가입 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class SignUpRequest {

    @NotBlank(message = "이름은 필수입니다")
    @Size(min = 2, message = "이름은 2자 이상이어야 합니다")
    private String name;

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$", message = "비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다")
    private String password;

    @AssertTrue(message = "이메일 인증이 완료되어야 합니다")
    private Boolean emailVerified;

    @NotNull(message = "성별은 필수입니다")
    private com.p_project.p_project_backend.entity.User.Gender gender;

}
