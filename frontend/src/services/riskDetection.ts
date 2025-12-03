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
 * - 엔드포인트: GET /api/users/risk-analysis
 * - 응답: RiskAnalysis 인터페이스
 * - 캐싱 전략 필요 (매 요청마다 14일 분석은 비효율적)
 */

import { DiaryDetail, fetchDiaryDetails } from './diaryApi';

/**
 * 위험 분석 결과 인터페이스 (플로우 9.1)
 */
export interface RiskAnalysis {
  isAtRisk: boolean; // 위험 신호 감지 여부
  riskLevel: 'none' | 'low' | 'medium' | 'high'; // 위험 레벨
  reasons: string[]; // 위험 판정 근거 (사용자에게 표시)
  recentNegativeCount: number; // 14일 중 부정 감정 일수
  consecutiveNegativeDays: number; // 최대 연속 부정 감정 일수
}

/**
 * 부정 감정 카테고리 (플로우 9.1)
 * - sad: 슬픔
 * - angry: 화남
 * - anxious: 불안
 * - tired: 피곤
 */
const NEGATIVE_EMOTIONS = ['sad', 'angry', 'anxious', 'tired'];

/**
 * 고위험 감정 카테고리 (플로우 9.1)
 * - sad: 슬픔 (우울 징후)
 * - angry: 화남 (분노 조절 문제)
 * - anxious: 불안 (불안 장애 징후)
 * 
 * [AI 팀] KoBERT 감정 분석 결과와 일치해야 함
 */
const HIGH_RISK_EMOTIONS = ['sad', 'angry', 'anxious'];

/**
 * 위험 신호 자동 분석 함수 (플로우 9.1)
 * 
 * 분석 과정:
 * 1. 최근 14일 일기 데이터 조회
 * 2. 감정 패턴 분석:
 *    - 연속 부정 감정 일수 계산
 *    - 부정 감정 발생 횟수 계산
 *    - 고위험 감정 발생 횟수 계산
 * 3. 위험 레벨 판정 (none/low/medium/high)
 * 4. 판정 근거 텍스트 생성
 * 
 * 위험 레벨 기준 (플로우 9.1):
 * - High: 5일 이상 연속 부정 감정 OR 14일 중 8일 이상 high-risk 감정
 * - Medium: 3-4일 연속 부정 감정 OR 14일 중 5-7일 부정 감정
 * - Low: 2일 연속 부정 감정 OR 14일 중 3-4일 부정 감정
 * - None: 위험 신호 없음
 * 
 * [백엔드 팀] 실제 구현 시:
 * - 서버 사이드에서 분석 수행 권장 (DB 쿼리 최적화)
 * - SQL 쿼리 예시:
 *   SELECT date, emotionCategory 
 *   FROM diaries 
 *   WHERE userId = ? AND date >= DATE_SUB(NOW(), INTERVAL 14 DAY)
 *   ORDER BY date DESC
 * - 캐싱 전략: Redis에 분석 결과 캐싱 (TTL: 1시간)
 * - 일기 작성/수정/삭제 시 캐시 무효화
 * 
 * @param daysToCheck 분석할 일수 (기본값: 14일)
 * @returns RiskAnalysis 위험 분석 결과
 */
