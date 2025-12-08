/**
 * ====================================================================================================
 * 관리자 API 서비스
 * ====================================================================================================
 * 
 * @description
 * 관리자 기능을 위한 API 클라이언트
 * - 유스케이스: 관리자 기반 상세기능명세서 전체
 * - 플로우: 관리자 인증, 서비스 통계, 공지사항 관리, 시스템 설정, 에러 로그 조회
 * 
 * @features
 * 1. 관리자 인증 API
 * 2. 서비스 통계 API (대시보드)
 * 3. 공지사항 관리 API
 * 4. 시스템 설정 API
 * 5. 에러 로그 조회 API
 * 
 * @backend_requirements
 * - 모든 API는 관리자 JWT 토큰 필요 (Authorization: Bearer {adminAccessToken})
 * - Base URL: /api/admin
 * - JWT 토큰은 adminApiClient의 interceptor에서 자동으로 추가됩니다.
 * 
 * ====================================================================================================
 */

import { adminApiClient } from './api';

// ========================================
// 관리자 인증 API
// ========================================

/**
 * 관리자 로그인 (10.1.1)
 * POST /api/admin/auth/login
 */
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: true;
  data: {
    accessToken: string;
    admin: {
      id: number;
      email: string;
      name: string;
    };
  };
}

/**
 * 관리자 로그인 함수
 * 
 * @param email - 관리자 이메일
 * @param password - 관리자 비밀번호
 * @returns 로그인 결과
 */
export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  const response = await adminApiClient.post('/auth/login', { email, password });
  
  if (response.data.success) {
    // 관리자 토큰을 localStorage에 저장 (adminApiClient interceptor에서 사용)
    if (response.data.data.accessToken) {
      localStorage.setItem('admin_jwt_token', response.data.data.accessToken);
    }
    return response.data;
  } else {
    throw new Error(response.data.error?.message || 'ID 또는 비밀번호가 일치하지 않거나 관리자 권한이 없습니다.');
  }
}

/**
 * 관리자 로그아웃 (10.1.2)
 * POST /api/admin/auth/logout
 */
export async function adminLogout(): Promise<{ success: true; data: { message: string } }> {
  const response = await adminApiClient.post('/auth/logout');
  
  if (response.data.success) {
    // 관리자 토큰 제거
    localStorage.removeItem('admin_jwt_token');
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '로그아웃에 실패했습니다.');
  }
}

// ========================================
// 서비스 통계 API (10.2)
// ========================================

/**
 * 서비스 통계 카드 (10.2.1)
 * GET /api/admin/dashboard/stats
 */
export interface DashboardStatsRequest {
  period?: 'weekly' | 'monthly' | 'yearly';
  activeUserType?: 'dau' | 'wau' | 'mau';
  newUserPeriod?: 'daily' | 'weekly' | 'monthly';
}

export interface DashboardStatsResponse {
  success: true;
  data: {
    totalUsers: {
      count: number;
      change: number;
      period: string;
    };
    activeUsers: {
      dau: number;
      wau: number;
      mau: number;
      type: string;
    };
    newUsers: {
      daily: number;
      weekly: number;
      monthly: number;
      period: string;
    };
    totalDiaries: {
      count: number;
      change: number;
    };
    averageDailyDiaries: {
      count: number;
      period: string;
    };
    riskLevelUsers: {
      high: number;
      medium: number;
      low: number;
      none: number;
    };
  };
}

/**
 * 서비스 통계 카드 조회 함수
 * 
 * @param params - 조회 파라미터
 * @returns 통계 카드 데이터
 */
export async function getDashboardStats(params?: DashboardStatsRequest): Promise<DashboardStatsResponse> {
  const queryParams: Record<string, string> = {};
  if (params?.period) queryParams.period = params.period;
  if (params?.activeUserType) queryParams.activeUserType = params.activeUserType;
  if (params?.newUserPeriod) queryParams.newUserPeriod = params.newUserPeriod;
  
  const response = await adminApiClient.get('/dashboard/stats', { params: queryParams });
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '서비스 통계 조회에 실패했습니다.');
  }
}

