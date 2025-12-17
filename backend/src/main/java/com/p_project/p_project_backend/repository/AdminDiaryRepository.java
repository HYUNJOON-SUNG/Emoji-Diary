package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.Diary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * 관리자용 일기 리포지토리
 */
public interface AdminDiaryRepository extends JpaRepository<Diary, Long> {

       /**
        * 기간별 일기 작성 수 (일별)
        */
       @Query("SELECT d.date, COUNT(d.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date >= :startDate AND d.date < :endDate " +
                     "GROUP BY d.date " +
                     "ORDER BY d.date")
       List<Object[]> countDiariesByDateInPeriod(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * 기간별 일기 작성 수 (월별)
        */
       @Query("SELECT YEAR(d.date), MONTH(d.date), COUNT(d.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date >= :startDate AND d.date < :endDate " +
                     "GROUP BY YEAR(d.date), MONTH(d.date) " +
                     "ORDER BY YEAR(d.date), MONTH(d.date)")
       List<Object[]> countDiariesByMonthInPeriod(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * 특정 날짜 작성자 수 (DAU)
        */
       @Query("SELECT COUNT(DISTINCT d.user.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date = :date")
       Long countDistinctUsersByDate(@Param("date") LocalDate date);

       /**
        * 기간 내 작성자 수 (WAU/MAU)
        */
       @Query("SELECT COUNT(DISTINCT d.user.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date >= :startDate AND d.date < :endDate")
       Long countDistinctUsersInPeriod(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * 기간별 활성 사용자 수 (일별)
        */
       @Query("SELECT d.date, COUNT(DISTINCT d.user.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date >= :startDate AND d.date < :endDate " +
                     "GROUP BY d.date " +
                     "ORDER BY d.date")
       List<Object[]> countDistinctUsersByDateInPeriod(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * 기간별 활성 사용자 수 (월별)
        */
       @Query("SELECT YEAR(d.date), MONTH(d.date), COUNT(DISTINCT d.user.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date >= :startDate AND d.date < :endDate " +
                     "GROUP BY YEAR(d.date), MONTH(d.date) " +
                     "ORDER BY YEAR(d.date), MONTH(d.date)")
       List<Object[]> countDistinctUsersByMonthInPeriod(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * 특정 날짜 작성자 ID 목록
        */
       @Query("SELECT DISTINCT d.user.id " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date = :date")
       List<Long> findDistinctUserIdsByDate(@Param("date") LocalDate date);

       /**
        * 기간 내 작성자 ID 목록
        */
       @Query("SELECT DISTINCT d.user.id " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date >= :startDate AND d.date < :endDate")
       List<Long> findDistinctUserIdsInPeriod(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * 전체 일기 수 조회
        */
       @Query("SELECT COUNT(d.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL")
       Long countTotalDiaries();

       /**
        * 기간 내 일기 수 조회
        */
       @Query("SELECT COUNT(d.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date >= :startDate AND d.date < :endDate")
       Long countDiariesInPeriod(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);
}
