package com.p_project.p_project_backend.backend_user.dto.risk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RiskAnalysisResponse {
    private String riskLevel; // none, low, medium, high
    private List<String> reasons;
    private AnalysisResult analysis;
    private List<String> urgentCounselingPhones;

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnalysisResult {
        private int monitoringPeriod;
        private int consecutiveScore;
        private int scoreInPeriod;
        private LocalDate lastNegativeDate;
    }
}
