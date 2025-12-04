package com.p_project.p_project_backend.backend_admin.dto.errorlog;

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
public class ErrorLogSummary {
    private Long error;
    private Long warn;
    private Long info;
}

