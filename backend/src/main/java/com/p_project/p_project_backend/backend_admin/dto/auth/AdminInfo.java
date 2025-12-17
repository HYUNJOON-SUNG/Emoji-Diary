package com.p_project.p_project_backend.backend_admin.dto.auth;

import com.p_project.p_project_backend.entity.Admin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 관리자 기본 정보 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminInfo {
    private Long id;
    private String email;
    private String name;

    public static AdminInfo from(Admin admin) {
        return AdminInfo.builder()
                .id(admin.getId())
                .email(admin.getEmail())
                .name(admin.getName())
                .build();
    }
}
