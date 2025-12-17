package com.p_project.p_project_backend.backend_user.controller;

import com.p_project.p_project_backend.backend_user.dto.risk.RiskAnalysisResponse;
import com.p_project.p_project_backend.backend_user.dto.risk.SessionStatusResponse;
import com.p_project.p_project_backend.backend_user.service.RiskDetectionService;
import com.p_project.p_project_backend.entity.User;
import com.p_project.p_project_backend.backend_user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/risk-detection")
@RequiredArgsConstructor
@Slf4j
public class RiskDetectionController {

    private final RiskDetectionService riskDetectionService;
    private final UserService userService; // To get User entity from UserDetails

    /**
     * 위험 분석 수행
     */
    @GetMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeRisk(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findActiveUser(userDetails.getUsername());
        RiskAnalysisResponse response = riskDetectionService.analyze(user);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 세션 상태 조회
     */
    @GetMapping("/session-status")
    public ResponseEntity<Map<String, Object>> getSessionStatus(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findActiveUser(userDetails.getUsername());
        SessionStatusResponse response = riskDetectionService.getSessionStatus(user);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 위험 알림 표시 상태 업데이트
     */
    @PostMapping("/mark-shown")
    public ResponseEntity<Map<String, Object>> markStationShown(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findActiveUser(userDetails.getUsername());
        riskDetectionService.markShown(user);
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("message", "위험 알림 표시 완료 기록됨")));
    }
}
