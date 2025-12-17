/**
 * 위험 신호 감지 서비스
 * - 위험 신호 분석 및 세션 관리
 * - 위험 알림 표시 상태 관리
 */

import { apiClient } from '@/shared/api/client';

/**
 * 위험 분석 결과 인터페이스
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
 * 위험 신호 분석 요청
 * - 서버에서 감정 패턴 분석 후 위험 레벨 반환
 * @param monitoringPeriod 모니터링 기간 (일, 기본 14일)
 * @returns 위험 분석 결과
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
 * 위험 레벨별 알림 메시지 반환
 * @param riskLevel 위험 레벨
 * @returns 알림 메시지
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
 * 위험 신호 세션 상태 확인
 * - 알림 표시 여부 확인
 * @returns 세션 상태 (alreadyShown)
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
 * 위험 알림 표시 완료 기록
 * - 세션 중 재표시 방지용
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
 * [참고] 위험 신호 분석은 백엔드에서 처리됩니다.
 */
