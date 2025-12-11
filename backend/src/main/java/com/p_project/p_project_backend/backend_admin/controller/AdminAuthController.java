package com.p_project.p_project_backend.backend_admin.controller;

import com.p_project.p_project_backend.backend_admin.dto.auth.AdminLoginRequest;
import com.p_project.p_project_backend.backend_admin.dto.auth.AdminLoginResponse;
import com.p_project.p_project_backend.backend_admin.dto.auth.AdminRefreshRequest;
import com.p_project.p_project_backend.backend_admin.dto.auth.AdminRefreshResponse;
import com.p_project.p_project_backend.backend_admin.service.AdminAuthService;
import com.p_project.p_project_backend.exception.AdminNotFoundException;
import com.p_project.p_project_backend.exception.InvalidCredentialsException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        try {
            AdminLoginResponse response = adminAuthService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (InvalidCredentialsException e) {
            // 명세서: 통합 에러 메시지 표시
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error",
                            Map.of("code", "INVALID_CREDENTIALS", "message", "아이디 또는 비밀번호가 일치하지 않습니다.")));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody @Valid AdminRefreshRequest request) {
        try {
            AdminRefreshResponse response = adminAuthService.refresh(request.getRefreshToken());
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (AdminNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error",
                            Map.of("code", "INVALID_REFRESH_TOKEN", "message", "유효하지 않은 리프레시 토큰입니다.")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error",
                            Map.of("code", "REFRESH_FAILED", "message", "토큰 갱신 중 오류가 발생했습니다.")));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            if (authorizationHeader == null || authorizationHeader.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "error",
                                Map.of("code", "UNAUTHORIZED", "message", "인증 토큰이 필요합니다.")));
            }

            String token = AdminAuthService.extractTokenFromHeader(authorizationHeader);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "error",
                                Map.of("code", "UNAUTHORIZED", "message", "인증 토큰 형식이 올바르지 않습니다.")));
            }

            adminAuthService.logout(token);
            return ResponseEntity.ok(Map.of("success", true, "data", Map.of("message", "로그아웃되었습니다")));
        } catch (AdminNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error",
                            Map.of("code", "UNAUTHORIZED", "message", "인증 토큰이 유효하지 않습니다.")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error",
                            Map.of("code", "LOGOUT_FAILED", "message", "로그아웃 처리 중 오류가 발생했습니다.")));
        }
    }
}
