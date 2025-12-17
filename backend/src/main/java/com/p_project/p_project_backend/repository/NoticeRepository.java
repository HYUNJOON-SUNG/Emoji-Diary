package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * 공지사항 리포지토리
 */
public interface NoticeRepository extends JpaRepository<Notice, Long> {

       /**
        * 삭제되지 않은 전체 목록 조회 (고정 우선)
        */
       @Query("SELECT n FROM Notice n " +
                     "LEFT JOIN FETCH n.admin " +
                     "WHERE n.deletedAt IS NULL " +
                     "ORDER BY n.isPinned DESC, n.createdAt DESC")
       Page<Notice> findAllNotDeleted(Pageable pageable);

       /**
        * 삭제되지 않은 단건 조회
        */
       @Query("SELECT n FROM Notice n " +
                     "WHERE n.id = :id AND n.deletedAt IS NULL")
       Optional<Notice> findByIdAndNotDeleted(@Param("id") Long id);

       /**
        * 상세 조회 (관리자 포함)
        */
       @Query("SELECT n FROM Notice n " +
                     "LEFT JOIN FETCH n.admin " +
                     "WHERE n.id = :id")
       Optional<Notice> findByIdWithAdmin(@Param("id") Long id);

       /**
        * 사용자용 공개 목록 조회
        */
       @Query("SELECT n FROM Notice n " +
                     "WHERE n.isPublic = true AND n.deletedAt IS NULL " +
                     "ORDER BY n.isPinned DESC, n.createdAt DESC")
       Page<Notice> findPublicNotices(Pageable pageable);

       /**
        * 사용자용 상세 조회 (관리자 포함)
        */
       @Query("SELECT n FROM Notice n " +
                     "LEFT JOIN FETCH n.admin " +
                     "WHERE n.id = :id AND n.isPublic = true AND n.deletedAt IS NULL")
       Optional<Notice> findByIdAndPublic(@Param("id") Long id);
}
