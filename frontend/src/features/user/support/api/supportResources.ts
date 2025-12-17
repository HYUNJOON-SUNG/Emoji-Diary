/**
 * ====================================================================================================
 * 지원 리소스 상수 및 타입 정의
 * ====================================================================================================
 * 
 * @description
 * 프론트엔드에서 사용하는 상담 기관 카테고리 매핑 및 스타일 상수
 * - 백엔드 Enum과 프론트엔드 표시 텍스트/스타일 간의 매핑 관리
 * 
 * ====================================================================================================
 */

/**
 * 지원 리소스(프론트엔드용) 인터페이스
 */
export interface SupportResource {
  id: string; // 상담 기관 고유 ID (ERD: Counseling_Resources.id, BIGINT)
  name: string; // 기관명 (ERD: Counseling_Resources.name, VARCHAR(255))
  description: string; // 설명 (ERD: Counseling_Resources.description, TEXT)
  phone?: string; // 전화번호 (ERD: Counseling_Resources.phone, VARCHAR(50), NULL 가능)
  website?: string; // 웹사이트 URL (ERD: Counseling_Resources.website, VARCHAR(500), NULL 가능)
  hours?: string; // 운영 시간 (ERD: Counseling_Resources.operating_hours, VARCHAR(255), NULL 가능)
  category: 'emergency' | 'counseling' | 'hotline' | 'community'; // 카테고리 (ERD: Counseling_Resources.category, ENUM: 긴급상담, 전문상담, 상담전화, 의료기관)
  isUrgent?: boolean; // 긴급 상담 기관 여부 (ERD: Counseling_Resources.is_urgent, BOOLEAN, 기본값: FALSE, High 레벨 위험 신호 시 전화번호 표시)
}



/**
 * 카테고리 라벨 매핑
 */
export const categoryLabels = {
  emergency: '긴급 상담',
  counseling: '전문 상담',
  hotline: '상담 전화',
  community: '의료 기관',
};

/**
 * 카테고리별 색상 테마 매핑
 */
export const categoryColors = {
  emergency: 'bg-rose-100 text-rose-700 border-rose-300',
  counseling: 'bg-blue-100 text-blue-700 border-blue-300',
  hotline: 'bg-purple-100 text-purple-700 border-purple-300',
  community: 'bg-green-100 text-green-700 border-green-300',
};
