package com.p_project.p_project_backend.backend_user.dto.notice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeListResponse {
    private Long total;
    private Integer limit; // 'limit' matches API spec (not 'size')
    private Integer page;
    private List<NoticeResponse> notices;

    // API Spec also mentions totalPages but it is not explicitly in the list
    // response structure in 10.4.1 (Admin)
    // but usually beneficial. User spec 7.1 example: total, limit, notices.
    // Wait, the API spec example for User Notice List (7.1) shows:
    // { "total": 5, "limit": 10, "page": 1, "notices": [...] }
}
