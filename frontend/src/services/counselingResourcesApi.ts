/**
 * ========================================
 * 상담 기관 리소스 API (Section 8)
 * ========================================
 * 
 * [API 명세서 Section 8]
 */

import { TokenStorage } from './authApi';

/**
 * 지연 함수 (네트워크 지연 시뮬레이션)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  phone: string; // 전화번호 (ERD: Counseling_Resources.phone, VARCHAR(50), NULL 가능)
  website?: string; // 웹사이트 URL (ERD: Counseling_Resources.website, VARCHAR(500), NULL 가능)
  description: string; // 설명 (ERD: Counseling_Resources.description, TEXT, NULL 가능)
  operatingHours?: string; // 운영 시간 (ERD: Counseling_Resources.operating_hours, VARCHAR(255), NULL 가능)
  isUrgent: boolean; // 긴급 상담 기관 여부 (ERD: Counseling_Resources.is_urgent, BOOLEAN, 기본값: FALSE)
}

/**
 * Mock 상담 기관 리소스 데이터
 */
const mockResources: CounselingResource[] = [
  {
    id: 1,
    name: '자살예방 상담전화',
    category: '긴급상담',
    phone: '1393',
    website: 'https://www.suicide.or.kr',
    description: '24시간 위기상담 및 자살예방 전문 상담',
    operatingHours: '24시간',
    isUrgent: true,
  },
  {
    id: 2,
    name: '정신건강 위기상담 전화',
    category: '긴급상담',
    phone: '1577-0199',
    website: 'https://www.mentalhealth.go.kr',
    description: '정신건강 위기 상황에 대한 전문 상담',
    operatingHours: '24시간',
    isUrgent: true,
  },
  {
    id: 3,
    name: '청소년 상담전화',
    category: '상담전화',
    phone: '1388',
    website: 'https://www.cyber1388.kr',
    description: '청소년 대상 심리 상담 및 위기 지원',
    operatingHours: '평일 09:00-22:00',
    isUrgent: false,
  },
  {
    id: 4,
    name: '한국심리상담협회',
    category: '전문상담',
    phone: '02-3452-0091',
    website: 'https://www.krcpa.or.kr',
    description: '전문 심리상담사와의 1:1 상담',
    operatingHours: '평일 09:00-18:00',
    isUrgent: false,
  },
  {
    id: 5,
    name: '국립정신건강센터',
    category: '의료기관',
    phone: '02-2204-0001',
    website: 'https://www.ncmh.go.kr',
    description: '정신건강 전문 진료 및 치료 서비스',
    operatingHours: '평일 09:00-18:00',
    isUrgent: false,
  },
];

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
 * [백엔드 팀] 실제 구현 시:
 * - GET /api/counseling-resources
 * - Headers: { Authorization: Bearer {accessToken} }
 * - Query Parameters: { category?: 'all' | '긴급상담' | '전문상담' | '상담전화' | '의료기관' }
 * - Response: { success: true, data: { resources: CounselingResource[] } }
 * - 쿼리:
 *   SELECT * FROM counseling_resources
 *   WHERE deleted_at IS NULL
 *   AND (category = ? OR ? = 'all')
 *   ORDER BY is_urgent DESC, name ASC
 * 
 * @param category 카테고리 필터 (기본값: 'all')
 * @returns Promise<{ resources: CounselingResource[] }> - 상담 기관 리소스 목록
 */
export async function getCounselingResources(category: 'all' | '긴급상담' | '전문상담' | '상담전화' | '의료기관' = 'all'): Promise<{
  resources: CounselingResource[];
}> {
  await delay(500);
  
  // [백엔드 팀] 실제 구현 시:
  // const token = TokenStorage.getAccessToken();
  // const queryParams = new URLSearchParams();
  // if (category !== 'all') {
  //   queryParams.append('category', category);
  // }
  // const response = await fetch(`/api/counseling-resources?${queryParams}`, {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //   },
  // });
  // const result = await response.json();
  // return result.success ? result.data : { resources: [] };
  
  // Mock 구현: 카테고리 필터링
  let filtered = mockResources;
  if (category !== 'all') {
    filtered = mockResources.filter((resource) => resource.category === category);
  }
  
  // 정렬: 긴급 상담 기관 우선, 이후 이름순
  filtered.sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return a.name.localeCompare(b.name, 'ko');
  });
  
  return {
    resources: filtered,
  };
}

