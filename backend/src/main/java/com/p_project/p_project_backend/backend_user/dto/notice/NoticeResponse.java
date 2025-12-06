package com.p_project.p_project_backend.backend_user.dto.notice;

import com.p_project.p_project_backend.entity.Notice;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NoticeResponse {
    private Long id;
    private String title;
    private String author;
    private Integer views;
    private Boolean isPinned;
    private LocalDateTime createdAt;

    @Builder
    public NoticeResponse(Long id, String title, String author, Integer views, Boolean isPinned,
            LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.views = views;
        this.isPinned = isPinned;
        this.createdAt = createdAt;
    }

    public static NoticeResponse from(Notice notice) {
        return NoticeResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .author(notice.getAdmin() != null ? notice.getAdmin().getName() : "관리자")
                .views(notice.getViews())
                .isPinned(notice.getIsPinned())
                .createdAt(notice.getCreatedAt())
                .build();
    }
}
