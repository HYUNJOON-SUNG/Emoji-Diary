package com.p_project.p_project_backend.repository;

/**
 * 에러 로그 레벨별 집계 결과를 위한 프로젝션 인터페이스
 */
public interface ErrorLogSummaryProjection {
    Long getError();
    Long getWarn();
    Long getInfo();
}

