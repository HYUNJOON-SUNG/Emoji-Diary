/**
 * ========================================
 * 위험 신호 감지 서비스 (플로우 9.1)
 * ========================================
 * 
 * 주요 기능:
 * - 최근 14일 일기 데이터 조회
 * - 감정 패턴 자동 분석
 * - 위험 레벨 판정 (none/low/medium/high)
 * - 위험 신호 감지 시 알림 모달 표시
 * - 위험 신호 세션 관리 (세션 중 한 번만 표시)
 * 
 * 분석 기준 (플로우 9.1):
 * - High: 5일 이상 연속 부정 감정 OR 14일 중 8일 이상 high-risk 감정
 * - Medium: 3-4일 연속 부정 감정 OR 14일 중 5-7일 부정 감정
 * - Low: 2일 연속 부정 감정 OR 14일 중 3-4일 부정 감정
 * - None: 위험 신호 없음
 * 
 * 트리거 (플로우 9.1):
 * - 로그인 성공 후 다이어리 메인 화면 진입 시 한 번만 실행
 * - 일기 작성/수정/삭제 후 재분석 (refreshKey 변경 시)
 * 
 * [백엔드 팀] 실제 구현 시:
 * - 서버 사이드에서 분석 수행 권장 (성능 최적화)
 * - 엔드포인트: GET /api/risk-detection/analyze (API 명세서 Section 6.1)
 * - 응답: RiskAnalysis 인터페이스
 * - 캐싱 전략 필요 (매 요청마다 14일 분석은 비효율적)
 */

import { DiaryDetail, fetchDiaryDetails } from './diaryApi';

/**
 * 지연 함수 (네트워크 지연 시뮬레이션)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
 * KoBERT 부정 감정 종류 (API 명세서 Section 6.1)
 * - 슬픔, 분노, 불안, 혐오
 */
const NEGATIVE_EMOTIONS = ['슬픔', '분노', '불안', '혐오'];

/**
 * 고위험 부정 감정 (2점)
 * [API 명세서 Section 6.1]
 * - 슬픔: 2점
 * - 분노: 2점
 */
const HIGH_RISK_EMOTIONS = ['슬픔', '분노'];

/**
 * 중위험 부정 감정 (1점)
 * [API 명세서 Section 6.1]
 * - 불안: 1점
 * - 혐오: 1점
 */
const MEDIUM_RISK_EMOTIONS = ['불안', '혐오'];

/**
 * 감정 점수 계산 함수
 * [API 명세서 Section 6.1]
 * - 고위험 부정 감정 (2점): 슬픔, 분노
 * - 중위험 부정 감정 (1점): 불안, 혐오
 */
function getEmotionScore(emotion: string): number {
  if (HIGH_RISK_EMOTIONS.includes(emotion)) {
    return 2;
  } else if (MEDIUM_RISK_EMOTIONS.includes(emotion)) {
    return 1;
  }
  return 0;
}

/**
 * GET /api/risk-detection/analyze
 * 위험 신호 분석
 * 
 * [API 명세서 Section 6.1]
 * 
 * 분석 과정:
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
 * [백엔드 팀] 실제 구현 시:
 * - GET /api/risk-detection/analyze
 * - Headers: { Authorization: Bearer {accessToken} }
 * - Response: { success: true, data: { riskLevel, reasons, analysis, urgentCounselingPhones } }
 * - 서버 사이드에서 분석 수행 (DB 쿼리 최적화)
 * - 관리자가 설정한 위험 신호 감지 기준 조회 후 판정
 * - High 레벨인 경우 is_urgent = TRUE인 상담 기관 전화번호 반환
 * 
 * @param monitoringPeriod 모니터링 기간 (일, 기본값: 14일)
 * @returns RiskAnalysis 위험 분석 결과
 */
