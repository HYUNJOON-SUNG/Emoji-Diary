package com.p_project.p_project_backend.backend_admin.service;

import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeCreateRequest;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeDetailResponse;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeItem;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeListResponse;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticePinResponse;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeUpdateRequest;
import com.p_project.p_project_backend.backend_admin.dto.notice.NoticeUpdateResponse;
import com.p_project.p_project_backend.entity.Admin;
import com.p_project.p_project_backend.entity.Notice;
import com.p_project.p_project_backend.exception.AdminNotFoundException;
import com.p_project.p_project_backend.repository.AdminRepository;
import com.p_project.p_project_backend.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminNoticeService {

    private static final int PAGE_OFFSET = 1; // 1-based to 0-based page conversion
    private static final String ERROR_MESSAGE_NOTICE_NOT_FOUND = "공지사항을 찾을 수 없습니다.";
    private static final String ERROR_MESSAGE_ADMIN_NOT_FOUND = "관리자를 찾을 수 없습니다.";

    private final NoticeRepository noticeRepository;
    private final AdminRepository adminRepository;

    /**
     * 공지사항 목록 조회
     */
    @Transactional(readOnly = true)
    public NoticeListResponse getNoticeList(int page, int limit) {
        // 페이징 설정
        Pageable pageable = PageRequest.of(page - PAGE_OFFSET, limit);

        // 공지사항 목록 조회
        Page<Notice> noticePage = noticeRepository.findAllNotDeleted(pageable);

        // DTO 변환
        List<NoticeItem> noticeItems = noticePage.getContent().stream()
                .map(NoticeItem::from)
                .collect(Collectors.toList());

        return NoticeListResponse.builder()
                .total(noticePage.getTotalElements())
                .page(page)
                .limit(limit)
                .notices(noticeItems)
                .build();
    }

    /**
     * 공지사항 상세 조회 (관리자 정보 포함)
     */
    @Transactional(readOnly = true)
    public NoticeDetailResponse getNoticeDetail(Long noticeId) {
        Notice notice = findNoticeById(noticeId);
        validateNoticeNotDeleted(notice, noticeId);
        return NoticeDetailResponse.from(notice);
    }

    /**
     * 신규 공지사항 생성
     */
    @Transactional
    public NoticeDetailResponse createNotice(NoticeCreateRequest request, Long adminId) {
        // 관리자 조회
        Admin admin = findAdminById(adminId);

        // 공지사항 생성
        LocalDateTime now = LocalDateTime.now();
        Notice notice = Notice.builder()
                .admin(admin)
                .title(request.getTitle())
                .content(request.getContent())
                .isPublic(request.getIsPublic())
                .isPinned(request.getIsPinned())
                .views(0)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Notice savedNotice = noticeRepository.save(notice);

        // 관리자 정보 포함하여 조회
        Notice noticeWithAdmin = noticeRepository.findByIdWithAdmin(savedNotice.getId())
                .orElse(savedNotice);

        log.info("Notice created: noticeId={}, adminId={}", savedNotice.getId(), adminId);
        return NoticeDetailResponse.from(noticeWithAdmin);
    }

    /**
     * 공지사항 수정
     */
    @Transactional
    public NoticeUpdateResponse updateNotice(Long noticeId, NoticeUpdateRequest request) {
        Notice notice = findNoticeById(noticeId);
        validateNoticeNotDeleted(notice, noticeId);

        // 공지사항 수정
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setIsPublic(request.getIsPublic());
        notice.setIsPinned(request.getIsPinned());
        notice.setUpdatedAt(LocalDateTime.now());

        Notice updatedNotice = noticeRepository.save(notice);

        log.info("Notice updated: noticeId={}", noticeId);
        return NoticeUpdateResponse.builder()
                .id(updatedNotice.getId())
                .title(updatedNotice.getTitle())
                .content(updatedNotice.getContent())
                .updatedAt(updatedNotice.getUpdatedAt())
                .build();
    }

    /**
     * 공지사항 삭제 (소프트 삭제)
     */
    @Transactional
    public void deleteNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> {
                    log.warn("Notice not found: noticeId={}", noticeId);
                    return new AdminNotFoundException(ERROR_MESSAGE_NOTICE_NOT_FOUND);
                });

        validateNoticeNotDeleted(notice, noticeId);

        // 소프트 삭제
        notice.setDeletedAt(LocalDateTime.now());
        notice.setUpdatedAt(LocalDateTime.now());
        noticeRepository.save(notice);

        log.info("Notice deleted (soft delete): noticeId={}", noticeId);
    }

    /**
     * 공지사항 상단 고정 상태 토글
     */
    @Transactional
    public NoticePinResponse togglePin(Long noticeId, boolean isPinned) {
        Notice notice = findNoticeById(noticeId);
        validateNoticeNotDeleted(notice, noticeId);

        // 고정 상태 변경
        notice.setIsPinned(isPinned);
        notice.setUpdatedAt(LocalDateTime.now());
        Notice updatedNotice = noticeRepository.save(notice);

        log.info("Notice pin toggled: noticeId={}, isPinned={}", noticeId, isPinned);
        return NoticePinResponse.builder()
                .id(updatedNotice.getId())
                .isPinned(updatedNotice.getIsPinned())
                .build();
    }

    /**
     * 공지사항 ID 조회 (관리자 포함)
     */
    private Notice findNoticeById(Long noticeId) {
        return noticeRepository.findByIdWithAdmin(noticeId)
                .orElseThrow(() -> {
                    log.warn("Notice not found: noticeId={}", noticeId);
                    return new AdminNotFoundException(ERROR_MESSAGE_NOTICE_NOT_FOUND);
                });
    }

    /**
     * 관리자 ID 조회
     */
    private Admin findAdminById(Long adminId) {
        return adminRepository.findById(adminId)
                .orElseThrow(() -> {
                    log.warn("Admin not found: adminId={}", adminId);
                    return new AdminNotFoundException(ERROR_MESSAGE_ADMIN_NOT_FOUND);
                });
    }

    /**
     * 공지사항 삭제 여부 검증
     */
    private void validateNoticeNotDeleted(Notice notice, Long noticeId) {
        if (notice.getDeletedAt() != null) {
            log.warn("Attempted to access deleted notice: noticeId={}", noticeId);
            throw new AdminNotFoundException(ERROR_MESSAGE_NOTICE_NOT_FOUND);
        }
    }
}
