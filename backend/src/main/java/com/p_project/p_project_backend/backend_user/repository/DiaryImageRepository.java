package com.p_project.p_project_backend.backend_user.repository;

import com.p_project.p_project_backend.entity.DiaryImage;
import org.springframework.data.jpa.repository.JpaRepository;

import com.p_project.p_project_backend.entity.Diary;
import java.util.List;

/**
 * 일기 이미지 정보 레포지토리
 */
public interface DiaryImageRepository extends JpaRepository<DiaryImage, Long> {
    List<DiaryImage> findAllByDiary(Diary diary);
}
