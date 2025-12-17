package com.p_project.p_project_backend.backend_admin.dto.riskdetection;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 위험 레벨 기준 정보 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskLevelCriteria {

    @NotNull(message = "연속 부정 감정 임계 점수는 필수입니다")
    @Min(value = 1, message = "연속 부정 감정 임계 점수는 1 이상이어야 합니다")
    @Max(value = 100, message = "연속 부정 감정 임계 점수는 100 이하여야 합니다")
    private Integer consecutiveScore;

    @NotNull(message = "모니터링 기간 내 부정 감정 임계 점수는 필수입니다")
    @Min(value = 1, message = "모니터링 기간 내 부정 감정 임계 점수는 1 이상이어야 합니다")
    @Max(value = 200, message = "모니터링 기간 내 부정 감정 임계 점수는 200 이하여야 합니다")
    private Integer scoreInPeriod;
}
