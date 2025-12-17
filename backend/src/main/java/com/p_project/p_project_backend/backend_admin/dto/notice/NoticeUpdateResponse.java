package com.p_project.p_project_backend.backend_admin.dto.notice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 공지사항 수정 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeUpdateResponse {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime updatedAt;
}
