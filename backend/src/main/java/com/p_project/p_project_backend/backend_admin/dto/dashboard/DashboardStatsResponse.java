package com.p_project.p_project_backend.backend_admin.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 서비스 통계 카드 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private TotalUsersInfo totalUsers;
    private ActiveUsersInfo activeUsers;
    private NewUsersInfo newUsers;
    private TotalDiariesInfo totalDiaries;
    private AverageDailyDiariesInfo averageDailyDiaries;
    private RiskLevelUsersInfo riskLevelUsers;

    /**
     * 전체 사용자 수 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TotalUsersInfo {
        private Long count;
        private Long change;
        private String period;
    }

    /**
     * 활성 사용자 수 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActiveUsersInfo {
        private Long dau;
        private Long wau;
        private Long mau;
        private String type;
    }

    /**
     * 신규 가입자 수 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NewUsersInfo {
        private Long daily;
        private Long weekly;
        private Long monthly;
        private String period;
    }

    /**
     * 총 일지 작성 수 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TotalDiariesInfo {
        private Long count;
        private Long change;
        private String period;
    }

    /**
     * 일평균 일지 작성 수 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AverageDailyDiariesInfo {
        private Long count;
        private String period;
    }

    /**
     * 위험 레벨별 사용자 수 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskLevelUsersInfo {
        private Long high;
        private Long medium;
        private Long low;
        private Long none;
        private String period;
    }
}
