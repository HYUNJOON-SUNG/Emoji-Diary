package com.p_project.p_project_backend.backend_admin.dto.notice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 공지사항 고정 상태 변경 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticePinResponse {
    private Long id;
    private Boolean isPinned;
}
