package com.p_project.p_project_backend.backend_user.repository;

import com.p_project.p_project_backend.entity.DiaryImage;
import org.springframework.data.jpa.repository.JpaRepository;

import com.p_project.p_project_backend.entity.Diary;
import java.util.List;

public interface DiaryImageRepository extends JpaRepository<DiaryImage, Long> {
    List<DiaryImage> findAllByDiary(Diary diary);
}