export async function analyzeRiskSignals(daysToCheck: number = 14): Promise<RiskAnalysis> {
  const today = new Date();
  const reasons: string[] = []; // 판정 근거 텍스트 배열
  let recentNegativeCount = 0; // 14일 중 부정 감정 일수
  let consecutiveNegativeDays = 0; // 현재 연속 부정 감정 일수 (카운터)
  let maxConsecutive = 0; // 최대 연속 부정 감정 일수
  let highRiskCount = 0; // 14일 중 high-risk 감정 일수

  /**
   * 최근 14일 일기 데이터 조회 (플로우 9.1)
   * 
   * 로직:
   * - 오늘부터 14일 전까지 역순으로 조회
   * - 일기가 있으면 감정 카테고리 확인
   * - 부정 감정이면 카운터 증가
   * - 부정 감정 아니면 연속 일수 초기화
   * 
   * [백엔드 팀] 실제 구현 시:
   * - 한 번의 API 호출로 14일 데이터 한꺼번에 조회
   * - 엔드포인트: GET /api/diaries/recent?days=14
   * - 응답: DiaryDetail[] (날짜 역순 정렬)
   */
  const recentDiaries: (DiaryDetail | null)[] = [];
  for (let i = 0; i < daysToCheck; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    
    const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    
    try {
      const diary = await fetchDiaryDetails(dateKey);
      recentDiaries.push(diary);
      
      /**
       * 부정 감정 판정 (플로우 9.1)
       * 
       * 조건:
       * - diary.emotionCategory가 NEGATIVE_EMOTIONS에 포함되면 부정 감정
       * - 부정 감정이면:
       *   1. recentNegativeCount 증가 (14일 중 부정 감정 일수)
       *   2. consecutiveNegativeDays 증가 (연속 일수 카운터)
       *   3. HIGH_RISK_EMOTIONS 포함 여부 확인 → highRiskCount 증가
       * - 부정 감정 아니면:
       *   1. maxConsecutive 업데이트 (최대값 갱신)
       *   2. consecutiveNegativeDays 초기화 (연속 끊김)
       */
      if (diary && NEGATIVE_EMOTIONS.includes(diary.emotionCategory)) {
        recentNegativeCount++; // 14일 중 부정 감정 일수 증가
        consecutiveNegativeDays++; // 연속 일수 증가
        
        // 고위험 감정 체크 (플로우 9.1: High 레벨 판정 기준)
        if (HIGH_RISK_EMOTIONS.includes(diary.emotionCategory)) {
          highRiskCount++;
        }
      } else {
        // 연속 끊김: 최대값 갱신 후 카운터 초기화
        if (consecutiveNegativeDays > maxConsecutive) {
          maxConsecutive = consecutiveNegativeDays;
        }
        consecutiveNegativeDays = 0;
      }
    } catch {
      recentDiaries.push(null);
      if (consecutiveNegativeDays > maxConsecutive) {
        maxConsecutive = consecutiveNegativeDays;
      }
      consecutiveNegativeDays = 0;
    }
  }

  // Final check for consecutive days
  if (consecutiveNegativeDays > maxConsecutive) {
    maxConsecutive = consecutiveNegativeDays;
  }

  /**
   * 위험 레벨 판정 (플로우 9.1)
   * 
   * 기준:
   * - High: 5일 이상 연속 부정 감정 OR 14일 중 8일 이상 high-risk 감정
   * - Medium: 3-4일 연속 부정 감정 OR 14일 중 5-7일 부정 감정
   * - Low: 2일 연속 부정 감정 OR 14일 중 3-4일 부정 감정
   * - None: 위험 신호 없음
   * 
   * 판정 근거 (reasons):
   * - 사용자에게 표시할 메시지 생성
   * - 예: "최근 5일 연속으로 부정적인 감정이 기록되었습니다."
   */
  let riskLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
  let isAtRisk = false;

  /**
   * High 레벨 판정 (플로우 9.1)
   * - 5일 이상 연속 부정 감정
   * - OR 14일 중 8일 이상 high-risk 감정 (sad, angry, anxious)
   */
  if (maxConsecutive >= 5 || highRiskCount >= 8) {
    riskLevel = 'high';
    isAtRisk = true;
    if (maxConsecutive >= 5) {
      reasons.push(`최근 ${maxConsecutive}일 연속으로 부정적인 감정이 기록되었습니다.`);
    }
    if (highRiskCount >= 8) {
      reasons.push(`최근 14일 중 ${highRiskCount}일에 우울, 분노, 불안 등의 감정이 기록되었습니다.`);
    }
  }
  /**
   * Medium 레벨 판정 (플로우 9.1)
   * - 3-4일 연속 부정 감정
   * - OR 14일 중 5-7일 부정 감정
   */
  else if (maxConsecutive >= 3 || recentNegativeCount >= 5) {
    riskLevel = 'medium';
    isAtRisk = true;
    if (maxConsecutive >= 3) {
      reasons.push(`최근 ${maxConsecutive}일 연속으로 부정적인 감정이 기록되었습니다.`);
    }
    if (recentNegativeCount >= 5) {
      reasons.push(`최근 14일 중 ${recentNegativeCount}일에 부정적인 감정이 기록되었습니다.`);
    }
  }
  /**
   * Low 레벨 판정 (플로우 9.1)
   * - 2일 연속 부정 감정
   * - OR 14일 중 3-4일 부정 감정
   */
  else if (maxConsecutive >= 2 || recentNegativeCount >= 3) {
    riskLevel = 'low';
    reasons.push('최근 부정적인 감정이 반복되고 있습니다.');
  }

  return {
    isAtRisk,
    riskLevel,
    reasons,
    recentNegativeCount,
    consecutiveNegativeDays: maxConsecutive,
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
