package com.p_project.p_project_backend.backend_admin.controller;

import com.p_project.p_project_backend.backend_admin.dto.dashboard.RiskLevelDistributionResponse;
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
     * 위험 레벨 분포 통계 조회
     * GET /api/admin/dashboard/risk-level-distribution
     */
    @GetMapping("/risk-level-distribution")
    public ResponseEntity<?> getRiskLevelDistribution(
            @RequestParam(required = false, defaultValue = "monthly") String period,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        RiskLevelDistributionResponse response = adminDashboardService.getRiskLevelDistribution(period, year, month);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }
}

