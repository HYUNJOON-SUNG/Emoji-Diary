/**
 * ========================================
 * 위험 신호 점수 계산 유틸리티 함수
 * ========================================
 * 
 * [관리자 명세서 4.2: 위험 신호 감지 기준 변경]
 * 
 * 주요 기능:
 * 1. 부정 감정 점수 계산
 * 2. 연속 부정 감정 점수 계산
 * 3. 모니터링 기간 내 부정 감정 점수 합계 계산
 * 4. 위험 레벨 판정 (none/low/medium/high)
 * 
 * [KoBERT 감정 분석 기준]
 * - KoBERT 감정 종류: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오 (7가지)
 * - 긍정: 행복 (1가지)
 * - 중립: 중립, 당황 (2가지)
 * - 부정: 슬픔, 분노, 불안, 혐오 (4가지)
 * 
 * [부정 감정 심각도별 분류]
 * - 고위험 부정 감정 (2점): 슬픔, 분노
 * - 중위험 부정 감정 (1점): 불안, 혐오
 * 
 * [계산 방식]
 * - 각 감정의 가중치를 합산하여 점수로 계산
 * - 예시: 슬픔 2일 = 4점, 불안 3일 = 3점, 총 7점
 * 
 * [참고]
 * - 중립(중립, 당황)과 긍정(행복) 감정은 위험 신호 계산에 포함되지 않음
 */

import { DiaryDetail } from '../services/diaryApi';
import { RiskDetectionSettings } from '../services/adminApi';

/**
 * 부정 감정 점수 계산
 * 
 * @param emotion - KoBERT가 분석한 감정 (한글: "행복", "중립", "당황", "슬픔", "분노", "불안", "혐오")
 * @returns 점수 (고위험: 2점, 중위험: 1점, 기타: 0점)
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
 * 
 * [명세서 4.2]
 * - 최근부터 거슬러 올라가며 연속으로 부정적 감정을 기록한 점수 합계
 * - 연속이 끊기면 계산 종료
 * - 고위험 감정 1일=2점, 중위험 감정 1일=1점
 * 
 * @param diaries - 일기 목록 (날짜순 정렬, 최신순)
 * @returns 연속 부정 감정 점수
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
 * 모니터링 기간 내 부정 감정 점수 합계 계산
 * 
 * [명세서 4.2]
 * - 모니터링 기간 내에서 부정 감정을 기록한 모든 날짜의 점수 합계
 * - 연속 여부와 무관하게 기간 내 모든 부정 감정 합산
 * 
 * @param diaries - 일기 목록 (모니터링 기간 내)
 * @returns 모니터링 기간 내 부정 감정 점수 합계
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
 * 
 * [명세서 4.2]
 * - High: consecutiveScore >= high.consecutiveScore OR scoreInPeriod >= high.scoreInPeriod
 * - Medium: consecutiveScore >= medium.consecutiveScore OR scoreInPeriod >= medium.scoreInPeriod (High 미충족 시)
 * - Low: consecutiveScore >= low.consecutiveScore OR scoreInPeriod >= low.scoreInPeriod (High/Medium 미충족 시)
 * - None: 위의 기준을 모두 충족하지 않는 경우
 * 
 * @param consecutiveScore - 연속 부정 감정 점수
 * @param scoreInPeriod - 모니터링 기간 내 부정 감정 점수
 * @param settings - 위험 신호 감지 기준 설정
 * @returns 위험 레벨 ('none' | 'low' | 'medium' | 'high')
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
 * 
 * [명세서 4.2]
 * - 연속 부정 감정 기준 충족 시: 해당 안내 표시
 * - 모니터링 기간 내 부정 감정 기준 충족 시: 해당 안내 표시
 * - 둘 다 충족 시: 둘 다 표시
 * 
 * @param consecutiveScore - 연속 부정 감정 점수
 * @param scoreInPeriod - 모니터링 기간 내 부정 감정 점수
 * @param riskLevel - 위험 레벨
 * @param settings - 위험 신호 감지 기준 설정
 * @returns 위험 판정 근거 텍스트 배열
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