/**
 * 일지 작성 추이 차트 (10.2.2)
 * GET /api/admin/dashboard/diary-trend
 */
export interface DiaryTrendRequest {
  period: 'weekly' | 'monthly' | 'yearly';
  year?: number;
  month?: number;
}

export interface DiaryTrendResponse {
  success: true;
  data: {
    period: string;
    trend: Array<{
      date: string;
      count: number;
    }>;
  };
}

/**
 * 일지 작성 추이 차트 조회 함수
 * 
 * @param params - 조회 파라미터
 * @returns 일지 작성 추이 데이터
 */
export async function getDiaryTrend(params: DiaryTrendRequest): Promise<DiaryTrendResponse> {
  const queryParams: Record<string, string | number> = { period: params.period };
  if (params.year !== undefined) queryParams.year = params.year;
  if (params.month !== undefined) queryParams.month = params.month;
  
  const response = await adminApiClient.get('/dashboard/diary-trend', { params: queryParams });
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '일지 작성 추이 조회에 실패했습니다.');
  }
}

/**
 * 사용자 활동 통계 차트 (10.2.3)
 * GET /api/admin/dashboard/user-activity-stats
 */
export interface UserActivityStatsRequest {
  period: 'weekly' | 'monthly' | 'yearly';
  year?: number;
  month?: number;
  metrics?: string; // 쉼표로 구분: dau,wau,mau,newUsers,retentionRate
}

export interface UserActivityStatsResponse {
  success: true;
  data: {
    period: string;
    year?: number;
    month?: number;
    metrics: string[];
    trend: Array<{
      date: string;
      dau?: number;
      wau?: number;
      mau?: number;
      newUsers?: number;
      retentionRate?: number;
    }>;
  };
}

/**
 * 사용자 활동 통계 차트 조회 함수
 * 
 * @param params - 조회 파라미터
 * @returns 사용자 활동 통계 데이터
 */
export async function getUserActivityStats(params: UserActivityStatsRequest): Promise<UserActivityStatsResponse> {
  const queryParams: Record<string, string | number | string> = { period: params.period };
  if (params.year !== undefined) queryParams.year = params.year;
  if (params.month !== undefined) queryParams.month = params.month;
  if (params.metrics) queryParams.metrics = params.metrics;
  
  const response = await adminApiClient.get('/dashboard/user-activity-stats', { params: queryParams });
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '사용자 활동 통계 조회에 실패했습니다.');
  }
}

/**
 * 위험 레벨 분포 통계 (10.2.4)
 * GET /api/admin/dashboard/risk-level-distribution
 */
export interface RiskLevelDistributionRequest {
  period: 'weekly' | 'monthly' | 'yearly';
  year?: number;
  month?: number;
}

export interface RiskLevelDistributionResponse {
  success: true;
  data: {
    period: string;
    year?: number;
    month?: number;
    distribution: {
      high: {
        count: number;
        percentage: number;
      };
      medium: {
        count: number;
        percentage: number;
      };
      low: {
        count: number;
        percentage: number;
      };
      none: {
        count: number;
        percentage: number;
      };
    };
    total: number;
  };
}

/**
 * 위험 레벨 분포 통계 조회 함수
 * 
 * @param params - 조회 파라미터
 * @returns 위험 레벨 분포 데이터
 */
export async function getRiskLevelDistribution(params: RiskLevelDistributionRequest): Promise<RiskLevelDistributionResponse> {
  const queryParams: Record<string, string | number> = { period: params.period };
  if (params.year !== undefined) queryParams.year = params.year;
  if (params.month !== undefined) queryParams.month = params.month;
  
  const response = await adminApiClient.get('/dashboard/risk-level-distribution', { params: queryParams });
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '위험 레벨 분포 통계 조회에 실패했습니다.');
  }
}

// ========================================
// 공지사항 관리 API (10.3)
// ========================================

