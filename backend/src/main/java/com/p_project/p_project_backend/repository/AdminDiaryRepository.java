package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.Diary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AdminDiaryRepository extends JpaRepository<Diary, Long> {

    /**
     * 기간별 일지 작성 개수 집계 (일별)
     * 주간/월간 조회 시 사용
     * 
     * @param startDate 기간 시작일
     * @param endDate 기간 종료일
     * @return 일별 일지 작성 개수 (List<Object[]>: [0]=LocalDate date, [1]=Long count)
     */
    @Query("SELECT d.date, COUNT(d.id) " +
           "FROM Diary d " +
           "WHERE d.deletedAt IS NULL " +
           "AND d.date >= :startDate AND d.date < :endDate " +
           "GROUP BY d.date " +
           "ORDER BY d.date")
    List<Object[]> countDiariesByDateInPeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * 기간별 일지 작성 개수 집계 (월별)
     * 연간 조회 시 사용
     * 
     * @param startDate 기간 시작일
     * @param endDate 기간 종료일
     * @return 월별 일지 작성 개수 (List<Object[]>: [0]=Integer year, [1]=Integer month, [2]=Long count)
     */
    @Query("SELECT YEAR(d.date), MONTH(d.date), COUNT(d.id) " +
           "FROM Diary d " +
           "WHERE d.deletedAt IS NULL " +
           "AND d.date >= :startDate AND d.date < :endDate " +
           "GROUP BY YEAR(d.date), MONTH(d.date) " +
           "ORDER BY YEAR(d.date), MONTH(d.date)")
    List<Object[]> countDiariesByMonthInPeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

