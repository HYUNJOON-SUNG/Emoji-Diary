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
     * 서버 에러 로그 리스트 조회 (필터링 및 페이징 지원)
     */
    @GetMapping
    public ResponseEntity<?> getErrorLogList(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        ErrorLogListResponse response = adminErrorLogService.getErrorLogList(
                level, startDate, endDate, search, page, limit);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 특정 에러 로그의 상세 정보(스택 트레이스 등) 조회
     */
    @GetMapping("/{logId}")
    public ResponseEntity<?> getErrorLogDetail(@PathVariable Long logId) {
        ErrorLogDetailResponse response = adminErrorLogService.getErrorLogDetail(logId);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }
}