/**
 * 공지사항 인터페이스
 * 
 * [ERD 설계서 참고 - Notices 테이블]
 * - id: BIGINT (PK) → number (공지사항 고유 ID)
 * - admin_id: BIGINT (FK) → author (작성자, API 응답에서는 작성자 이름으로 반환, Admins.id 참조)
 * - title: VARCHAR(255) → string (공지사항 제목)
 * - content: TEXT → string (공지사항 내용, HTML 가능)
 * - is_pinned: BOOLEAN → isPinned (상단 고정 여부, 기본값: FALSE)
 * - views: INT → number (조회수, 기본값: 0, 조회 시 자동 증가)
 * - is_public: BOOLEAN → isPublic (공개 여부, 기본값: TRUE)
 * - created_at: DATETIME → createdAt (ISO 8601 형식)
 * - updated_at: DATETIME → updatedAt (ISO 8601 형식, NULL 가능)
 * - deleted_at: DATETIME → (소프트 삭제, API 응답에 포함되지 않음)
 * 
 * [관계]
 * - Notices.admin_id → Admins.id (FK, CASCADE)
 * - 사용자 조회 시: is_public = TRUE AND deleted_at IS NULL인 공지사항만 표시
 * - 관리자 조회 시: deleted_at IS NULL인 모든 공지사항 표시
 * - 조회 시 views 자동 증가
 */
export interface Notice {
  id: number; // 공지사항 고유 ID (ERD: Notices.id, BIGINT)
  title: string; // 제목 (ERD: Notices.title, VARCHAR(255))
  content: string; // 내용 (HTML 가능, ERD: Notices.content, TEXT)
  author: string; // 작성자 (ERD: Notices.admin_id → Admins.name, API 응답에서 작성자 이름으로 반환)
  createdAt: string; // 작성일 (ERD: Notices.created_at, DATETIME, ISO 8601 형식)
  updatedAt?: string; // 수정일 (ERD: Notices.updated_at, DATETIME, ISO 8601 형식, NULL 가능)
  views: number; // 조회수 (ERD: Notices.views, INT, 기본값: 0, 조회 시 자동 증가)
  isPinned: boolean; // 고정 여부 (ERD: Notices.is_pinned, BOOLEAN, 기본값: FALSE)
  isPublic: boolean; // 공개 여부 (ERD: Notices.is_public, BOOLEAN, 기본값: TRUE)
}

/**
 * 공지사항 목록 조회 (10.3.1)
 * GET /api/admin/notices
 */
export interface NoticeListRequest {
  page?: number;
  limit?: number;
}

export interface NoticeListResponse {
  success: true;
  data: {
    total: number;
    page: number;
    limit: number;
    notices: Notice[];
  };
}

/**
 * 공지사항 목록 조회 함수
 * 
 * @param params - 조회 파라미터
 * @returns 공지사항 목록
 */
export async function getNoticeList(params?: NoticeListRequest): Promise<NoticeListResponse> {
  const queryParams: Record<string, number> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  
  const response = await adminApiClient.get('/notices', { params: queryParams });
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '공지사항 목록 조회에 실패했습니다.');
  }
}

/**
 * 공지사항 작성 (10.3.2)
 * POST /api/admin/notices
 */
export interface CreateNoticeRequest {
  title: string;
  content: string;
  isPublic: boolean;
  isPinned: boolean;
}

export interface CreateNoticeResponse {
  success: true;
  data: Notice;
}

/**
 * 공지사항 작성 함수
 * 
 * @param notice - 공지사항 데이터
 * @returns 생성된 공지사항
 */
export async function createNotice(notice: CreateNoticeRequest): Promise<CreateNoticeResponse> {
  const response = await adminApiClient.post('/notices', notice);
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '공지사항 작성에 실패했습니다.');
  }
}

/**
 * 공지사항 수정 (10.3.3)
 * PUT /api/admin/notices/{noticeId}
 */
export interface UpdateNoticeRequest {
  title: string;
  content: string;
  isPublic: boolean;
  isPinned: boolean;
}

export interface UpdateNoticeResponse {
  success: true;
  data: Notice;
}

