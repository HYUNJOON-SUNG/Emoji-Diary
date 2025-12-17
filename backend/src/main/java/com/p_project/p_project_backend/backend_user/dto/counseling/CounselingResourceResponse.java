package com.p_project.p_project_backend.backend_user.dto.counseling;

import com.p_project.p_project_backend.entity.CounselingResource;
import lombok.Builder;
import lombok.Getter;

/**
 * 상담 기관 정보 응답 DTO
 */
@Getter
@Builder
public class CounselingResourceResponse {
    private Long id;
    private String name;
    private String category;
    private String phone;
    private String website;
    private String description;
    private String operatingHours;
    private Boolean isUrgent;

    public static CounselingResourceResponse from(CounselingResource resource) {
        return CounselingResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .category(resource.getCategory().getDescription())
                .phone(resource.getPhone())
                .website(resource.getWebsite())
                .description(resource.getDescription())
                .operatingHours(resource.getOperatingHours())
                .isUrgent(resource.getIsUrgent())
                .build();
    }
}
