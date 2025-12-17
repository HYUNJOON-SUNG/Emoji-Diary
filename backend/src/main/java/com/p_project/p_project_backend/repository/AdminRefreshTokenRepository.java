package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.Admin;
import com.p_project.p_project_backend.entity.AdminRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import java.util.Optional;

/**
 * 관리자 리프레시 토큰 리포지토리
 */
public interface AdminRefreshTokenRepository extends JpaRepository<AdminRefreshToken, Long> {
    /**
     * 토큰으로 조회
     */
    Optional<AdminRefreshToken> findByToken(String token);

    /**
     * 관리자로 삭제
     */
    @Modifying
    void deleteByAdmin(Admin admin);
}
