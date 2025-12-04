package com.p_project.p_project_backend.backend_user.controller;

import com.p_project.p_project_backend.backend_user.dto.diary.DiaryRequest;
import com.p_project.p_project_backend.backend_user.dto.diary.DiaryResponse;
import com.p_project.p_project_backend.backend_user.dto.diary.DiarySummaryResponse;
import com.p_project.p_project_backend.backend_user.service.DiaryService;
import com.p_project.p_project_backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

        private final DiaryService diaryService;
        private final com.p_project.p_project_backend.repository.UserRepository userRepository;

        @PostMapping
        public ResponseEntity<DiaryResponse> createDiary(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody DiaryRequest request) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(diaryService.createDiary(user, request));
        }

        @PutMapping("/{diaryId}")
        public ResponseEntity<DiaryResponse> updateDiary(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long diaryId,
                        @RequestBody DiaryRequest request) {
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

        @GetMapping
        public ResponseEntity<DiaryResponse> getDiaryByDate(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestParam("date") String dateStr) {
                User user = getUser(userDetails);
                LocalDate date = LocalDate.parse(dateStr);
                return ResponseEntity.ok(diaryService.getDiaryByDate(user, date));
        }

        @GetMapping("/calendar")
        public ResponseEntity<List<DiarySummaryResponse>> getMonthlyDiaries(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestParam("year") int year,
                        @RequestParam("month") int month) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(diaryService.getMonthlyDiaries(user, year, month));
        }

        @DeleteMapping("/{diaryId}")
        public ResponseEntity<Void> deleteDiary(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long diaryId) {
                User user = getUser(userDetails);
                diaryService.deleteDiary(user, diaryId);
                return ResponseEntity.noContent().build();
        }

        private User getUser(UserDetails userDetails) {
                return userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
        }
}
