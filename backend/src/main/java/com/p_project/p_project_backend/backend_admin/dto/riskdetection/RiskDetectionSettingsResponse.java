package com.p_project.p_project_backend.backend_admin.dto.riskdetection;

import com.p_project.p_project_backend.entity.RiskDetectionSettings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskDetectionSettingsResponse {
    private Integer monitoringPeriod;
    private RiskLevelCriteria high;
    private RiskLevelCriteria medium;
    private RiskLevelCriteria low;

    public static RiskDetectionSettingsResponse from(RiskDetectionSettings settings) {
        return RiskDetectionSettingsResponse.builder()
                .monitoringPeriod(settings.getMonitoringPeriod())
                .high(RiskLevelCriteria.builder()
                        .consecutiveScore(settings.getHighConsecutiveScore())
                        .scoreInPeriod(settings.getHighScoreInPeriod())
                        .build())
                .medium(RiskLevelCriteria.builder()
                        .consecutiveScore(settings.getMediumConsecutiveScore())
                        .scoreInPeriod(settings.getMediumScoreInPeriod())
                        .build())
                .low(RiskLevelCriteria.builder()
                        .consecutiveScore(settings.getLowConsecutiveScore())
                        .scoreInPeriod(settings.getLowScoreInPeriod())
                        .build())
                .build();
    }
}

