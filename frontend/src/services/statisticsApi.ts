/**
 * ========================================
 * 통계 API 서비스 (Mock 구현)
 * ========================================
 * 
 * [백엔드 팀 작업 필요]
 * - 현재는 Mock 데이터로 동작
 * - 실제 백엔드 API로 교체 필요
 * 
 * 주요 기능:
 * - 감정 통계 조회 (기간별)
 * - 감정 변화 추이 조회
 * 
 * [API 명세서 Section 5.2]
 * 
 * 참고:
 * - 통계는 KoBERT 분석 결과에서 추출한 감정(`emotion` 컬럼) 기준으로 집계됨
 * - 7가지 감정 (행복, 중립, 당황, 슬픔, 분노, 불안, 혐오) 기준
 */

import { fetchDiaryList } from './diaryApi';

/**
 * 지연 함수 (네트워크 지연 시뮬레이션)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 감정 통계 조회 파라미터 인터페이스
 * 
 * [API 명세서 Section 5.2.1]
 */
export interface EmotionStatisticsParams {
  period: 'weekly' | 'monthly' | 'yearly'; // 기간
  year?: number; // 연도 (월간/연간 조회 시)
  month?: number; // 월 (주간/월간 조회 시, 1-12)
  week?: number; // 주 (주간 조회 시, 1-52)
}

/**
 * 감정 통계 응답 인터페이스
 * 
 * [API 명세서 Section 5.2.1]
 * - Response: { success: true, data: { period, year, month, emotions, total } }
 * - emotions: { "행복": 10, "중립": 5, "슬픔": 3, ... }
 */
export interface EmotionStatisticsResponse {
  period: 'weekly' | 'monthly' | 'yearly';
  year?: number;
  month?: number;
  week?: number;
  emotions: {
    [key: string]: number; // 감정명: 개수 (예: "행복": 10)
  };
  total: number; // 총 일기 개수
}

/**
 * 감정 변화 추이 조회 파라미터 인터페이스
 * 
 * [API 명세서 Section 5.2.2]
 */
export interface EmotionTrendParams {
  period: 'weekly' | 'monthly'; // 기간
  year: number; // 연도
  month?: number; // 월 (월간 조회 시, 1-12)
}

/**
 * 감정 변화 추이 응답 인터페이스
 * 
 * [API 명세서 Section 5.2.2]
 * - Response: { success: true, data: { period, dates, emotions } }
 */
export interface EmotionTrendResponse {
  period: 'weekly' | 'monthly';
  dates: string[]; // 날짜 배열 (YYYY-MM-DD)
  emotions: Array<{
    date: string; // 날짜 (YYYY-MM-DD)
    emotion: string; // KoBERT 감정 (행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
  }>;
}

/**
 * KoBERT 감정 종류 (7가지)
 */
const KOBERT_EMOTIONS = ['행복', '중립', '당황', '슬픔', '분노', '불안', '혐오'];

/**
 * GET /statistics/emotions
 * 감정 통계 조회 (기간별)
 * 
 * [API 명세서 Section 5.2.1]
 * 
 * 동작:
 * 1. 기간 파라미터에 따라 일기 데이터 조회
 * 2. KoBERT 감정(`emotion` 컬럼) 기준으로 집계
 * 3. 감정별 개수와 총 개수 반환
 * 
 * [백엔드 팀] 실제 구현 시:
 * - GET /api/statistics/emotions
 * - Headers: { Authorization: Bearer {accessToken} }
 * - Query Parameters: { period, year, month, week }
 * - Response: { success: true, data: { period, year, month, emotions, total } }
 * - SQL 쿼리 예시:
 *   SELECT emotion, COUNT(*) as count
 *   FROM diaries
 *   WHERE userId = ? AND date >= ? AND date <= ?
 *   GROUP BY emotion
 */
export async function getEmotionStatistics(
  params: EmotionStatisticsParams
): Promise<EmotionStatisticsResponse> {
  await delay(500);
  
  const { period, year, month, week } = params;
  
  // [백엔드 팀] 실제 구현 시:
  // 기간에 따라 시작일/종료일 계산 후 일기 데이터 조회
  // const startDate = calculateStartDate(period, year, month, week);
  // const endDate = calculateEndDate(period, year, month, week);
  // const diaries = await fetchDiariesByDateRange(startDate, endDate);
  
  // Mock 구현: 일기 목록 조회 후 감정별 집계
  const diaryList = await fetchDiaryList({});
  
  // 감정별 개수 집계
  const emotionCounts: { [key: string]: number } = {};
  let total = 0;
  
  diaryList.diaries.forEach(diary => {
    // [API 명세서] emotion은 한글 문자열 (행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
    const emotion = diary.emotion || '중립';
    
    if (KOBERT_EMOTIONS.includes(emotion)) {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      total++;
    }
  });
  
  return {
    period,
    year,
    month,
    week,
    emotions: emotionCounts,
    total,
  };
}

/**
 * GET /statistics/emotion-trend
 * 감정 변화 추이 조회
 * 
 * [API 명세서 Section 5.2.2]
 * 
 * 동작:
 * 1. 기간 파라미터에 따라 일기 데이터 조회
 * 2. 날짜별 감정 데이터 정렬
 * 3. 날짜 배열과 감정 배열 반환
 * 
 * [백엔드 팀] 실제 구현 시:
 * - GET /api/statistics/emotion-trend
 * - Headers: { Authorization: Bearer {accessToken} }
 * - Query Parameters: { period, year, month }
 * - Response: { success: true, data: { period, dates, emotions } }
 * - SQL 쿼리 예시:
 *   SELECT date, emotion
 *   FROM diaries
 *   WHERE userId = ? AND date >= ? AND date <= ?
 *   ORDER BY date ASC
 */
export async function getEmotionTrend(
  params: EmotionTrendParams
): Promise<EmotionTrendResponse> {
  await delay(500);
  
  const { period, year, month } = params;
  
  // [백엔드 팀] 실제 구현 시:
  // 기간에 따라 시작일/종료일 계산 후 일기 데이터 조회
  // const startDate = calculateStartDate(period, year, month);
  // const endDate = calculateEndDate(period, year, month);
  // const diaries = await fetchDiariesByDateRange(startDate, endDate);
  
  // Mock 구현: 일기 목록 조회 후 날짜별 정렬
  const diaryList = await fetchDiaryList({});
  
  // 날짜별 감정 데이터 정렬
  const emotionData = diaryList.diaries
    .map(diary => ({
      date: diary.date,
      emotion: diary.emotion || '중립', // [API 명세서] emotion은 한글 문자열
    }))
    .sort((a, b) => a.date.localeCompare(b.date)); // 날짜 오름차순 정렬
  
  // 날짜 배열 추출
  const dates = emotionData.map(item => item.date);
  
  return {
    period,
    dates,
    emotions: emotionData,
  };
}

