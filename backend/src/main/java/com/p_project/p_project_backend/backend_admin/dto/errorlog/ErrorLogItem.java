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
public class ErrorLogItem {
    private Long id;
    private LocalDateTime timestamp;
    private ErrorLog.Level level;
    private String message;
    private String endpoint;
    private Long userId;

    public static ErrorLogItem from(ErrorLog errorLog) {
        return ErrorLogItem.builder()
                .id(errorLog.getId())
                .timestamp(errorLog.getCreatedAt())
                .level(errorLog.getLevel())
                .message(errorLog.getMessage())
                .endpoint(errorLog.getEndpoint())
                .userId(errorLog.getUser() != null ? errorLog.getUser().getId() : null)
                .build();
    }
}

