package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * 관리자 리포지토리
 */
public interface AdminRepository extends JpaRepository<Admin, Long> {
    /**
     * 이메일로 관리자 조회
     */
    Optional<Admin> findByEmail(String email);

    /**
     * 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);
}
