/**
 * 관리자 API 서비스
 * - 관리자 인증, 대시보드 통계, 공지사항 관리 등 (adminApiClient 사용)
 */

import { adminApiClient } from '@/shared/api/client';

// ========================================
// 관리자 인증 API
// ========================================

/**
 * 관리자 로그인 요청
 */
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    admin: {
      id: number;
      email: string;
      name: string;
    };
  };
}

/**
 * 관리자 로그인
 * @param email 관리자 이메일
 * @param password 관리자 비밀번호
 * @returns 토큰 및 관리자 정보
 */
export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  try {
    const response = await adminApiClient.post('/auth/login', { email, password });

    if (response.data.success) {
      // [명세서 1.1] 관리자 Access Token 및 Refresh Token을 localStorage에 저장
      // - admin_access_token: 관리자 Access Token
      // - admin_refresh_token: 관리자 Refresh Token
      if (response.data.data.accessToken) {
        localStorage.setItem('admin_access_token', response.data.data.accessToken);
      }
      if (response.data.data.refreshToken) {
        localStorage.setItem('admin_refresh_token', response.data.data.refreshToken);
      }
      return response.data;
    } else {
      throw new Error(response.data.error?.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  } catch (error: any) {
    // [API 명세서 10.1.1] axios 에러 처리 - 서버 에러 메시지 추출
    // 400/401 에러 시 error.response.data에서 서버 메시지를 가져옴
    const serverMessage = error.response?.data?.error?.message;
    throw new Error(serverMessage || '아이디 또는 비밀번호가 일치하지 않습니다.');
  }
}

/**
 * 토큰 재발급 요청
 */
export interface AdminRefreshRequest {
  refreshToken: string;
}

export interface AdminRefreshResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * 관리자 토큰 재발급
 * @param refreshToken 리프레시 토큰
 * @returns 새 액세스/리프레시 토큰
 */
export async function adminRefresh(refreshToken: string): Promise<AdminRefreshResponse> {
  const response = await adminApiClient.post('/auth/refresh', { refreshToken });

  if (response.data.success) {
    // [명세서 1.1] 관리자 Access Token 및 Refresh Token 저장
    if (response.data.data.accessToken) {
      localStorage.setItem('admin_access_token', response.data.data.accessToken);
    }
    if (response.data.data.refreshToken) {
      localStorage.setItem('admin_refresh_token', response.data.data.refreshToken);
    }
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '토큰 재발급에 실패했습니다.');
  }
}

/**
 * 관리자 로그아웃
 * - 서버 로그아웃 처리 및 로컬 토큰 제거
 */
export async function adminLogout(): Promise<{ success: true; data: { message: string } }> {
  const response = await adminApiClient.post('/auth/logout');

  if (response.data.success) {
    // [명세서 6.1] 관리자 Access Token 및 Refresh Token 제거
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '로그아웃에 실패했습니다.');
  }
}

// ========================================
// 서비스 통계 API (10.2)
// ========================================

/**
 * 서비스 통계 카드 조회 요청
 */
export interface DashboardStatsRequest {
  averageDiariesPeriod?: 'weekly' | 'monthly' | 'yearly';
  riskLevelPeriod?: 'weekly' | 'monthly' | 'yearly';
  activeUserType?: 'dau' | 'wau' | 'mau';
  newUserPeriod?: 'daily' | 'weekly' | 'monthly';
}

export interface DashboardStatsResponse {
  success: true;
  data: {
    totalUsers: {
      count: number;
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
      period: string;
    };
  };
}

/**
 * 대시보드 주요 지표 조회
 * @param params 통계 조회 조건
 * @returns 주요 지표 데이터
 */
export async function getDashboardStats(params?: DashboardStatsRequest): Promise<DashboardStatsResponse> {
  const queryParams: Record<string, string> = {};
  if (params?.averageDiariesPeriod) queryParams.averageDiariesPeriod = params.averageDiariesPeriod;
  if (params?.riskLevelPeriod) queryParams.riskLevelPeriod = params.riskLevelPeriod;
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
 * 일지 작성 추이 차트 요청
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
 * 일지 작성 추이 조회
 * @param params 조회 기간
 * @returns 추이 차트 데이터
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
 * 사용자 활동 통계 요청
 */
export interface UserActivityStatsRequest {
  period: 'weekly' | 'monthly' | 'yearly';
  metrics?: string; // 쉼표로 구분: newUsers,withdrawnUsers
}

export interface UserActivityStatsResponse {
  success: true;
  data: {
    period: string;
    metrics: string[];
    trend: Array<{
      date: string;
      newUsers?: number;
      withdrawnUsers?: number;
    }>;
  };
}

/**
 * 사용자 활동 통계 조회
 * @param params 조회 기간 및 지표
 * @returns 활동 통계 데이터
 */
export async function getUserActivityStats(params: UserActivityStatsRequest): Promise<UserActivityStatsResponse> {
  const queryParams: Record<string, string | number | string> = { period: params.period };
  if (params.metrics) {
    queryParams.metrics = params.metrics;
  } else {
    // Default metrics if not specified
    queryParams.metrics = 'newUsers,withdrawnUsers';
  }

  const response = await adminApiClient.get('/dashboard/user-activity-stats', { params: queryParams });

  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '사용자 활동 통계 조회에 실패했습니다.');
  }
}

