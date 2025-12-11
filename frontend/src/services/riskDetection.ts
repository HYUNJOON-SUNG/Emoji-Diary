/**
 * ========================================
 * 위험 신호 감지 서비스 (플로우 9.1)
 * ========================================
 * 
 * 주요 기능:
 * - 위험 신호 분석 (백엔드에서 수행)
 * - 위험 레벨 판정 (none/low/medium/high)
 * - 위험 신호 감지 시 알림 모달 표시
 * - 위험 신호 세션 관리 (세션 중 한 번만 표시)
 * 
 * 트리거 (플로우 9.1):
 * - 로그인 성공 후 다이어리 메인 화면 진입 시 한 번만 실행
 * - 일기 작성/수정/삭제 후 재분석 (refreshKey 변경 시)
 * 
 * [API 명세서 Section 6]
 * - JWT 토큰은 apiClient의 interceptor에서 자동으로 추가됩니다.
 */

import { apiClient } from './api';

/**
 * 위험 분석 결과 인터페이스
 * 
 * [API 명세서 Section 6.1]
 * - GET /api/risk-detection/analyze 응답 형식
 * - Response: { success: true, data: { riskLevel, reasons, analysis, urgentCounselingPhones } }
 * 
 * [ERD 설계서 참고 - Risk_Detection_Sessions 테이블]
 * - id: BIGINT (PK) → (세션 고유 ID, API 응답에 포함되지 않을 수 있음)
 * - user_id: BIGINT (FK) → (사용자 ID, Users.id 참조, API 응답에 포함되지 않음)
 * - risk_level: ENUM → riskLevel (위험 레벨: none, low, medium, high)
 * - shown_at: DATETIME → (알림 표시 완료 일시, NULL이면 아직 알림을 보지 않은 상태)
 * - created_at: DATETIME → (생성일시, API 응답에 포함되지 않을 수 있음)
 * 
 * [관계]
 * - Risk_Detection_Sessions.user_id → Users.id (FK, CASCADE)
 * - 사용자 로그인 후 다이어리 메인 화면 진입 시 위험 신호 분석 후 세션 생성
 * - shown_at이 NULL이면 아직 알림을 보지 않은 상태
 * - 세션 중 한 번만 표시되도록 shown_at으로 확인
 * 
 * [점수 기준]
 * - 고위험 부정 감정 (2점): 슬픔, 분노
 * - 중위험 부정 감정 (1점): 불안, 혐오
 * - consecutiveScore: 최근부터 거슬러 올라가며 연속으로 부정적 감정을 기록한 점수 합계
 * - scoreInPeriod: 모니터링 기간 내에서 부정 감정을 기록한 모든 날짜의 점수 합계 (연속 여부와 무관)
 */
export interface RiskAnalysis {
  riskLevel: 'none' | 'low' | 'medium' | 'high'; // 위험 레벨 (ERD: Risk_Detection_Sessions.risk_level, ENUM)
  reasons: string[]; // 위험 판정 근거 (사용자에게 표시)
  analysis: { // [API 명세서] 분석 상세 정보
    monitoringPeriod: number; // 모니터링 기간 (일)
    consecutiveScore: number; // 연속 부정 감정 점수
    scoreInPeriod: number; // 모니터링 기간 내 부정 감정 점수
    lastNegativeDate?: string; // 마지막 부정 감정 날짜 (YYYY-MM-DD)
  };
  urgentCounselingPhones: string[]; // [API 명세서] 긴급 상담 전화번호 (High 레벨인 경우, Counseling_Resources.is_urgent = TRUE인 기관의 전화번호)
}


