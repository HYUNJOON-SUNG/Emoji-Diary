package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.RiskDetectionSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RiskDetectionSettingsRepository extends JpaRepository<RiskDetectionSettings, Long> {

    /**
     * 단일 레코드 조회 (id=1)
     * 항상 id=1인 레코드만 존재
     */
    @Query("SELECT r FROM RiskDetectionSettings r WHERE r.id = 1")
    Optional<RiskDetectionSettings> findSettings();

    /**
     * 관리자 정보 포함 조회 (JOIN FETCH)
     */
    @Query("SELECT r FROM RiskDetectionSettings r LEFT JOIN FETCH r.updatedBy WHERE r.id = 1")
    Optional<RiskDetectionSettings> findSettingsWithAdmin();
}

