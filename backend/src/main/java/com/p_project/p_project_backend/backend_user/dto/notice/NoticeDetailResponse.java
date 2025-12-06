package com.p_project.p_project_backend.backend_user.dto.notice;

import com.p_project.p_project_backend.entity.Notice;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NoticeDetailResponse {
    private Long id;
    private String title;
    private String content;
    private Integer views;
    private Boolean isPinned;
    private String author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder
    public NoticeDetailResponse(Long id, String title, String content, Integer views, Boolean isPinned,
            String author, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.views = views;
        this.isPinned = isPinned;
        this.author = author;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static NoticeDetailResponse from(Notice notice) {
        return NoticeDetailResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .views(notice.getViews())
                .isPinned(notice.getIsPinned())
                .author(notice.getAdmin() != null ? notice.getAdmin().getName() : "관리자")
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .build();
    }
}
