package com.p_project.p_project_backend.backend_user.controller;

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

        /**
         * 일기 작성
         */
        @PostMapping
        public ResponseEntity<?> createDiary(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody @jakarta.validation.Valid com.p_project.p_project_backend.backend_user.dto.diary.DiaryCreateRequest request) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "data", diaryService.createDiary(user, request)));
        }

        /**
         * 일기 수정
         */
        @PutMapping("/{diaryId}")
        public ResponseEntity<?> updateDiary(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long diaryId,
                        @RequestBody @jakarta.validation.Valid com.p_project.p_project_backend.backend_user.dto.diary.DiaryUpdateRequest request) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "data", diaryService.updateDiary(user, diaryId, request)));
        }

        /**
         * 일기 상세 조회
         */
        @GetMapping("/{diaryId}")
        public ResponseEntity<?> getDiary(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long diaryId) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "data", diaryService.getDiary(user, diaryId)));
        }

        /**
         * 날짜별 일기 조회
         */
        @GetMapping("/date/{date}")
        public ResponseEntity<?> getDiaryByDate(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable("date") String dateStr) {
                User user = getUser(userDetails);
                LocalDate date = LocalDate.parse(dateStr);
                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "data", diaryService.getDiaryByDate(user, date)));
        }

        /**
         * 월별 일기 목록 조회 (캘린더용)
         */
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

        /**
         * 일기 검색 (키워드/날짜/감정)
         */
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

        /**
         * 일기 삭제
         */
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
