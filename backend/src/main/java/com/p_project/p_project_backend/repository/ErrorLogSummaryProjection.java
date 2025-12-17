package com.p_project.p_project_backend.repository;

/**
 * 에러 로그 요약 프로젝션
 */
public interface ErrorLogSummaryProjection {
    Long getError();

    Long getWarn();

    Long getInfo();
}
