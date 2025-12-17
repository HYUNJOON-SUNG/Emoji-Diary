package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * 비밀번호 재설정 코드 리포지토리
 */
public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {
    /**
     * 이메일과 코드로 조회
     */
    Optional<PasswordResetCode> findByEmailAndCode(String email, String code);

    /**
     * 최근 요청 코드 조회
     */
    Optional<PasswordResetCode> findTopByEmailOrderByCreatedAtDesc(String email);

    /**
     * 이메일로 삭제
     */
    void deleteByEmail(String email);
}
