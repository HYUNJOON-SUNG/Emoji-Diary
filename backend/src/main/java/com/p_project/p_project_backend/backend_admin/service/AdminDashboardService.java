package com.p_project.p_project_backend.backend_admin.service;

import com.p_project.p_project_backend.backend_admin.dto.dashboard.DashboardStatsResponse;
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
    private static final String METRIC_NEW_USERS = "newUsers";
    private static final String METRIC_WITHDRAWN_USERS = "withdrawnUsers";

    // 기본 metrics 목록
    private static final List<String> DEFAULT_METRICS = List.of(
            METRIC_NEW_USERS, METRIC_WITHDRAWN_USERS);

    // ActiveUserType 상수 (기본값)
    private static final String ACTIVE_USER_TYPE_DAU = "dau";

    // NewUserPeriod 상수 (기본값)
    private static final String NEW_USER_PERIOD_DAILY = "daily";

    private final RiskDetectionSessionRepository riskDetectionSessionRepository;
    private final AdminDiaryRepository adminDiaryRepository;
    private final UserRepository userRepository;

    /**
     * 위험 레벨 분포 통계 조회
     */
    @Transactional(readOnly = true)
    public RiskLevelDistributionResponse getRiskLevelDistribution(String period) {
        // 기간 계산
        PeriodRange periodRange = calculatePeriodRange(period);
        LocalDateTime startDate = periodRange.getStartDate();
        LocalDateTime endDate = periodRange.getEndDate();

        // 위험 레벨별 사용자 수 집계
        Map<RiskDetectionSession.RiskLevel, Long> riskLevelCounts = extractRiskLevelCounts(startDate, endDate);

        // 기간 내에 세션이 있는 전체 사용자 수 조회
        Long totalUsersInPeriod = riskDetectionSessionRepository.countTotalUsersInPeriod(startDate, endDate);
        long totalUsers = totalUsersInPeriod != null ? totalUsersInPeriod : 0L;

        // 비율 계산 및 Response 생성
        return buildRiskLevelDistributionResponse(
                period, riskLevelCounts, totalUsers);
    }

    /**
     * 일기 작성 추이 통계 조회
     */
    @Transactional(readOnly = true)
    public DiaryTrendResponse getDiaryTrend(
            String period,
            Integer year,
            Integer month) {
        // 기간 계산
        DatePeriodRange datePeriodRange = calculateDatePeriodRange(period, year, month);
        LocalDate startDate = datePeriodRange.getStartDate();
        LocalDate endDate = datePeriodRange.getEndDate();

        // 기간별 집계 수행
        List<DiaryTrendItem> trend;
        if (PERIOD_YEARLY.equalsIgnoreCase(period)) {
            // 월별 집계
            trend = buildMonthlyTrend(startDate, endDate);
        } else {
            // 일별 집계
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
     * 서비스 주요 통계(가입자, 일기, 위험군 등) 카드 데이터 조회
     */
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(
            String averageDiariesPeriod,
            String riskLevelPeriod,
            String activeUserType,
            String newUserPeriod) {
        // 기본값 설정
        String resolvedAverageDiariesPeriod = (averageDiariesPeriod != null && !averageDiariesPeriod.trim().isEmpty())
                ? averageDiariesPeriod.toLowerCase()
                : PERIOD_MONTHLY;
        String resolvedRiskLevelPeriod = (riskLevelPeriod != null && !riskLevelPeriod.trim().isEmpty())
                ? riskLevelPeriod.toLowerCase()
                : PERIOD_MONTHLY;
        String resolvedActiveUserType = (activeUserType != null && !activeUserType.trim().isEmpty())
                ? activeUserType.toLowerCase()
                : ACTIVE_USER_TYPE_DAU;
        String resolvedNewUserPeriod = (newUserPeriod != null && !newUserPeriod.trim().isEmpty())
                ? newUserPeriod.toLowerCase()
                : NEW_USER_PERIOD_DAILY;

        // 전체 사용자 수 계산
        DashboardStatsResponse.TotalUsersInfo totalUsers = calculateTotalUsersInfo();

        // 활성 사용자 수(DAU/WAU/MAU) 계산
        DashboardStatsResponse.ActiveUsersInfo activeUsers = calculateActiveUsers(resolvedActiveUserType);

        // 신규 가입자 수 계산
        DashboardStatsResponse.NewUsersInfo newUsers = calculateNewUsers(resolvedNewUserPeriod);

        // 총 일기 작성 수 계산
        DashboardStatsResponse.TotalDiariesInfo totalDiaries = calculateTotalDiariesInfo();

        // 일평균 일기 작성 수 계산
        PeriodRange avgDiariesPeriodRange = calculatePeriodRangeForStats(resolvedAverageDiariesPeriod);
        LocalDateTime avgDiariesCurrentStart = avgDiariesPeriodRange.getStartDate();
        LocalDateTime avgDiariesCurrentEnd = avgDiariesPeriodRange.getEndDate();

        DashboardStatsResponse.AverageDailyDiariesInfo averageDailyDiaries = calculateAverageDailyDiaries(
                resolvedAverageDiariesPeriod, avgDiariesCurrentStart, avgDiariesCurrentEnd);

        // 위험 레벨별 사용자 수 계산
        PeriodRange riskLevelPeriodRange = calculatePeriodRangeForStats(resolvedRiskLevelPeriod);
        LocalDateTime riskLevelCurrentStart = riskLevelPeriodRange.getStartDate();
        LocalDateTime riskLevelCurrentEnd = riskLevelPeriodRange.getEndDate();

        DashboardStatsResponse.RiskLevelUsersInfo riskLevelUsers = calculateRiskLevelUsers(
                resolvedRiskLevelPeriod, riskLevelCurrentStart, riskLevelCurrentEnd);

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .newUsers(newUsers)
                .totalDiaries(totalDiaries)
                .averageDailyDiaries(averageDailyDiaries)
                .riskLevelUsers(riskLevelUsers)
                .build();
    }

    /**
     * 전체 사용자 수 계산
     */
    private DashboardStatsResponse.TotalUsersInfo calculateTotalUsersInfo() {
        // 현재 시점의 전체 사용자 수
        long totalUsersCount = userRepository.countByDeletedAtIsNull();

        return DashboardStatsResponse.TotalUsersInfo.builder()
                .count(totalUsersCount)
                .build();
    }

    /**
     * 총 일기 작성 수 계산
     */
    private DashboardStatsResponse.TotalDiariesInfo calculateTotalDiariesInfo() {
        long totalDiariesCount = getLongValueOrZero(adminDiaryRepository.countTotalDiaries());

        return DashboardStatsResponse.TotalDiariesInfo.builder()
                .count(totalDiariesCount)
                .build();
    }

    /**
     * Null 안전한 Long 값 반환
     */
    private long getLongValueOrZero(Long value) {
        return value != null ? value : 0L;
    }

    /**
     * 사용자 활동 통계 차트 조회
     */
    @Transactional(readOnly = true)
    public UserActivityStatsResponse getUserActivityStats(
            String period,
            String metrics) {
        // metrics 파라미터 파싱
        List<String> metricsList = parseMetrics(metrics);

        // 기간 계산 (롤링 윈도우 사용)
        DatePeriodRange datePeriodRange = calculateRollingDatePeriodRange(period);
        LocalDate startDate = datePeriodRange.getStartDate();
        LocalDate endDate = datePeriodRange.getEndDate();

        List<UserActivityStatsItem> trend;
        if (PERIOD_YEARLY.equalsIgnoreCase(period)) {
            // 월별 집계
            trend = buildMonthlyUserActivityTrend(startDate, endDate, metricsList);
        } else {
            // 일별 집계
            trend = buildDailyUserActivityTrend(startDate, endDate, metricsList);
        }

        return UserActivityStatsResponse.builder()
                .period(period)
                .metrics(metricsList)
                .trend(trend)
                .build();
    }

    /**
     * 기간 범위 문자열 파싱 및 계산
     */
    private PeriodRange calculatePeriodRange(String period) {
        String periodLower = period.toLowerCase();
        switch (periodLower) {
            case PERIOD_WEEKLY:
                return calculateWeeklyRange();
            case PERIOD_MONTHLY:
                return calculateMonthlyRange();
            case PERIOD_YEARLY:
                return calculateYearlyRange();
            default:
                throw new IllegalArgumentException(String.format(ERROR_MESSAGE_INVALID_PERIOD, period));
        }
    }

    /**
     * LocalDate 기반 기간 계산
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
     * 롤링 윈도우 기간 계산 (최근 7일/30일/1년)
     */
    private DatePeriodRange calculateRollingDatePeriodRange(String period) {
        String periodLower = period.toLowerCase();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;

        switch (periodLower) {
            case PERIOD_WEEKLY:
                // 최근 7일 (오늘 포함)
                startDate = endDate.minusDays(WEEKLY_DAYS - 1);
                break;
            case PERIOD_MONTHLY:
                // 최근 30일 (오늘 포함)
                startDate = endDate.minusDays(MONTHLY_DAYS - 1);
                break;
            case PERIOD_YEARLY:
                // 최근 1년 (오늘 포함)
                startDate = endDate.minusYears(1).plusDays(1);
                break;
            default:
                throw new IllegalArgumentException(String.format(ERROR_MESSAGE_INVALID_PERIOD, period));
        }

        return new DatePeriodRange(startDate, endDate);
    }

    /**
     * 연도값이 없으면 현재 연도 반환
     */
    private Integer getDefaultYearIfNull(Integer year) {
        return year != null ? year : LocalDate.now().getYear();
    }

    /**
     * 위험 레벨별 사용자 수 집계
     */
    private Map<RiskDetectionSession.RiskLevel, Long> extractRiskLevelCounts(
            LocalDateTime startDate,
            LocalDateTime endDate) {
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
     * 최근 7일 기간 계산
     */
    private PeriodRange calculateWeeklyRange() {
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.minusDays(6);
        LocalDate endDate = now.plusDays(1);
        return new PeriodRange(startDate.atStartOfDay(), endDate.atStartOfDay());
    }

    /**
     * 최근 30일 기간 계산
     */
    private PeriodRange calculateMonthlyRange() {
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.minusDays(29);
        LocalDate endDate = now.plusDays(1);
        return new PeriodRange(startDate.atStartOfDay(), endDate.atStartOfDay());
    }

    /**
     * 최근 1년 기간 계산
     */
    private PeriodRange calculateYearlyRange() {
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.minusYears(1);
        LocalDate endDate = now.plusDays(1);
        return new PeriodRange(startDate.atStartOfDay(), endDate.atStartOfDay());
    }

    /**
     * 위험 레벨 분포 응답 객체 생성
     */
    private RiskLevelDistributionResponse buildRiskLevelDistributionResponse(
            String period,
            Map<RiskDetectionSession.RiskLevel, Long> riskLevelCounts,
            long totalUsers) {
        RiskLevelDistributionResponse.RiskLevelDistribution distribution = buildDistribution(riskLevelCounts,
                totalUsers);

        return RiskLevelDistributionResponse.builder()
                .period(period)
                .distribution(distribution)
                .total(totalUsers)
                .build();
    }

    /**
     * 위험 레벨별 분포 정보 생성
     */
    private RiskLevelDistributionResponse.RiskLevelDistribution buildDistribution(
            Map<RiskDetectionSession.RiskLevel, Long> riskLevelCounts,
            long totalUsers) {
        return RiskLevelDistributionResponse.RiskLevelDistribution.builder()
                .high(createDistributionItem(riskLevelCounts.getOrDefault(RiskDetectionSession.RiskLevel.HIGH, 0L),
                        totalUsers))
                .medium(createDistributionItem(riskLevelCounts.getOrDefault(RiskDetectionSession.RiskLevel.MEDIUM, 0L),
                        totalUsers))
                .low(createDistributionItem(riskLevelCounts.getOrDefault(RiskDetectionSession.RiskLevel.LOW, 0L),
                        totalUsers))
                .none(createDistributionItem(riskLevelCounts.getOrDefault(RiskDetectionSession.RiskLevel.NONE, 0L),
                        totalUsers))
                .build();
    }

    /**
     * 분포 항목 생성 및 비율 계산
     */
    private RiskLevelDistributionItem createDistributionItem(long count, long total) {
        double percentage = calculatePercentage(count, total);
        return RiskLevelDistributionItem.builder()
                .count(count)
                .percentage(percentage)
                .build();
    }

    /**
     * 백분율 계산 (소수점 첫째 자리 반올림)
     */
    private double calculatePercentage(long count, long total) {
        if (total == 0) {
            return 0.0;
        }
        double percentage = (count * PERCENTAGE_MULTIPLIER) / total;
        return Math.round(percentage * PERCENTAGE_ROUNDING_FACTOR) / PERCENTAGE_ROUNDING_FACTOR;
    }

    /**
     * 주간 LocalDate 범위 계산
     */
    private DatePeriodRange calculateWeeklyDateRange(Integer year, Integer month) {
        // Rolling 7 Days (Today inclusive)
        LocalDate endDate = LocalDate.now().plusDays(1);
        LocalDate startDate = LocalDate.now().minusDays(6);
        return new DatePeriodRange(startDate, endDate);
    }

    /**
     * 월간 LocalDate 범위 계산
     */
    private DatePeriodRange calculateMonthlyDateRange(Integer year, Integer month) {
        // Rolling 30 Days (Today inclusive)
        LocalDate endDate = LocalDate.now().plusDays(1);
        LocalDate startDate = LocalDate.now().minusDays(29);
        return new DatePeriodRange(startDate, endDate);
    }

    /**
     * 연간 LocalDate 범위 계산
     */
    private DatePeriodRange calculateYearlyDateRange(Integer year) {
        // Rolling 1 Year (Today inclusive)
        LocalDate endDate = LocalDate.now().plusDays(1);
        LocalDate startDate = LocalDate.now().minusYears(1);
        return new DatePeriodRange(startDate, endDate);
    }

    /**
     * 일별 작성 추이 데이터 생성
     */
    private List<DiaryTrendItem> buildDailyTrend(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = adminDiaryRepository.countDiariesByDateInPeriod(startDate, endDate);

        // 결과를 Map으로 변환 (빠른 조회를 위해)
        Map<LocalDate, Long> countMap = results.stream()
                .collect(Collectors.toMap(
                        result -> (LocalDate) result[0],
                        result -> ((Number) result[1]).longValue()));

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
     * 월별 작성 추이 데이터 생성
     */
    private List<DiaryTrendItem> buildMonthlyTrend(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = adminDiaryRepository.countDiariesByMonthInPeriod(startDate, endDate);

        // 결과 매핑: YearMonth -> Count
        Map<YearMonth, Long> countMap = results.stream()
                .collect(Collectors.toMap(
                        result -> YearMonth.of(extractYearFromResult(result), extractMonthFromResult(result)),
                        result -> extractCountFromResult(result)));

        List<DiaryTrendItem> trend = new ArrayList<>();
        YearMonth current = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate.minusDays(1)); // endDate is exclusive (start of next period)

        while (!current.isAfter(end)) {
            Long count = countMap.getOrDefault(current, 0L);
            LocalDate monthDate = current.atDay(1);
            trend.add(createDiaryTrendItem(monthDate.format(MONTH_FORMATTER), count));
            current = current.plusMonths(1);
        }

        return trend;
    }

    /**
     * 월별 집계 결과를 DiaryTrendItem으로 변환
     */

    /**
     * 결과 배열에서 연도 추출
     */
    private Integer extractYearFromResult(Object[] result) {
        return (Integer) result[RESULT_INDEX_YEAR];
    }

    /**
     * 결과 배열에서 월 추출
     */
    private Integer extractMonthFromResult(Object[] result) {
        return (Integer) result[RESULT_INDEX_MONTH];
    }

    /**
     * 결과 배열에서 카운트 추출
     */
    private Long extractCountFromResult(Object[] result) {
        return ((Number) result[RESULT_INDEX_COUNT]).longValue();
    }

    /**
     * 추이 아이템 객체 생성
     */
    private DiaryTrendItem createDiaryTrendItem(String date, Long count) {
        return DiaryTrendItem.builder()
                .date(date)
                .count(count)
                .build();
    }

    /**
     * 메트릭 목록 파싱
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
     * 일별 사용자 활동 데이터 생성
     */
    private List<UserActivityStatsItem> buildDailyUserActivityTrend(
            LocalDate startDate,
            LocalDate endDate,
            List<String> metricsList) {
        List<UserActivityStatsItem> trend = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            UserActivityStatsItem item = buildUserActivityItemForDate(currentDate, metricsList);
            trend.add(item);
            currentDate = currentDate.plusDays(DAYS_INCREMENT);
        }

        return trend;
    }

    /**
     * 월별 사용자 활동 데이터 생성
     */
    private List<UserActivityStatsItem> buildMonthlyUserActivityTrend(
            LocalDate startDate,
            LocalDate endDate,
            List<String> metricsList) {
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
     * 일별 활동 통계 항목 빌드
     */
    private UserActivityStatsItem buildUserActivityItemForDate(
            LocalDate date,
            List<String> metricsList) {
        UserActivityStatsItem.UserActivityStatsItemBuilder builder = UserActivityStatsItem.builder()
                .date(date.format(DATE_FORMATTER));

        // 신규 가입자 수 계산
        if (metricsList.contains(METRIC_NEW_USERS)) {
            Integer newUsers = calculateNewUsersForDate(date);
            builder.newUsers(newUsers);
        }

        // 탈퇴 사용자 수 계산
        if (metricsList.contains(METRIC_WITHDRAWN_USERS)) {
            Integer withdrawnUsers = calculateWithdrawnUsersForDate(date);
            builder.withdrawnUsers(withdrawnUsers);
        }

        return builder.build();
    }

    /**
     * 월별 활동 통계 항목 빌드
     */
    private UserActivityStatsItem buildUserActivityItemForMonth(
            LocalDate monthStart,
            LocalDate monthEnd,
            List<String> metricsList) {
        UserActivityStatsItem.UserActivityStatsItemBuilder builder = UserActivityStatsItem.builder()
                .date(YearMonth.from(monthStart).format(MONTH_FORMATTER));

        // 신규 가입자 수: 월 전체
        if (metricsList.contains(METRIC_NEW_USERS)) {
            Integer newUsers = calculateNewUsersForMonth(monthStart, monthEnd);
            builder.newUsers(newUsers);
        }

        // 탈퇴 사용자 수: 월 전체
        if (metricsList.contains(METRIC_WITHDRAWN_USERS)) {
            Integer withdrawnUsers = calculateWithdrawnUsersForMonth(monthStart, monthEnd);
            builder.withdrawnUsers(withdrawnUsers);
        }

        return builder.build();
    }

    /**
     * 일별 신규 가입자 수 계산
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
     * 월별 신규 가입자 수 계산
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
     * 일별 탈퇴 사용자 수 계산
     */
    private Integer calculateWithdrawnUsersForDate(LocalDate date) {
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(DAYS_INCREMENT).atStartOfDay();
        List<Object[]> results = userRepository.countWithdrawnUsersByDateInPeriod(dayStart, dayEnd);

        long withdrawnUsers = results.stream()
                .filter(result -> {
                    java.sql.Date sqlDate = (java.sql.Date) result[0];
                    LocalDate resultDate = sqlDate.toLocalDate();
                    return resultDate.equals(date);
                })
                .mapToLong(result -> ((Number) result[1]).longValue())
                .findFirst()
                .orElse(0L);

        return (int) withdrawnUsers;
    }

    /**
     * 월별 탈퇴 사용자 수 계산
     */
    private Integer calculateWithdrawnUsersForMonth(LocalDate monthStart, LocalDate monthEnd) {
        LocalDateTime monthStartDateTime = monthStart.atStartOfDay();
        LocalDateTime monthEndDateTime = monthEnd.atStartOfDay();
        List<Object[]> results = userRepository.countWithdrawnUsersByMonthInPeriod(monthStartDateTime,
                monthEndDateTime);

        long withdrawnUsers = results.stream()
                .filter(result -> {
                    Integer resultYear = (Integer) result[0];
                    Integer resultMonth = (Integer) result[1];
                    return resultYear.equals(monthStart.getYear()) && resultMonth.equals(monthStart.getMonthValue());
                })
                .mapToLong(result -> ((Number) result[2]).longValue())
                .findFirst()
                .orElse(0L);

        return (int) withdrawnUsers;
    }

    /**
     * 통계용 기간 범위 계산
     */
    private PeriodRange calculatePeriodRangeForStats(String period) {
        LocalDate now = LocalDate.now();

        String periodLower = period.toLowerCase();
        switch (periodLower) {
            case PERIOD_WEEKLY:
                // Rolling 7 Days (Today inclusive)
                LocalDate weekStart = now.minusDays(6);
                LocalDate weekEnd = now.plusDays(1);
                return new PeriodRange(weekStart.atStartOfDay(), weekEnd.atStartOfDay());
            case PERIOD_MONTHLY:
                // Rolling 30 Days (Today inclusive)
                LocalDate monthStart = now.minusDays(29);
                LocalDate monthEnd = now.plusDays(1);
                return new PeriodRange(monthStart.atStartOfDay(), monthEnd.atStartOfDay());
            case PERIOD_YEARLY:
                // Rolling 1 Year (Today inclusive)
                LocalDate yearStart = now.minusYears(1);
                LocalDate yearEnd = now.plusDays(1);
                return new PeriodRange(yearStart.atStartOfDay(), yearEnd.atStartOfDay());
            default:
                throw new IllegalArgumentException(String.format(ERROR_MESSAGE_INVALID_PERIOD, period));
        }
    }

    /**
     * 이전 기간 범위 계산 (증감율 계산용)
     */
    private PeriodRange calculatePreviousPeriodRange(String period, LocalDateTime currentStart) {
        LocalDate startDate = currentStart.toLocalDate();
        String periodLower = period.toLowerCase();

        switch (periodLower) {
            case PERIOD_WEEKLY:
                LocalDate previousWeekStart = startDate.minusWeeks(1);
                LocalDate previousWeekEnd = previousWeekStart.plusDays(WEEKLY_DAYS);
                return new PeriodRange(previousWeekStart.atStartOfDay(), previousWeekEnd.atStartOfDay());
            case PERIOD_MONTHLY:
                YearMonth previousMonth = YearMonth.from(startDate).minusMonths(1);
                LocalDate previousMonthStart = previousMonth.atDay(FIRST_DAY_OF_MONTH);
                LocalDate previousMonthEnd = previousMonth.atEndOfMonth().plusDays(DAYS_INCREMENT);
                return new PeriodRange(previousMonthStart.atStartOfDay(), previousMonthEnd.atStartOfDay());
            case PERIOD_YEARLY:
                YearMonth previousYearStart = YearMonth.of(startDate.getYear() - 1, FIRST_MONTH_OF_YEAR);
                YearMonth previousYearEnd = YearMonth.of(startDate.getYear() - 1, 12);
                LocalDate previousYearStartDate = previousYearStart.atDay(FIRST_DAY_OF_MONTH);
                LocalDate previousYearEndDate = previousYearEnd.atEndOfMonth().plusDays(DAYS_INCREMENT);
                return new PeriodRange(previousYearStartDate.atStartOfDay(), previousYearEndDate.atStartOfDay());
            default:
                throw new IllegalArgumentException(String.format(ERROR_MESSAGE_INVALID_PERIOD, period));
        }
    }

    /**
     * 활성 사용자 수(DAU/WAU/MAU) 계산
     */
    private DashboardStatsResponse.ActiveUsersInfo calculateActiveUsers(String activeUserType) {
        LocalDate today = LocalDate.now();
        long dau = getLongValueOrZero(adminDiaryRepository.countDistinctUsersByDate(today));

        LocalDate wauStart = today.minusDays(WEEKLY_DAYS - 1);
        long wau = getLongValueOrZero(adminDiaryRepository.countDistinctUsersInPeriod(
                wauStart, today.plusDays(DAYS_INCREMENT)));

        LocalDate mauStart = today.minusDays(MONTHLY_DAYS - 1);
        long mau = getLongValueOrZero(adminDiaryRepository.countDistinctUsersInPeriod(
                mauStart, today.plusDays(DAYS_INCREMENT)));

        return DashboardStatsResponse.ActiveUsersInfo.builder()
                .dau(dau)
                .wau(wau)
                .mau(mau)
                .type(activeUserType)
                .build();
    }

    /**
     * 신규 가입자 수 계산
     */
    private DashboardStatsResponse.NewUsersInfo calculateNewUsers(String newUserPeriod) {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.plusDays(DAYS_INCREMENT).atStartOfDay();

        // 일별 신규 가입자 수
        List<Object[]> dailyResults = userRepository.countNewUsersByDateInPeriod(todayStart, todayEnd);
        Long daily = dailyResults.stream()
                .filter(result -> {
                    java.sql.Date sqlDate = (java.sql.Date) result[0];
                    return sqlDate.toLocalDate().equals(today);
                })
                .mapToLong(result -> ((Number) result[1]).longValue())
                .findFirst()
                .orElse(0L);

        // 주별 신규 가입자 수
        // 주별 신규 가입자 수 (Weekly - 최근 7일)
        LocalDate weekStart = today.minusDays(WEEKLY_DAYS - 1);
        LocalDateTime weekStartDateTime = weekStart.atStartOfDay();
        List<Object[]> weeklyResults = userRepository.countNewUsersByDateInPeriod(weekStartDateTime, todayEnd);
        Long weekly = weeklyResults.stream()
                .mapToLong(result -> ((Number) result[1]).longValue())
                .sum();

        // 월별 신규 가입자 수 (Monthly - 최근 30일)
        LocalDate monthStart = today.minusDays(MONTHLY_DAYS - 1);
        LocalDateTime monthStartDateTime = monthStart.atStartOfDay();
        List<Object[]> monthlyResults = userRepository.countNewUsersByDateInPeriod(monthStartDateTime, todayEnd);
        Long monthly = monthlyResults.stream()
                .mapToLong(result -> ((Number) result[1]).longValue())
                .sum();

        return DashboardStatsResponse.NewUsersInfo.builder()
                .daily(daily)
                .weekly(weekly)
                .monthly(monthly)
                .period(newUserPeriod)
                .build();
    }

    /**
     * 일평균 일지 작성 수 계산
     */
    private DashboardStatsResponse.AverageDailyDiariesInfo calculateAverageDailyDiaries(
            String period,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime) {
        LocalDate startDate = startDateTime.toLocalDate();
        LocalDate endDate = endDateTime.toLocalDate();

        List<Object[]> diaryCounts;
        LocalDate today = LocalDate.now();
        long daysCount;

        if (PERIOD_YEARLY.equalsIgnoreCase(period)) {
            // 연간: 월별 집계 후 평균
            diaryCounts = adminDiaryRepository.countDiariesByMonthInPeriod(startDate, endDate);

            // 분모 계산 (경과 일수)
            LocalDate effectiveEndDate = endDate.isAfter(today.plusDays(1)) ? today.plusDays(1) : endDate;
            daysCount = java.time.temporal.ChronoUnit.DAYS.between(startDate, effectiveEndDate);
            if (daysCount < 1)
                daysCount = 1;

            if (diaryCounts.isEmpty()) {
                return DashboardStatsResponse.AverageDailyDiariesInfo.builder()
                        .count(0L)
                        .period(period)
                        .build();
            }
            // 월별 일지 작성 수의 합을 일수로 나누기
            long totalDiaries = diaryCounts.stream()
                    .mapToLong(result -> ((Number) result[2]).longValue())
                    .sum();

            long average = totalDiaries / daysCount;
            return DashboardStatsResponse.AverageDailyDiariesInfo.builder()
                    .count(average)
                    .period(period)
                    .build();
        } else {
            // 주간/월간: 일별 집계 후 평균
            diaryCounts = adminDiaryRepository.countDiariesByDateInPeriod(startDate, endDate);

            // 분모 계산 (경과 일수)
            LocalDate effectiveEndDate = endDate.isAfter(today.plusDays(1)) ? today.plusDays(1) : endDate;
            daysCount = java.time.temporal.ChronoUnit.DAYS.between(startDate, effectiveEndDate);
            if (daysCount < 1)
                daysCount = 1;

            if (diaryCounts.isEmpty()) {
                return DashboardStatsResponse.AverageDailyDiariesInfo.builder()
                        .count(0L)
                        .period(period)
                        .build();
            }
            long totalDiaries = diaryCounts.stream()
                    .mapToLong(result -> ((Number) result[1]).longValue())
                    .sum();

            long average = totalDiaries / daysCount;
            return DashboardStatsResponse.AverageDailyDiariesInfo.builder()
                    .count(average)
                    .period(period)
                    .build();
        }
    }

    /**
     * 위험 레벨별 사용자 수 계산
     */
    private DashboardStatsResponse.RiskLevelUsersInfo calculateRiskLevelUsers(
            String period,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime) {
        List<Object[]> riskLevelCounts = riskDetectionSessionRepository.countUsersByRiskLevelInPeriod(
                startDateTime, endDateTime);

        Map<RiskDetectionSession.RiskLevel, Long> riskLevelMap = new HashMap<>();
        for (Object[] result : riskLevelCounts) {
            RiskDetectionSession.RiskLevel level = (RiskDetectionSession.RiskLevel) result[0];
            Long count = ((Number) result[1]).longValue();
            riskLevelMap.put(level, count);
        }

        return DashboardStatsResponse.RiskLevelUsersInfo.builder()
                .high(riskLevelMap.getOrDefault(RiskDetectionSession.RiskLevel.HIGH, 0L))
                .medium(riskLevelMap.getOrDefault(RiskDetectionSession.RiskLevel.MEDIUM, 0L))
                .low(riskLevelMap.getOrDefault(RiskDetectionSession.RiskLevel.LOW, 0L))
                .none(riskLevelMap.getOrDefault(RiskDetectionSession.RiskLevel.NONE, 0L))
                .period(period)
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
