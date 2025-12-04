package com.p_project.p_project_backend.backend_user.controller;

import com.p_project.p_project_backend.backend_user.dto.diary.DiaryRequest;
import com.p_project.p_project_backend.backend_user.dto.diary.DiaryResponse;
import com.p_project.p_project_backend.backend_user.service.DiaryService;
import com.p_project.p_project_backend.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;
    private final com.p_project.p_project_backend.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<DiaryResponse> createDiary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid DiaryRequest request) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DiaryResponse response = diaryService.createDiary(user, request);
        return ResponseEntity.ok(response);
    }
}
