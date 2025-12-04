package com.p_project.p_project_backend.backend_user.repository;

import com.p_project.p_project_backend.entity.Diary;
import com.p_project.p_project_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Long> {
    Optional<Diary> findByUserAndDate(User user, LocalDate date);

    List<Diary> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);
}
