package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {
    Optional<PasswordResetCode> findByEmailAndCode(String email, String code);

    Optional<PasswordResetCode> findTopByEmailOrderByCreatedAtDesc(String email);
}
