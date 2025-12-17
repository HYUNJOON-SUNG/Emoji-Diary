package com.p_project.p_project_backend.backend_admin.dto.errorlog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 에러 로그 레벨별 요약 정보 (ERROR, WARN, INFO 카운트)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorLogSummary {
    private Long error;
    private Long warn;
    private Long info;
}
