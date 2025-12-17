package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.EmailVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * 이메일 인증 코드 리포지토리
 */
public interface EmailVerificationCodeRepository extends JpaRepository<EmailVerificationCode, Long> {
    /**
     * 이메일과 코드로 조회
     */
    Optional<EmailVerificationCode> findByEmailAndCode(String email, String code);

    /**
     * 최근 인증 코드 조회
     */
    Optional<EmailVerificationCode> findTopByEmailOrderByCreatedAtDesc(String email);

    /**
     * 이메일로 삭제
     */
    void deleteByEmail(String email);
}
