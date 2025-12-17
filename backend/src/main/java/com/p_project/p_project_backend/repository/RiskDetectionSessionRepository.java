package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.RiskDetectionSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // Added Optional
import com.p_project.p_project_backend.entity.User; // Added User

/**
 * 위험 신호 세션 리포지토리
 */
public interface RiskDetectionSessionRepository extends JpaRepository<RiskDetectionSession, Long> {
        /**
         * 최신 세션 조회
         */
        Optional<RiskDetectionSession> findTopByUserOrderByCreatedAtDesc(User user);

        /**
         * 기간별 위험 레벨 사용자 집계
         */
        @Query("SELECT r.riskLevel, COUNT(DISTINCT r.user.id) " +
                        "FROM RiskDetectionSession r " +
                        "WHERE r.id IN (" +
                        "  SELECT MAX(r2.id) " +
                        "  FROM RiskDetectionSession r2 " +
                        "  WHERE r2.createdAt >= :startDate AND r2.createdAt < :endDate " +
                        "  GROUP BY r2.user.id" +
                        ") " +
                        "GROUP BY r.riskLevel")
        List<Object[]> countUsersByRiskLevelInPeriod(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        /**
         * 기간 내 전체 사용자 수
         */
        @Query("SELECT COUNT(DISTINCT r.user.id) " +
                        "FROM RiskDetectionSession r " +
                        "WHERE r.createdAt >= :startDate AND r.createdAt < :endDate")
        Long countTotalUsersInPeriod(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);
}
