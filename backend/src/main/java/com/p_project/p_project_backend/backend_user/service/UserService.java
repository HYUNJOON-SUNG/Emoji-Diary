package com.p_project.p_project_backend.backend_user.service;

import com.p_project.p_project_backend.backend_user.dto.user.PasswordChangeRequest;
import com.p_project.p_project_backend.backend_user.dto.user.PersonaUpdateRequest;
import com.p_project.p_project_backend.backend_user.dto.user.UserResponse;
import com.p_project.p_project_backend.exception.IncorrectPasswordException;
import com.p_project.p_project_backend.exception.InvalidCredentialsException;
import com.p_project.p_project_backend.entity.User;
import com.p_project.p_project_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 현재 로그인한 사용자 정보 조회
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserResponse.from(user);
    }

    /**
     * 페르소나 수정
     */
    @Transactional
    public UserResponse updatePersona(String email, PersonaUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPersona(request.getPersona());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return UserResponse.from(user);
    }

    /**
     * 비밀번호 변경
     */
    @Transactional
    public void changePassword(String email, PasswordChangeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IncorrectPasswordException("Incorrect password");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * 회원 탈퇴 (Soft Delete)
     */
    @Transactional
    public void deleteAccount(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 비밀번호 검증
        if (password == null || password.isEmpty()) {
            throw new InvalidCredentialsException("비밀번호를 입력해주세요.");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("비밀번호가 일치하지 않습니다.");
        }

        // Soft delete
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User findActiveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