/**
 * 공지사항 수정 함수
 * 
 * @param noticeId - 공지사항 ID
 * @param notice - 수정할 공지사항 데이터
 * @returns 수정된 공지사항
 */
export async function updateNotice(noticeId: number, notice: UpdateNoticeRequest): Promise<UpdateNoticeResponse> {
  const response = await adminApiClient.put(`/notices/${noticeId}`, notice);
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '공지사항 수정에 실패했습니다.');
  }
}

/**
 * 공지사항 삭제 (10.3.4)
 * DELETE /api/admin/notices/{noticeId}
 */
export interface DeleteNoticeResponse {
  success: true;
  data: {
    message: string;
  };
}

/**
 * 공지사항 삭제 함수
 * 
 * @param noticeId - 공지사항 ID
 * @returns 삭제 결과
 */
export async function deleteNotice(noticeId: number): Promise<DeleteNoticeResponse> {
  const response = await adminApiClient.delete(`/notices/${noticeId}`);
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '공지사항 삭제에 실패했습니다.');
  }
}

/**
 * 공지사항 고정/해제 (10.3.5)
 * PUT /api/admin/notices/{noticeId}/pin
 */
export interface PinNoticeRequest {
  isPinned: boolean;
}

export interface PinNoticeResponse {
  success: true;
  data: {
    id: number;
    isPinned: boolean;
  };
}

/**
 * 공지사항 고정/해제 함수
 * 
 * @param noticeId - 공지사항 ID
 * @param isPinned - 고정 여부
 * @returns 고정 상태
 */
export async function pinNotice(noticeId: number, isPinned: boolean): Promise<PinNoticeResponse> {
  const response = await adminApiClient.put(`/notices/${noticeId}/pin`, { isPinned });
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '공지사항 고정/해제에 실패했습니다.');
  }
}

// ========================================
// 시스템 설정 API (10.4)
// ========================================

/**
 * 위험 신호 감지 기준 (10.4.1, 10.4.2)
 * GET /api/admin/settings/risk-detection
 * PUT /api/admin/settings/risk-detection
 * 
 * [ERD 설계서 참고 - Risk_Detection_Settings 테이블]
 * - id: BIGINT (PK) → (단일 레코드만 존재, id=1, API 응답에 포함되지 않음)
 * - monitoring_period: INT → monitoringPeriod (모니터링 기간, 일, 기본값: 14, 범위: 1-365)
 * - high_consecutive_score: INT → high.consecutiveScore (High 레벨 연속 부정 감정 임계 점수, 기본값: 8, 범위: 1-100)
 * - high_score_in_period: INT → high.scoreInPeriod (High 레벨 모니터링 기간 내 부정 감정 임계 점수, 기본값: 12, 범위: 1-200)
 * - medium_consecutive_score: INT → medium.consecutiveScore (Medium 레벨 연속 부정 감정 임계 점수, 기본값: 5, 범위: 1-100)
 * - medium_score_in_period: INT → medium.scoreInPeriod (Medium 레벨 모니터링 기간 내 부정 감정 임계 점수, 기본값: 8, 범위: 1-200)
 * - low_consecutive_score: INT → low.consecutiveScore (Low 레벨 연속 부정 감정 임계 점수, 기본값: 2, 범위: 1-100)
 * - low_score_in_period: INT → low.scoreInPeriod (Low 레벨 모니터링 기간 내 부정 감정 임계 점수, 기본값: 4, 범위: 1-200)
 * - updated_at: DATETIME → updatedAt (수정일시, API 응답에 포함될 수 있음)
 * - updated_by: BIGINT (FK) → (수정한 관리자 ID, Admins.id 참조, API 응답에 포함되지 않을 수 있음)
 * 
 * [점수 기준]
 * - 고위험 부정 감정 (2점): 슬픔, 분노
 * - 중위험 부정 감정 (1점): 불안, 혐오
 * - consecutiveScore: 최근부터 거슬러 올라가며 연속으로 부정적 감정을 기록한 점수 합계
 * - scoreInPeriod: 모니터링 기간 내에서 부정 감정을 기록한 모든 날짜의 점수 합계 (연속 여부와 무관)
 * 
 * [검증 규칙]
 * - High의 consecutiveScore > Medium의 consecutiveScore > Low의 consecutiveScore
 * - High의 scoreInPeriod > Medium의 scoreInPeriod > Low의 scoreInPeriod
 * 
 * [관계]
 * - Risk_Detection_Settings.updated_by → Admins.id (FK, NULL 가능)
 * - 이 테이블은 단일 레코드만 존재 (id=1)
 * - 관리자가 설정을 변경할 때마다 UPDATE
 */
