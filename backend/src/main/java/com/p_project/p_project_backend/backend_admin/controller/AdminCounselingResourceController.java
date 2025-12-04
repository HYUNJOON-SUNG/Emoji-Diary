package com.p_project.p_project_backend.backend_admin.controller;

import com.p_project.p_project_backend.backend_admin.dto.counselingresource.CounselingResourceCreateRequest;
import com.p_project.p_project_backend.backend_admin.dto.counselingresource.CounselingResourceListResponse;
import com.p_project.p_project_backend.backend_admin.dto.counselingresource.CounselingResourceResponse;
import com.p_project.p_project_backend.backend_admin.dto.counselingresource.CounselingResourceUpdateRequest;
import com.p_project.p_project_backend.backend_admin.service.AdminCounselingResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings/counseling-resources")
@RequiredArgsConstructor
public class AdminCounselingResourceController {

    private final AdminCounselingResourceService adminCounselingResourceService;

    /**
     * 상담 기관 목록 조회
     * GET /api/admin/settings/counseling-resources
     */
    @GetMapping
    public ResponseEntity<?> getCounselingResourceList() {
        CounselingResourceListResponse response = adminCounselingResourceService.getCounselingResourceList();
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 상담 기관 추가
     * POST /api/admin/settings/counseling-resources
     */
    @PostMapping
    public ResponseEntity<?> createCounselingResource(
            @RequestBody @Valid CounselingResourceCreateRequest request
    ) {
        CounselingResourceResponse response = adminCounselingResourceService.createCounselingResource(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true, "data", response));
    }

    /**
     * 상담 기관 수정
     * PUT /api/admin/settings/counseling-resources/{resourceId}
     */
    @PutMapping("/{resourceId}")
    public ResponseEntity<?> updateCounselingResource(
            @PathVariable Long resourceId,
            @RequestBody @Valid CounselingResourceUpdateRequest request
    ) {
        CounselingResourceResponse response = adminCounselingResourceService.updateCounselingResource(resourceId, request);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 상담 기관 삭제
     * DELETE /api/admin/settings/counseling-resources/{resourceId}
     */
    @DeleteMapping("/{resourceId}")
    public ResponseEntity<?> deleteCounselingResource(@PathVariable Long resourceId) {
        adminCounselingResourceService.deleteCounselingResource(resourceId);
        return ResponseEntity.ok(Map.of("success", true,
                "data", Map.of("message", "상담 기관이 삭제되었습니다")));
    }
}

