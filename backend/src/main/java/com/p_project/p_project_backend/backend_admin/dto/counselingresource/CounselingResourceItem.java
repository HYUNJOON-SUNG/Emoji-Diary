package com.p_project.p_project_backend.backend_admin.dto.counselingresource;

import com.p_project.p_project_backend.entity.CounselingResource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 상담 기관 정보 DTO (목록 조회/상세 조회 공통)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingResourceItem {
    private Long id;
    private String name;
    private String category;
    private String phone;
    private String website;
    private String description;
    private String operatingHours;
    private Boolean isUrgent;

    public static CounselingResourceItem from(CounselingResource resource) {
        return CounselingResourceItem.builder()
                .id(resource.getId())
                .name(resource.getName())
                .category(CounselingResourceCategoryConverter.toKorean(resource.getCategory()))
                .phone(resource.getPhone())
                .website(resource.getWebsite())
                .description(resource.getDescription())
                .operatingHours(resource.getOperatingHours())
                .isUrgent(resource.getIsUrgent())
                .build();
    }
}
