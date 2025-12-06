package com.p_project.p_project_backend;

import com.p_project.p_project_backend.backend_user.dto.auth.SignUpRequest;
import com.p_project.p_project_backend.backend_user.service.AuthService;
import com.p_project.p_project_backend.entity.EmailVerificationCode;
import com.p_project.p_project_backend.entity.User;
import com.p_project.p_project_backend.repository.*;
import com.p_project.p_project_backend.security.CustomUserDetailsService;
import com.p_project.p_project_backend.security.JwtTokenProvider;
import com.p_project.p_project_backend.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserDeletionPolicyTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private AdminRepository adminRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private EmailVerificationCodeRepository emailVerificationCodeRepository;
    @Mock
    private PasswordResetCodeRepository passwordResetCodeRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EmailService emailService;
    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void loadUserByUsername_ShouldThrowException_WhenUserIsSoftDeleted() {
        // Given
        String email = "deleted@example.com";
        User deletedUser = User.builder()
                .email(email)
                .passwordHash("hash")
                .build();
        deletedUser.setDeletedAt(LocalDateTime.now());

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(deletedUser));

        // When & Then
        assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername(email);
        });
    }

    @Test
    void checkEmailAvailability_ShouldReturnTrue_WhenUserIsSoftDeleted() {
        // Given
        String email = "deleted@example.com";
        User deletedUser = User.builder()
                .email(email)
                .build();
        deletedUser.setDeletedAt(LocalDateTime.now());

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(deletedUser));
        when(adminRepository.existsByEmail(email)).thenReturn(false);

        // When
        boolean isAvailable = authService.checkEmailAvailability(email);

        // Then
        assertTrue(isAvailable);
    }

    @Test
    void register_ShouldHardDeleteExistingUser_WhenUserIsSoftDeleted() {
        // Given
        String email = "deleted@example.com";
        String password = "password";
        SignUpRequest request = new SignUpRequest();
        request.setEmail(email);
        request.setPassword(password);
        request.setName("New Name");
        request.setEmailVerified(true); // Assuming client verified

        User deletedUser = User.builder()
                .email(email)
                .passwordHash("oldHash")
                .build();
        deletedUser.setDeletedAt(LocalDateTime.now());

        User newUser = User.builder()
                .email(email)
                .passwordHash("newHash") // matches encoded password
                .build();

        // Mocks for registration flow
        // 1st call: check existing user (returns deleted user)
        // 2nd call: login (returns new user - simulating DB update)
        when(userRepository.findByEmail(email))
                .thenReturn(Optional.of(deletedUser))
                .thenReturn(Optional.of(newUser));

        when(passwordEncoder.encode(password)).thenReturn("newHash");
        when(passwordEncoder.matches(password, "newHash")).thenReturn(true);
        when(tokenProvider.createAccessToken(anyString())).thenReturn("access");
        when(tokenProvider.createRefreshToken(anyString())).thenReturn("refresh");

        // When
        authService.register(request);

        // Then
        verify(emailVerificationCodeRepository).deleteByEmail(email); // Verify email codes deleted
        verify(passwordResetCodeRepository).deleteByEmail(email); // Verify reset codes deleted
        verify(userRepository).delete(deletedUser); // Verify hard delete called
        verify(userRepository).save(any(User.class)); // Verify new user saved
    }
}
