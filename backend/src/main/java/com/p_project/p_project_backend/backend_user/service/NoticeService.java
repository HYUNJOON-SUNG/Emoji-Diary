package com.p_project.p_project_backend.backend_user.service;

import com.p_project.p_project_backend.backend_user.dto.notice.NoticeDetailResponse;
import com.p_project.p_project_backend.backend_user.dto.notice.NoticeListResponse;
import com.p_project.p_project_backend.backend_user.dto.notice.NoticeResponse;
import com.p_project.p_project_backend.entity.Notice;
import com.p_project.p_project_backend.exception.NoticeNotFoundException;
import com.p_project.p_project_backend.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;

    /**
     * 공지사항 목록 조회 (공개된 것만, 고정 우선)
     */
    public NoticeListResponse getNoticeList(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit); // page is 1-based in API, 0-based in Spring Data

        Page<Notice> noticePage = noticeRepository.findPublicNotices(pageable);

        List<NoticeResponse> notices = noticePage.getContent().stream()
                .map(NoticeResponse::from)
                .collect(Collectors.toList());

        return NoticeListResponse.builder()
                .total(noticePage.getTotalElements())
                .limit(limit)
                .page(page)
                .notices(notices)
                .build();
    }

    /**
     * 공지사항 상세 조회 (공개된 것만, 조회수 증가)
     */
    @Transactional
    public NoticeDetailResponse getNoticeDetail(Long id) {
        Notice notice = noticeRepository.findByIdAndPublic(id)
                .orElseThrow(() -> new NoticeNotFoundException("공지사항을 찾을 수 없습니다"));

        // 조회수 증가
        notice.setViews(notice.getViews() + 1);
        // Dirty checking will update the entity

        return NoticeDetailResponse.from(notice);
    }
}
