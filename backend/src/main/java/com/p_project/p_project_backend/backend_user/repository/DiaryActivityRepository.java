package com.p_project.p_project_backend.backend_user.repository;

import com.p_project.p_project_backend.entity.DiaryActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import com.p_project.p_project_backend.entity.Diary;
import java.util.List;

/**
 * 일기 활동 정보 레포지토리
 */
public interface DiaryActivityRepository extends JpaRepository<DiaryActivity, Long> {
    List<DiaryActivity> findAllByDiary(Diary diary);
}
