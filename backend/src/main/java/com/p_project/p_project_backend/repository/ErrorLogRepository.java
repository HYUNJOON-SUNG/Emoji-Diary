package com.p_project.p_project_backend.repository;

import com.p_project.p_project_backend.entity.ErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {
}

