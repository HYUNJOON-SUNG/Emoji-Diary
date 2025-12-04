package com.p_project.p_project_backend.backend_admin.service;

import com.p_project.p_project_backend.backend_admin.dto.counselingresource.CounselingResourceCategoryConverter;
import com.p_project.p_project_backend.backend_admin.dto.counselingresource.CounselingResourceCreateRequest;
import com.p_project.p_project_backend.backend_admin.dto.counselingresource.CounselingResourceItem;
import com.p_project.p_project_backend.backend_admin.dto.counselingresource.CounselingResourceListResponse;
import com.p_project.p_project_backend.backend_admin.dto.counselingresource.CounselingResourceResponse;
import com.p_project.p_project_backend.backend_admin.dto.counselingresource.CounselingResourceUpdateRequest;
import com.p_project.p_project_backend.entity.CounselingResource;
import com.p_project.p_project_backend.exception.AdminNotFoundException;
import com.p_project.p_project_backend.repository.CounselingResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCounselingResourceService {

    private static final String ERROR_MESSAGE_RESOURCE_NOT_FOUND = "상담 기관을 찾을 수 없습니다.";
    private static final String ERROR_MESSAGE_INVALID_CATEGORY = "유효하지 않은 카테고리입니다: ";

    private final CounselingResourceRepository counselingResourceRepository;

    /**
     * 상담 기관 목록 조회
     */
    @Transactional(readOnly = true)
    public CounselingResourceListResponse getCounselingResourceList() {
        List<CounselingResource> resources = counselingResourceRepository.findAllNotDeleted();

        List<CounselingResourceItem> items = resources.stream()
                .map(CounselingResourceItem::from)
                .collect(Collectors.toList());

        return CounselingResourceListResponse.builder()
                .resources(items)
                .build();
    }

    /**
     * 상담 기관 추가
     */
    @Transactional
    public CounselingResourceResponse createCounselingResource(CounselingResourceCreateRequest request) {
        // 카테고리 변환 및 검증
        CounselingResource.Category category = validateAndConvertCategory(request.getCategory());

        // 상담 기관 생성
        LocalDateTime now = LocalDateTime.now();
        CounselingResource resource = CounselingResource.builder()
                .name(request.getName())
                .category(category)
                .phone(request.getPhone())
                .website(request.getWebsite())
                .description(request.getDescription())
                .operatingHours(request.getOperatingHours())
                .isUrgent(request.getIsUrgent())
                .createdAt(now)
                .updatedAt(now)
                .build();

        CounselingResource savedResource = counselingResourceRepository.save(resource);

        log.info("Counseling resource created: resourceId={}", savedResource.getId());
        return CounselingResourceResponse.from(savedResource);
    }

    /**
     * 상담 기관 수정
     */
    @Transactional
    public CounselingResourceResponse updateCounselingResource(Long resourceId, CounselingResourceUpdateRequest request) {
        // 상담 기관 조회
        CounselingResource resource = findResourceById(resourceId);
        validateResourceNotDeleted(resource, resourceId);

        // 카테고리 변환 및 검증
        CounselingResource.Category category = validateAndConvertCategory(request.getCategory());

        // 상담 기관 수정
        updateResourceFields(resource, request, category);
        resource.setUpdatedAt(LocalDateTime.now());

        CounselingResource updatedResource = counselingResourceRepository.save(resource);

        log.info("Counseling resource updated: resourceId={}", resourceId);
        return CounselingResourceResponse.from(updatedResource);
    }

    /**
     * 상담 기관 삭제 (소프트 삭제)
     */
    @Transactional
    public void deleteCounselingResource(Long resourceId) {
        CounselingResource resource = findResourceById(resourceId);
        validateResourceNotDeleted(resource, resourceId);

        // 소프트 삭제
        resource.setDeletedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());
        counselingResourceRepository.save(resource);

        log.info("Counseling resource deleted (soft delete): resourceId={}", resourceId);
    }

    /**
     * 상담 기관 ID로 조회
     */
    private CounselingResource findResourceById(Long resourceId) {
        return counselingResourceRepository.findById(resourceId)
                .orElseThrow(() -> {
                    log.warn("Counseling resource not found: resourceId={}", resourceId);
                    return new AdminNotFoundException(ERROR_MESSAGE_RESOURCE_NOT_FOUND);
                });
    }

    /**
     * 상담 기관이 삭제되지 않았는지 검증
     */
    private void validateResourceNotDeleted(CounselingResource resource, Long resourceId) {
        if (resource.getDeletedAt() != null) {
            log.warn("Attempted to access deleted counseling resource: resourceId={}", resourceId);
            throw new AdminNotFoundException(ERROR_MESSAGE_RESOURCE_NOT_FOUND);
        }
    }

    /**
     * 카테고리 변환 및 검증
     */
    private CounselingResource.Category validateAndConvertCategory(String categoryKorean) {
        CounselingResource.Category category = CounselingResourceCategoryConverter.fromKorean(categoryKorean);
        if (category == null) {
            throw new IllegalArgumentException(ERROR_MESSAGE_INVALID_CATEGORY + categoryKorean);
        }
        return category;
    }

    /**
     * 상담 기관 필드 업데이트
     */
    private void updateResourceFields(CounselingResource resource, CounselingResourceUpdateRequest request, CounselingResource.Category category) {
        resource.setName(request.getName());
        resource.setCategory(category);
        resource.setPhone(request.getPhone());
        resource.setWebsite(request.getWebsite());
        resource.setDescription(request.getDescription());
        resource.setOperatingHours(request.getOperatingHours());
        resource.setIsUrgent(request.getIsUrgent());
    }
}

