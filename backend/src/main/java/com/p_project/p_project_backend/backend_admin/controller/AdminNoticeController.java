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
     * 공지사항 목록 조회 (페이지네이션)
     */
    @GetMapping
    public ResponseEntity<?> getNoticeList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        NoticeListResponse response = adminNoticeService.getNoticeList(page, limit);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 공지사항 상세 내용 조회
     */
    @GetMapping("/{noticeId}")
    public ResponseEntity<?> getNoticeDetail(@PathVariable Long noticeId) {
        NoticeDetailResponse response = adminNoticeService.getNoticeDetail(noticeId);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 신규 공지사항 작성
     */
    @PostMapping
    public ResponseEntity<?> createNotice(
            @RequestBody @Valid NoticeCreateRequest request,
            Authentication authentication) {
        Long adminId = getAdminIdFromAuthentication(authentication);
        NoticeDetailResponse response = adminNoticeService.createNotice(request, adminId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true, "data", response));
    }

    /**
     * 기존 공지사항 내용 수정
     */
    @PutMapping("/{noticeId}")
    public ResponseEntity<?> updateNotice(
            @PathVariable Long noticeId,
            @RequestBody @Valid NoticeUpdateRequest request) {
        NoticeUpdateResponse response = adminNoticeService.updateNotice(noticeId, request);
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 공지사항 삭제
     */
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long noticeId) {
        adminNoticeService.deleteNotice(noticeId);
        return ResponseEntity.ok(Map.of("success", true,
                "data", Map.of("message", "공지사항이 삭제되었습니다")));
    }

    /**
     * 공지사항 상단 고정 상태 변경
     */
    @PutMapping("/{noticeId}/pin")
    public ResponseEntity<?> togglePin(
            @PathVariable Long noticeId,
            @RequestBody @Valid NoticePinRequest request) {
        NoticePinResponse response = adminNoticeService.togglePin(noticeId, request.getIsPinned());
        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }

    /**
     * 인증 정보에서 관리자 식별자(ID) 추출
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
