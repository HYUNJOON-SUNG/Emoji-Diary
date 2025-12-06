package com.p_project.p_project_backend.backend_user.service;

import com.p_project.p_project_backend.backend_user.repository.DiaryRepository;
import com.p_project.p_project_backend.entity.Diary;
import com.p_project.p_project_backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

        private final DiaryRepository diaryRepository;

        @Transactional(readOnly = true)
        public Map<String, Object> getEmotionStats(User user, String period, Integer year, Integer month,
                        Integer week) {
                DateRange dateRange = calculateDateRange(period, year, month, week);
                List<Diary> diaries = diaryRepository.findByUserAndDateBetweenAndDeletedAtIsNull(user,
                                dateRange.startDate, dateRange.endDate);

                Map<String, Long> emotionCounts = calculateEmotionCounts(diaries);

                return buildStatsResponse(period, year, month, week, emotionCounts, diaries.size());
        }

        @Transactional(readOnly = true)
        public Map<String, Object> getEmotionTrend(User user, String period, Integer year, Integer month) {
                if ("weekly".equalsIgnoreCase(period)) {
                        return getDailyTrendForMonth(user, period, year, month);
                } else {
                        return getWeeklyTrendForMonth(user, period, year, month);
                }
        }

        private Map<String, Object> getDailyTrendForMonth(User user, String period, Integer year, Integer month) {
                validateYearAndMonth(year, month);
                DateRange dateRange = calculateDateRange("monthly", year, month, null); // Reuse monthly range logic
                List<Diary> diaries = diaryRepository.findByUserAndDateBetweenAndDeletedAtIsNull(user,
                                dateRange.startDate, dateRange.endDate);

                Map<LocalDate, String> dateEmotionMap = diaries.stream()
                                .collect(Collectors.toMap(Diary::getDate, d -> d.getEmotion().name(),
                                                (existing, replacement) -> existing));

                List<String> dates = new ArrayList<>();
                List<Map<String, Object>> emotions = new ArrayList<>();

                for (LocalDate date = dateRange.startDate; !date.isAfter(dateRange.endDate); date = date.plusDays(1)) {
                        if (dateEmotionMap.containsKey(date)) {
                                dates.add(date.toString());
                                emotions.add(Map.of("date", date.toString(), "emotion", dateEmotionMap.get(date)));
                        }
                }

                return Map.of("period", period, "dates", dates, "emotions", emotions);
        }

        private Map<String, Object> getWeeklyTrendForMonth(User user, String period, Integer year, Integer month) {
                validateYearAndMonth(year, month);
                DateRange dateRange = calculateDateRange("monthly", year, month, null);
                List<Diary> diaries = diaryRepository.findByUserAndDateBetweenAndDeletedAtIsNull(user,
                                dateRange.startDate, dateRange.endDate);

                Map<Integer, List<String>> weekEmotionsMap = groupEmotionsByWeek(diaries);

                List<String> dates = new ArrayList<>();
                List<Map<String, Object>> emotions = new ArrayList<>();

                for (Map.Entry<Integer, List<String>> entry : weekEmotionsMap.entrySet()) {
                        String label = calculateWeekLabel(year, entry.getKey());
                        String topEmotion = findMostFrequentEmotion(entry.getValue());

                        dates.add(label);
                        emotions.add(Map.of("date", label, "emotion", topEmotion));
                }

                return Map.of("period", period, "dates", dates, "emotions", emotions);
        }

        // --- Helper Methods ---

        private DateRange calculateDateRange(String period, Integer year, Integer month, Integer week) {
                LocalDate startDate;
                LocalDate endDate;

                if ("weekly".equalsIgnoreCase(period)) {
                        if (year == null || week == null)
                                throw new IllegalArgumentException("Year and week are required for weekly stats");
                        startDate = LocalDate.of(year, 1, 1).with(WeekFields.ISO.weekOfYear(), week)
                                        .with(DayOfWeek.MONDAY);
                        endDate = startDate.plusDays(6);
                } else if ("monthly".equalsIgnoreCase(period)) {
                        if (year == null || month == null)
                                throw new IllegalArgumentException("Year and month are required for monthly stats");
                        startDate = LocalDate.of(year, month, 1);
                        endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                } else if ("yearly".equalsIgnoreCase(period)) {
                        if (year == null)
                                throw new IllegalArgumentException("Year is required for yearly stats");
                        startDate = LocalDate.of(year, 1, 1);
                        endDate = LocalDate.of(year, 12, 31);
                } else {
                        throw new IllegalArgumentException("Invalid period: " + period);
                }
                return new DateRange(startDate, endDate);
        }

        private Map<String, Long> calculateEmotionCounts(List<Diary> diaries) {
                Map<String, Long> emotionCounts = new HashMap<>();
                for (Diary diary : diaries) {
                        String emotionName = diary.getEmotion().name();
                        emotionCounts.put(emotionName, emotionCounts.getOrDefault(emotionName, 0L) + 1);
                }
                return emotionCounts;
        }

        private Map<String, Object> buildStatsResponse(String period, Integer year, Integer month, Integer week,
                        Map<String, Long> emotionCounts, int total) {
                Map<String, Object> response = new HashMap<>();
                response.put("period", period);
                if (year != null)
                        response.put("year", year);
                if (month != null)
                        response.put("month", month);
                if (week != null)
                        response.put("week", week);
                response.put("emotions", emotionCounts);
                response.put("total", total);
                return response;
        }

        private void validateYearAndMonth(Integer year, Integer month) {
                if (year == null || month == null) {
                        throw new IllegalArgumentException("Year and month are required");
                }
        }

        private Map<Integer, List<String>> groupEmotionsByWeek(List<Diary> diaries) {
                Map<Integer, List<String>> weekEmotionsMap = new TreeMap<>();
                WeekFields weekFields = WeekFields.ISO;
                for (Diary d : diaries) {
                        int weekOfYear = d.getDate().get(weekFields.weekOfYear());
                        weekEmotionsMap.computeIfAbsent(weekOfYear, k -> new ArrayList<>()).add(d.getEmotion().name());
                }
                return weekEmotionsMap;
        }

        private String calculateWeekLabel(int year, int weekOfYear) {
                return LocalDate.of(year, 1, 1)
                                .with(WeekFields.ISO.weekOfYear(), weekOfYear)
                                .with(DayOfWeek.MONDAY)
                                .toString();
        }

        private String findMostFrequentEmotion(List<String> emotionList) {
                return emotionList.stream()
                                .collect(Collectors.groupingBy(e -> e, Collectors.counting()))
                                .entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey)
                                .orElse("중립");
        }

        private static class DateRange {
                final LocalDate startDate;
                final LocalDate endDate;

                DateRange(LocalDate startDate, LocalDate endDate) {
                        this.startDate = startDate;
                        this.endDate = endDate;
                }
        }
}