/**
 * GET /api/risk-detection/analyze
 * 위험 신호 분석
 * 
 * [API 명세서 Section 6.1]
 * 
 * 분석 과정 (백엔드에서 수행):
 * 1. 최근 모니터링 기간(기본 14일) 일기 데이터 조회
 * 2. 감정 패턴 분석:
 *    - 연속 부정 감정 점수 계산 (consecutiveScore)
 *    - 모니터링 기간 내 부정 감정 점수 계산 (scoreInPeriod)
 * 3. 관리자가 설정한 위험 신호 감지 기준에 따라 위험 레벨 판정 (none/low/medium/high)
 * 4. 판정 근거 텍스트 생성
 * 
 * 점수 기준:
 * - 고위험 부정 감정 (2점): 슬픔, 분노
 * - 중위험 부정 감정 (1점): 불안, 혐오
 * - consecutiveScore: 최근부터 거슬러 올라가며 연속으로 부정적 감정을 기록한 점수 합계
 * - scoreInPeriod: 모니터링 기간 내에서 부정 감정을 기록한 모든 날짜의 점수 합계 (연속 여부와 무관)
 * 
 * 위험 레벨 기준 (관리자 설정 기준):
 * - High: consecutiveScore >= high.consecutiveScore OR scoreInPeriod >= high.scoreInPeriod
 * - Medium: consecutiveScore >= medium.consecutiveScore OR scoreInPeriod >= medium.scoreInPeriod
 * - Low: consecutiveScore >= low.consecutiveScore OR scoreInPeriod >= low.scoreInPeriod
 * - None: 위험 신호 없음
 * 
 * - GET /api/risk-detection/analyze
 * - Headers: { Authorization: Bearer {accessToken} } (apiClient interceptor에서 자동 추가)
 * - Response: { success: true, data: { riskLevel, reasons, analysis, urgentCounselingPhones } }
 * - 서버 사이드에서 분석 수행 (DB 쿼리 최적화)
 * - 관리자가 설정한 위험 신호 감지 기준 조회 후 판정
 * - High 레벨인 경우 is_urgent = TRUE인 상담 기관 전화번호 반환
 * 
 * @param monitoringPeriod 모니터링 기간 (일, 기본값: 14일, 백엔드에서 관리자 설정 기준 사용)
 * @returns RiskAnalysis 위험 분석 결과
 */
export async function analyzeRiskSignals(monitoringPeriod: number = 14): Promise<RiskAnalysis> {
  // [디버깅용] API 호출 시작 로그 (F12 관리자도구에서 확인 가능)
  console.log('[위험 신호 분석] GET /api/risk-detection/analyze 호출 시작');
  console.log('[위험 신호 분석] monitoringPeriod:', monitoringPeriod);
  
  try {
    const response = await apiClient.get('/risk-detection/analyze');
    
    // [디버깅용] API 응답 로그
    console.log('[위험 신호 분석] API 응답:', response.data);
    
    if (response.data.success) {
      console.log('[위험 신호 분석] 분석 결과:', response.data.data);
      return response.data.data;
    } else {
      console.error('[위험 신호 분석] API 응답 실패:', response.data);
      throw new Error(response.data.error?.message || '위험 신호 분석에 실패했습니다.');
    }
  } catch (error) {
    console.error('[위험 신호 분석] API 호출 실패:', error);
    if (error instanceof Error) {
      console.error('[위험 신호 분석] 에러 메시지:', error.message);
    }
    throw error;
  }
}

/**
 * 위험 레벨별 알림 메시지 생성 (플로우 9.2)
 * 
 * 사용처:
 * - RiskAlertModal에서 표시
 * - 푸시 알림 메시지 (추후 구현 시)
 * 
 * @param riskLevel 위험 레벨
 * @returns 알림 메시지 텍스트
 */
export function getRiskNotificationMessage(riskLevel: 'low' | 'medium' | 'high'): string {
  switch (riskLevel) {
    case 'high':
      return '최근 감정 패턴에서 심각한 위험 신호가 감지되었습니다. 전문가의 도움을 받는 것을 권장합니다.';
    case 'medium':
      return '최근 부정적인 감정이 지속되고 있습니다. 감정 상태를 돌아보고 필요시 전문가와 상담해보세요.';
    case 'low':
      return '최근 부정적인 감정이 반복되고 있습니다. 잠시 시간을 내어 자신을 돌아보세요.';
    default:
      return '';
  }
}

