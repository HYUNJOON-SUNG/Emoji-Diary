package com.p_project.p_project_backend.backend_admin.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 일기 작성 추이 그래프의 개별 데이터 포인트
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryTrendItem {
    private String date;
    private Long count;
}
