/**
 * 공통 타입 정의
 */

/**
 * 사용자 타입
 * 
 * [ERD 설계서 참고 - Users 테이블]
 * - id: BIGINT (PK) → string (사용자 고유 ID)
 * - email: VARCHAR(255), UNIQUE → string (이메일 주소)
 * - name: VARCHAR(100) → string (사용자 이름)
 * - password_hash: VARCHAR(255) → (프론트엔드에 포함하지 않음, 백엔드 내부 처리)
 * - gender: ENUM (MALE, FEMALE) → string (성별, AI 이미지 생성 시 주인공 성별 결정)
 * - persona: ENUM → string (페르소나: 베프, 부모님, 전문가, 멘토, 상담사, 시인, 기본값: 베프)
 * - email_verified: BOOLEAN → (API 응답에 포함되지 않을 수 있음, 백엔드 내부 처리)
 * - created_at: DATETIME → createdAt (ISO 8601 형식)
 * - updated_at: DATETIME → (API 응답에 포함되지 않을 수 있음)
 * - deleted_at: DATETIME → (소프트 삭제, API 응답에 포함되지 않음)
 * 
 * [API 명세서 Section 3.1 - GET /users/me]
 * - Response에 gender 필드 포함
 */
export interface User {
  id: string; // 사용자 고유 ID (ERD: Users.id, BIGINT)
  email: string; // 이메일 주소 (ERD: Users.email, VARCHAR(255), UNIQUE)
  name: string; // 사용자 이름 (ERD: Users.name, VARCHAR(100))
  gender?: 'MALE' | 'FEMALE'; // 성별 (ERD: Users.gender, ENUM, API 명세서 필수 필드, AI 이미지 생성 시 사용)
  persona: string; // 페르소나 (ERD: Users.persona, ENUM, 기본값: "베프", API 명세서 필수 필드)
  notificationEnabled?: boolean; // 알림 설정 (API 명세서에 없지만 기존 기능 유지, ERD에 없음)
  createdAt?: string; // 계정 생성일 (ERD: Users.created_at, DATETIME, ISO 8601 형식, API 명세서 필수 필드)
}

/**
 * API 응답 기본 구조
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 페이지네이션 정보
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 로딩 상태
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

