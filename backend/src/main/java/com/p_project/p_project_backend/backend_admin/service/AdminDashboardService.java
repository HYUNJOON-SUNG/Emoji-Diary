package com.p_project.p_project_backend.backend_admin.service;

import com.p_project.p_project_backend.backend_admin.dto.dashboard.DiaryTrendItem;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.DiaryTrendResponse;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.RiskLevelDistributionItem;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.RiskLevelDistributionResponse;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.UserActivityStatsItem;
import com.p_project.p_project_backend.backend_admin.dto.dashboard.UserActivityStatsResponse;
import com.p_project.p_project_backend.entity.RiskDetectionSession;
import com.p_project.p_project_backend.repository.AdminDiaryRepository;
import com.p_project.p_project_backend.repository.RiskDetectionSessionRepository;
import com.p_project.p_project_backend.repository.UserRepository;
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
    private static final String ERROR_MESSAGE_INVALID_MONTH = "Invalid month: %d. Must be between 1 and 12.";

    // 월 유효성 검증 상수
    private static final int MIN_MONTH = 1;
    private static final int MAX_MONTH = 12;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    // 기간 계산 상수
    private static final int WEEKLY_DAYS = 7;
    private static final int MONTHLY_DAYS = 30;
    private static final int DAYS_INCREMENT = 1;
    private static final int FIRST_DAY_OF_MONTH = 1;
    private static final int FIRST_MONTH_OF_YEAR = 1;

    // 월별 집계 결과 배열 인덱스
    private static final int RESULT_INDEX_YEAR = 0;
    private static final int RESULT_INDEX_MONTH = 1;
    private static final int RESULT_INDEX_COUNT = 2;

    // Metrics 상수
    private static final String METRIC_DAU = "dau";
    private static final String METRIC_WAU = "wau";
    private static final String METRIC_MAU = "mau";
    private static final String METRIC_NEW_USERS = "newUsers";
    private static final String METRIC_RETENTION_RATE = "retentionRate";

    // 기본 metrics 목록
    private static final List<String> DEFAULT_METRICS = List.of(
            METRIC_DAU, METRIC_WAU, METRIC_MAU, METRIC_NEW_USERS, METRIC_RETENTION_RATE
    );

    private final RiskDetectionSessionRepository riskDetectionSessionRepository;
    private final AdminDiaryRepository adminDiaryRepository;
    private final UserRepository userRepository;

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
     * 사용자 활동 통계 차트 조회
     */
    @Transactional(readOnly = true)
    public UserActivityStatsResponse getUserActivityStats(
            String period,
            Integer year,
            Integer month,
            String metrics
    ) {
        // metrics 파라미터 파싱
        List<String> metricsList = parseMetrics(metrics);
        
        // 기간 계산 (LocalDate 사용)
        DatePeriodRange datePeriodRange = calculateDatePeriodRange(period, year, month);
        LocalDate startDate = datePeriodRange.getStartDate();
        LocalDate endDate = datePeriodRange.getEndDate();

        // period에 따라 다른 집계 방식 사용
        List<UserActivityStatsItem> trend;
        if (PERIOD_YEARLY.equalsIgnoreCase(period)) {
            // 연간: 월별 집계
            trend = buildMonthlyUserActivityTrend(startDate, endDate, metricsList);
        } else {
            // 주간/월간: 일별 집계
            trend = buildDailyUserActivityTrend(startDate, endDate, metricsList);
        }

        Integer resolvedYear = getDefaultYearIfNull(year);
        return UserActivityStatsResponse.builder()
                .period(period)
                .year(resolvedYear)
                .month(month)
                .metrics(metricsList)
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
     * 유효성 검증 포함 (1~12 범위)
     */
    private Integer getDefaultMonthIfNull(Integer month) {
        if (month == null) {
            return LocalDate.now().getMonthValue();
        }
        if (month < MIN_MONTH || month > MAX_MONTH) {
            throw new IllegalArgumentException(String.format(ERROR_MESSAGE_INVALID_MONTH, month));
        }
        return month;
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
     * metrics 파라미터 파싱
     */
    private List<String> parseMetrics(String metrics) {
        if (metrics == null || metrics.trim().isEmpty()) {
            return new ArrayList<>(DEFAULT_METRICS);
        }
        return List.of(metrics.split(","))
                .stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * 일별 사용자 활동 추이 생성
     */
    private List<UserActivityStatsItem> buildDailyUserActivityTrend(
            LocalDate startDate,
            LocalDate endDate,
            List<String> metricsList
    ) {
        List<UserActivityStatsItem> trend = new ArrayList<>();
        LocalDate currentDate = startDate;
        
        while (currentDate.isBefore(endDate)) {
            UserActivityStatsItem item = buildUserActivityItemForDate(currentDate, metricsList);
            trend.add(item);
            currentDate = currentDate.plusDays(DAYS_INCREMENT);
        }
        
        return trend;
    }

    /**
     * 월별 사용자 활동 추이 생성
     */
    private List<UserActivityStatsItem> buildMonthlyUserActivityTrend(
            LocalDate startDate,
            LocalDate endDate,
            List<String> metricsList
    ) {
        List<UserActivityStatsItem> trend = new ArrayList<>();
        LocalDate currentDate = startDate;
        
        while (currentDate.isBefore(endDate)) {
            YearMonth yearMonth = YearMonth.from(currentDate);
            LocalDate monthStart = yearMonth.atDay(FIRST_DAY_OF_MONTH);
            LocalDate monthEnd = yearMonth.atEndOfMonth();
            
            UserActivityStatsItem item = buildUserActivityItemForMonth(monthStart, monthEnd, metricsList);
            trend.add(item);
            
            currentDate = yearMonth.plusMonths(1).atDay(FIRST_DAY_OF_MONTH);
        }
        
        return trend;
    }

    /**
     * 특정 날짜의 사용자 활동 통계 항목 생성
     */
    private UserActivityStatsItem buildUserActivityItemForDate(
            LocalDate date,
            List<String> metricsList
    ) {
        UserActivityStatsItem.UserActivityStatsItemBuilder builder = UserActivityStatsItem.builder()
                .date(date.format(DATE_FORMATTER));

        // DAU 계산
        if (metricsList.contains(METRIC_DAU)) {
            Long dau = adminDiaryRepository.countDistinctUsersByDate(date);
            builder.dau(toIntOrZero(dau));
        }

        // WAU 계산 (최근 7일)
        if (metricsList.contains(METRIC_WAU)) {
            LocalDate wauStartDate = date.minusDays(WEEKLY_DAYS - 1);
            Long wau = adminDiaryRepository.countDistinctUsersInPeriod(wauStartDate, date.plusDays(DAYS_INCREMENT));
            builder.wau(toIntOrZero(wau));
        }

        // MAU 계산 (최근 30일)
        if (metricsList.contains(METRIC_MAU)) {
            LocalDate mauStartDate = date.minusDays(MONTHLY_DAYS - 1);
            Long mau = adminDiaryRepository.countDistinctUsersInPeriod(mauStartDate, date.plusDays(DAYS_INCREMENT));
            builder.mau(toIntOrZero(mau));
        }

        // 신규 가입자 수 계산
        if (metricsList.contains(METRIC_NEW_USERS)) {
            Integer newUsers = calculateNewUsersForDate(date);
            builder.newUsers(newUsers);
        }

        // 유지율 계산
        if (metricsList.contains(METRIC_RETENTION_RATE)) {
            Double retentionRate = calculateRetentionRateForDate(date);
            builder.retentionRate(retentionRate);
        }

        return builder.build();
    }

    /**
     * 특정 월의 사용자 활동 통계 항목 생성
     */
    private UserActivityStatsItem buildUserActivityItemForMonth(
            LocalDate monthStart,
            LocalDate monthEnd,
            List<String> metricsList
    ) {
        UserActivityStatsItem.UserActivityStatsItemBuilder builder = UserActivityStatsItem.builder()
                .date(YearMonth.from(monthStart).format(MONTH_FORMATTER));

        // DAU: 월 평균 (월 내 일별 DAU의 평균)
        if (metricsList.contains(METRIC_DAU)) {
            List<Object[]> dailyDauResults = adminDiaryRepository.countDistinctUsersByDateInPeriod(monthStart, monthEnd);
            double avgDau = dailyDauResults.stream()
                    .mapToLong(result -> ((Number) result[1]).longValue())
                    .average()
                    .orElse(0.0);
            builder.dau((int) Math.round(avgDau));
        }

        // WAU: 월 말일 기준 WAU
        if (metricsList.contains(METRIC_WAU)) {
            LocalDate monthEndDate = monthEnd.minusDays(DAYS_INCREMENT);
            LocalDate wauStartDate = monthEndDate.minusDays(WEEKLY_DAYS - 1);
            Long wau = adminDiaryRepository.countDistinctUsersInPeriod(wauStartDate, monthEnd);
            builder.wau(toIntOrZero(wau));
        }

        // MAU: 월 말일 기준 MAU
        if (metricsList.contains(METRIC_MAU)) {
            LocalDate monthEndDate = monthEnd.minusDays(DAYS_INCREMENT);
            LocalDate mauStartDate = monthEndDate.minusDays(MONTHLY_DAYS - 1);
            Long mau = adminDiaryRepository.countDistinctUsersInPeriod(mauStartDate, monthEnd);
            builder.mau(toIntOrZero(mau));
        }

        // 신규 가입자 수: 월 전체
        if (metricsList.contains(METRIC_NEW_USERS)) {
            Integer newUsers = calculateNewUsersForMonth(monthStart, monthEnd);
            builder.newUsers(newUsers);
        }

        // 유지율: 이전 월과 현재 월 비교
        if (metricsList.contains(METRIC_RETENTION_RATE)) {
            Double retentionRate = calculateRetentionRateForMonth(monthStart, monthEnd);
            builder.retentionRate(retentionRate);
        }

        return builder.build();
    }

    /**
     * Long을 Integer로 변환 (null이면 0)
     */
    private Integer toIntOrZero(Long value) {
        return value != null ? value.intValue() : 0;
    }

    /**
     * 특정 날짜의 신규 가입자 수 계산
     */
    private Integer calculateNewUsersForDate(LocalDate date) {
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(DAYS_INCREMENT).atStartOfDay();
        List<Object[]> results = userRepository.countNewUsersByDateInPeriod(dayStart, dayEnd);
        
        long newUsers = results.stream()
                .filter(result -> {
                    java.sql.Date sqlDate = (java.sql.Date) result[0];
                    LocalDate resultDate = sqlDate.toLocalDate();
                    return resultDate.equals(date);
                })
                .mapToLong(result -> ((Number) result[1]).longValue())
                .findFirst()
                .orElse(0L);
        
        return (int) newUsers;
    }

    /**
     * 특정 월의 신규 가입자 수 계산
     */
    private Integer calculateNewUsersForMonth(LocalDate monthStart, LocalDate monthEnd) {
        LocalDateTime monthStartDateTime = monthStart.atStartOfDay();
        LocalDateTime monthEndDateTime = monthEnd.atStartOfDay();
        List<Object[]> results = userRepository.countNewUsersByMonthInPeriod(monthStartDateTime, monthEndDateTime);
        
        long newUsers = results.stream()
                .filter(result -> {
                    Integer resultYear = (Integer) result[0];
                    Integer resultMonth = (Integer) result[1];
                    return resultYear.equals(monthStart.getYear()) && resultMonth.equals(monthStart.getMonthValue());
                })
                .mapToLong(result -> ((Number) result[2]).longValue())
                .findFirst()
                .orElse(0L);
        
        return (int) newUsers;
    }

    /**
     * 특정 날짜의 유지율 계산
     * 이전 날짜에 활동한 사용자 중, 현재 날짜에도 활동한 사용자의 비율
     */
    private Double calculateRetentionRateForDate(LocalDate date) {
        LocalDate previousDate = date.minusDays(DAYS_INCREMENT);
        
        // 이전 날짜에 활동한 사용자 ID 목록
        List<Long> previousUserIds = adminDiaryRepository.findDistinctUserIdsByDate(previousDate);
        if (previousUserIds.isEmpty()) {
            return 0.0;
        }
        
        // 현재 날짜에 활동한 사용자 ID 목록
        List<Long> currentUserIds = adminDiaryRepository.findDistinctUserIdsByDate(date);
        
        // 교집합 계산
        long retainedUsers = currentUserIds.stream()
                .filter(previousUserIds::contains)
                .count();
        
        return calculatePercentage(retainedUsers, previousUserIds.size());
    }

    /**
     * 특정 월의 유지율 계산
     * 이전 월에 활동한 사용자 중, 현재 월에도 활동한 사용자의 비율
     */
    private Double calculateRetentionRateForMonth(LocalDate monthStart, LocalDate monthEnd) {
        YearMonth currentMonth = YearMonth.from(monthStart);
        YearMonth previousMonth = currentMonth.minusMonths(1);
        
        LocalDate previousMonthStart = previousMonth.atDay(FIRST_DAY_OF_MONTH);
        LocalDate previousMonthEnd = previousMonth.atEndOfMonth().plusDays(DAYS_INCREMENT);
        
        // 이전 월에 활동한 사용자 ID 목록
        List<Long> previousUserIds = adminDiaryRepository.findDistinctUserIdsInPeriod(previousMonthStart, previousMonthEnd);
        if (previousUserIds.isEmpty()) {
            return 0.0;
        }
        
        // 현재 월에 활동한 사용자 ID 목록
        List<Long> currentUserIds = adminDiaryRepository.findDistinctUserIdsInPeriod(monthStart, monthEnd);
        
        // 교집합 계산
        long retainedUsers = currentUserIds.stream()
                .filter(previousUserIds::contains)
                .count();
        
        return calculatePercentage(retainedUsers, previousUserIds.size());
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

