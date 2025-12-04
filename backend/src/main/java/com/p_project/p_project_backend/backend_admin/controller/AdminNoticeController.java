package com.p_project.p_project_backend.backend_admin.controller;

import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeCreateRequest;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeDetailResponse;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeListResponse;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticePinRequest;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticePinResponse;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeUpdateRequest;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeUpdateResponse;
import com.p_project.p_project_backend.backend_admin.service.AdminNoticeService;
import com.p_project.p_project_backend.entity.Admin;
import com.p_project.p_project_backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class AdminNoticeController {

    private final AdminNoticeService adminNoticeService;
    private final AdminRepository adminRepository;

    /**
     * 공지사항 목록 조회
     * GET /api/admin/notices
     */
    @GetMapping
    public ResponseEntity<?> getNoticeList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        NoticeListResponse response = adminNoticeService.getNoticeList(page, limit);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 공지사항 상세 조회
     * GET /api/admin/notices/{noticeId}
     */
    @GetMapping("/{noticeId}")
    public ResponseEntity<?> getNoticeDetail(@PathVariable Long noticeId) {
        NoticeDetailResponse response = adminNoticeService.getNoticeDetail(noticeId);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 공지사항 작성
     * POST /api/admin/notices
     */
    @PostMapping
    public ResponseEntity<?> createNotice(
            @RequestBody @Valid NoticeCreateRequest request,
            Authentication authentication
    ) {
        Long adminId = getAdminIdFromAuthentication(authentication);
        NoticeDetailResponse response = adminNoticeService.createNotice(request, adminId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true, "data", response));
    }

    /**
     * 공지사항 수정
     * PUT /api/admin/notices/{noticeId}
     */
    @PutMapping("/{noticeId}")
    public ResponseEntity<?> updateNotice(
            @PathVariable Long noticeId,
            @RequestBody @Valid NoticeUpdateRequest request
    ) {
        NoticeUpdateResponse response = adminNoticeService.updateNotice(noticeId, request);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 공지사항 삭제
     * DELETE /api/admin/notices/{noticeId}
     */
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long noticeId) {
        adminNoticeService.deleteNotice(noticeId);
        return ResponseEntity.ok(Map.of("success", true,
                "data", Map.of("message", "공지사항이 삭제되었습니다")));
    }

    /**
     * 공지사항 고정/해제
     * PUT /api/admin/notices/{noticeId}/pin
     */
    @PutMapping("/{noticeId}/pin")
    public ResponseEntity<?> togglePin(
            @PathVariable Long noticeId,
            @RequestBody @Valid NoticePinRequest request
    ) {
        NoticePinResponse response = adminNoticeService.togglePin(noticeId, request.getIsPinned());
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * Authentication에서 관리자 ID 추출
     */
    private Long getAdminIdFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("인증 정보가 없습니다.");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();

        return adminRepository.findByEmail(email)
                .map(Admin::getId)
                .orElseThrow(() -> new RuntimeException("관리자 정보를 찾을 수 없습니다."));
    }
}