/**
 * 위험 레벨 분포 통계 요청
 */
export interface RiskLevelDistributionRequest {
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface RiskLevelDistributionResponse {
  success: true;
  data: {
    period: string;
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
 * 위험 레벨 분포 통계 조회
 * @param params 조회 기간
 * @returns 위험 레벨별 분포
 */
export async function getRiskLevelDistribution(params: RiskLevelDistributionRequest): Promise<RiskLevelDistributionResponse> {
  const queryParams: Record<string, string | number> = { period: params.period };

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
 * 공지사항 정보
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
 * 공지사항 목록 조회 요청
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
 * 공지사항 목록 조회
 * @param params 페이징 및 필터
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
 * 공지사항 상세 조회 요청
 */
export interface NoticeDetailResponse {
  success: true;
  data: Notice;
}

/**
 * 공지사항 상세 조회
 * @param noticeId 공지사항 ID
 * @returns 공지사항 상세
 */
export async function getNoticeById(noticeId: number): Promise<NoticeDetailResponse> {
  const response = await adminApiClient.get(`/notices/${noticeId}`);

  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.error?.message || '공지사항 상세 조회에 실패했습니다.');
  }
}

/**
 * 공지사항 생성 요청
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
 * 공지사항 생성
 * @param notice 공지사항 정보
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
 * 공지사항 수정 요청
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
 * 공지사항 수정
 * @param noticeId 공지사항 ID
 * @param notice 수정할 정보
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
 * 공지사항 삭제 요청
 */
export interface DeleteNoticeResponse {
  success: true;
  data: {
    message: string;
  };
}

/**
 * 공지사항 삭제
 * @param noticeId 공지사항 ID
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
 * 공지사항 고정/해제 요청
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
 * 공지사항 고정 상태 변경
 * @param noticeId 공지사항 ID
 * @param isPinned 고정 여부
 * @returns 변경된 상태
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
 * 위험 감지 기준 설정값
 * - 모니터링 기간 및 레벨별 임계값 (Low/Medium/High)
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
 * 위험 감지 기준 조회
 * @returns 현재 설정값
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
 * 위험 감지 기준 수정
 * @param settings 새 설정값
 * @returns 성공 여부
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
 * 상담 기관 리소스 정보
 */
export interface CounselingResource {
  id: number; // 상담 기관 고유 ID (ERD: Counseling_Resources.id, BIGINT)
  name: string; // 기관명 (ERD: Counseling_Resources.name, VARCHAR(255))
  category: '긴급상담' | '전문상담' | '상담전화' | '의료기관'; // 카테고리 (ERD: Counseling_Resources.category, ENUM)
  phone?: string; // 전화번호 (ERD: Counseling_Resources.phone, VARCHAR(50), NULL 가능)
  website?: string; // 웹사이트 URL (ERD: Counseling_Resources.website, VARCHAR(500), NULL 가능)
  description?: string; // 설명 (ERD: Counseling_Resources.description, TEXT, NULL 가능)
  operatingHours?: string; // 운영 시간 (ERD: Counseling_Resources.operating_hours, VARCHAR(255), NULL 가능)
  isUrgent: boolean; // 긴급 상담 기관 여부 (ERD: Counseling_Resources.is_urgent, BOOLEAN, 기본값: FALSE, High 레벨 위험 신호 시 전화번호 표시)
}

/**
 * 상담 기관 리소스 목록 조회 요청
 */
export interface CounselingResourcesResponse {
  success: true;
  data: {
    resources: CounselingResource[];
  };
}

/**
 * 상담 기관 목록 조회
 * @returns 기관 목록
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
 * 상담 기관 추가 요청
 */
export interface CreateCounselingResourceRequest {
  name: string;
  category: '긴급상담' | '전문상담' | '상담전화' | '의료기관';
  phone?: string; // NULL 가능
  website?: string;
  description?: string; // NULL 가능
  operatingHours?: string;
  isUrgent: boolean;
}

export interface CreateCounselingResourceResponse {
  success: true;
  data: CounselingResource;
}

/**
 * 상담 기관 추가
 * @param resource 기관 정보
 * @returns 생성된 기관 정보
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
 * 상담 기관 수정 요청
 */
export interface UpdateCounselingResourceRequest {
  name: string;
  category: '긴급상담' | '전문상담' | '상담전화' | '의료기관';
  phone?: string; // NULL 가능
  website?: string;
  description?: string; // NULL 가능
  operatingHours?: string;
  isUrgent: boolean;
}

export interface UpdateCounselingResourceResponse {
  success: true;
  data: CounselingResource;
}

/**
 * 상담 기관 수정
 * @param resourceId 기관 ID
 * @param resource 수정할 정보
 * @returns 수정된 기관 정보
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

