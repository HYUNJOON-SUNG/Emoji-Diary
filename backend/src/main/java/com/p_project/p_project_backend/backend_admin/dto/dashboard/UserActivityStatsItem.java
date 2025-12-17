package com.p_project.p_project_backend.backend_admin.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 활동 통계 그래프의 개별 데이터 포인트
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityStatsItem {
    private String date;
    private Integer newUsers; // 신규 가입자 수
    private Integer withdrawnUsers; // 탈퇴 사용자 수
}
