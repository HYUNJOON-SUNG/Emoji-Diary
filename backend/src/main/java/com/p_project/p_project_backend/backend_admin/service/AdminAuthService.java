package com.p_project.p_project_backend.backend_admin.service;

import com.p_project.p_project_backend.backend_admin.dto.auth.AdminInfo;
import com.p_project.p_project_backend.backend_admin.dto.auth.AdminLoginResponse;
import com.p_project.p_project_backend.entity.Admin;
import com.p_project.p_project_backend.entity.AdminRefreshToken;
import com.p_project.p_project_backend.entity.ErrorLog;
import com.p_project.p_project_backend.exception.AdminNotFoundException;
import com.p_project.p_project_backend.exception.InvalidCredentialsException;
import com.p_project.p_project_backend.repository.AdminRefreshTokenRepository;
import com.p_project.p_project_backend.repository.AdminRepository;
import com.p_project.p_project_backend.repository.ErrorLogRepository;
import com.p_project.p_project_backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final int BEARER_PREFIX_LENGTH = 7;
    private static final String LOGIN_ENDPOINT = "/api/admin/auth/login";

    private final JwtTokenProvider tokenProvider;
    private final AdminRepository adminRepository;
    private final AdminRefreshTokenRepository adminRefreshTokenRepository;
    private final ErrorLogRepository errorLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.refresh-expiration:604800000}") // 기본값 7일 (밀리초)
    private long refreshTokenValidityInMilliseconds;

    @Transactional
    public AdminLoginResponse login(String email, String password) {
        try {
            // Admin 조회
            Admin admin = adminRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        logLoginAttempt(email, false, "Admin not found");
                        return new InvalidCredentialsException("아이디 또는 비밀번호가 일치하지 않습니다.");
                    });

            // 비밀번호 확인
            if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
                logLoginAttempt(email, false, "Invalid password", admin);
                throw new InvalidCredentialsException("아이디 또는 비밀번호가 일치하지 않습니다.");
            }

            // JWT 토큰 생성
            String accessToken = tokenProvider.createAccessToken(email);
            String refreshToken = tokenProvider.createRefreshToken(email);

            // Refresh Token 저장
            long refreshTokenValidityDays = refreshTokenValidityInMilliseconds / (1000 * 60 * 60 * 24);
            AdminRefreshToken adminRefreshToken = AdminRefreshToken.builder()
                    .admin(admin)
                    .token(refreshToken)
                    .expiresAt(LocalDateTime.now().plusDays(refreshTokenValidityDays))
                    .createdAt(LocalDateTime.now())
                    .build();
            adminRefreshTokenRepository.save(adminRefreshToken);

            // 로그인 성공 로그 기록
            logLoginAttempt(email, true, "Login successful", admin);
            log.info("Admin login successful: email={}, adminId={}", email, admin.getId());

            // API 명세서에 따르면 accessToken만 반환 (refreshToken은 내부적으로만 사용)
            return AdminLoginResponse.builder()
                    .accessToken(accessToken)
                    .admin(AdminInfo.from(admin))
                    .build();

        } catch (InvalidCredentialsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during admin login: email={}", email, e);
            logLoginAttempt(email, false, "Unexpected error: " + e.getMessage());
            throw new InvalidCredentialsException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    }

    @Transactional
    public void logout(String accessToken) {
        try {
            // JWT 토큰에서 이메일 추출 (만료된 토큰도 처리 가능)
            String email = tokenProvider.getEmailFromTokenEvenIfExpired(accessToken);
            
            // 잘못된 형식의 토큰인 경우
            if (email == null || email.isBlank()) {
                log.warn("Invalid token format during logout");
                throw new AdminNotFoundException("Invalid token format");
            }

            // Admin 조회
            Admin admin = adminRepository.findByEmail(email)
                    .orElseThrow(() -> new AdminNotFoundException("Admin not found with email: " + email));

            // 해당 관리자의 모든 refresh token 삭제 (무효화)
            adminRefreshTokenRepository.deleteByAdmin(admin);

            log.info("Admin logout successful: email={}, adminId={}", email, admin.getId());

        } catch (AdminNotFoundException e) {
            // AdminNotFoundException은 그대로 던짐 (Controller에서 401로 처리)
            throw e;
        } catch (Exception e) {
            // 예상치 못한 예외는 로그만 남기고 AdminNotFoundException으로 변환
            log.error("Unexpected error during admin logout", e);
            throw new AdminNotFoundException("Invalid token");
        }
    }

    /**
     * 로그인 시도 이력 기록 (명세서 요구사항)
     */
    private void logLoginAttempt(String email, boolean success, String reason) {
        logLoginAttempt(email, success, reason, null);
    }

    private void logLoginAttempt(String email, boolean success, String reason, Admin admin) {
        try {
            ErrorLog.Level level = success ? ErrorLog.Level.INFO : ErrorLog.Level.WARN;
            String message = success
                    ? String.format("Admin login successful: %s", email)
                    : String.format("Admin login failed: %s - %s", email, reason);

            ErrorLog errorLog = ErrorLog.builder()
                    .level(level)
                    .message(message)
                    .errorCode(success ? null : "INVALID_CREDENTIALS")
                    .endpoint(LOGIN_ENDPOINT)
                    .admin(admin)
                    .createdAt(LocalDateTime.now())
                    .build();

            errorLogRepository.save(errorLog);
        } catch (Exception e) {
            // 에러 로그 기록 실패해도 로그인 프로세스는 계속 진행
            log.error("Failed to save login attempt log", e);
        }
    }

    /**
     * Authorization 헤더에서 토큰 추출
     */
    public static String extractTokenFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }
        if (authorizationHeader.startsWith(BEARER_PREFIX)) {
            return authorizationHeader.substring(BEARER_PREFIX_LENGTH);
        }
        return null; // Bearer 접두사가 없으면 null 반환 (JWT 표준 준수)
    }
}

