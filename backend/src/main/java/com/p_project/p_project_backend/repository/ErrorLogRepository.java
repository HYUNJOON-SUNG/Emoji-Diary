package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.ErrorLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {

    /**
     * 필터링 및 검색 조건에 맞는 에러 로그 목록 조회 (페이징)
     */
    @Query("SELECT e FROM ErrorLog e " +
            "WHERE (:level IS NULL OR e.level = :level) " +
            "  AND (:startDate IS NULL OR e.createdAt >= :startDate) " +
            "  AND (:endDate IS NULL OR e.createdAt <= :endDate) " +
            "  AND (:search IS NULL OR " +
            "        LOWER(e.message) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "        LOWER(e.endpoint) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "        LOWER(e.errorCode) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY e.createdAt DESC")
    Page<ErrorLog> findWithFilters(
            @Param("level") ErrorLog.Level level,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("search") String search,
            Pageable pageable
    );

    /**
     * 레벨별 에러 로그 개수 집계
     */
    @Query("SELECT " +
            "  SUM(CASE WHEN e.level = 'ERROR' THEN 1 ELSE 0 END) as error, " +
            "  SUM(CASE WHEN e.level = 'WARN' THEN 1 ELSE 0 END) as warn, " +
            "  SUM(CASE WHEN e.level = 'INFO' THEN 1 ELSE 0 END) as info " +
            "FROM ErrorLog e " +
            "WHERE (:level IS NULL OR e.level = :level) " +
            "  AND (:startDate IS NULL OR e.createdAt >= :startDate) " +
            "  AND (:endDate IS NULL OR e.createdAt <= :endDate) " +
            "  AND (:search IS NULL OR " +
            "        LOWER(e.message) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "        LOWER(e.endpoint) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "        LOWER(e.errorCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    ErrorLogSummaryProjection countByLevelWithFilters(
            @Param("level") ErrorLog.Level level,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("search") String search
    );

    /**
     * 필터링 조건에 맞는 전체 개수 조회
     */
    @Query("SELECT COUNT(e) FROM ErrorLog e " +
            "WHERE (:level IS NULL OR e.level = :level) " +
            "  AND (:startDate IS NULL OR e.createdAt >= :startDate) " +
            "  AND (:endDate IS NULL OR e.createdAt <= :endDate) " +
            "  AND (:search IS NULL OR " +
            "        LOWER(e.message) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "        LOWER(e.endpoint) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "        LOWER(e.errorCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    long countWithFilters(
            @Param("level") ErrorLog.Level level,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("search") String search
    );

    /**
     * ID로 에러 로그 조회 (User 엔티티 페치 조인)
     */
    @Query("SELECT e FROM ErrorLog e LEFT JOIN FETCH e.user WHERE e.id = :id")
    Optional<ErrorLog> findByIdWithUser(@Param("id") Long id);
}

