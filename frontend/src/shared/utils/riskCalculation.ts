/**
 * 위험 신호 점수 계산 유틸리티
 * - 부정 감정 점수 및 연속성 계산
 * - 위험 레벨 판정 (None/Low/Medium/High)
 */

import { DiaryDetail } from '@/features/user/diary/api/diaryApi';
import { RiskDetectionSettings } from '@/features/admin/api/adminApi';

/**
 * 부정 감정 점수 반환
 * - 고위험(슬픔, 분노): 2점
 * - 중위험(불안, 혐오): 1점
 * - 그 외: 0점
 */
export function calculateEmotionScore(emotion: string): number {
  // 고위험 부정 감정 (2점): 슬픔, 분노
  if (emotion === '슬픔' || emotion === '분노') {
    return 2;
  }
  
  // 중위험 부정 감정 (1점): 불안, 혐오
  if (emotion === '불안' || emotion === '혐오') {
    return 1;
  }
  
  // 긍정(행복), 중립(중립, 당황) 감정은 위험 신호 계산에 포함되지 않음
  return 0;
}

/**
 * 연속 부정 감정 점수 계산
 * - 최신순 데이터에서 연속적인 부정 감정 점수 합산
 */
export function calculateConsecutiveScore(diaries: DiaryDetail[]): number {
  let consecutiveScore = 0;
  
  // 최근부터 거슬러 올라가며 연속으로 부정적 감정을 기록한 점수 합계
  for (const diary of diaries) {
    const score = calculateEmotionScore(diary.emotion);
    
    // 부정 감정이 아니면 연속이 끊김 (계산 종료)
    if (score === 0) {
      break;
    }
    
    consecutiveScore += score;
  }
  
  return consecutiveScore;
}

/**
 * 기간 내 부정 감정 점수 총합 계산
 */
export function calculateScoreInPeriod(diaries: DiaryDetail[]): number {
  let scoreInPeriod = 0;
  
  // 모니터링 기간 내에서 부정 감정을 기록한 모든 날짜의 점수 합계
  for (const diary of diaries) {
    const score = calculateEmotionScore(diary.emotion);
    scoreInPeriod += score;
  }
  
  return scoreInPeriod;
}

/**
 * 위험 레벨 판정
 * - 설정된 임계값 기준으로 High/Medium/Low/None 판정
 */
export function determineRiskLevel(
  consecutiveScore: number,
  scoreInPeriod: number,
  settings: RiskDetectionSettings
): 'none' | 'low' | 'medium' | 'high' {
  // High 레벨 판정
  // 둘 중 하나라도 충족하면 High 레벨로 판정
  if (
    consecutiveScore >= settings.high.consecutiveScore ||
    scoreInPeriod >= settings.high.scoreInPeriod
  ) {
    return 'high';
  }
  
  // Medium 레벨 판정
  // 둘 중 하나라도 충족하면 Medium 레벨로 판정 (High 기준 미충족 시)
  if (
    consecutiveScore >= settings.medium.consecutiveScore ||
    scoreInPeriod >= settings.medium.scoreInPeriod
  ) {
    return 'medium';
  }
  
  // Low 레벨 판정
  // 둘 중 하나라도 충족하면 Low 레벨로 판정 (High/Medium 기준 미충족 시)
  if (
    consecutiveScore >= settings.low.consecutiveScore ||
    scoreInPeriod >= settings.low.scoreInPeriod
  ) {
    return 'low';
  }
  
  // None 레벨: 위의 기준을 모두 충족하지 않는 경우
  return 'none';
}

/**
 * 위험 판정 근거 텍스트 생성
 * - 판정된 위험 레벨에 따른 사유 반환
 */
export function generateRiskReasons(
  consecutiveScore: number,
  scoreInPeriod: number,
  riskLevel: 'none' | 'low' | 'medium' | 'high',
  settings: RiskDetectionSettings
): string[] {
  const reasons: string[] = [];
  
  if (riskLevel === 'none') {
    return reasons;
  }
  
  // 연속 부정 감정 기준 충족 여부 확인
  const consecutiveThreshold = 
    riskLevel === 'high' ? settings.high.consecutiveScore :
    riskLevel === 'medium' ? settings.medium.consecutiveScore :
    settings.low.consecutiveScore;
  
  if (consecutiveScore >= consecutiveThreshold) {
    reasons.push(`최근 연속으로 부정적인 감정을 기록했습니다 (${consecutiveScore}점)`);
  }
  
  // 모니터링 기간 내 부정 감정 기준 충족 여부 확인
  const periodThreshold = 
    riskLevel === 'high' ? settings.high.scoreInPeriod :
    riskLevel === 'medium' ? settings.medium.scoreInPeriod :
    settings.low.scoreInPeriod;
  
  if (scoreInPeriod >= periodThreshold) {
    reasons.push(`최근 ${settings.monitoringPeriod}일 동안 부정적인 감정이 반복되었습니다 (${scoreInPeriod}점)`);
  }
  
  return reasons;
}

/**
 * 위험 신호 점수 계산 및 위험 레벨 판정
 * 
 * @param diaries - 일기 목록 (최근 모니터링 기간, 날짜순 정렬, 최신순)
 * @param settings - 위험 신호 감지 기준 설정
 * @returns 위험 신호 분석 결과
 */
export interface RiskCalculationResult {
  consecutiveScore: number; // 연속 부정 감정 점수
  scoreInPeriod: number; // 모니터링 기간 내 부정 감정 점수
  riskLevel: 'none' | 'low' | 'medium' | 'high'; // 위험 레벨
  reasons: string[]; // 위험 판정 근거 텍스트 배열
}

export function calculateRiskSignals(
  diaries: DiaryDetail[],
  settings: RiskDetectionSettings
): RiskCalculationResult {
  // 1. 연속 부정 감정 점수 계산
  const consecutiveScore = calculateConsecutiveScore(diaries);
  
  // 2. 모니터링 기간 내 부정 감정 점수 합계 계산
  const scoreInPeriod = calculateScoreInPeriod(diaries);
  
  // 3. 위험 레벨 판정
  const riskLevel = determineRiskLevel(consecutiveScore, scoreInPeriod, settings);
  
  // 4. 위험 판정 근거 텍스트 생성
  const reasons = generateRiskReasons(consecutiveScore, scoreInPeriod, riskLevel, settings);
  
  return {
    consecutiveScore,
    scoreInPeriod,
    riskLevel,
    reasons,
  };
}

