package com.p_project.p_project_backend.backend_user.controller;

import com.p_project.p_project_backend.backend_user.dto.notice.NoticeDetailResponse;
import com.p_project.p_project_backend.backend_user.dto.notice.NoticeListResponse;
import com.p_project.p_project_backend.backend_user.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    /**
     * 공지사항 목록 조회
     * GET /api/notices
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotices(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        NoticeListResponse response = noticeService.getNoticeList(page, limit);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", response);

        return ResponseEntity.ok(body);
    }

    /**
     * 공지사항 상세 조회
     * GET /api/notices/{noticeId}
     */
    @GetMapping("/{noticeId}")
    public ResponseEntity<Map<String, Object>> getNoticeDetail(@PathVariable Long noticeId) {
        NoticeDetailResponse response = noticeService.getNoticeDetail(noticeId);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", response);

        return ResponseEntity.ok(body);
    }
}
