/**
 * ====================================================================================================
 * 에러 처리 유틸리티
 * ====================================================================================================
 * 
 * @description
 * 관리자 대시보드의 공통 에러 처리 로직
 * - 유스케이스: 8.3 에러 처리 및 로딩 상태
 * 
 * @features
 * 1. API 에러 처리:
 *    - 401 Unauthorized → 로그인 페이지로 리다이렉트
 *    - 403 Forbidden → 권한 에러 메시지
 *    - 기타 에러 → 사용자 친화적 메시지
 * 2. 에러 로깅:
 *    - 콘솔 로그
 *    - [백엔드 작업] 에러 로그 DB 저장
 * 
 * ====================================================================================================
 */

// ========================================
// 에러 타입 정의
// ========================================
export interface ApiError {
  status?: number;           // HTTP 상태 코드
  message: string;           // 에러 메시지
  code?: string;             // 에러 코드
  details?: any;             // 추가 상세 정보
}

// ========================================
// 에러 메시지 매핑 (8.3)
// ========================================
const ERROR_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다. 입력 내용을 확인해주세요.',
  401: '인증이 만료되었습니다. 다시 로그인해주세요.',
  403: '접근 권한이 없습니다.',
  404: '요청하신 데이터를 찾을 수 없습니다.',
  500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  503: '서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
};

/**
 * API 에러 처리 (8.3)
 * 
 * @param error - 발생한 에러
 * @param context - 에러 발생 컨텍스트 (예: "공지사항 로드")
 * @returns 사용자에게 표시할 에러 메시지
 */
export function handleApiError(error: any, context?: string): string {
  console.error(`[API Error] ${context || 'Unknown context'}:`, error);

  // ApiError 객체인 경우
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;

    // 401 Unauthorized - 로그인 페이지로 리다이렉트 (8.3)
    if (apiError.status === 401) {
      // [명세서 1.1] 관리자 Access Token 및 Refresh Token 제거
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      
      // 페이지 리로드 (로그인 페이지로 이동)
      window.location.reload();
      
      return ERROR_MESSAGES[401];
    }

    // 403 Forbidden - 권한 에러 (8.3)
    if (apiError.status === 403) {
      return ERROR_MESSAGES[403];
    }

    // 정의된 상태 코드인 경우
    if (apiError.status && ERROR_MESSAGES[apiError.status]) {
      return ERROR_MESSAGES[apiError.status];
    }

    // 커스텀 에러 메시지가 있는 경우
    if (apiError.message) {
      return apiError.message;
    }
  }

  // 기본 에러 메시지 (8.3)
  const defaultMessage = context 
    ? `${context} 중 오류가 발생했습니다.`
    : '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

  return defaultMessage;
}

/**
 * 에러 메시지 표시 (8.3)
 * 
 * @param error - 발생한 에러
 * @param context - 에러 발생 컨텍스트
 */
export function showError(error: any, context?: string): void {
  const message = handleApiError(error, context);
  alert(message);
}

/**
 * 성공 메시지 표시 (8.2)
 * 
 * @param message - 성공 메시지
 */
export function showSuccess(message: string): void {
  // TODO: 향후 toast 알림으로 교체 가능
  alert(message);
}

/**
 * 확인 대화상자 표시 (8.1)
 * 
 * @param message - 확인 메시지
 * @returns 사용자 확인 여부
 */
export function confirm(message: string): boolean {
  return window.confirm(message);
}

/**
 * 데이터 로드 에러 처리 (8.3)
 * 
 * @param context - 데이터 로드 컨텍스트
 * @returns 에러 메시지
 */
export function handleLoadError(context: string): string {
  return `${context}를 불러오는 데 실패했습니다.`;
}

/**
 * 데이터 저장 에러 처리 (8.3)
 * 
 * @param context - 데이터 저장 컨텍스트
 * @returns 에러 메시지
 */
export function handleSaveError(context: string): string {
  return `${context}를 저장하는 데 실패했습니다.`;
}

/**
 * 데이터 삭제 에러 처리 (8.3)
 * 
 * @param context - 데이터 삭제 컨텍스트
 * @returns 에러 메시지
 */
export function handleDeleteError(context: string): string {
  return `${context}를 삭제하는 데 실패했습니다.`;
}
