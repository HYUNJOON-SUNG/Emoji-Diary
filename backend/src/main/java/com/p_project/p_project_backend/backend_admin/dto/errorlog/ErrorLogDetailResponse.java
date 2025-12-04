package com.p_project.p_project_backend.backend_admin.dto.errorlog;

import com.p_project.p_project_backend.entity.ErrorLog;
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
public class ErrorLogDetailResponse {
    private Long id;
    private LocalDateTime timestamp;
    private ErrorLog.Level level;
    private String message;
    private String errorCode;
    private String endpoint;
    private Long userId;
    private String stackTrace;

    public static ErrorLogDetailResponse from(ErrorLog errorLog) {
        return ErrorLogDetailResponse.builder()
                .id(errorLog.getId())
                .timestamp(errorLog.getCreatedAt())
                .level(errorLog.getLevel())
                .message(errorLog.getMessage())
                .errorCode(errorLog.getErrorCode())
                .endpoint(errorLog.getEndpoint())
                .userId(errorLog.getUser() != null ? errorLog.getUser().getId() : null)
                .stackTrace(errorLog.getStackTrace())
                .build();
    }
}

