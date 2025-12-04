package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    /**
     * 삭제되지 않은 공지사항 목록 조회 (고정 우선, 최신순)
     * 정렬: isPinned DESC, createdAt DESC
     */
    @Query("SELECT n FROM Notice n " +
           "LEFT JOIN FETCH n.admin " +
           "WHERE n.deletedAt IS NULL " +
           "ORDER BY n.isPinned DESC, n.createdAt DESC")
    Page<Notice> findAllNotDeleted(Pageable pageable);

    /**
     * 삭제되지 않은 공지사항 단건 조회
     */
    @Query("SELECT n FROM Notice n " +
           "WHERE n.id = :id AND n.deletedAt IS NULL")
    Optional<Notice> findByIdAndNotDeleted(@Param("id") Long id);

    /**
     * 관리자 정보 포함 공지사항 조회 (JOIN FETCH)
     */
    @Query("SELECT n FROM Notice n " +
           "LEFT JOIN FETCH n.admin " +
           "WHERE n.id = :id")
    Optional<Notice> findByIdWithAdmin(@Param("id") Long id);
}

