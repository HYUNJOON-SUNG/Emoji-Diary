package com.p_project.p_project_backend.backend_user.service;

import com.p_project.p_project_backend.backend_user.dto.risk.RiskAnalysisResponse;
import com.p_project.p_project_backend.backend_user.dto.risk.SessionStatusResponse;
import com.p_project.p_project_backend.backend_user.repository.DiaryRepository;
import com.p_project.p_project_backend.entity.*;
import com.p_project.p_project_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.p_project.p_project_backend.entity.RiskDetectionSession.RiskLevel;
import static com.p_project.p_project_backend.entity.RiskDetectionSession.RiskLevel.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskDetectionService {

    private final DiaryRepository diaryRepository;
    private final RiskDetectionSettingsRepository settingsRepository;
    private final RiskDetectionSessionRepository sessionRepository;
    private final CounselingResourceRepository counselingResourceRepository;

    /**
     * 위험 감지 분석
     */
    @Transactional(readOnly = true)
    public RiskAnalysisResponse analyze(User user) {
        RiskDetectionSettings settings = getSettings();

        int monitoringPeriod = settings.getMonitoringPeriod();
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(monitoringPeriod);

        List<Diary> diaries = diaryRepository.findByUserAndDateBetweenAndDeletedAtIsNullOrderByDateDesc(user, startDate,
                today);

        int consecutiveScore = calculateConsecutiveScore(diaries);
        int scoreInPeriod = calculateScoreInPeriod(diaries);

        RiskLevel riskLevel = determineRiskLevel(settings, consecutiveScore, scoreInPeriod);

        List<String> reasons = generateReasons(settings, riskLevel, consecutiveScore, scoreInPeriod);
        List<String> urgentPhones = getUrgentPhones(riskLevel);

        return RiskAnalysisResponse.builder()
                .riskLevel(riskLevel.name().toLowerCase())
                .reasons(reasons)
                .analysis(buildAnalysisResult(diaries, monitoringPeriod, consecutiveScore, scoreInPeriod))
                .urgentCounselingPhones(urgentPhones)
                .build();
    }

    /**
     * 위험 알림 세션 상태 조회
     */
    @Transactional(readOnly = true)
    public SessionStatusResponse getSessionStatus(User user) {
        LocalDate today = LocalDate.now();
        return sessionRepository.findTopByUserOrderByCreatedAtDesc(user)
                .map(session -> {
                    boolean isToday = session.getCreatedAt().toLocalDate().isEqual(today);
                    return SessionStatusResponse.builder()
                            .alreadyShown(isToday && session.getShownAt() != null)
                            .build();
                })
                .orElse(SessionStatusResponse.builder().alreadyShown(false).build());
    }

    /**
     * 위험 알림 노출 처리 (세션 기록)
     */
    @Transactional
    public void markShown(User user) {
        LocalDate today = LocalDate.now();
        RiskAnalysisResponse analysis = analyze(user);
        RiskLevel riskLevel = RiskLevel.valueOf(analysis.getRiskLevel().toUpperCase());

        Optional<RiskDetectionSession> latestSessionOpt = sessionRepository.findTopByUserOrderByCreatedAtDesc(user);

        RiskDetectionSession session;
        if (latestSessionOpt.isPresent() && latestSessionOpt.get().getCreatedAt().toLocalDate().isEqual(today)) {
            session = latestSessionOpt.get();
            session.setRiskLevel(riskLevel);
        } else {
            session = RiskDetectionSession.builder()
                    .user(user)
                    .riskLevel(riskLevel)
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        session.setShownAt(LocalDateTime.now());
        sessionRepository.save(session);
    }

    // Helper Methods

    private RiskDetectionSettings getSettings() {
        return settingsRepository.findAll().stream().findFirst()
                .orElse(RiskDetectionSettings.builder().build());
    }

    private int calculateConsecutiveScore(List<Diary> diaries) {
        int score = 0;
        for (Diary diary : diaries) {
            int dayScore = getScore(diary.getEmotion());
            if (dayScore <= 0)
                break;
            score += dayScore;
        }
        return score;
    }

    private int calculateScoreInPeriod(List<Diary> diaries) {
        return diaries.stream()
                .mapToInt(d -> getScore(d.getEmotion()))
                .sum();
    }

    private int getScore(Diary.Emotion emotion) {
        if (emotion == null)
            return 0;
        return switch (emotion) {
            case 슬픔, 분노 -> 2;
            case 불안, 혐오 -> 1;
            default -> 0;
        };
    }

    private RiskLevel determineRiskLevel(RiskDetectionSettings settings, int consecutive, int total) {
        if (isHighRisk(settings, consecutive, total))
            return HIGH;
        if (isMediumRisk(settings, consecutive, total))
            return MEDIUM;
        if (isLowRisk(settings, consecutive, total))
            return LOW;
        return NONE;
    }

    private boolean isHighRisk(RiskDetectionSettings s, int consecutive, int total) {
        return consecutive >= s.getHighConsecutiveScore() || total >= s.getHighScoreInPeriod();
    }

    private boolean isMediumRisk(RiskDetectionSettings s, int consecutive, int total) {
        return consecutive >= s.getMediumConsecutiveScore() || total >= s.getMediumScoreInPeriod();
    }

    private boolean isLowRisk(RiskDetectionSettings s, int consecutive, int total) {
        return consecutive >= s.getLowConsecutiveScore() || total >= s.getLowScoreInPeriod();
    }

    private List<String> generateReasons(RiskDetectionSettings settings, RiskLevel riskLevel, int consecutive,
            int total) {
        List<String> reasons = new ArrayList<>();
        if (riskLevel == NONE)
            return reasons;

        int consecutiveThreshold = getThreshold(settings, riskLevel, true);
        int totalThreshold = getThreshold(settings, riskLevel, false);

        if (consecutive >= consecutiveThreshold) {
            reasons.add("연속 부정 감정 점수 " + consecutive + "점 감지");
        }
        if (total >= totalThreshold) {
            reasons.add("최근 " + settings.getMonitoringPeriod() + "일 중 부정 감정 점수 " + total + "점 발생");
        }
        return reasons;
    }

    private List<String> getUrgentPhones(RiskLevel riskLevel) {
        if (riskLevel != HIGH)
            return new ArrayList<>();
        return counselingResourceRepository.findAllByIsUrgentTrueAndDeletedAtIsNull().stream()
                .map(CounselingResource::getPhone)
                .collect(Collectors.toList());
    }

    private RiskAnalysisResponse.AnalysisResult buildAnalysisResult(List<Diary> diaries, int monitoringPeriod,
            int consecutive, int total) {
        LocalDate lastNegativeDate = diaries.stream()
                .filter(d -> getScore(d.getEmotion()) > 0)
                .findFirst()
                .map(Diary::getDate)
                .orElse(null);

        return RiskAnalysisResponse.AnalysisResult.builder()
                .monitoringPeriod(monitoringPeriod)
                .consecutiveScore(consecutive)
                .scoreInPeriod(total)
                .lastNegativeDate(lastNegativeDate)
                .build();
    }

    private int getThreshold(RiskDetectionSettings s, RiskLevel level, boolean isConsecutive) {
        return switch (level) {
            case HIGH -> isConsecutive ? s.getHighConsecutiveScore() : s.getHighScoreInPeriod();
            case MEDIUM -> isConsecutive ? s.getMediumConsecutiveScore() : s.getMediumScoreInPeriod();
            case LOW -> isConsecutive ? s.getLowConsecutiveScore() : s.getLowScoreInPeriod();
            default -> 0;
        };
    }
}
