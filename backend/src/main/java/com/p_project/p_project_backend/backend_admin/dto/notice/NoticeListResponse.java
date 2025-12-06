package com.p_project.p_project_backend.backend_admin.dto.notice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeListResponse {
    private Long total;
    private Integer page;
    private Integer limit;
    private List<NoticeItem> notices;
}

