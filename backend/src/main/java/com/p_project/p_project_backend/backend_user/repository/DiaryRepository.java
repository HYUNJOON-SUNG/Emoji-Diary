package com.p_project.p_project_backend.backend_user.repository;

import com.p_project.p_project_backend.entity.Diary;
import com.p_project.p_project_backend.entity.Diary.Emotion;
import com.p_project.p_project_backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 일기 정보 레포지토리
 */
@Repository
public interface DiaryRepository extends JpaRepository<Diary, Long> {
        /**
         * 사용자 및 날짜별 일기 조회
         */
        Optional<Diary> findByUserAndDate(User user, LocalDate date);

        /**
         * 기간별 일기 목록 조회
         */
        List<Diary> findByUserAndDateBetweenAndDeletedAtIsNull(User user, LocalDate startDate, LocalDate endDate);

        /**
         * 기간별 일기 목록 조회 (최신순)
         */
        List<Diary> findByUserAndDateBetweenAndDeletedAtIsNullOrderByDateDesc(User user, LocalDate startDate,
                        LocalDate endDate);

        /**
         * 일기 검색 (키워드, 날짜, 감정 필터링)
         */
        @Query("SELECT d FROM Diary d WHERE d.user = :user " +
                        "AND d.deletedAt IS NULL " +
                        "AND (:keyword IS NULL OR d.content LIKE %:keyword% OR d.title LIKE %:keyword%) " +
                        "AND (:startDate IS NULL OR d.date >= :startDate) " +
                        "AND (:endDate IS NULL OR d.date <= :endDate) " +
                        "AND (:emotions IS NULL OR d.emotion IN :emotions) " +
                        "ORDER BY d.date DESC")
        Page<Diary> searchDiaries(@Param("user") User user,
                        @Param("keyword") String keyword,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("emotions") List<Emotion> emotions,
                        Pageable pageable);
}
