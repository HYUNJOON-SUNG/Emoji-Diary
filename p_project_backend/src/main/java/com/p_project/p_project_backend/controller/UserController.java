package com.p_project.p_project_backend.controller;

import com.p_project.p_project_backend.dto.user.PasswordChangeRequest;
import com.p_project.p_project_backend.dto.user.PersonaUpdateRequest;
import com.p_project.p_project_backend.dto.user.UserResponse;
import com.p_project.p_project_backend.service.UserService;
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

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            UserResponse response = userService.getCurrentUser(userDetails.getUsername());
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", Map.of("code", "FETCH_FAILED", "message", e.getMessage())));
        }
    }

    @PutMapping("/me/persona")
    public ResponseEntity<?> updatePersona(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @jakarta.validation.Valid PersonaUpdateRequest request) {
        try {
            UserResponse response = userService.updatePersona(userDetails.getUsername(), request);
            return ResponseEntity.ok(Map.of("success", true, "data",
                    Map.of("message", "페르소나가 변경되었습니다", "persona", response.getPersona())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", Map.of("code", "UPDATE_FAILED", "message", e.getMessage())));
        }
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @jakarta.validation.Valid PasswordChangeRequest request) {
        try {
            userService.changePassword(userDetails.getUsername(), request);
            return ResponseEntity.ok(Map.of("success", true, "data", Map.of("message", "비밀번호가 변경되었습니다")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", Map.of("code", "UPDATE_FAILED", "message", e.getMessage())));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            userService.deleteAccount(userDetails.getUsername());
            return ResponseEntity.ok(Map.of("success", true, "data", Map.of("message", "계정이 삭제되었습니다")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", Map.of("code", "DELETE_FAILED", "message", e.getMessage())));
        }
    }
}
