package com.p_project.p_project_backend.backend_user.dto.diary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiarySummaryResponse {
    private Long id;
    private LocalDate date;
    private String emotion;
}
