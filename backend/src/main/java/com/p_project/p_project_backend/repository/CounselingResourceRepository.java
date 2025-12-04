package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.CounselingResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CounselingResourceRepository extends JpaRepository<CounselingResource, Long> {

    /**
     * 삭제되지 않은 상담 기관 목록 조회 (생성일시 최신순)
     */
    @Query("SELECT c FROM CounselingResource c " +
           "WHERE c.deletedAt IS NULL " +
           "ORDER BY c.createdAt DESC")
    List<CounselingResource> findAllNotDeleted();

    /**
     * 삭제되지 않은 상담 기관 단건 조회
     */
    @Query("SELECT c FROM CounselingResource c " +
           "WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<CounselingResource> findByIdAndNotDeleted(@Param("id") Long id);
}

