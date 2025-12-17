package com.p_project.p_project_backend.backend_admin.dto.counselingresource;

import com.p_project.p_project_backend.entity.CounselingResource;

/**
 * 상담 기관 카테고리 변환 유틸리티
 */
public class CounselingResourceCategoryConverter {

    private static final String CATEGORY_EMERGENCY = "긴급상담";
    private static final String CATEGORY_PROFESSIONAL = "전문상담";
    private static final String CATEGORY_HOTLINE = "상담전화";
    private static final String CATEGORY_MEDICAL = "의료기관";

    /**
     * Entity enum을 한글 문자열로 변환
     */
    public static String toKorean(CounselingResource.Category category) {
        if (category == null) {
            return null;
        }
        return switch (category) {
            case EMERGENCY -> CATEGORY_EMERGENCY;
            case PROFESSIONAL -> CATEGORY_PROFESSIONAL;
            case HOTLINE -> CATEGORY_HOTLINE;
            case MEDICAL -> CATEGORY_MEDICAL;
        };
    }

    /**
     * 한글 문자열을 Entity enum으로 변환
     */
    public static CounselingResource.Category fromKorean(String categoryKorean) {
        if (categoryKorean == null || categoryKorean.isBlank()) {
            return null;
        }
        return switch (categoryKorean.trim()) {
            case CATEGORY_EMERGENCY -> CounselingResource.Category.EMERGENCY;
            case CATEGORY_PROFESSIONAL -> CounselingResource.Category.PROFESSIONAL;
            case CATEGORY_HOTLINE -> CounselingResource.Category.HOTLINE;
            case CATEGORY_MEDICAL -> CounselingResource.Category.MEDICAL;
            default -> null;
        };
    }
}

