package com.p_project.p_project_backend.backend_admin.service;

import com.p_project.p_project_backend.backend_admin.dto.dashboard.RiskLevelDistributionItem;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.RiskLevelDistributionResponse;
import com.p_project.p_project_backend.entity.RiskDetectionSession;
import com.p_project.p_project_backend.repository.RiskDetectionSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private static final String PERIOD_WEEKLY = "weekly";
    private static final String PERIOD_MONTHLY = "monthly";
    private static final String PERIOD_YEARLY = "yearly";

    private static final double PERCENTAGE_MULTIPLIER = 100.0;
    private static final double PERCENTAGE_ROUNDING_FACTOR = 10.0;

    private static final String ERROR_MESSAGE_INVALID_PERIOD = "Invalid period: %s. Must be weekly, monthly, or yearly.";

    private final RiskDetectionSessionRepository riskDetectionSessionRepository;

    /**
     * 위험 레벨 분포 통계 조회
     */
    @Transactional(readOnly = true)
    public RiskLevelDistributionResponse getRiskLevelDistribution(
            String period,
            Integer year,
            Integer month
    ) {
        // 기간 계산
        PeriodRange periodRange = calculatePeriodRange(period, year, month);
        LocalDateTime startDate = periodRange.getStartDate();
        LocalDateTime endDate = periodRange.getEndDate();

        // 위험 레벨별 사용자 수 집계
        Map<RiskDetectionSession.RiskLevel, Long> riskLevelCounts = extractRiskLevelCounts(startDate, endDate);

        // 기간 내에 세션이 있는 전체 사용자 수 조회
        Long totalUsersInPeriod = riskDetectionSessionRepository.countTotalUsersInPeriod(startDate, endDate);
        long totalUsers = totalUsersInPeriod != null ? totalUsersInPeriod : 0L;

        // 비율 계산 및 Response 생성
        return buildRiskLevelDistributionResponse(
                period, year, month, riskLevelCounts, totalUsers
        );
    }

    /**
     * 기간 범위 계산
     */
    private PeriodRange calculatePeriodRange(String period, Integer year, Integer month) {
        if (year == null) {
            year = LocalDate.now().getYear();
        }

        String periodLower = period.toLowerCase();
        switch (periodLower) {
            case PERIOD_WEEKLY:
                return calculateWeeklyRange(year, month);
            case PERIOD_MONTHLY:
                return calculateMonthlyRange(year, month);
            case PERIOD_YEARLY:
                return calculateYearlyRange(year);
            default:
                throw new IllegalArgumentException(String.format(ERROR_MESSAGE_INVALID_PERIOD, period));
        }
    }

    /**
     * 위험 레벨별 사용자 수 추출
     */
    private Map<RiskDetectionSession.RiskLevel, Long> extractRiskLevelCounts(
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {
        List<Object[]> results = riskDetectionSessionRepository.countUsersByRiskLevelInPeriod(startDate, endDate);
        Map<RiskDetectionSession.RiskLevel, Long> riskLevelCounts = new HashMap<>();
        
        // 초기화 (모든 레벨을 0으로)
        for (RiskDetectionSession.RiskLevel level : RiskDetectionSession.RiskLevel.values()) {
            riskLevelCounts.put(level, 0L);
        }
        
        // 집계 결과 매핑
        for (Object[] result : results) {
            RiskDetectionSession.RiskLevel riskLevel = (RiskDetectionSession.RiskLevel) result[0];
            Long count = ((Number) result[1]).longValue();
            riskLevelCounts.put(riskLevel, count);
        }
        
        return riskLevelCounts;
    }

    /**
     * 주간 기간 범위 계산
     */
    private PeriodRange calculateWeeklyRange(Integer year, Integer month) {
        if (month == null) {
            month = LocalDate.now().getMonthValue();
        }
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusDays(7);
        if (endDate.getMonthValue() != month) {
            endDate = YearMonth.of(year, month).atEndOfMonth().plusDays(1);
        }
        return new PeriodRange(startDate.atStartOfDay(), endDate.atStartOfDay());
    }

    /**
     * 월간 기간 범위 계산
     */
    private PeriodRange calculateMonthlyRange(Integer year, Integer month) {
        if (month == null) {
            month = LocalDate.now().getMonthValue();
        }
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = YearMonth.of(year, month).atEndOfMonth().plusDays(1);
        return new PeriodRange(startDate.atStartOfDay(), endDate.atStartOfDay());
    }

    /**
     * 연간 기간 범위 계산
     */
    private PeriodRange calculateYearlyRange(Integer year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year + 1, 1, 1);
        return new PeriodRange(startDate.atStartOfDay(), endDate.atStartOfDay());
    }

    /**
     * Response DTO 생성
     */
    private RiskLevelDistributionResponse buildRiskLevelDistributionResponse(
            String period,
            Integer year,
            Integer month,
            Map<RiskDetectionSession.RiskLevel, Long> riskLevelCounts,
            long totalUsers
    ) {
        RiskLevelDistributionResponse.RiskLevelDistribution distribution = buildDistribution(riskLevelCounts, totalUsers);

        return RiskLevelDistributionResponse.builder()
                .period(period)
                .year(year)
                .month(month)
                .distribution(distribution)
                .total(totalUsers)
                .build();
    }

    /**
     * 위험 레벨별 Distribution 생성
     */
    private RiskLevelDistributionResponse.RiskLevelDistribution buildDistribution(
            Map<RiskDetectionSession.RiskLevel, Long> riskLevelCounts,
            long totalUsers
    ) {
        return RiskLevelDistributionResponse.RiskLevelDistribution.builder()
                .high(createDistributionItem(riskLevelCounts.getOrDefault(RiskDetectionSession.RiskLevel.HIGH, 0L), totalUsers))
                .medium(createDistributionItem(riskLevelCounts.getOrDefault(RiskDetectionSession.RiskLevel.MEDIUM, 0L), totalUsers))
                .low(createDistributionItem(riskLevelCounts.getOrDefault(RiskDetectionSession.RiskLevel.LOW, 0L), totalUsers))
                .none(createDistributionItem(riskLevelCounts.getOrDefault(RiskDetectionSession.RiskLevel.NONE, 0L), totalUsers))
                .build();
    }

    /**
     * DistributionItem 생성 (비율 계산 포함)
     */
    private RiskLevelDistributionItem createDistributionItem(long count, long total) {
        double percentage = calculatePercentage(count, total);
        return RiskLevelDistributionItem.builder()
                .count(count)
                .percentage(percentage)
                .build();
    }

    /**
     * 비율 계산 (백분율, 소수점 첫째 자리까지 반올림)
     */
    private double calculatePercentage(long count, long total) {
        if (total == 0) {
            return 0.0;
        }
        double percentage = (count * PERCENTAGE_MULTIPLIER) / total;
        return Math.round(percentage * PERCENTAGE_ROUNDING_FACTOR) / PERCENTAGE_ROUNDING_FACTOR;
    }

    /**
     * 기간 범위 내부 클래스
     */
    private static class PeriodRange {
        private final LocalDateTime startDate;
        private final LocalDateTime endDate;

        public PeriodRange(LocalDateTime startDate, LocalDateTime endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        }

        public LocalDateTime getStartDate() {
            return startDate;
        }

        public LocalDateTime getEndDate() {
            return endDate;
        }
    }
}

