package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * 삭제되지 않은 사용자 수 조회
     */
    long countByDeletedAtIsNull();

    /**
     * 기간별 신규 가입자 수 집계 (일별)
     * 주간/월간 조회 시 사용
     * 
     * @param startDateTime 기간 시작일시
     * @param endDateTime 기간 종료일시
     * @return 일별 신규 가입자 수 (List<Object[]>: [0]=java.sql.Date date, [1]=Long count)
     */
    @Query("SELECT CAST(u.createdAt AS date), COUNT(u.id) " +
           "FROM User u " +
           "WHERE u.deletedAt IS NULL " +
           "AND u.createdAt >= :startDateTime AND u.createdAt < :endDateTime " +
           "GROUP BY CAST(u.createdAt AS date) " +
           "ORDER BY CAST(u.createdAt AS date)")
    List<Object[]> countNewUsersByDateInPeriod(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    /**
     * 기간별 신규 가입자 수 집계 (월별)
     * 연간 조회 시 사용
     * 
     * @param startDateTime 기간 시작일시
     * @param endDateTime 기간 종료일시
     * @return 월별 신규 가입자 수 (List<Object[]>: [0]=Integer year, [1]=Integer month, [2]=Long count)
     */
    @Query("SELECT YEAR(u.createdAt), MONTH(u.createdAt), COUNT(u.id) " +
           "FROM User u " +
           "WHERE u.deletedAt IS NULL " +
           "AND u.createdAt >= :startDateTime AND u.createdAt < :endDateTime " +
           "GROUP BY YEAR(u.createdAt), MONTH(u.createdAt) " +
           "ORDER BY YEAR(u.createdAt), MONTH(u.createdAt)")
    List<Object[]> countNewUsersByMonthInPeriod(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    /**
     * 기간별 신규 가입자 수 조회
     * 해당 기간에 가입한 사용자 수
     * 
     * @param startDateTime 기간 시작일시
     * @param endDateTime 기간 종료일시
     * @return 신규 가입자 수
     */
    @Query("SELECT COUNT(u.id) " +
           "FROM User u " +
           "WHERE u.deletedAt IS NULL " +
           "AND u.createdAt >= :startDateTime AND u.createdAt < :endDateTime")
    Long countUsersInPeriod(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    /**
     * 특정 시점까지 가입한 전체 사용자 수 조회
     * 전체 사용자 수 증감 계산용
     * 
     * @param beforeDateTime 조회 시점
     * @return 해당 시점까지 가입한 전체 사용자 수
     */
    @Query("SELECT COUNT(u.id) " +
           "FROM User u " +
           "WHERE u.deletedAt IS NULL " +
           "AND u.createdAt < :beforeDateTime")
    Long countByDeletedAtIsNullAndCreatedAtBefore(
            @Param("beforeDateTime") LocalDateTime beforeDateTime
    );
}
