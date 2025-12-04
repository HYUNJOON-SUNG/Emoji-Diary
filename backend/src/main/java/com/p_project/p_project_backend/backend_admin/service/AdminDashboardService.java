package com.p_project.p_project_backend.backend_admin.service;

import com.p_project.p_project_backend.backend_admin.dto.dashboard.DiaryTrendItem;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.DiaryTrendResponse;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.RiskLevelDistributionItem;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.RiskLevelDistributionResponse;
import com.p_project.p_project_backend.entity.RiskDetectionSession;
import com.p_project.p_project_backend.repository.AdminDiaryRepository;
import com.p_project.p_project_backend.repository.RiskDetectionSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    // 기간 계산 상수
    private static final int WEEKLY_DAYS = 7;
    private static final int DAYS_INCREMENT = 1;
    private static final int FIRST_DAY_OF_MONTH = 1;
    private static final int FIRST_MONTH_OF_YEAR = 1;

    // 월별 집계 결과 배열 인덱스
    private static final int RESULT_INDEX_YEAR = 0;
    private static final int RESULT_INDEX_MONTH = 1;
    private static final int RESULT_INDEX_COUNT = 2;

    private final RiskDetectionSessionRepository riskDetectionSessionRepository;
    private final AdminDiaryRepository adminDiaryRepository;

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
     * 일지 작성 추이 차트 조회
     */
    @Transactional(readOnly = true)
    public DiaryTrendResponse getDiaryTrend(
            String period,
            Integer year,
            Integer month
    ) {
        // 기간 계산 (LocalDate 사용)
        DatePeriodRange datePeriodRange = calculateDatePeriodRange(period, year, month);
        LocalDate startDate = datePeriodRange.getStartDate();
        LocalDate endDate = datePeriodRange.getEndDate();

        // period에 따라 다른 집계 방식 사용
        List<DiaryTrendItem> trend;
        if (PERIOD_YEARLY.equalsIgnoreCase(period)) {
            // 연간: 월별 집계
            trend = buildMonthlyTrend(startDate, endDate);
        } else {
            // 주간/월간: 일별 집계
            trend = buildDailyTrend(startDate, endDate);
        }

        Integer resolvedYear = getDefaultYearIfNull(year);
        return DiaryTrendResponse.builder()
                .period(period)
                .year(resolvedYear)
                .month(month)
                .trend(trend)
                .build();
    }

    /**
     * 기간 범위 계산
     */
    private PeriodRange calculatePeriodRange(String period, Integer year, Integer month) {
        Integer resolvedYear = getDefaultYearIfNull(year);
        String periodLower = period.toLowerCase();
        switch (periodLower) {
            case PERIOD_WEEKLY:
                return calculateWeeklyRange(resolvedYear, month);
            case PERIOD_MONTHLY:
                return calculateMonthlyRange(resolvedYear, month);
            case PERIOD_YEARLY:
                return calculateYearlyRange(resolvedYear);
            default:
                throw new IllegalArgumentException(String.format(ERROR_MESSAGE_INVALID_PERIOD, period));
        }
    }

    /**
     * LocalDate 기간 범위 계산
     */
    private DatePeriodRange calculateDatePeriodRange(String period, Integer year, Integer month) {
        Integer resolvedYear = getDefaultYearIfNull(year);
        String periodLower = period.toLowerCase();
        switch (periodLower) {
            case PERIOD_WEEKLY:
                return calculateWeeklyDateRange(resolvedYear, month);
            case PERIOD_MONTHLY:
                return calculateMonthlyDateRange(resolvedYear, month);
            case PERIOD_YEARLY:
                return calculateYearlyDateRange(resolvedYear);
            default:
                throw new IllegalArgumentException(String.format(ERROR_MESSAGE_INVALID_PERIOD, period));
        }
    }

    /**
     * year 기본값 설정 (null이면 현재 연도)
     */
    private Integer getDefaultYearIfNull(Integer year) {
        return year != null ? year : LocalDate.now().getYear();
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
        Integer resolvedMonth = getDefaultMonthIfNull(month);
        LocalDate startDate = LocalDate.of(year, resolvedMonth, FIRST_DAY_OF_MONTH);
        LocalDate endDate = startDate.plusDays(WEEKLY_DAYS);
        if (endDate.getMonthValue() != resolvedMonth) {
            endDate = YearMonth.of(year, resolvedMonth).atEndOfMonth().plusDays(DAYS_INCREMENT);
        }
        return new PeriodRange(startDate.atStartOfDay(), endDate.atStartOfDay());
    }

    /**
     * 월간 기간 범위 계산
     */
    private PeriodRange calculateMonthlyRange(Integer year, Integer month) {
        Integer resolvedMonth = getDefaultMonthIfNull(month);
        LocalDate startDate = LocalDate.of(year, resolvedMonth, FIRST_DAY_OF_MONTH);
        LocalDate endDate = YearMonth.of(year, resolvedMonth).atEndOfMonth().plusDays(DAYS_INCREMENT);
        return new PeriodRange(startDate.atStartOfDay(), endDate.atStartOfDay());
    }

    /**
     * 연간 기간 범위 계산
     */
    private PeriodRange calculateYearlyRange(Integer year) {
        LocalDate startDate = LocalDate.of(year, FIRST_MONTH_OF_YEAR, FIRST_DAY_OF_MONTH);
        LocalDate endDate = LocalDate.of(year + 1, FIRST_MONTH_OF_YEAR, FIRST_DAY_OF_MONTH);
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
     * month 기본값 설정 (null이면 현재 월)
     */
    private Integer getDefaultMonthIfNull(Integer month) {
        return month != null ? month : LocalDate.now().getMonthValue();
    }

    /**
     * 주간 LocalDate 기간 범위 계산
     */
    private DatePeriodRange calculateWeeklyDateRange(Integer year, Integer month) {
        Integer resolvedMonth = getDefaultMonthIfNull(month);
        LocalDate startDate = LocalDate.of(year, resolvedMonth, FIRST_DAY_OF_MONTH);
        LocalDate endDate = startDate.plusDays(WEEKLY_DAYS);
        if (endDate.getMonthValue() != resolvedMonth) {
            endDate = YearMonth.of(year, resolvedMonth).atEndOfMonth().plusDays(DAYS_INCREMENT);
        }
        return new DatePeriodRange(startDate, endDate);
    }

    /**
     * 월간 LocalDate 기간 범위 계산
     */
    private DatePeriodRange calculateMonthlyDateRange(Integer year, Integer month) {
        Integer resolvedMonth = getDefaultMonthIfNull(month);
        LocalDate startDate = LocalDate.of(year, resolvedMonth, FIRST_DAY_OF_MONTH);
        LocalDate endDate = YearMonth.of(year, resolvedMonth).atEndOfMonth().plusDays(DAYS_INCREMENT);
        return new DatePeriodRange(startDate, endDate);
    }

    /**
     * 연간 LocalDate 기간 범위 계산
     */
    private DatePeriodRange calculateYearlyDateRange(Integer year) {
        LocalDate startDate = LocalDate.of(year, FIRST_MONTH_OF_YEAR, FIRST_DAY_OF_MONTH);
        LocalDate endDate = LocalDate.of(year + 1, FIRST_MONTH_OF_YEAR, FIRST_DAY_OF_MONTH);
        return new DatePeriodRange(startDate, endDate);
    }

    /**
     * 일별 추이 생성
     */
    private List<DiaryTrendItem> buildDailyTrend(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = adminDiaryRepository.countDiariesByDateInPeriod(startDate, endDate);
        
        // 결과를 Map으로 변환 (빠른 조회를 위해)
        Map<LocalDate, Long> countMap = results.stream()
                .collect(Collectors.toMap(
                        result -> (LocalDate) result[0],
                        result -> ((Number) result[1]).longValue()
                ));

        // 기간 내 모든 날짜에 대해 데이터 생성 (0인 날짜도 포함)
        List<DiaryTrendItem> trend = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (currentDate.isBefore(endDate)) {
            Long count = countMap.getOrDefault(currentDate, 0L);
            trend.add(createDiaryTrendItem(currentDate.format(DATE_FORMATTER), count));
            currentDate = currentDate.plusDays(DAYS_INCREMENT);
        }

        return trend;
    }

    /**
     * 월별 추이 생성
     */
    private List<DiaryTrendItem> buildMonthlyTrend(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = adminDiaryRepository.countDiariesByMonthInPeriod(startDate, endDate);
        
        return results.stream()
                .map(this::convertMonthlyResultToTrendItem)
                .collect(Collectors.toList());
    }

    /**
     * 월별 집계 결과를 DiaryTrendItem으로 변환
     */
    private DiaryTrendItem convertMonthlyResultToTrendItem(Object[] result) {
        Integer year = extractYearFromResult(result);
        Integer month = extractMonthFromResult(result);
        Long count = extractCountFromResult(result);
        
        LocalDate monthDate = LocalDate.of(year, month, FIRST_DAY_OF_MONTH);
        return createDiaryTrendItem(monthDate.format(MONTH_FORMATTER), count);
    }

    /**
     * 결과 배열에서 year 추출
     */
    private Integer extractYearFromResult(Object[] result) {
        return (Integer) result[RESULT_INDEX_YEAR];
    }

    /**
     * 결과 배열에서 month 추출
     */
    private Integer extractMonthFromResult(Object[] result) {
        return (Integer) result[RESULT_INDEX_MONTH];
    }

    /**
     * 결과 배열에서 count 추출
     */
    private Long extractCountFromResult(Object[] result) {
        return ((Number) result[RESULT_INDEX_COUNT]).longValue();
    }

    /**
     * DiaryTrendItem 생성
     */
    private DiaryTrendItem createDiaryTrendItem(String date, Long count) {
        return DiaryTrendItem.builder()
                .date(date)
                .count(count)
                .build();
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

    /**
     * LocalDate 기간 범위 내부 클래스
     */
    private static class DatePeriodRange {
        private final LocalDate startDate;
        private final LocalDate endDate;

        public DatePeriodRange(LocalDate startDate, LocalDate endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }
    }
}

