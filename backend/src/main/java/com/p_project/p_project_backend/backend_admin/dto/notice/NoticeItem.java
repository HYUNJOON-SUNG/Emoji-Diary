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
public class NoticeItem {
    private Long id;
    private String title;
    private String author;
    private LocalDateTime createdAt;
    private Integer views;
    private Boolean isPinned;
    private Boolean isPublic;

    public static NoticeItem from(Notice notice) {
        return NoticeItem.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .author(notice.getAdmin() != null ? notice.getAdmin().getName() : null)
                .createdAt(notice.getCreatedAt())
                .views(notice.getViews())
                .isPinned(notice.getIsPinned())
                .isPublic(notice.getIsPublic())
                .build();
    }
}

