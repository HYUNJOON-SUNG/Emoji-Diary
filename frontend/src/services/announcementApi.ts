/**
 * ========================================
 * 공지사항 API (플로우 10.4)
 * ========================================
 * 
 * [플로우 10.4: 공지사항 조회]
 * 
 * **경로**: 마이페이지 좌측 페이지에서 "공지사항" 버튼 클릭
 * **화면**: 공지사항 목록 모달
 * 
 * **모달 표시 내용**:
 * 1. **공지사항 목록**:
 *    - 관리자가 작성한 공지사항 목록 표시
 *    - 고정된 공지사항이 상단에 표시 (📌 아이콘)
 *    - 이후 작성일 최신순 정렬
 * 
 * 2. **각 공지사항 항목 표시**:
 *    - 제목
 *    - 작성일
 *    - 고정 여부 (고정된 경우 "📌 고정" 배지)
 *    - 공지사항 항목 클릭 → 공지사항 상세 모달 표시
 * 
 * 3. **공지사항 상세 모달**:
 *    - 공지사항 제목
 *    - 작성일
 *    - 고정 여부 (고정된 경우 표시)
 *    - 공지사항 내용 (HTML 렌더링)
 *    - "닫기" 버튼 클릭 → 상세 모달 닫기
 * 
 * **데이터 로드**:
 * - 모달 열릴 때 공지사항 목록 자동 로드
 * - 로딩 상태 표시 ("공지사항을 불러오는 중...")
 * - 공개 상태인 공지사항만 표시 (비공개 공지사항은 제외)
 * 
 * **공지사항이 없는 경우**:
 * - "등록된 공지사항이 없습니다." 메시지 표시
 * 
 * **모달 닫기**:
 * - 우측 상단 "X" 버튼 클릭 → 모달 닫기
 * - 상세 모달에서 "닫기" 버튼 클릭 → 상세 모달만 닫기, 목록 모달은 유지
 */

/**
 * 공지사항 타입
 * 
 * [API 명세서 Section 7.1, 7.2]
 * 
 * [ERD 설계서 참고 - Notices 테이블]
 * - id: BIGINT (PK) → number (공지사항 고유 ID)
 * - admin_id: BIGINT (FK) → author (작성자, API 응답에서는 작성자 이름으로 반환)
 * - title: VARCHAR(255) → string (공지사항 제목)
 * - content: TEXT → string (공지사항 내용, HTML 가능)
 * - is_pinned: BOOLEAN → isPinned (상단 고정 여부)
 * - views: INT → number (조회수, 기본값: 0, 조회 시 자동 증가)
 * - is_public: BOOLEAN → isPublic (공개 여부, 기본값: TRUE)
 * - created_at: DATETIME → createdAt (ISO 8601 형식)
 * - updated_at: DATETIME → updatedAt (ISO 8601 형식, NULL 가능)
 * - deleted_at: DATETIME → (소프트 삭제, API 응답에 포함되지 않음)
 * 
 * [관계]
 * - Notices.admin_id → Admins.id (FK, CASCADE)
 * - 사용자 조회 시: is_public = TRUE AND deleted_at IS NULL인 공지사항만 표시
 * - 조회 시 views 자동 증가
 */
export interface Notice {
  id: number; // 공지사항 고유 ID (ERD: Notices.id, BIGINT)
  title: string; // 제목 (ERD: Notices.title, VARCHAR(255))
  content?: string; // 내용 (HTML 가능, ERD: Notices.content, TEXT, 목록 조회 시 미포함)
  author: string; // 작성자 (ERD: Notices.admin_id → Admins.name, API 응답에서 작성자 이름으로 반환)
  createdAt: string; // 작성일 (ERD: Notices.created_at, DATETIME, ISO 8601 형식)
  views: number; // 조회수 (ERD: Notices.views, INT, 기본값: 0, 조회 시 자동 증가)
  isPinned: boolean; // 고정 여부 (ERD: Notices.is_pinned, BOOLEAN, 기본값: FALSE)
}

import { apiClient } from './api';

/**
 * GET /api/notices
 * 공지사항 목록 조회
 * 
 * [API 명세서 Section 7.1]
 * 
 * 기능:
 * - 공개 상태인 공지사항만 반환 (isPublic = true)
 * - 정렬 순서:
 *   1. 고정된 공지사항 우선 (isPinned = true)
 *   2. 이후 작성일 최신순 정렬 (createdAt DESC)
 * 
 * - GET /api/notices
 * - Headers: { Authorization: Bearer {accessToken} } (apiClient interceptor에서 자동 추가)
 * - Query Parameters: { page?, limit? } (기본값: page=1, limit=10)
 * - Response: { success: true, data: { total, page, limit, totalPages, notices } }
 * 
 * @param page 페이지 번호 (기본값: 1)
 * @param limit 페이지당 항목 수 (기본값: 10)
 * @returns Promise<{ total: number; page: number; limit: number; totalPages: number; notices: Notice[] }> - 공지사항 목록
 */
export async function getNotices(page: number = 1, limit: number = 10): Promise<{
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  notices: Notice[];
}> {
  const response = await apiClient.get('/notices', {
    params: { page, limit },
  });
  
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.error?.message || '공지사항 목록 조회에 실패했습니다.');
  }
}

/**
 * GET /api/notices/{noticeId}
 * 공지사항 상세 조회
 * 
 * [API 명세서 Section 7.2]
 * 
 * 기능:
 * - 특정 공지사항의 상세 정보 반환
 * - 공개 상태인 공지사항만 조회 가능
 * - 조회 시 views 자동 증가
 * 
 * - GET /api/notices/{noticeId}
 * - Headers: { Authorization: Bearer {accessToken} } (apiClient interceptor에서 자동 추가)
 * - Response: { success: true, data: Notice } (content 포함)
 * - Response 404: { success: false, error: { code: "NOTICE_NOT_FOUND", message: "..." } }
 * 
 * @param noticeId - 공지사항 ID
 * @returns Promise<Notice> - 공지사항 상세 정보 (content 포함)
 */
export async function getNoticeById(noticeId: number): Promise<Notice> {
  const response = await apiClient.get(`/notices/${noticeId}`);
  
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.error?.message || '공지사항을 찾을 수 없습니다.');
  }
}