export interface RiskDetectionSettings {
  monitoringPeriod: number; // 모니터링 기간 (일, ERD: Risk_Detection_Settings.monitoring_period, INT, 기본값: 14, 범위: 1-365)
  high: {
    consecutiveScore: number; // High 레벨 연속 부정 감정 임계 점수 (ERD: Risk_Detection_Settings.high_consecutive_score, INT, 기본값: 8, 범위: 1-100)
    scoreInPeriod: number; // High 레벨 모니터링 기간 내 부정 감정 임계 점수 (ERD: Risk_Detection_Settings.high_score_in_period, INT, 기본값: 12, 범위: 1-200)
  };
  medium: {
    consecutiveScore: number; // Medium 레벨 연속 부정 감정 임계 점수 (ERD: Risk_Detection_Settings.medium_consecutive_score, INT, 기본값: 5, 범위: 1-100)
    scoreInPeriod: number; // Medium 레벨 모니터링 기간 내 부정 감정 임계 점수 (ERD: Risk_Detection_Settings.medium_score_in_period, INT, 기본값: 8, 범위: 1-200)
  };
  low: {
    consecutiveScore: number; // Low 레벨 연속 부정 감정 임계 점수 (ERD: Risk_Detection_Settings.low_consecutive_score, INT, 기본값: 2, 범위: 1-100)
    scoreInPeriod: number; // Low 레벨 모니터링 기간 내 부정 감정 임계 점수 (ERD: Risk_Detection_Settings.low_score_in_period, INT, 기본값: 4, 범위: 1-200)
  };
}

export interface RiskDetectionSettingsResponse {
  success: true;
  data: RiskDetectionSettings;
}

/**
 * 위험 신호 감지 기준 조회 함수
 * 
 * @returns 위험 신호 감지 기준 설정
 */
export async function getRiskDetectionSettings(): Promise<RiskDetectionSettingsResponse> {
  const response = await adminApiClient.get('/settings/risk-detection');
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '위험 신호 감지 기준 조회에 실패했습니다.');
  }
}

/**
 * 위험 신호 감지 기준 저장 함수
 * 
 * @param settings - 위험 신호 감지 기준 설정
 * @returns 저장 결과
 */
export async function updateRiskDetectionSettings(settings: RiskDetectionSettings): Promise<{ success: true; data: { message: string; updatedAt: string } }> {
  const response = await adminApiClient.put('/settings/risk-detection', settings);
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '위험 신호 감지 기준 저장에 실패했습니다.');
  }
}

/**
 * 상담 기관 리소스 (10.4.3-10.4.6)
 * 
 * [ERD 설계서 참고 - Counseling_Resources 테이블]
 * - id: BIGINT (PK) → number (상담 기관 고유 ID)
 * - name: VARCHAR(255) → string (기관명)
 * - category: ENUM → string (카테고리: 긴급상담, 전문상담, 상담전화, 의료기관)
 * - phone: VARCHAR(50) → string (전화번호, NULL 가능)
 * - website: VARCHAR(500) → string (웹사이트 URL, NULL 가능)
 * - description: TEXT → string (설명, NULL 가능)
 * - operating_hours: VARCHAR(255) → operatingHours (운영 시간, NULL 가능)
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
export interface CounselingResource {
  id: number; // 상담 기관 고유 ID (ERD: Counseling_Resources.id, BIGINT)
  name: string; // 기관명 (ERD: Counseling_Resources.name, VARCHAR(255))
  category: '긴급상담' | '전문상담' | '상담전화' | '의료기관'; // 카테고리 (ERD: Counseling_Resources.category, ENUM)
  phone: string; // 전화번호 (ERD: Counseling_Resources.phone, VARCHAR(50), NULL 가능)
  website?: string; // 웹사이트 URL (ERD: Counseling_Resources.website, VARCHAR(500), NULL 가능)
  description: string; // 설명 (ERD: Counseling_Resources.description, TEXT, NULL 가능)
  operatingHours?: string; // 운영 시간 (ERD: Counseling_Resources.operating_hours, VARCHAR(255), NULL 가능)
  isUrgent: boolean; // 긴급 상담 기관 여부 (ERD: Counseling_Resources.is_urgent, BOOLEAN, 기본값: FALSE, High 레벨 위험 신호 시 전화번호 표시)
}

/**
 * 상담 기관 리소스 목록 조회 (10.4.3)
 * GET /api/admin/settings/counseling-resources
 */
