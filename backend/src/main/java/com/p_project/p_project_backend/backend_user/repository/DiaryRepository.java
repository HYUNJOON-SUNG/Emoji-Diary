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

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Long> {
        Optional<Diary> findByUserAndDate(User user, LocalDate date);

        List<Diary> findByUserAndDateBetweenAndDeletedAtIsNull(User user, LocalDate startDate, LocalDate endDate);

        List<Diary> findByUserAndDateBetweenAndDeletedAtIsNullOrderByDateDesc(User user, LocalDate startDate,
                        LocalDate endDate);

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
