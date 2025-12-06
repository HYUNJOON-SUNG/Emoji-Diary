package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.RiskDetectionSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // Added Optional
import com.p_project.p_project_backend.entity.User; // Added User

public interface RiskDetectionSessionRepository extends JpaRepository<RiskDetectionSession, Long> {
        Optional<RiskDetectionSession> findTopByUserOrderByCreatedAtDesc(User user);

        /**
         * 기간별 위험 레벨별 사용자 수 집계
         * 기간 내에 생성된 세션 중, 각 사용자의 최신 세션의 위험 레벨을 기준으로 집계
         * 
         * @param startDate 기간 시작일
         * @param endDate   기간 종료일
         * @return 위험 레벨별 사용자 수 (List<Object[]>: [0]=RiskLevel, [1]=Long count)
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
         * 기간 내에 세션이 있는 전체 사용자 수 조회
         * 
         * @param startDate 기간 시작일
         * @param endDate   기간 종료일
         * @return 기간 내 세션이 있는 사용자 수
         */
        @Query("SELECT COUNT(DISTINCT r.user.id) " +
                        "FROM RiskDetectionSession r " +
                        "WHERE r.createdAt >= :startDate AND r.createdAt < :endDate")
        Long countTotalUsersInPeriod(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);
}