export interface CounselingResourcesResponse {
  success: true;
  data: {
    resources: CounselingResource[];
  };
}

/**
 * 상담 기관 리소스 목록 조회 함수
 * 
 * @returns 상담 기관 리소스 목록
 */
export async function getCounselingResources(): Promise<CounselingResourcesResponse> {
  const response = await adminApiClient.get('/settings/counseling-resources');
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '상담 기관 리소스 목록 조회에 실패했습니다.');
  }
}

/**
 * 상담 기관 리소스 추가 (10.4.4)
 * POST /api/admin/settings/counseling-resources
 */
export interface CreateCounselingResourceRequest {
  name: string;
  category: '긴급상담' | '전문상담' | '상담전화' | '의료기관';
  phone: string;
  website?: string;
  description: string;
  operatingHours?: string;
  isUrgent: boolean;
}

export interface CreateCounselingResourceResponse {
  success: true;
  data: CounselingResource;
}

/**
 * 상담 기관 리소스 추가 함수
 * 
 * @param resource - 상담 기관 리소스 데이터
 * @returns 생성된 상담 기관 리소스
 */
export async function createCounselingResource(resource: CreateCounselingResourceRequest): Promise<CreateCounselingResourceResponse> {
  const response = await adminApiClient.post('/settings/counseling-resources', resource);
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '상담 기관 리소스 추가에 실패했습니다.');
  }
}

/**
 * 상담 기관 리소스 수정 (10.4.5)
 * PUT /api/admin/settings/counseling-resources/{resourceId}
 */
export interface UpdateCounselingResourceRequest {
  name: string;
  category: '긴급상담' | '전문상담' | '상담전화' | '의료기관';
  phone: string;
  website?: string;
  description: string;
  operatingHours?: string;
  isUrgent: boolean;
}

export interface UpdateCounselingResourceResponse {
  success: true;
  data: CounselingResource;
}

/**
 * 상담 기관 리소스 수정 함수
 * 
 * @param resourceId - 상담 기관 리소스 ID
 * @param resource - 수정할 상담 기관 리소스 데이터
 * @returns 수정된 상담 기관 리소스
 */
export async function updateCounselingResource(resourceId: number, resource: UpdateCounselingResourceRequest): Promise<UpdateCounselingResourceResponse> {
  const response = await adminApiClient.put(`/settings/counseling-resources/${resourceId}`, resource);
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '상담 기관 리소스 수정에 실패했습니다.');
  }
}

/**
 * 상담 기관 리소스 삭제 (10.4.6)
 * DELETE /api/admin/settings/counseling-resources/{resourceId}
 */
export interface DeleteCounselingResourceResponse {
  success: true;
  data: {
    message: string;
  };
}

/**
 * 상담 기관 리소스 삭제 함수
 * 
 * @param resourceId - 상담 기관 리소스 ID
 * @returns 삭제 결과
 */
export async function deleteCounselingResource(resourceId: number): Promise<DeleteCounselingResourceResponse> {
  const response = await adminApiClient.delete(`/settings/counseling-resources/${resourceId}`);
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '상담 기관 리소스 삭제에 실패했습니다.');
  }
}

