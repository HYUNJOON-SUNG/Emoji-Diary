package com.p_project.p_project_backend.backend_admin.controller;

import com.p_project.p_project_backend.backend_admin.dto.riskdetection.RiskDetectionSettingsRequest;
import com.p_project.p_project_backend.backend_admin.dto.riskdetection.RiskDetectionSettingsResponse;
import com.p_project.p_project_backend.backend_admin.dto.riskdetection.RiskDetectionSettingsUpdateResponse;
import com.p_project.p_project_backend.backend_admin.service.AdminRiskDetectionSettingsService;
import com.p_project.p_project_backend.entity.Admin;
import com.p_project.p_project_backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings/risk-detection")
@RequiredArgsConstructor
public class AdminRiskDetectionSettingsController {

    private static final String ERROR_MESSAGE_AUTHENTICATION_REQUIRED = "인증 정보가 없습니다.";
    private static final String ERROR_MESSAGE_ADMIN_NOT_FOUND = "관리자 정보를 찾을 수 없습니다.";

    private final AdminRiskDetectionSettingsService adminRiskDetectionSettingsService;
    private final AdminRepository adminRepository;

    /**
     * 현재 설정된 위험 신호 감지 기준 조회
     */
    @GetMapping
    public ResponseEntity<?> getRiskDetectionSettings() {
        RiskDetectionSettingsResponse response = adminRiskDetectionSettingsService.getRiskDetectionSettings();
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 위험 신호 감지 기준 변경 및 업데이트
     */
    @PutMapping
    public ResponseEntity<?> updateRiskDetectionSettings(
            @RequestBody @Valid RiskDetectionSettingsRequest request,
            Authentication authentication) {
        Long adminId = getAdminIdFromAuthentication(authentication);
        RiskDetectionSettingsUpdateResponse response = adminRiskDetectionSettingsService
                .updateRiskDetectionSettings(request, adminId);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 인증 정보에서 관리자 식별자(ID) 추출
     */
    private Long getAdminIdFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException(ERROR_MESSAGE_AUTHENTICATION_REQUIRED);
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();

        return adminRepository.findByEmail(email)
                .map(Admin::getId)
                .orElseThrow(() -> new RuntimeException(ERROR_MESSAGE_ADMIN_NOT_FOUND));
    }
}