export async function analyzeRiskSignals(monitoringPeriod: number = 14): Promise<RiskAnalysis> {
  const today = new Date();
  const reasons: string[] = []; // 판정 근거 텍스트 배열
  
  // [API 명세서] 점수 기반 분석 변수
  let consecutiveScore = 0; // 연속 부정 감정 점수 (최근부터 거슬러 올라가며 연속으로 부정적 감정을 기록한 점수 합계)
  let maxConsecutiveScore = 0; // 최대 연속 부정 감정 점수
  let scoreInPeriod = 0; // 모니터링 기간 내 부정 감정 점수 (연속 여부와 무관)
  let lastNegativeDate: string | undefined; // 마지막 부정 감정 날짜

  /**
   * 최근 모니터링 기간 일기 데이터 조회
   * 
   * [API 명세서 Section 6.1]
   * - 오늘부터 모니터링 기간 전까지 역순으로 조회
   * - 일기가 있으면 감정 확인 및 점수 계산
   * 
   * [백엔드 팀] 실제 구현 시:
   * - GET /api/risk-detection/analyze
   * - 서버에서 모니터링 기간 내 일기 데이터 조회
   * - KoBERT 감정(emotion) 기준으로 점수 계산
   */
  const recentDiaries: Array<{ date: string; emotion: string; score: number }> = [];
  for (let i = 0; i < monitoringPeriod; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    
    const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    
    try {
      const diary = await fetchDiaryDetails(dateKey);
      if (diary && diary.emotion) {
        const score = getEmotionScore(diary.emotion);
        
        if (score > 0) {
          // 부정 감정인 경우
          recentDiaries.push({ date: dateKey, emotion: diary.emotion, score });
          scoreInPeriod += score; // 모니터링 기간 내 점수 합계
          
          if (!lastNegativeDate) {
            lastNegativeDate = dateKey;
          }
          
          // 연속 부정 감정 점수 계산 (최근부터 거슬러 올라가며)
          consecutiveScore += score;
        } else {
          // 부정 감정이 아닌 경우: 연속 끊김
          if (consecutiveScore > maxConsecutiveScore) {
            maxConsecutiveScore = consecutiveScore;
          }
          consecutiveScore = 0;
        }
      } else {
        // 일기가 없는 경우: 연속 끊김
        if (consecutiveScore > maxConsecutiveScore) {
          maxConsecutiveScore = consecutiveScore;
        }
        consecutiveScore = 0;
      }
    } catch {
      // 일기 조회 실패: 연속 끊김
      if (consecutiveScore > maxConsecutiveScore) {
        maxConsecutiveScore = consecutiveScore;
      }
      consecutiveScore = 0;
    }
  }

  // Final check for consecutive score
  if (consecutiveScore > maxConsecutiveScore) {
    maxConsecutiveScore = consecutiveScore;
  }

  /**
   * 위험 레벨 판정 (관리자 설정 기준)
   * 
   * [API 명세서 Section 6.1]
   * - 관리자가 설정한 위험 신호 감지 기준에 따라 판정
   * - Mock 구현: 기본값 사용 (실제로는 백엔드에서 관리자 설정 조회 후 판정)
   * 
   * 기본값 (Mock):
   * - High: consecutiveScore >= 8 OR scoreInPeriod >= 12
   * - Medium: consecutiveScore >= 5 OR scoreInPeriod >= 8
   * - Low: consecutiveScore >= 2 OR scoreInPeriod >= 4
   * - None: 위험 신호 없음
   * 
   * [백엔드 팀] 실제 구현 시:
   * - 관리자 설정 조회: GET /api/admin/settings/risk-detection
   * - 설정된 기준에 따라 판정
   */
  let riskLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
  const urgentCounselingPhones: string[] = []; // High 레벨인 경우 긴급 상담 전화번호

  // [API 명세서] 기본값 사용 (실제로는 관리자 설정 조회)
  const defaultThresholds = {
    high: { consecutiveScore: 8, scoreInPeriod: 12 },
    medium: { consecutiveScore: 5, scoreInPeriod: 8 },
    low: { consecutiveScore: 2, scoreInPeriod: 4 },
  };

  // High 레벨 판정
  if (maxConsecutiveScore >= defaultThresholds.high.consecutiveScore || 
      scoreInPeriod >= defaultThresholds.high.scoreInPeriod) {
    riskLevel = 'high';
    if (maxConsecutiveScore >= defaultThresholds.high.consecutiveScore) {
      reasons.push(`연속 부정 감정 점수 ${maxConsecutiveScore}점 감지`);
    }
    if (scoreInPeriod >= defaultThresholds.high.scoreInPeriod) {
      reasons.push(`최근 ${monitoringPeriod}일 중 부정 감정 점수 ${scoreInPeriod}점 발생`);
    }
    // [API 명세서] High 레벨인 경우 긴급 상담 전화번호 추가 (실제로는 백엔드에서 반환)
    // urgentCounselingPhones.push('1393', '1577-0199');
  }
  // Medium 레벨 판정
  else if (maxConsecutiveScore >= defaultThresholds.medium.consecutiveScore || 
           scoreInPeriod >= defaultThresholds.medium.scoreInPeriod) {
    riskLevel = 'medium';
    if (maxConsecutiveScore >= defaultThresholds.medium.consecutiveScore) {
      reasons.push(`연속 부정 감정 점수 ${maxConsecutiveScore}점 감지`);
    }
    if (scoreInPeriod >= defaultThresholds.medium.scoreInPeriod) {
      reasons.push(`최근 ${monitoringPeriod}일 중 부정 감정 점수 ${scoreInPeriod}점 발생`);
    }
  }
  // Low 레벨 판정
  else if (maxConsecutiveScore >= defaultThresholds.low.consecutiveScore || 
           scoreInPeriod >= defaultThresholds.low.scoreInPeriod) {
    riskLevel = 'low';
    if (maxConsecutiveScore >= defaultThresholds.low.consecutiveScore) {
      reasons.push(`연속 부정 감정 점수 ${maxConsecutiveScore}점 감지`);
    }
    if (scoreInPeriod >= defaultThresholds.low.scoreInPeriod) {
      reasons.push(`최근 ${monitoringPeriod}일 중 부정 감정 점수 ${scoreInPeriod}점 발생`);
    }
  }

  return {
    riskLevel,
    reasons,
    analysis: {
      monitoringPeriod,
      consecutiveScore: maxConsecutiveScore,
      scoreInPeriod,
      lastNegativeDate,
    },
    urgentCounselingPhones,
  };
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
 * [백엔드 팀] 실제 구현 시:
 * - GET /api/risk-detection/session-status
 * - Headers: { Authorization: Bearer {accessToken} }
 * - Response: { success: true, data: { alreadyShown: boolean } }
 * - 세션 정보는 서버에서 관리 (Redis 등)
 */
export async function getRiskSessionStatus(): Promise<{ alreadyShown: boolean }> {
  await delay(300);
  
  // [백엔드 팀] 실제 구현 시:
  // const response = await fetch('/api/risk-detection/session-status', {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${TokenStorage.getAccessToken()}`,
  //   },
  // });
  // const result = await response.json();
  // return { alreadyShown: result.data.alreadyShown };
  
  // Mock 구현: localStorage에서 세션 상태 확인
  const sessionKey = 'riskAlertShown';
  const alreadyShown = localStorage.getItem(sessionKey) === 'true';
  
  return {
    alreadyShown,
  };
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
 * [백엔드 팀] 실제 구현 시:
 * - POST /api/risk-detection/mark-shown
 * - Headers: { Authorization: Bearer {accessToken} }
 * - Response: { success: true, data: { message: string } }
 * - 세션 정보는 서버에서 관리 (Redis 등)
 */
export async function markRiskAlertShown(): Promise<{ message: string }> {
  await delay(300);
  
  // [백엔드 팀] 실제 구현 시:
  // const response = await fetch('/api/risk-detection/mark-shown', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${TokenStorage.getAccessToken()}`,
  //   },
  // });
  // const result = await response.json();
  // return { message: result.data.message };
  
  // Mock 구현: localStorage에 세션 상태 저장
  const sessionKey = 'riskAlertShown';
  localStorage.setItem(sessionKey, 'true');
  
  console.log('[Risk Alert Marked as Shown]');
  
  return {
    message: '위험 알림 표시 완료 기록됨',
  };
}
