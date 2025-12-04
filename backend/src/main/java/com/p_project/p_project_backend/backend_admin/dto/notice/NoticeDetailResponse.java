package com.p_project.p_project_backend.backend_admin.dto.notice;

import com.p_project.p_project_backend.entity.Notice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeDetailResponse {
    private Long id;
    private String title;
    private String content;
    private String author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer views;
    private Boolean isPinned;
    private Boolean isPublic;

    public static NoticeDetailResponse from(Notice notice) {
        return NoticeDetailResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .author(notice.getAdmin() != null ? notice.getAdmin().getName() : null)
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .views(notice.getViews())
                .isPinned(notice.getIsPinned())
                .isPublic(notice.getIsPublic())
                .build();
    }
}

