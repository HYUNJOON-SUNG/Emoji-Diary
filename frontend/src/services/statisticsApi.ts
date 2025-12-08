/**
 * ========================================
 * 통계 API 서비스
 * ========================================
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
 * - JWT 토큰은 apiClient의 interceptor에서 자동으로 추가됩니다.
 */

import { apiClient } from './api';

/**
 * 감정 통계 조회 파라미터 인터페이스
 * 
 * [API 명세서 Section 5.2.1]
 * 
 * [ERD 설계서 참고 - Diaries 테이블]
 * - 통계는 Diaries 테이블의 emotion 컬럼 기준으로 집계됨
 * - emotion: ENUM (행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
 * - KoBERT가 일기 본문(content)만 분석하여 자동으로 저장
 * - 인덱스: idx_diaries_emotion, idx_diaries_emotion_date (통계 조회 최적화)
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
 * 
 * [ERD 설계서 참고 - Diaries 테이블]
 * - emotions 객체의 키는 Diaries.emotion 컬럼 값 (ENUM: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
 * - 값은 해당 감정을 가진 일기의 개수
 * - total은 조회 기간 내 전체 일기 개수
 * - 통계는 KoBERT 분석 결과(emotion 컬럼) 기준으로 집계됨
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
 * 
 * [ERD 설계서 참고 - Diaries 테이블]
 * - emotions 배열의 각 항목은 Diaries 테이블의 레코드
 * - date: Diaries.date (DATE, YYYY-MM-DD 형식)
 * - emotion: Diaries.emotion (ENUM: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
 * - KoBERT가 일기 본문(content)만 분석하여 자동으로 저장
 * - 인덱스: idx_diaries_emotion_date (통계 조회 최적화)
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
 * - GET /api/statistics/emotions
 * - Headers: { Authorization: Bearer {accessToken} } (apiClient interceptor에서 자동 추가)
 * - Query Parameters: { period, year, month, week }
 * - Response: { success: true, data: { period, year, month, emotions, total } }
 * 
 * @param params 감정 통계 조회 파라미터
 * @returns Promise<EmotionStatisticsResponse> 감정 통계 응답
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
 * - GET /api/statistics/emotion-trend
 * - Headers: { Authorization: Bearer {accessToken} } (apiClient interceptor에서 자동 추가)
 * - Query Parameters: { period, year, month }
 * - Response: { success: true, data: { period, dates, emotions } }
 * 
 * @param params 감정 변화 추이 조회 파라미터
 * @returns Promise<EmotionTrendResponse> 감정 변화 추이 응답
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

