package com.p_project.p_project_backend.backend_admin.dto.dashboard;

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
public class RiskLevelDistributionResponse {
    private String period;
    private RiskLevelDistribution distribution;
    private Long total;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RiskLevelDistribution {
        private RiskLevelDistributionItem high;
        private RiskLevelDistributionItem medium;
        private RiskLevelDistributionItem low;
        private RiskLevelDistributionItem none;
    }
}
