package com.p_project.p_project_backend.backend_admin.service;

import com.p_project.p_project_backend.backend_admin.dto.riskdetection.RiskDetectionSettingsRequest;
import com.p_project.p_project_backend.backend_admin.dto.riskdetection.RiskDetectionSettingsResponse;
import com.p_project.p_project_backend.backend_admin.dto.riskdetection.RiskDetectionSettingsUpdateResponse;
import com.p_project.p_project_backend.entity.Admin;
import com.p_project.p_project_backend.entity.RiskDetectionSettings;
import com.p_project.p_project_backend.exception.AdminNotFoundException;
import com.p_project.p_project_backend.repository.AdminRepository;
import com.p_project.p_project_backend.repository.RiskDetectionSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminRiskDetectionSettingsService {

    private static final String ERROR_MESSAGE_ADMIN_NOT_FOUND = "관리자를 찾을 수 없습니다.";
    private static final String ERROR_MESSAGE_VALIDATION_FAILED = "검증 규칙을 위반했습니다: ";
    private static final String SUCCESS_MESSAGE_SETTINGS_SAVED = "위험 신호 감지 기준이 저장되었습니다";

    // 기본값 상수
    private static final int DEFAULT_MONITORING_PERIOD = 14;
    private static final int DEFAULT_HIGH_CONSECUTIVE_SCORE = 8;
    private static final int DEFAULT_HIGH_SCORE_IN_PERIOD = 12;
    private static final int DEFAULT_MEDIUM_CONSECUTIVE_SCORE = 5;
    private static final int DEFAULT_MEDIUM_SCORE_IN_PERIOD = 8;
    private static final int DEFAULT_LOW_CONSECUTIVE_SCORE = 2;
    private static final int DEFAULT_LOW_SCORE_IN_PERIOD = 4;

    private final RiskDetectionSettingsRepository riskDetectionSettingsRepository;
    private final AdminRepository adminRepository;

    /**
     * 위험 감지 설정 조회 (없으면 기본값 생성)
     */
    @Transactional(readOnly = true)
    public RiskDetectionSettingsResponse getRiskDetectionSettings() {
        RiskDetectionSettings settings = riskDetectionSettingsRepository.findSettings()
                .orElseGet(this::createDefaultSettings);

        return RiskDetectionSettingsResponse.from(settings);
    }

    /**
     * 위험 감지 설정 업데이트
     */
    @Transactional
    public RiskDetectionSettingsUpdateResponse updateRiskDetectionSettings(
            RiskDetectionSettingsRequest request,
            Long adminId) {
        // 검증
        validateSettings(request);

        // 관리자 조회
        Admin admin = findAdminById(adminId);

        // 설정 조회 또는 생성
        RiskDetectionSettings settings = riskDetectionSettingsRepository.findSettings()
                .orElseGet(this::createDefaultSettings);

        // 설정 업데이트
        updateSettingsFields(settings, request);
        settings.setUpdatedBy(admin);
        settings.setUpdatedAt(LocalDateTime.now());

        RiskDetectionSettings savedSettings = riskDetectionSettingsRepository.save(settings);

        log.info("Risk detection settings updated by adminId={}", adminId);
        return RiskDetectionSettingsUpdateResponse.builder()
                .message(SUCCESS_MESSAGE_SETTINGS_SAVED)
                .updatedAt(savedSettings.getUpdatedAt())
                .build();
    }

    /**
     * 기본 설정값 생성 및 저장
     */
    @Transactional
    private RiskDetectionSettings createDefaultSettings() {
        LocalDateTime now = LocalDateTime.now();
        RiskDetectionSettings settings = RiskDetectionSettings.builder()
                .monitoringPeriod(DEFAULT_MONITORING_PERIOD)
                .highConsecutiveScore(DEFAULT_HIGH_CONSECUTIVE_SCORE)
                .highScoreInPeriod(DEFAULT_HIGH_SCORE_IN_PERIOD)
                .mediumConsecutiveScore(DEFAULT_MEDIUM_CONSECUTIVE_SCORE)
                .mediumScoreInPeriod(DEFAULT_MEDIUM_SCORE_IN_PERIOD)
                .lowConsecutiveScore(DEFAULT_LOW_CONSECUTIVE_SCORE)
                .lowScoreInPeriod(DEFAULT_LOW_SCORE_IN_PERIOD)
                .updatedAt(now)
                .build();

        log.info("Creating default risk detection settings");
        return riskDetectionSettingsRepository.save(settings);
    }

    /**
     * 설정 필드 값 업데이트
     */
    private void updateSettingsFields(RiskDetectionSettings settings, RiskDetectionSettingsRequest request) {
        settings.setMonitoringPeriod(request.getMonitoringPeriod());
        settings.setHighConsecutiveScore(request.getHigh().getConsecutiveScore());
        settings.setHighScoreInPeriod(request.getHigh().getScoreInPeriod());
        settings.setMediumConsecutiveScore(request.getMedium().getConsecutiveScore());
        settings.setMediumScoreInPeriod(request.getMedium().getScoreInPeriod());
        settings.setLowConsecutiveScore(request.getLow().getConsecutiveScore());
        settings.setLowScoreInPeriod(request.getLow().getScoreInPeriod());
    }

    /**
     * 설정값 유효성 검증 (점수 계층 구조 확인)
     */
    private void validateSettings(RiskDetectionSettingsRequest request) {
        validateConsecutiveScore(request);
        validateScoreInPeriod(request);
    }

    /**
     * 연속 감정 점수 계층 구조 검증
     */
    private void validateConsecutiveScore(RiskDetectionSettingsRequest request) {
        validateScoreHierarchy(
                request.getHigh().getConsecutiveScore(),
                request.getMedium().getConsecutiveScore(),
                "High의 연속 부정 감정 임계 점수는 Medium보다 커야 합니다");
        validateScoreHierarchy(
                request.getMedium().getConsecutiveScore(),
                request.getLow().getConsecutiveScore(),
                "Medium의 연속 부정 감정 임계 점수는 Low보다 커야 합니다");
    }

    /**
     * 기간 내 감정 점수 계층 구조 검증
     */
    private void validateScoreInPeriod(RiskDetectionSettingsRequest request) {
        validateScoreHierarchy(
                request.getHigh().getScoreInPeriod(),
                request.getMedium().getScoreInPeriod(),
                "High의 모니터링 기간 내 부정 감정 임계 점수는 Medium보다 커야 합니다");
        validateScoreHierarchy(
                request.getMedium().getScoreInPeriod(),
                request.getLow().getScoreInPeriod(),
                "Medium의 모니터링 기간 내 부정 감정 임계 점수는 Low보다 커야 합니다");
    }

    /**
     * 상위 점수가 하위 점수보다 큰지 검증
     */
    private void validateScoreHierarchy(Integer higherScore, Integer lowerScore, String errorMessage) {
        if (higherScore <= lowerScore) {
            throw new IllegalArgumentException(ERROR_MESSAGE_VALIDATION_FAILED + errorMessage);
        }
    }

    /**
     * 관리자 ID 조회
     */
    private Admin findAdminById(Long adminId) {
        return adminRepository.findById(adminId)
                .orElseThrow(() -> {
                    log.warn("Admin not found: adminId={}", adminId);
                    return new AdminNotFoundException(ERROR_MESSAGE_ADMIN_NOT_FOUND);
                });
    }
}
