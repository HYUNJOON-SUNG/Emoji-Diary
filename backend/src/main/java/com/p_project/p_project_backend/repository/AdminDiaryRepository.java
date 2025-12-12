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
        * @param endDate   기간 종료일
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
                     @Param("endDate") LocalDate endDate);

       /**
        * 기간별 일지 작성 개수 집계 (월별)
        * 연간 조회 시 사용
        * 
        * @param startDate 기간 시작일
        * @param endDate   기간 종료일
        * @return 월별 일지 작성 개수 (List<Object[]>: [0]=Integer year, [1]=Integer month,
        *         [2]=Long count)
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
        * 특정 날짜에 일기를 작성한 고유 사용자 수 (DAU)
        * 
        * @param date 조회할 날짜
        * @return 고유 사용자 수
        */
       @Query("SELECT COUNT(DISTINCT d.user.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date = :date")
       Long countDistinctUsersByDate(@Param("date") LocalDate date);

       /**
        * 기간 내에 일기를 작성한 고유 사용자 수 (WAU/MAU)
        * 
        * @param startDate 기간 시작일
        * @param endDate   기간 종료일
        * @return 고유 사용자 수
        */
       @Query("SELECT COUNT(DISTINCT d.user.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date >= :startDate AND d.date < :endDate")
       Long countDistinctUsersInPeriod(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * 기간별 일일 활성 사용자 수 집계 (일별)
        * 주간/월간 조회 시 사용
        * 
        * @param startDate 기간 시작일
        * @param endDate   기간 종료일
        * @return 일별 DAU (List<Object[]>: [0]=LocalDate date, [1]=Long count)
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
        * 기간별 일일 활성 사용자 수 집계 (월별)
        * 연간 조회 시 사용
        * 
        * @param startDate 기간 시작일
        * @param endDate   기간 종료일
        * @return 월별 평균 DAU (List<Object[]>: [0]=Integer year, [1]=Integer month,
        *         [2]=Long count)
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
        * 특정 날짜에 일기를 작성한 사용자 ID 목록 조회
        * 유지율 계산용
        * 
        * @param date 조회할 날짜
        * @return 사용자 ID 목록
        */
       @Query("SELECT DISTINCT d.user.id " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date = :date")
       List<Long> findDistinctUserIdsByDate(@Param("date") LocalDate date);

       /**
        * 기간 내에 일기를 작성한 사용자 ID 목록 조회
        * 유지율 계산용
        * 
        * @param startDate 기간 시작일
        * @param endDate   기간 종료일
        * @return 사용자 ID 목록
        */
       @Query("SELECT DISTINCT d.user.id " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date >= :startDate AND d.date < :endDate")
       List<Long> findDistinctUserIdsInPeriod(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * 삭제되지 않은 전체 일지 작성 수 조회
        * 
        * @return 전체 일지 작성 수
        */
       @Query("SELECT COUNT(d.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL")
       Long countTotalDiaries();

       /**
        * 기간별 일지 작성 수 조회
        * 이전 기간 대비 증감 계산용
        * 
        * @param startDate 기간 시작일
        * @param endDate   기간 종료일
        * @return 일지 작성 수
        */
       @Query("SELECT COUNT(d.id) " +
                     "FROM Diary d " +
                     "WHERE d.deletedAt IS NULL " +
                     "AND d.date >= :startDate AND d.date < :endDate")
       Long countDiariesInPeriod(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);
}
