package com.p_project.p_project_backend.backend_user.dto.diary;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DiaryMonthlyResponse {
    private int year;
    private int month;
    private List<DiarySummaryResponse> diaries;
}
