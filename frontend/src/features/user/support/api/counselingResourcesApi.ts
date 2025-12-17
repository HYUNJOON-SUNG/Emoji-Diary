/**
 * ====================================================================================================
 * 상담 기관 리소스 API
 * ====================================================================================================
 * 
 * @description
 * 정신건강 상담 및 지원을 위한 상담 센터/기관 정보 API
 * - 유스케이스: 12.1 상담 기관 조회
 * 
 * @backend_requirements
 * - GET /api/counseling-resources
 *   - Query Params: category (필터링)
 * 
 * ====================================================================================================
 */

import { apiClient } from '@/shared/api/client';

/**
 * 상담 기관 정보 인터페이스
 * - ERD: Counseling_Resources 테이블 참조
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
 * 상담 기관 목록 조회
 * @param category 카테고리 필터 (기본값: 'all')
 * @returns 상담 기관 목록
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

