package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 사용자 리포지토리
 */
public interface UserRepository extends JpaRepository<User, Long> {
        /**
         * 이메일로 사용자 조회
         */
        Optional<User> findByEmail(String email);

        /**
         * 이메일 존재 여부 확인
         */
        boolean existsByEmail(String email);

        /**
         * 전체 사용자 수 조회
         */
        long countByDeletedAtIsNull();

        /**
         * 기간별 신규 사용자 (일별)
         */
        @Query("SELECT CAST(u.createdAt AS date), COUNT(u.id) " +
                        "FROM User u " +
                        "WHERE u.deletedAt IS NULL " +
                        "AND u.createdAt >= :startDateTime AND u.createdAt < :endDateTime " +
                        "GROUP BY CAST(u.createdAt AS date) " +
                        "ORDER BY CAST(u.createdAt AS date)")
        List<Object[]> countNewUsersByDateInPeriod(
                        @Param("startDateTime") LocalDateTime startDateTime,
                        @Param("endDateTime") LocalDateTime endDateTime);

        /**
         * 기간별 신규 사용자 (월별)
         */
        @Query("SELECT YEAR(u.createdAt), MONTH(u.createdAt), COUNT(u.id) " +
                        "FROM User u " +
                        "WHERE u.deletedAt IS NULL " +
                        "AND u.createdAt >= :startDateTime AND u.createdAt < :endDateTime " +
                        "GROUP BY YEAR(u.createdAt), MONTH(u.createdAt) " +
                        "ORDER BY YEAR(u.createdAt), MONTH(u.createdAt)")
        List<Object[]> countNewUsersByMonthInPeriod(
                        @Param("startDateTime") LocalDateTime startDateTime,
                        @Param("endDateTime") LocalDateTime endDateTime);

        /**
         * 기간 내 신규 사용자 수
         */
        @Query("SELECT COUNT(u.id) " +
                        "FROM User u " +
                        "WHERE u.deletedAt IS NULL " +
                        "AND u.createdAt >= :startDateTime AND u.createdAt < :endDateTime")
        Long countUsersInPeriod(
                        @Param("startDateTime") LocalDateTime startDateTime,
                        @Param("endDateTime") LocalDateTime endDateTime);

        /**
         * 특정 시점 누적 사용자 수
         */
        @Query("SELECT COUNT(u.id) " +
                        "FROM User u " +
                        "WHERE u.deletedAt IS NULL " +
                        "AND u.createdAt < :beforeDateTime")
        Long countByDeletedAtIsNullAndCreatedAtBefore(
                        @Param("beforeDateTime") LocalDateTime beforeDateTime);

        /**
         * 기간별 탈퇴 사용자 (일별)
         */
        @Query("SELECT CAST(u.deletedAt AS date), COUNT(u.id) " +
                        "FROM User u " +
                        "WHERE u.deletedAt IS NOT NULL " +
                        "AND u.deletedAt >= :startDateTime AND u.deletedAt < :endDateTime " +
                        "GROUP BY CAST(u.deletedAt AS date) " +
                        "ORDER BY CAST(u.deletedAt AS date)")
        List<Object[]> countWithdrawnUsersByDateInPeriod(
                        @Param("startDateTime") LocalDateTime startDateTime,
                        @Param("endDateTime") LocalDateTime endDateTime);

        /**
         * 기간별 탈퇴 사용자 (월별)
         */
        @Query("SELECT YEAR(u.deletedAt), MONTH(u.deletedAt), COUNT(u.id) " +
                        "FROM User u " +
                        "WHERE u.deletedAt IS NOT NULL " +
                        "AND u.deletedAt >= :startDateTime AND u.deletedAt < :endDateTime " +
                        "GROUP BY YEAR(u.deletedAt), MONTH(u.deletedAt) " +
                        "ORDER BY YEAR(u.deletedAt), MONTH(u.deletedAt)")
        List<Object[]> countWithdrawnUsersByMonthInPeriod(
                        @Param("startDateTime") LocalDateTime startDateTime,
                        @Param("endDateTime") LocalDateTime endDateTime);

        /**
         * 기간 내 탈퇴 사용자 수
         */
        @Query("SELECT COUNT(u.id) " +
                        "FROM User u " +
                        "WHERE u.deletedAt IS NOT NULL " +
                        "AND u.deletedAt >= :startDateTime AND u.deletedAt < :endDateTime")
        Integer countWithdrawnUsersInPeriod(
                        @Param("startDateTime") LocalDateTime startDateTime,
                        @Param("endDateTime") LocalDateTime endDateTime);
}
