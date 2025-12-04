package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * 삭제되지 않은 사용자 수 조회
     */
    long countByDeletedAtIsNull();
}
