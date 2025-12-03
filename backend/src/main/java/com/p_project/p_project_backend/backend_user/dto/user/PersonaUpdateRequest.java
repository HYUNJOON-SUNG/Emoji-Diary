package com.p_project.p_project_backend.backend_user.dto.user;

import com.p_project.p_project_backend.entity.User;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PersonaUpdateRequest {

    @NotNull(message = "페르소나는 필수입니다")
    private User.Persona persona;
}
