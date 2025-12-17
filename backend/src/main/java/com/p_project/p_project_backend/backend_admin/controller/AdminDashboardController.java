package com.p_project.p_project_backend.backend_admin.controller;

import com.p_project.p_project_backend.backend_admin.dto.dashboard.DashboardStatsResponse;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.DiaryTrendResponse;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.RiskLevelDistributionResponse;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.UserActivityStatsResponse;
import com.p_project.p_project_backend.backend_admin.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    /**
     * 서비스 주요 통계 카드 (가입자 수, 일기 작성 수 등) 조회
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(
            @RequestParam(required = false, defaultValue = "monthly") String averageDiariesPeriod,
            @RequestParam(required = false, defaultValue = "monthly") String riskLevelPeriod,
            @RequestParam(required = false, defaultValue = "dau") String activeUserType,
            @RequestParam(required = false, defaultValue = "daily") String newUserPeriod) {
        DashboardStatsResponse response = adminDashboardService.getDashboardStats(
                averageDiariesPeriod, riskLevelPeriod, activeUserType, newUserPeriod);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 사용자 위험 레벨 분포 통계 조회
     */
    @GetMapping("/risk-level-distribution")
    public ResponseEntity<?> getRiskLevelDistribution(
            @RequestParam(required = false, defaultValue = "monthly") String period) {
        RiskLevelDistributionResponse response = adminDashboardService.getRiskLevelDistribution(period);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 기간별 일기 작성 추이 차트 데이터 조회
     */
    @GetMapping("/diary-trend")
    public ResponseEntity<?> getDiaryTrend(
            @RequestParam(required = false, defaultValue = "monthly") String period,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        DiaryTrendResponse response = adminDashboardService.getDiaryTrend(period, year, month);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 사용자 활동(가입/탈퇴/활성) 통계 차트 데이터 조회
     */
    @GetMapping("/user-activity-stats")
    public ResponseEntity<?> getUserActivityStats(
            @RequestParam(required = false, defaultValue = "monthly") String period,
            @RequestParam(required = false) String metrics) {
        UserActivityStatsResponse response = adminDashboardService.getUserActivityStats(period, metrics);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }
}
