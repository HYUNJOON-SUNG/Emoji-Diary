package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.Admin;
import com.p_project.p_project_backend.entity.AdminRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import java.util.Optional;

public interface AdminRefreshTokenRepository extends JpaRepository<AdminRefreshToken, Long> {
    Optional<AdminRefreshToken> findByToken(String token);

    @Modifying
    void deleteByAdmin(Admin admin);
}

