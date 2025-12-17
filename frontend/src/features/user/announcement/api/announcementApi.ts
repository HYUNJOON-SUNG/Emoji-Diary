/**
 * ====================================================================================================
 * 공지사항 API
 * ====================================================================================================
 * 
 * @description
 * 사용자용 공지사항 관련 API 함수 정의
 * - 유스케이스: 10.4 공지사항 조회
 * 
 * @backend_requirements
 * - GET /api/notices (목록 조회)
 * - GET /api/notices/:id (상세 조회)
 * 
 * ====================================================================================================
 */

import { apiClient } from '@/shared/api/client';

/**
 * 공지사항 정보 인터페이스
 * - ERD: Notices 테이블 참조
 */
export interface Notice {
  /** 공지사항 고유 ID (ERD: Notices.id, BIGINT) */
  id: number;
  /** 제목 (ERD: Notices.title, VARCHAR(255)) */
  title: string;
  /** 내용 (HTML 가능, ERD: Notices.content, TEXT, 목록 조회 시 미포함) */
  content?: string;
  /** 작성자 (ERD: Notices.admin_id -> Admins.name) */
  author: string;
  /** 작성일 (ERD: Notices.created_at, DATETIME) */
  createdAt: string;
  /** 조회수 (ERD: Notices.views, INT) */
  views: number;
  /** 고정 여부 (ERD: Notices.is_pinned, BOOLEAN) */
  isPinned: boolean;
}

/**
 * 공지사항 목록 조회
 * @param page 페이지 번호
 * @param limit 페이지당 개수
 * @returns 공지사항 목록
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
 * 공지사항 상세 조회
 * @param noticeId 공지사항 ID
 * @returns 공지사항 상세
 */
export async function getNoticeById(noticeId: number): Promise<Notice> {
  const response = await apiClient.get(`/notices/${noticeId}`);
  
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.error?.message || '공지사항을 찾을 수 없습니다.');
  }
}
