package com.p_project.p_project_backend.controller;

import com.p_project.p_project_backend.dto.auth.*;
import com.p_project.p_project_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            TokenResponse response = authService.login(request);
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", Map.of("code", "LOGIN_FAILED", "message", e.getMessage())));
        }
    }

    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody EmailCheckRequest request) {
        boolean available = authService.checkEmailAvailability(request.getEmail());
        if (available) {
            return ResponseEntity
                    .ok(Map.of("success", true, "data", Map.of("available", true, "message", "사용 가능한 이메일입니다")));
        } else {
            return ResponseEntity.ok(Map.of("success", false, "error",
                    Map.of("code", "EMAIL_ALREADY_EXISTS", "message", "이미 가입된 이메일입니다")));
        }
    }

    @PostMapping("/send-verification-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody EmailCheckRequest request) {
        try {
            authService.sendVerificationCode(request.getEmail());
            return ResponseEntity
                    .ok(Map.of("success", true, "data", Map.of("message", "인증 코드가 발송되었습니다", "expiresIn", 300)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", Map.of("code", "SEND_FAILED", "message", e.getMessage())));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerificationCodeRequest request) {
        try {
            authService.verifyEmailCode(request.getEmail(), request.getCode());
            return ResponseEntity
                    .ok(Map.of("success", true, "data", Map.of("verified", true, "message", "이메일 인증이 완료되었습니다")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error",
                    Map.of("code", "VERIFICATION_FAILED", "message", e.getMessage())));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @jakarta.validation.Valid SignUpRequest request) {
        try {
            TokenResponse response = authService.register(request);
            return ResponseEntity.status(201).body(Map.of("success", true, "data", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", Map.of("code", "REGISTER_FAILED", "message", e.getMessage())));
        }
    }

    @PostMapping("/password-reset/send-code")
    public ResponseEntity<?> sendPasswordResetCode(@RequestBody PasswordResetRequest request) {
        try {
            authService.sendPasswordResetCode(request.getEmail());
            return ResponseEntity
                    .ok(Map.of("success", true, "data", Map.of("message", "인증 코드가 발송되었습니다", "expiresIn", 300)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", Map.of("code", "SEND_FAILED", "message", e.getMessage())));
        }
    }

    @PostMapping("/password-reset/verify-code")
    public ResponseEntity<?> verifyPasswordResetCode(@RequestBody PasswordResetVerifyRequest request) {
        try {
            String resetToken = authService.verifyPasswordResetCode(request.getEmail(), request.getCode());
            return ResponseEntity
                    .ok(Map.of("success", true, "data", Map.of("verified", true, "resetToken", resetToken)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error",
                    Map.of("code", "VERIFICATION_FAILED", "message", e.getMessage())));
        }
    }

    @PostMapping("/password-reset/reset")
    public ResponseEntity<?> resetPassword(@RequestBody @jakarta.validation.Valid PasswordResetConfirmRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(Map.of("success", true, "data", Map.of("message", "비밀번호가 재설정되었습니다")));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", Map.of("code", "RESET_FAILED", "message", e.getMessage())));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            TokenResponse response = authService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", Map.of("code", "REFRESH_FAILED", "message", e.getMessage())));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenRequest request) {
        try {
            authService.logout(request.getRefreshToken());
            return ResponseEntity.ok(Map.of("success", true, "data", Map.of("message", "로그아웃되었습니다")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", Map.of("code", "LOGOUT_FAILED", "message", e.getMessage())));
        }
    }
}
