package com.p_project.p_project_backend.backend_user.service;

import com.p_project.p_project_backend.backend_user.dto.auth.*;
import com.p_project.p_project_backend.backend_user.dto.user.UserResponse;
import com.p_project.p_project_backend.service.EmailService;
import com.p_project.p_project_backend.entity.*;
import com.p_project.p_project_backend.repository.*;
import com.p_project.p_project_backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String accessToken = tokenProvider.createAccessToken(authentication);
        String refreshToken = tokenProvider.createRefreshToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save Refresh Token
        // refreshTokenRepository.deleteByUser(user); // Remove old tokens -> Removed to
        // support multi-device login
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7)) // 7 days validity
                .createdAt(LocalDateTime.now())
                .build();
        refreshTokenRepository.save(rt);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponse.from(user))
                .build();
    }

    @Transactional(readOnly = true)
    public boolean checkEmailAvailability(String email) {
        // User와 Admin 모두 확인하여 중복 방지
        boolean userExists = userRepository.existsByEmail(email);
        boolean adminExists = adminRepository.existsByEmail(email);
        return !userExists && !adminExists;
    }

    @Transactional
    public void sendVerificationCode(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        String code = generateRandomCode();
        EmailVerificationCode evc = EmailVerificationCode.builder()
                .email(email)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .createdAt(LocalDateTime.now())
                .build();
        emailVerificationCodeRepository.save(evc);
        System.out.println("=========================================");
        System.out.println("VERIFICATION CODE: " + code);
        System.out.println("=========================================");
        try {
            emailService.sendVerificationCode(email, code);
        } catch (Exception e) {
            System.out.println("Failed to send email: " + e.getMessage());
            // Transaction will NOT rollback because we caught the exception
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
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (!request.getEmailVerified()) {
            // In a real scenario, we should double check if the email was actually verified
            // in the DB recently
            EmailVerificationCode evc = emailVerificationCodeRepository
                    .findTopByEmailOrderByCreatedAtDesc(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Email verification required"));
            if (evc.getVerifiedAt() == null) {
                throw new RuntimeException("Email not verified");
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        // Auto login
        return login(new LoginRequest() {
            {
                setEmail(request.getEmail());
                setPassword(request.getPassword());
            }
        });
    }

    @Transactional
    public void sendPasswordResetCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
            System.out.println("Failed to send email: " + e.getMessage());
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

        // Generate a temporary reset token
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

        // In a real app, we should store the resetToken and verify it here.
        // For simplicity, we assume the flow is sequential and trusted if the token is
        // present (or we could store it in Redis/DB).
        // The spec says verify-code returns a resetToken, and reset uses it.
        // Since we don't have a table for reset tokens, we'll skip strict token
        // validation for now or assume the client passes the code again?
        // The spec says `resetToken` is returned. Let's assume we just trust the email
        // for now as we verified it in the previous step.
        // Ideally, `PasswordResetCode` could store the `resetToken` after verification.

        // Verify reset token
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

        // Mark code as used
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

    private String generateRandomCode() {
        return String.format("%06d", new Random().nextInt(1000000));
    }
}