/**
 * GET /risk-detection/session-status
 * 위험 신호 세션 확인
 * 
 * [API 명세서 Section 6.2]
 * 
 * 동작:
 * - 로그인 후 다이어리 메인 화면 진입 시 위험 알림 모달이 표시되었는지 여부 확인
 * - `alreadyShown: true`이면 세션 중 다시 표시하지 않음
 * 
 * - GET /api/risk-detection/session-status
 * - Headers: { Authorization: Bearer {accessToken} } (apiClient interceptor에서 자동 추가)
 * - Response: { success: true, data: { alreadyShown: boolean } }
 * - 세션 정보는 서버에서 관리 (Redis 등)
 */
export async function getRiskSessionStatus(): Promise<{ alreadyShown: boolean }> {
  // [디버깅용] API 호출 시작 로그 (F12 관리자도구에서 확인 가능)
  console.log('[위험 신호 세션 상태] GET /api/risk-detection/session-status 호출 시작');
  
  try {
    const response = await apiClient.get('/risk-detection/session-status');
    
    // [디버깅용] API 응답 로그
    console.log('[위험 신호 세션 상태] API 응답:', response.data);
    
    if (response.data.success) {
      console.log('[위험 신호 세션 상태] 세션 상태:', response.data.data);
      return response.data.data;
    } else {
      console.error('[위험 신호 세션 상태] API 응답 실패:', response.data);
      throw new Error(response.data.error?.message || '위험 신호 세션 확인에 실패했습니다.');
    }
  } catch (error) {
    console.error('[위험 신호 세션 상태] API 호출 실패:', error);
    if (error instanceof Error) {
      console.error('[위험 신호 세션 상태] 에러 메시지:', error.message);
    }
    throw error;
  }
}

/**
 * POST /risk-detection/mark-shown
 * 위험 알림 표시 완료 기록
 * 
 * [API 명세서 Section 6.3]
 * 
 * 동작:
 * - 위험 알림 모달을 표시한 후 호출하여 세션 중 다시 표시하지 않도록 기록
 * - 세션 종료 시(로그아웃) 기록 초기화
 * 
 * - POST /api/risk-detection/mark-shown
 * - Headers: { Authorization: Bearer {accessToken} } (apiClient interceptor에서 자동 추가)
 * - Response: { success: true, data: { message: string } }
 * - 세션 정보는 서버에서 관리 (Redis 등)
 */
export async function markRiskAlertShown(): Promise<{ message: string }> {
  // [디버깅용] API 호출 시작 로그 (F12 관리자도구에서 확인 가능)
  console.log('[위험 알림 표시 완료] POST /api/risk-detection/mark-shown 호출 시작');
  
  try {
    const response = await apiClient.post('/risk-detection/mark-shown');
    
    // [디버깅용] API 응답 로그
    console.log('[위험 알림 표시 완료] API 응답:', response.data);
    
    if (response.data.success) {
      console.log('[위험 알림 표시 완료] 기록 완료:', response.data.data);
      return response.data.data;
    } else {
      console.error('[위험 알림 표시 완료] API 응답 실패:', response.data);
      throw new Error(response.data.error?.message || '위험 알림 표시 완료 기록에 실패했습니다.');
    }
  } catch (error) {
    console.error('[위험 알림 표시 완료] API 호출 실패:', error);
    if (error instanceof Error) {
      console.error('[위험 알림 표시 완료] 에러 메시지:', error.message);
    }
    throw error;
  }
}

/**
 * [참고] 위험 신호 점수 계산은 백엔드에서 자동으로 수행됩니다.
 * 
 * [API 명세서 Section 6.1]
 * - GET /api/risk-detection/analyze: 백엔드에서 위험 신호 분석 및 세션 저장
 * - POST /api/risk-detection/mark-shown: 세션에 알림 표시 완료 기록
 * 
 * [백엔드 구현]
 * - RiskDetectionService.analyze(): 위험 신호 분석 및 세션 생성/업데이트
 * - RiskDetectionService.markShown(): 세션에 shownAt 기록 (내부적으로 analyze 호출)
 * 
 * 프론트엔드에서는 위험 신호 점수를 계산하지 않으며, 백엔드 API를 호출하여 결과를 받습니다.
 */
