package com.p_project.p_project_backend.backend_admin.dto.riskdetection;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskDetectionSettingsUpdateResponse {
    private String message;
    private LocalDateTime updatedAt;
}

