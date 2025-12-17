package com.p_project.p_project_backend.backend_admin.service;

import com.p_project.p_project_backend.backend_admin.dto.errorlog.ErrorLogDetailResponse;
import com.p_project.p_project_backend.backend_admin.dto.errorlog.ErrorLogItem;
import com.p_project.p_project_backend.backend_admin.dto.errorlog.ErrorLogListResponse;
import com.p_project.p_project_backend.backend_admin.dto.errorlog.ErrorLogSummary;
import com.p_project.p_project_backend.entity.ErrorLog;
import com.p_project.p_project_backend.exception.AdminNotFoundException;
import com.p_project.p_project_backend.repository.ErrorLogRepository;
import com.p_project.p_project_backend.repository.ErrorLogSummaryProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminErrorLogService {

    private static final String LEVEL_ALL = "ALL";
    private static final int PAGE_OFFSET = 1; // 1-based to 0-based page conversion

    private final ErrorLogRepository errorLogRepository;

    /**
     * 에러 로그 목록 조회 (필터링, 페이징 지원)
     */
    @Transactional(readOnly = true)
    public ErrorLogListResponse getErrorLogList(
            String levelStr,
            String startDateStr,
            String endDateStr,
            String search,
            int page,
            int limit) {
        try {
            // 파라미터 파싱
            ErrorLog.Level level = parseLevel(levelStr);
            LocalDateTime startDate = parseStartDate(startDateStr);
            LocalDateTime endDate = parseEndDate(endDateStr);
            String searchTerm = normalizeSearchTerm(search);

            // 페이징 설정
            Pageable pageable = PageRequest.of(page - PAGE_OFFSET, limit);

            // 에러 로그 목록 조회
            Page<ErrorLog> errorLogPage = errorLogRepository.findWithFilters(
                    level, startDate, endDate, searchTerm, pageable);

            // 레벨별 집계 조회
            ErrorLogSummaryProjection summaryProjection = errorLogRepository.countByLevelWithFilters(
                    level, startDate, endDate, searchTerm);

            // 집계 결과 변환
            ErrorLogSummary summary = buildSummary(summaryProjection);

            // DTO 변환
            List<ErrorLogItem> logItems = errorLogPage.getContent().stream()
                    .map(ErrorLogItem::from)
                    .collect(Collectors.toList());

            return ErrorLogListResponse.builder()
                    .total(errorLogPage.getTotalElements())
                    .summary(summary)
                    .logs(logItems)
                    .build();

        } catch (Exception e) {
            log.error("Error occurred while fetching error log list", e);
            throw new RuntimeException("에러 로그 목록 조회 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 레벨 파라미터 파싱
     */
    private ErrorLog.Level parseLevel(String levelStr) {
        if (levelStr == null || levelStr.isBlank() || levelStr.equalsIgnoreCase(LEVEL_ALL)) {
            return null;
        }
        try {
            return ErrorLog.Level.valueOf(levelStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid level parameter: {}, treating as ALL", levelStr);
            return null; // 잘못된 레벨이면 null로 처리하여 모든 레벨 조회
        }
    }

    /**
     * 시작일 파싱 및 시간 설정 (00:00:00)
     */
    private LocalDateTime parseStartDate(String startDateStr) {
        if (startDateStr == null || startDateStr.isBlank()) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(startDateStr);
            return date.atStartOfDay();
        } catch (Exception e) {
            log.warn("Invalid startDate parameter: {}", startDateStr);
            return null;
        }
    }

    /**
     * 종료일 파싱 및 시간 설정 (23:59:59)
     */
    private LocalDateTime parseEndDate(String endDateStr) {
        if (endDateStr == null || endDateStr.isBlank()) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(endDateStr);
            return date.atTime(LocalTime.MAX);
        } catch (Exception e) {
            log.warn("Invalid endDate parameter: {}", endDateStr);
            return null;
        }
    }

    /**
     * 검색어 정규화 처리
     */
    private String normalizeSearchTerm(String search) {
        return (search != null && !search.isBlank()) ? search : null;
    }

    /**
     * 로그 집계 요약 생성
     */
    private ErrorLogSummary buildSummary(ErrorLogSummaryProjection projection) {
        if (projection == null) {
            return ErrorLogSummary.builder()
                    .error(0L)
                    .warn(0L)
                    .info(0L)
                    .build();
        }

        return ErrorLogSummary.builder()
                .error(projection.getError() != null ? projection.getError() : 0L)
                .warn(projection.getWarn() != null ? projection.getWarn() : 0L)
                .info(projection.getInfo() != null ? projection.getInfo() : 0L)
                .build();
    }

    /**
     * 에러 로그 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public ErrorLogDetailResponse getErrorLogDetail(Long logId) {
        try {
            ErrorLog errorLog = errorLogRepository.findByIdWithUser(logId)
                    .orElseThrow(() -> {
                        log.warn("Error log not found: logId={}", logId);
                        return new AdminNotFoundException("에러 로그를 찾을 수 없습니다.");
                    });

            return ErrorLogDetailResponse.from(errorLog);

        } catch (AdminNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error occurred while fetching error log detail: logId={}", logId, e);
            throw new RuntimeException("에러 로그 상세 조회 중 오류가 발생했습니다.", e);
        }
    }
}
