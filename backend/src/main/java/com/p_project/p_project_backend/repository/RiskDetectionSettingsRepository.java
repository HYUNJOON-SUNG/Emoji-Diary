package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.RiskDetectionSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

/**
 * 위험 신호 감지 기준 리포지토리
 */
public interface RiskDetectionSettingsRepository extends JpaRepository<RiskDetectionSettings, Long> {

    /**
     * 설정 단순 조회
     */
    @Query("SELECT r FROM RiskDetectionSettings r WHERE r.id = 1")
    Optional<RiskDetectionSettings> findSettings();

    /**
     * 설정 상세 조회 (관리자 포함)
     */
    @Query("SELECT r FROM RiskDetectionSettings r LEFT JOIN FETCH r.updatedBy WHERE r.id = 1")
    Optional<RiskDetectionSettings> findSettingsWithAdmin();
}
