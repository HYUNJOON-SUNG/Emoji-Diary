/**
 * ========================================
 * 상담 기관 리소스 API (Section 8)
 * ========================================
 * 
 * [API 명세서 Section 8]
 * - JWT 토큰은 apiClient의 interceptor에서 자동으로 추가됩니다.
 */

import { apiClient } from '@/shared/api/client';

/**
 * 상담 기관 리소스 타입
 * 
 * [API 명세서 Section 8.1]
 * [ERD 설계서 참고 - Counseling_Resources 테이블]
 * - id: BIGINT (PK) → number (상담 기관 고유 ID)
 * - name: VARCHAR(255) → string (기관명)
 * - category: ENUM → string (카테고리: 긴급상담, 전문상담, 상담전화, 의료기관)
 * - phone: VARCHAR(50) → string (전화번호, NULL 가능)
 * - website: VARCHAR(500) → string (웹사이트 URL, NULL 가능)
 * - description: TEXT → string (설명, NULL 가능)
 * - operating_hours: VARCHAR(255) → operatingHours (운영 시간, NULL 가능)
 * - is_urgent: BOOLEAN → isUrgent (긴급 상담 기관 여부, 기본값: FALSE)
 */
export interface CounselingResource {
  id: number; // 상담 기관 고유 ID (ERD: Counseling_Resources.id, BIGINT)
  name: string; // 기관명 (ERD: Counseling_Resources.name, VARCHAR(255))
  category: '긴급상담' | '전문상담' | '상담전화' | '의료기관'; // 카테고리 (ERD: Counseling_Resources.category, ENUM)
  phone?: string; // 전화번호 (ERD: Counseling_Resources.phone, VARCHAR(50), NULL 가능)
  website?: string; // 웹사이트 URL (ERD: Counseling_Resources.website, VARCHAR(500), NULL 가능)
  description?: string; // 설명 (ERD: Counseling_Resources.description, TEXT, NULL 가능)
  operatingHours?: string; // 운영 시간 (ERD: Counseling_Resources.operating_hours, VARCHAR(255), NULL 가능)
  isUrgent: boolean; // 긴급 상담 기관 여부 (ERD: Counseling_Resources.is_urgent, BOOLEAN, 기본값: FALSE)
}


/**
 * GET /api/counseling-resources
 * 상담 기관 목록 조회
 * 
 * [API 명세서 Section 8.1]
 * 
 * 기능:
 * - 상담 기관 리소스 목록 조회
 * - 카테고리별 필터링 가능
 * 
 * - GET /api/counseling-resources
 * - Headers: { Authorization: Bearer {accessToken} } (apiClient interceptor에서 자동 추가)
 * - Query Parameters: { category?: 'all' | '긴급상담' | '전문상담' | '상담전화' | '의료기관' }
 * - Response: { success: true, data: { resources: CounselingResource[] } }
 * 
 * @param category 카테고리 필터 (기본값: 'all')
 * @returns Promise<{ resources: CounselingResource[] }> - 상담 기관 리소스 목록
 */
export async function getCounselingResources(category: 'all' | '긴급상담' | '전문상담' | '상담전화' | '의료기관' = 'all'): Promise<{
  resources: CounselingResource[];
}> {
  const params: Record<string, string> = {};
  if (category !== 'all') {
    params.category = category;
  }
  
  const response = await apiClient.get('/counseling-resources', { params });
  
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.error?.message || '상담 기관 목록 조회에 실패했습니다.');
  }
}

