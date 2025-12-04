package com.p_project.p_project_backend.backend_admin.dto.riskdetection;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
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
public class RiskDetectionSettingsRequest {

    @NotNull(message = "모니터링 기간은 필수입니다")
    @Min(value = 1, message = "모니터링 기간은 1일 이상이어야 합니다")
    @Max(value = 365, message = "모니터링 기간은 365일 이하여야 합니다")
    private Integer monitoringPeriod;

    @NotNull(message = "High 레벨 기준은 필수입니다")
    @Valid
    private RiskLevelCriteria high;

    @NotNull(message = "Medium 레벨 기준은 필수입니다")
    @Valid
    private RiskLevelCriteria medium;

    @NotNull(message = "Low 레벨 기준은 필수입니다")
    @Valid
    private RiskLevelCriteria low;
}

