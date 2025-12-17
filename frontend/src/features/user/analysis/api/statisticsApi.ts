/**
 * 통계 API 서비스
 * - 기간별 감정 통계 및 추이 조회
 * - KoBERT 감정 분석 결과 기반 집계
 */

import { apiClient } from '@/shared/api/client';

/**
 * 감정 통계 조회 파라미터
 */
export interface EmotionStatisticsParams {
  period: 'weekly' | 'monthly' | 'yearly'; // 기간
  year?: number; // 연도 (월간/연간 조회 시)
  month?: number; // 월 (주간/월간 조회 시, 1-12)
  week?: number; // 주 (주간 조회 시, 1-52)
}

/**
 * 감정 통계 응답 데이터
 * - emotions: 감정별 개수 (행복, 중립, 슬픔 등)
 */
export interface EmotionStatisticsResponse {
  period: 'weekly' | 'monthly' | 'yearly';
  year?: number;
  month?: number;
  week?: number;
  emotions: {
    [key: string]: number; // 감정명: 개수 (ERD: Diaries.emotion 기준 집계, 예: "행복": 10)
  };
  total: number; // 총 일기 개수 (ERD: Diaries 테이블 조회 기간 내 전체 레코드 수)
}

/**
 * 감정 추이 조회 파라미터
 */
export interface EmotionTrendParams {
  period: 'weekly' | 'monthly'; // 기간
  year: number; // 연도
  month?: number; // 월 (월간 조회 시, 1-12)
}

/**
 * 감정 추이 응답 데이터
 * - 날짜별 감정 기록 배열
 */
export interface EmotionTrendResponse {
  period: 'weekly' | 'monthly';
  dates: string[]; // 날짜 배열 (ERD: Diaries.date, DATE, YYYY-MM-DD 형식)
  emotions: Array<{
    date: string; // 날짜 (ERD: Diaries.date, DATE, YYYY-MM-DD 형식)
    emotion: string; // KoBERT 감정 (ERD: Diaries.emotion, ENUM: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
  }>;
}



/**
 * 감정 통계 조회
 * @param params 조회 기간 (주간/월간/연간)
 * @returns 감정별 개수 및 총 합계
 */
export async function getEmotionStatistics(
  params: EmotionStatisticsParams
): Promise<EmotionStatisticsResponse> {
  const { period, year, month, week } = params;
  
  const queryParams: Record<string, string | number> = { period };
  if (year !== undefined) queryParams.year = year;
  if (month !== undefined) queryParams.month = month;
  if (week !== undefined) queryParams.week = week;
  
  const response = await apiClient.get('/statistics/emotions', { params: queryParams });
  
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.error?.message || '감정 통계 조회에 실패했습니다.');
  }
}

/**
 * 감정 추이 조회
 * @param params 조회 기간 (주간/월간)
 * @returns 날짜별 감정 데이터
 */
export async function getEmotionTrend(
  params: EmotionTrendParams
): Promise<EmotionTrendResponse> {
  const { period, year, month } = params;
  
  const queryParams: Record<string, string | number> = { period, year };
  if (month !== undefined) queryParams.month = month;
  
  const response = await apiClient.get('/statistics/emotion-trend', { params: queryParams });
  
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.error?.message || '감정 변화 추이 조회에 실패했습니다.');
  }
}