// ========================================
// 에러 로그 조회 API (10.5)
// ========================================

/**
 * 에러 로그 인터페이스
 * 
 * [ERD 설계서 참고 - Error_Logs 테이블]
 * - id: BIGINT (PK) → number (로그 고유 ID)
 * - level: ENUM → string (로그 레벨: ERROR, WARN, INFO)
 * - message: TEXT → string (에러 메시지)
 * - error_code: VARCHAR(50) → errorCode (에러 코드, NULL 가능)
 * - endpoint: VARCHAR(255) → string (API 엔드포인트, NULL 가능)
 * - user_id: BIGINT (FK) → userId (사용자 ID, NULL 가능, Users.id 참조)
 * - admin_id: BIGINT (FK) → adminId (관리자 ID, NULL 가능, Admins.id 참조)
 * - stack_trace: TEXT → stackTrace (스택 트레이스, NULL 가능)
 * - created_at: DATETIME → timestamp (생성일시, ISO 8601 형식)
 * 
 * [관계]
 * - Error_Logs.user_id → Users.id (FK, NULL 가능)
 * - Error_Logs.admin_id → Admins.id (FK, NULL 가능)
 * - 사용자 또는 관리자와 무관한 시스템 에러도 기록 가능 (user_id, admin_id 모두 NULL)
 */
export interface ErrorLog {
  id: number; // 로그 고유 ID (ERD: Error_Logs.id, BIGINT)
  timestamp: string; // 발생 시간 (ERD: Error_Logs.created_at, DATETIME, ISO 8601 형식)
  level: 'ERROR' | 'WARN' | 'INFO'; // 로그 레벨 (ERD: Error_Logs.level, ENUM: ERROR, WARN, INFO)
  message: string; // 에러 메시지 (ERD: Error_Logs.message, TEXT)
  endpoint?: string; // API 엔드포인트 (ERD: Error_Logs.endpoint, VARCHAR(255), NULL 가능)
  userId?: number; // 연관 사용자 ID (ERD: Error_Logs.user_id, BIGINT, FK → Users.id, NULL 가능)
  adminId?: number; // 연관 관리자 ID (ERD: Error_Logs.admin_id, BIGINT, FK → Admins.id, NULL 가능)
  errorCode?: string; // 에러 코드 (ERD: Error_Logs.error_code, VARCHAR(50), NULL 가능)
  stackTrace?: string; // 스택 트레이스 (ERD: Error_Logs.stack_trace, TEXT, NULL 가능)
}

/**
 * 에러 로그 목록 조회 (10.5.1)
 * GET /api/admin/error-logs
 */
export interface ErrorLogListRequest {
  level?: 'ALL' | 'ERROR' | 'WARN' | 'INFO';
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  search?: string;
  page?: number;
  limit?: number;
}

export interface ErrorLogListResponse {
  success: true;
  data: {
    total: number;
    summary: {
      error: number;
      warn: number;
      info: number;
    };
    logs: ErrorLog[];
  };
}

/**
 * 에러 로그 목록 조회 함수
 * 
 * @param params - 조회 파라미터
 * @returns 에러 로그 목록
 */
export async function getErrorLogList(params?: ErrorLogListRequest): Promise<ErrorLogListResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params?.level) queryParams.level = params.level;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.search) queryParams.search = params.search;
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  
  const response = await adminApiClient.get('/error-logs', { params: queryParams });
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '에러 로그 목록 조회에 실패했습니다.');
  }
}

/**
 * 에러 로그 상세 조회 (10.5.2)
 * GET /api/admin/error-logs/{logId}
 */
export interface ErrorLogDetailResponse {
  success: true;
  data: ErrorLog;
}

/**
 * 에러 로그 상세 조회 함수
 * 
 * @param logId - 에러 로그 ID
 * @returns 에러 로그 상세 정보
 */
export async function getErrorLogDetail(logId: number): Promise<ErrorLogDetailResponse> {
  const response = await adminApiClient.get(`/error-logs/${logId}`);
  
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '에러 로그 상세 조회에 실패했습니다.');
  }
}

