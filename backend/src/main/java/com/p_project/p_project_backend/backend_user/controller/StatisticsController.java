package com.p_project.p_project_backend.backend_user.controller;

import com.p_project.p_project_backend.backend_user.service.StatsService;
import com.p_project.p_project_backend.entity.User;
import com.p_project.p_project_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatsService statsService;
    private final UserRepository userRepository;

    /**
     * 감정 통계 조회
     */
    @GetMapping("/emotions")
    public ResponseEntity<?> getEmotionStats(@AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String period,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer week) {
        User user = getUser(userDetails);
        return ResponseEntity
                .ok(Map.of("success", true, "data", statsService.getEmotionStats(user, period, year, month, week)));
    }

    /**
     * 감정 추이 조회
     */
    @GetMapping("/emotion-trend")
    public ResponseEntity<?> getEmotionTrend(@AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String period,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        User user = getUser(userDetails);
        return ResponseEntity
                .ok(Map.of("success", true, "data", statsService.getEmotionTrend(user, period, year, month)));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
