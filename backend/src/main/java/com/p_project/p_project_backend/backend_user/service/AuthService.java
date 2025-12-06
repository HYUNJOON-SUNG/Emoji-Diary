package com.p_project.p_project_backend.backend_user.service;

import com.p_project.p_project_backend.backend_user.dto.auth.*;
import com.p_project.p_project_backend.backend_user.dto.user.UserResponse;
import com.p_project.p_project_backend.service.EmailService;
import com.p_project.p_project_backend.entity.*;
import com.p_project.p_project_backend.repository.*;
import com.p_project.p_project_backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationCodeRepository emailVerificationCodeRepository;
    private final PasswordResetCodeRepository passwordResetCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = findActiveUser(request.getEmail());
        validatePassword(request.getPassword(), user.getPasswordHash());

        String accessToken = tokenProvider.createAccessToken(user.getEmail());
        String refreshToken = tokenProvider.createRefreshToken(user.getEmail());

        saveRefreshToken(user, refreshToken);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponse.from(user))
                .build();
    }

    @Transactional(readOnly = true)
    public boolean checkEmailAvailability(String email) {
        return !isUserEmailTaken(email) && !adminRepository.existsByEmail(email);
    }

    @Transactional
    public void sendVerificationCode(String email) {
        if (isUserEmailTaken(email)) {
            throw new RuntimeException("Email already exists");
        }

        String code = generateRandomCode();
        saveVerificationCode(email, code);

        log.info("Sent verification code to {}: {}", email, code);
        try {
            emailService.sendVerificationCode(email, code);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", email, e);
            // Non-blocking failure for demo purposes, or rethrow if critical
        }
    }

    @Transactional
    public void verifyEmailCode(String email, String code) {
        EmailVerificationCode evc = emailVerificationCodeRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException("Verification code not found"));

        if (!evc.getCode().equals(code)) {
            throw new RuntimeException("Invalid verification code");
        }

        if (evc.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired");
        }

        evc.setVerifiedAt(LocalDateTime.now());
        emailVerificationCodeRepository.save(evc);
    }

    @Transactional
    public TokenResponse register(SignUpRequest request) {
        handleExistingUser(request.getEmail());
        validateEmailVerified(request.getEmail(), request.getEmailVerified());

        User user = createUser(request);
        userRepository.save(user);

        return login(new LoginRequest(request.getEmail(), request.getPassword()));
    }

    @Transactional
    public void sendPasswordResetCode(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("User not found");
        }

        String code = generateRandomCode();
        PasswordResetCode prc = PasswordResetCode.builder()
                .email(email)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .createdAt(LocalDateTime.now())
                .build();
        passwordResetCodeRepository.save(prc);

        try {
            emailService.sendPasswordResetCode(email, code);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", email, e);
        }
    }

    @Transactional
    public String verifyPasswordResetCode(String email, String code) {
        PasswordResetCode prc = passwordResetCodeRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException("Reset code not found"));

        if (!prc.getCode().equals(code)) {
            throw new RuntimeException("Invalid reset code");
        }

        if (prc.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset code expired");
        }

        String resetToken = UUID.randomUUID().toString();
        prc.setResetToken(resetToken);
        passwordResetCodeRepository.save(prc);

        return resetToken;
    }

    @Transactional
    public void resetPassword(PasswordResetConfirmRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        PasswordResetCode prc = passwordResetCodeRepository.findTopByEmailOrderByCreatedAtDesc(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Reset code not found"));

        if (prc.getResetToken() == null || !prc.getResetToken().equals(request.getResetToken())) {
            throw new RuntimeException("Invalid reset token");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        prc.setUsedAt(LocalDateTime.now());
        passwordResetCodeRepository.save(prc);
    }

    @Transactional
    public TokenResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        RefreshToken rt = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (rt.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(rt);
            throw new RuntimeException("Refresh token expired");
        }

        User user = rt.getUser();
        String newAccessToken = tokenProvider.createAccessToken(user.getEmail());
        String newRefreshToken = tokenProvider.createRefreshToken(user.getEmail());

        rt.setToken(newRefreshToken);
        rt.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(rt);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(UserResponse.from(user))
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    // --- Private Helper Methods ---

    private User findActiveUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));

        if (user.getDeletedAt() != null) {
            throw new IllegalArgumentException("User account is deleted");
        }
        return user;
    }

    private void validatePassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new IllegalArgumentException("INVALID_CREDENTIALS");
        }
    }

    private void saveRefreshToken(User user, String token) {
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .createdAt(LocalDateTime.now())
                .build();
        refreshTokenRepository.save(rt);
    }

    private boolean isUserEmailTaken(String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getDeletedAt() == null)
                .orElse(false);
    }

    private void handleExistingUser(String email) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            if (existingUser.get().getDeletedAt() == null) {
                throw new RuntimeException("Email already exists");
            } else {
                // Hard delete existing soft-deleted user (Cascade will delete diaries)
                emailVerificationCodeRepository.deleteByEmail(email);
                passwordResetCodeRepository.deleteByEmail(email);
                userRepository.delete(existingUser.get());
                userRepository.flush();
                log.info("Re-registration: Hard deleted existing user {}", email);
            }
        }
    }

    private void saveVerificationCode(String email, String code) {
        EmailVerificationCode evc = EmailVerificationCode.builder()
                .email(email)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .createdAt(LocalDateTime.now())
                .build();
        emailVerificationCodeRepository.save(evc);
    }

    private void validateEmailVerified(String email, Boolean isVerifiedByClient) {
        if (Boolean.FALSE.equals(isVerifiedByClient)) { // Null safe check
            EmailVerificationCode evc = emailVerificationCodeRepository
                    .findTopByEmailOrderByCreatedAtDesc(email)
                    .orElseThrow(() -> new RuntimeException("Email verification required"));
            if (evc.getVerifiedAt() == null) {
                throw new RuntimeException("Email not verified");
            }
        }
    }

    private User createUser(SignUpRequest request) {
        return User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private String generateRandomCode() {
        return String.format("%06d", new Random().nextInt(1000000));
    }
}
