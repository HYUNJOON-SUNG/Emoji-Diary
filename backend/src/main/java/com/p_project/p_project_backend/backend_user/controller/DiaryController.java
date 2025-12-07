package com.p_project.p_project_backend.backend_user.controller;

import com.p_project.p_project_backend.backend_user.dto.diary.DiaryResponse;

import com.p_project.p_project_backend.backend_user.service.DiaryService;
import com.p_project.p_project_backend.entity.Diary.Emotion;
import com.p_project.p_project_backend.entity.User;
import com.p_project.p_project_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

        private final DiaryService diaryService;
        private final UserRepository userRepository;

        @PostMapping
        public ResponseEntity<DiaryResponse> createDiary(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody @jakarta.validation.Valid com.p_project.p_project_backend.backend_user.dto.diary.DiaryCreateRequest request) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(diaryService.createDiary(user, request));
        }

        @PutMapping("/{diaryId}")
        public ResponseEntity<DiaryResponse> updateDiary(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long diaryId,
                        @RequestBody @jakarta.validation.Valid com.p_project.p_project_backend.backend_user.dto.diary.DiaryUpdateRequest request) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(diaryService.updateDiary(user, diaryId, request));
        }

        @GetMapping("/{diaryId}")
        public ResponseEntity<DiaryResponse> getDiary(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long diaryId) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(diaryService.getDiary(user, diaryId));
        }

        @GetMapping("/date/{date}")
        public ResponseEntity<DiaryResponse> getDiaryByDate(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable("date") String dateStr) {
                User user = getUser(userDetails);
                LocalDate date = LocalDate.parse(dateStr);
                return ResponseEntity.ok(diaryService.getDiaryByDate(user, date));
        }

        @GetMapping("/calendar")
        public ResponseEntity<?> getMonthlyDiaries(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestParam("year") int year,
                        @RequestParam("month") int month) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "data", diaryService.getMonthlyDiaries(user, year, month)));
        }

        @GetMapping("/search")
        public ResponseEntity<?> searchDiaries(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) LocalDate startDate,
                        @RequestParam(required = false) LocalDate endDate,
                        @RequestParam(required = false) List<Emotion> emotions,
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "10") int limit) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(Map.of("success", true, "data",
                                diaryService.searchDiaries(user, keyword, startDate, endDate, emotions, page, limit)));
        }

        @DeleteMapping("/{diaryId}")
        public ResponseEntity<?> deleteDiary(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long diaryId) {
                User user = getUser(userDetails);
                diaryService.deleteDiary(user, diaryId);
                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "data", Map.of("message", "일기가 삭제되었습니다")));
        }

        private User getUser(UserDetails userDetails) {
                return userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
        }
}
