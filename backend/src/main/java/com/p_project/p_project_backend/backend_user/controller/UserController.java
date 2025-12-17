package com.p_project.p_project_backend.backend_user.controller;

import com.p_project.p_project_backend.backend_user.dto.user.PasswordChangeRequest;
import com.p_project.p_project_backend.backend_user.dto.user.PersonaUpdateRequest;
import com.p_project.p_project_backend.backend_user.dto.user.UserResponse;
import com.p_project.p_project_backend.backend_user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 내 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse response = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 페르소나 설정
     */
    @PutMapping("/me/persona")
    public ResponseEntity<?> updatePersona(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @jakarta.validation.Valid PersonaUpdateRequest request) {
        UserResponse response = userService.updatePersona(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("success", true, "data",
                Map.of("message", "페르소나가 설정되었습니다", "persona", response.getPersona())));
    }

    /**
     * 비밀번호 변경
     */
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @jakarta.validation.Valid PasswordChangeRequest request) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("message", "비밀번호가 변경되었습니다")));
    }

    /**
     * 회원 탈퇴
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {
        String password = request.get("password");
        userService.deleteAccount(userDetails.getUsername(), password);
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("message", "계정이 삭제되었습니다")));
    }
}
