/**
 * ========================================
 * 지원 리소스 데이터 (플로우 9.3)
 * ========================================
 * 
 * 주요 기능:
 * - 정신건강 지원 기관 정보 제공
 * - 카테고리별 필터링 (긴급 상담, 전문 상담, 상담 전화, 의료 기관)
 * - 기관명, 설명, 전화번호, 웹사이트, 운영 시간 정보
 * 
 * 사용처:
 * - SupportResourcesPage (지원 리소스 페이지)
 * - RiskAlertModal ("도움말 & 리소스 보기" 버튼 클릭 시)
 * - MyPage (마이페이지에서 직접 접근)
 * 
 * [백엔드 팀] 실제 구현 시:
 * - DB에 support_resources 테이블 생성
 * - 관리자 페이지에서 리소스 관리 (추가/수정/삭제)
 * - 엔드포인트: GET /api/support-resources
 * - 카테고리별 필터: GET /api/support-resources?category=emergency
 */

/**
 * 지원 리소스 인터페이스 (플로우 9.3)
 * 
 * [ERD 설계서 참고 - Counseling_Resources 테이블]
 * - id: BIGINT (PK) → string (상담 기관 고유 ID)
 * - name: VARCHAR(255) → string (기관명)
 * - category: ENUM → string (카테고리: 긴급상담, 전문상담, 상담전화, 의료기관)
 * - phone: VARCHAR(50) → string (전화번호, NULL 가능)
 * - website: VARCHAR(500) → string (웹사이트 URL, NULL 가능)
 * - description: TEXT → string (설명, NULL 가능)
 * - operating_hours: VARCHAR(255) → hours (운영 시간, NULL 가능)
 * - is_urgent: BOOLEAN → isUrgent (긴급 상담 기관 여부, 기본값: FALSE, High 레벨 위험 신호 시 전화번호 표시)
 * - is_available: BOOLEAN → (이용 가능 여부, 기본값: TRUE, API 응답에 포함되지 않을 수 있음)
 * - created_at: DATETIME → (생성일시, API 응답에 포함되지 않을 수 있음)
 * - updated_at: DATETIME → (수정일시, API 응답에 포함되지 않을 수 있음)
 * - deleted_at: DATETIME → (소프트 삭제, API 응답에 포함되지 않음)
 * 
 * [관계]
 * - 관리자 페이지에서 상담 기관 리소스 관리 (추가/수정/삭제)
 * - is_urgent = TRUE인 기관의 전화번호는 High 레벨 위험 신호 표시 시 자동으로 포함됨
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
 * 지원 리소스 목록 (플로우 9.3)
 * 
 * 카테고리:
 * - emergency: 긴급 상담 (24시간, 위기 상황)
 * - counseling: 전문 상담 (심리상담, 전문기관)
 * - hotline: 상담 전화 (청소년, 일반 상담)
 * - community: 의료 기관 (정신과, 정신건강센터)
 * 
 * [백엔드 팀] 실제 구현 시:
 * - DB에서 조회
 * - 관리자 페이지에서 관리
 * - 지역별 필터링 추가 가능
 */
export const supportResources: SupportResource[] = [
  {
    id: '1',
    name: '자살예방 상담전화',
    description: '24시간 위기상담 및 자살예방 전문 상담',
    phone: '1393',
    website: 'https://www.kfsp.or.kr',
    hours: '24시간',
    category: 'emergency',
  },
  {
    id: '2',
    name: '정신건강 위기상담 전화',
    description: '정신건강 위기 상황에 대한 전문 상담',
    phone: '1577-0199',
    website: 'https://www.mentalhealth.go.kr',
    hours: '24시간',
    category: 'emergency',
  },
  {
    id: '3',
    name: '청소년 상담전화',
    description: '청소년의 고민과 위기 상황 상담',
    phone: '1388',
    website: 'https://www.cyber1388.kr',
    hours: '24시간',
    category: 'hotline',
  },
  {
    id: '4',
    name: '한국생명의전화',
    description: '자살예방 및 정서적 지원 상담',
    phone: '1588-9191',
    website: 'https://www.lifeline.or.kr',
    hours: '24시간',
    category: 'hotline',
  },
  {
    id: '5',
    name: '마음이음',
    description: '정신건강 관련 정보 제공 및 전문기관 연계',
    phone: '1577-0199',
    website: 'https://www.mentalhealth.go.kr',
    hours: '평일 9시~18시',
    category: 'counseling',
  },
  {
    id: '6',
    name: '한국심리상담센터',
    description: '전문 심리상담사와의 1:1 상담',
    phone: '1899-1231',
    website: 'https://www.kpcc.or.kr',
    hours: '평일 10시~19시',
    category: 'counseling',
  },
  {
    id: '7',
    name: '대한신경정신의학회',
    description: '정신과 전문의 찾기 및 정신건강 정보',
    website: 'https://www.knpa.or.kr',
    hours: '평일 9시~18시',
    category: 'community',
  },
  {
    id: '8',
    name: '국립정신건강센터',
    description: '정신건강 전문 진료 및 치료 서비스',
    phone: '02-2204-0001',
    website: 'https://www.ncmh.go.kr',
    hours: '평일 9시~18시',
    category: 'community',
  },
];

/**
 * 카테고리 라벨 (플로우 9.3)
 * 
 * 필터 버튼에 표시되는 텍스트
 */
export const categoryLabels = {
  emergency: '긴급 상담',
  counseling: '전문 상담',
  hotline: '상담 전화',
  community: '의료 기관',
};

/**
 * 카테고리별 색상 (플로우 9.3)
 * 
 * 리소스 카드의 카테고리 배지 색상
 * - emergency: 장미색 (긴급함 강조)
 * - counseling: 파란색 (전문성 강조)
 * - hotline: 보라색 (접근성 강조)
 * - community: 초록색 (안정감 강조)
 */
export const categoryColors = {
  emergency: 'bg-rose-100 text-rose-700 border-rose-300',
  counseling: 'bg-blue-100 text-blue-700 border-blue-300',
  hotline: 'bg-purple-100 text-purple-700 border-purple-300',
  community: 'bg-green-100 text-green-700 border-green-300',
};
