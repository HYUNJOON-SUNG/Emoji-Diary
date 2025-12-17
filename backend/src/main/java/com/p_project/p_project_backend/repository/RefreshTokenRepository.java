package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.RefreshToken;
import com.p_project.p_project_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import java.util.Optional;

/**
 * 리프레시 토큰 리포지토리
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    /**
     * 토큰으로 조회
     */
    Optional<RefreshToken> findByToken(String token);

    /**
     * 사용자로 삭제
     */
    @Modifying
    void deleteByUser(User user);
}
