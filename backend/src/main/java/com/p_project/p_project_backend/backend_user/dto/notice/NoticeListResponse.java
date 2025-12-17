package com.p_project.p_project_backend.backend_user.dto.notice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 공지사항 목록 응답 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeListResponse {
    private Long total;
    private Integer limit;
    private Integer page;
    private List<NoticeResponse> notices;

}
