package com.p_project.p_project_backend.backend_admin.controller;

import com.p_project.p_project_backend.backend_admin.dto.errorlog.ErrorLogDetailResponse;
import com.p_project.p_project_backend.backend_admin.dto.errorlog.ErrorLogListResponse;
import com.p_project.p_project_backend.backend_admin.service.AdminErrorLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/error-logs")
@RequiredArgsConstructor
public class AdminErrorLogController {

    private final AdminErrorLogService adminErrorLogService;

    /**
     * 에러 로그 목록 조회
     * GET /api/admin/error-logs
     */
    @GetMapping
    public ResponseEntity<?> getErrorLogList(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        ErrorLogListResponse response = adminErrorLogService.getErrorLogList(
                level, startDate, endDate, search, page, limit
        );
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 에러 로그 상세 조회
     * GET /api/admin/error-logs/{logId}
     */
    @GetMapping("/{logId}")
    public ResponseEntity<?> getErrorLogDetail(@PathVariable Long logId) {
        ErrorLogDetailResponse response = adminErrorLogService.getErrorLogDetail(logId);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }
}

