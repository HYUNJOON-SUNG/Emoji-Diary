package com.p_project.p_project_backend.backend_user.dto.auth;

import com.p_project.p_project_backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 로그인 사용자 정보 응답 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginUserResponse {
    private Long id;
    private String email;
    private String name;
    private User.Persona persona;

    public static LoginUserResponse from(User user) {
        return LoginUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .persona(user.getPersona())
                .build();
    }
}
