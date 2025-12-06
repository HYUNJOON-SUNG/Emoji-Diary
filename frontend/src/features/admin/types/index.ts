/**
 * 관리자 기능 공통 타입 정의
 * 
 * [API 명세서 및 ERD 설계서 참고]
 * 모든 타입은 API 명세서와 ERD 설계서를 기반으로 정의됨
 */

/**
 * 관리자 정보
 * [ERD: Admins 테이블]
 */
export interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  lastLogin?: string;
}

/**
 * 에러 로그
 * [ERD: Error_Logs 테이블]
 * [API 명세서: 10.5 에러 로그 조회 API]
 */
export interface ErrorLog {
  id: number; // ERD: Error_Logs.id (BIGINT)
  timestamp: string; // ERD: Error_Logs.created_at (DATETIME, ISO 8601)
  level: 'ERROR' | 'WARN' | 'INFO'; // ERD: Error_Logs.level (ENUM)
  message: string; // ERD: Error_Logs.message (TEXT)
  endpoint?: string; // ERD: Error_Logs.endpoint (VARCHAR(255), NULL 가능)
  userId?: number; // ERD: Error_Logs.user_id (BIGINT, FK → Users.id, NULL 가능)
  adminId?: number; // ERD: Error_Logs.admin_id (BIGINT, FK → Admins.id, NULL 가능)
  errorCode?: string; // ERD: Error_Logs.error_code (VARCHAR(50), NULL 가능)
  stackTrace?: string; // ERD: Error_Logs.stack_trace (TEXT, NULL 가능)
  userAgent?: string; // (선택적, UI에서 사용)
}

/**
 * 로그 통계
 */
export interface LogStats {
  total: number;
  error: number;
  warn: number;
  info: number;
}

/**
 * 공지사항
 * [ERD: Notices 테이블]
 * [API 명세서: 10.3 공지사항 관리 API]
 */
export interface Notice {
  id: number; // ERD: Notices.id (BIGINT)
  title: string; // ERD: Notices.title (VARCHAR(255))
  content: string; // ERD: Notices.content (TEXT, HTML 가능)
  author: string; // ERD: Notices.admin_id → Admins.name (API 응답에서 작성자 이름)
  createdAt: string; // ERD: Notices.created_at (DATETIME, ISO 8601)
  updatedAt?: string; // ERD: Notices.updated_at (DATETIME, NULL 가능)
  views: number; // ERD: Notices.views (INT, 기본값: 0)
  isPinned: boolean; // ERD: Notices.is_pinned (BOOLEAN, 기본값: FALSE)
  isPublic: boolean; // ERD: Notices.is_public (BOOLEAN, 기본값: TRUE)
}

/**
 * 위험 신호 감지 기준
 * [ERD: Risk_Detection_Settings 테이블]
 * [API 명세서: 10.4.1, 10.4.2 위험 신호 감지 기준]
 */
export interface RiskThreshold {
  monitoringPeriodDays: number; // ERD: Risk_Detection_Settings.monitoring_period (INT)
  highConsecutiveDays: number; // ERD: Risk_Detection_Settings.high_consecutive_score (INT)
  highTotalDays: number; // ERD: Risk_Detection_Settings.high_score_in_period (INT)
  mediumConsecutiveDays: number; // ERD: Risk_Detection_Settings.medium_consecutive_score (INT)
  mediumTotalDays: number; // ERD: Risk_Detection_Settings.medium_score_in_period (INT)
  lowConsecutiveDays: number; // ERD: Risk_Detection_Settings.low_consecutive_score (INT)
  lowTotalDays: number; // ERD: Risk_Detection_Settings.low_score_in_period (INT)
}

/**
 * 상담 기관 리소스
 * [ERD: Counseling_Resources 테이블]
 * [API 명세서: 10.4.3-10.4.6 상담 기관 리소스]
 */
export interface CounselingResource {
  id: number; // ERD: Counseling_Resources.id (BIGINT)
  name: string; // ERD: Counseling_Resources.name (VARCHAR(255))
  category: '긴급상담' | '전문상담' | '상담전화' | '의료기관'; // ERD: Counseling_Resources.category (ENUM)
  phone: string; // ERD: Counseling_Resources.phone (VARCHAR(50), NULL 가능)
  website?: string; // ERD: Counseling_Resources.website (VARCHAR(500), NULL 가능)
  description: string; // ERD: Counseling_Resources.description (TEXT, NULL 가능)
  operatingHours?: string; // ERD: Counseling_Resources.operating_hours (VARCHAR(255), NULL 가능)
  isUrgent: boolean; // ERD: Counseling_Resources.is_urgent (BOOLEAN, 기본값: FALSE)
}

