/**
 * 일기 API 서비스
 * - 일기 CRUD 및 캘린더/통계 조회
 * - AI 기능(감정, 이미지, 코멘트)은 백엔드 자동 처리
 * - 에러 처리 및 로딩 상태 관리 포함
 */

/**
 * 캘린더용 감정 데이터
 */
export interface EmotionData {
  date: string; // 날짜 (YYYY-MM-DD 형식)
  emotion: string; // 감정 이모지 (예: '😊', '😢')
  emotionCategory: string; // 감정 카테고리 (예: 'happy', 'sad', 'anxious')
}

/**
 * 일기 상세 정보
 * - 조회/작성/수정 시 사용되는 전체 데이터
 */
export interface DiaryDetail {
  id: string; // 일기 고유 ID (ERD: Diaries.id, BIGINT)
  date: string; // 날짜 (YYYY-MM-DD 형식, ERD: Diaries.date, DATE)
  emotion: string; // KoBERT가 분석한 감정 (한글: "행복", "중립", "당황", "슬픔", "분노", "불안", "혐오", ERD: Diaries.emotion, ENUM)
  emotionCategory?: string; // AI가 분석한 감정 카테고리 (KoBERT 결과: positive/neutral/negative) - 프론트엔드에서 계산
  mood: string; // 사용자가 입력한 기분 텍스트 (ERD: Diaries.mood, VARCHAR(255))
  title: string; // 일기 제목 (ERD: Diaries.title, VARCHAR(255))
  content: string; // 일기 본문 (ERD: Diaries.content, TEXT, KoBERT 분석 대상, API 명세서: content)
  weather?: string; // 날씨 (ERD: Diaries.weather, ENUM, 선택사항: 맑음, 흐림, 비, 천둥, 눈, 안개)
  activities?: string[]; // 활동 목록 (ERD: Diary_Activities 테이블, API 응답에서는 배열로 반환)
  images?: string[]; // 사용자가 업로드한 이미지 URL 목록 (ERD: Diary_Images 테이블, API 응답에서는 배열로 반환, API 명세서: images)
  imageUrl?: string; // AI 생성 그림일기 이미지 URL (ERD: Diaries.image_url, VARCHAR(500), NanoVana API로 생성)
  aiComment?: string; // AI 코멘트 (ERD: Diaries.ai_comment, TEXT, Gemini API로 생성, 페르소나 반영)
  recommendedFood?: { // 음식 추천 정보 (ERD: Diaries.recommended_food, JSON, Gemini API로 생성)
    name: string; // 추천 음식 이름
    reason: string; // 추천 근거
  };
  persona?: string; // 작성 당시 페르소나 (Backend Enum: BEST_FRIEND, POET, ...)
  createdAt?: string; // 생성일시 (ERD: Diaries.created_at, DATETIME, ISO 8601 형식)
  updatedAt?: string; // 수정일시 (ERD: Diaries.updated_at, DATETIME, ISO 8601 형식)
}

/**
 * 일기 작성 요청 데이터
 * - emotion은 Backend(KoBERT)에서 분석
 */
export interface CreateDiaryRequest {
  date: string; // 날짜 (YYYY-MM-DD 형식, 필수)
  title: string; // 일기 제목 (필수)
  content: string; // 일기 본문 (필수, KoBERT 분석 대상, API 명세서: content)
  mood?: string; // 기분 (선택사항, 쉼표로 구분된 여러 값 가능)
  weather?: string; // 날씨 (선택사항: 맑음, 흐림, 비, 천둥, 눈, 안개)
  activities?: string[]; // 활동 목록 (선택사항, 문자열 배열)
  images?: string[]; // 사용자가 업로드한 이미지 URL 목록 (선택사항, 문자열 배열, API 명세서: images)
}

/**
 * 일기 수정 요청 데이터
 * - emotion, imageUrl은 Backend 자동 갱신
 */
export interface UpdateDiaryRequest {
  title: string; // 일기 제목 (필수, ERD: Diaries.title, VARCHAR(255))
  content: string; // 일기 본문 (필수, KoBERT 재분석 대상, ERD: Diaries.content, TEXT, API 명세서: content)
  mood?: string; // 기분 (선택사항, 쉼표로 구분된 여러 값 가능, ERD: Diaries.mood, VARCHAR(255))
  weather?: string; // 날씨 (선택사항: 맑음, 흐림, 비, 천둥, 눈, 안개, ERD: Diaries.weather, ENUM)
  activities?: string[]; // 활동 목록 (선택사항, 문자열 배열, ERD: Diary_Activities 테이블 업데이트)
  images?: string[]; // 사용자가 업로드한 이미지 URL 목록 (선택사항, 문자열 배열, 수정된 내용 반영, ERD: Diary_Images 테이블 업데이트, API 명세서: images)
  // imageUrl은 Request Body에서 제거됨 (API 명세서: AI가 수정된 일기 내용을 바탕으로 자동 재생성)
}

import { apiClient, BASE_URL } from '@/shared/api/client';

/**
 * 이미지 URL 처리 헬퍼 함수
 * - API에서 이미지 경로가 상대 경로(/images/...)로 오는 경우 백엔드 Base URL을 붙여준다.
 * - 이미 절대 경로(http...)인 경우 그대로 사용한다.
 */
function getImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // BASE_URL은 http://localhost:8080/api 형태이므로 /api를 제거하고 결합
  const baseUrlOrigin = BASE_URL.endsWith('/api') ? BASE_URL.slice(0, -4) : BASE_URL;
  return `${baseUrlOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
}



/**
 * 감정 카테고리 매핑
 */
const emotionCategoryMap: { [key: string]: string } = {
  '행복': 'positive',
  '중립': 'neutral',
  '당황': 'neutral',
  '슬픔': 'negative',
  '분노': 'negative',
  '불안': 'negative',
  '혐오': 'negative',
};


/**
 * 감정 카테고리 계산 헬퍼 함수
 * KoBERT 분석 결과(한글 감정)를 카테고리로 변환
 */
function getEmotionCategory(emotion: string): string {
  return emotionCategoryMap[emotion] || 'neutral';
}

/**
 * ========== API 함수들 ==========
 */

/**
 * 캘린더 월별 감정 조회
 * @param year 연도
 * @param month 월 (0-11)
 * @returns 해당 월의 감정 데이터
 */
export async function fetchMonthlyEmotions(year: number, month: number): Promise<EmotionData[]> {
  try {
    const response = await apiClient.get('/diaries/calendar', {
      params: {
        year,
        month: month + 1, // JavaScript Date는 0-11이지만 API는 1-12를 기대
      },
    });

    if (response.data.success) {
      const diaries = response.data.data.diaries || [];
      // API 응답을 EmotionData 형식으로 변환
      return diaries.map((diary: { date: string; emotion: string }) => ({
        date: diary.date,
        emotion: diary.emotion,
        emotionCategory: getEmotionCategory(diary.emotion),
      }));
    } else {
      throw new Error(response.data.error?.message || '캘린더 데이터를 불러오는데 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

/**
 * 일기 상세 조회
 * @param diaryId 일기 ID
 * @returns 일기 상세 정보
 */
export async function fetchDiaryById(diaryId: string): Promise<DiaryDetail | null> {
  try {
    const response = await apiClient.get(`/diaries/${diaryId}`);

    if (response.data.success) {
      const diary = response.data.data;
      return {
        ...diary,
        id: diary.id != null ? String(diary.id) : '',
        activities: diary.activities || [],
        images: (diary.images || []).map((imgUrl: string) => getImageUrl(imgUrl) || imgUrl),
        imageUrl: getImageUrl(diary.imageUrl || diary.image_url),
        aiComment: diary.aiComment || diary.ai_comment,
        recommendedFood: diary.recommendedFood || diary.recommended_food,
        createdAt: diary.createdAt || diary.created_at,
        updatedAt: diary.updatedAt || diary.updated_at,
        emotionCategory: getEmotionCategory(diary.emotion),
      };
    } else {
      return null;
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    if (error.response?.status === 401) {
      window.location.href = '/';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

/**
 * 일기 상세 조회 (날짜 기준)
 * @param date 날짜 (YYYY-MM-DD)
 * @returns 일기 상세 정보
 */
export async function fetchDiaryDetails(date: string): Promise<DiaryDetail | null> {
  try {
    const response = await apiClient.get(`/diaries/date/${date}`);

    if (response.data.success) {
      const diary = response.data.data;
      return {
        ...diary,
        // ID 타입 처리: 백엔드에서 숫자로 올 수 있으므로 string으로 변환
        id: diary.id != null ? String(diary.id) : '',
        // activities 필드 처리 (배열, API 명세서에 포함됨)
        activities: diary.activities || [],
        // 백엔드에서 snake_case로 올 수 있는 필드들을 camelCase로 변환
        // 이미지 경로가 상대 경로인 경우 백엔드 URL 추가
        images: (diary.images || []).map((imgUrl: string) => getImageUrl(imgUrl) || imgUrl),
        imageUrl: getImageUrl(diary.imageUrl || diary.image_url),
        aiComment: diary.aiComment || diary.ai_comment,
        recommendedFood: diary.recommendedFood || diary.recommended_food,
        createdAt: diary.createdAt || diary.created_at,
        updatedAt: diary.updatedAt || diary.updated_at,
        emotionCategory: getEmotionCategory(diary.emotion),
      };
    } else {
      return null;
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    if (error.response?.status === 401) {
      window.location.href = '/';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

/**
 * 일기 작성
 * - AI 감정/이미지/코멘트 생성은 Backend에서 처리
 * @param data 작성 데이터
 * @returns 작성된 일기 상세
 */
export async function createDiary(data: CreateDiaryRequest): Promise<DiaryDetail> {
  try {
    const response = await apiClient.post('/diaries', data);

    if (response.data.success) {
      const diary = response.data.data;
      // 백엔드에서 KoBERT 감정 분석, AI 이미지 생성, AI 코멘트 생성, 음식 추천 생성이 모두 처리됨
      // 이미지 경로 처리 (상대 경로인 경우 백엔드 URL 추가)
      return {
        ...diary,
        // ID 타입 처리: 백엔드에서 숫자로 올 수 있으므로 string으로 변환
        id: diary.id != null ? String(diary.id) : '',
        // activities 필드 처리 (배열, API 명세서에 포함됨)
        activities: diary.activities || [],
        images: (diary.images || []).map((imgUrl: string) => getImageUrl(imgUrl) || imgUrl),
        imageUrl: getImageUrl(diary.imageUrl || diary.image_url),
        aiComment: diary.aiComment || diary.ai_comment,
        recommendedFood: diary.recommendedFood || diary.recommended_food,
        createdAt: diary.createdAt || diary.created_at,
        updatedAt: diary.updatedAt || diary.updated_at,
        emotionCategory: getEmotionCategory(diary.emotion),
      };
    } else {
      throw new Error(response.data.error?.message || '일기 작성에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

/**
 * 일기 수정
 * - AI 재분석/재생성 포함
 * @param id 일기 ID
 * @param date 날짜
 * @param data 수정 데이터
 * @returns 수정된 일기 상세
 */
export async function updateDiary(id: string, date: string, data: UpdateDiaryRequest): Promise<DiaryDetail> {
  try {
    const response = await apiClient.put(`/diaries/${id}`, data);

    if (response.data.success) {
      const diary = response.data.data;
      // 백엔드에서 KoBERT 감정 재분석, AI 이미지 재생성, AI 코멘트 재생성, 음식 추천 재생성이 모두 처리됨
      // 이미지 경로 처리 (상대 경로인 경우 백엔드 URL 추가)
      return {
        ...diary,
        // ID 타입 처리: 백엔드에서 숫자로 올 수 있으므로 string으로 변환
        id: diary.id != null ? String(diary.id) : '',
        // activities 필드 처리 (배열, API 명세서에 포함됨)
        activities: diary.activities || [],
        images: (diary.images || []).map((imgUrl: string) => getImageUrl(imgUrl) || imgUrl),
        imageUrl: getImageUrl(diary.imageUrl || diary.image_url),
        aiComment: diary.aiComment || diary.ai_comment,
        recommendedFood: diary.recommendedFood || diary.recommended_food,
        createdAt: diary.createdAt || diary.created_at,
        updatedAt: diary.updatedAt || diary.updated_at,
        emotionCategory: getEmotionCategory(diary.emotion),
      };
    } else {
      throw new Error(response.data.error?.message || '일기 수정에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/';
      throw new Error('로그인이 필요합니다.');
    }
    if (error.response?.status === 404) {
      throw new Error('일기를 찾을 수 없습니다.');
    }
    throw error;
  }
}

/**
 * 일기 삭제
 * - 일기 및 관련 데이터(이미지 등) 삭제
 * @param id 일기 ID
 * @param date 날짜
 */
export async function deleteDiary(id: string, date: string): Promise<void> {
  try {
    const response = await apiClient.delete(`/diaries/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || '일기 삭제에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/';
      throw new Error('로그인이 필요합니다.');
    }
    if (error.response?.status === 404) {
      throw new Error('일기를 찾을 수 없습니다.');
    }
    throw error;
  }
}

/**
 * ========== 통계 API ==========
 */

/**
 * 일별 통계 데이터 인터페이스
 * - 감정 통계 페이지의 히트맵에 사용
 */
export interface DailyStats {
  date: string; // 날짜 (YYYY-MM-DD)
  emotion: string; // 감정 이모지
  emotionCategory: string; // 감정 카테고리
  title: string; // 일기 제목
}

/**
 * 일별 감정 통계 조회
 * - 월별 감정 분포 및 일기 제목 조회
 * @param yearMonth 연월(YYYY-MM)
 * @returns 일별 통계
 */
export async function fetchDailyStats(yearMonth: string): Promise<DailyStats[]> {
  // [백엔드 팀] 통계 API로 이동 예정
  // 현재는 캘린더 API를 사용하여 구현 가능
  try {
    const [year, month] = yearMonth.split('-').map(Number);
    const emotions = await fetchMonthlyEmotions(year, month - 1);

    // 각 날짜별로 일기 상세 정보를 조회하여 제목 가져오기
    // 병렬 처리로 성능 최적화
    const statsPromises = emotions.map(async (emotion) => {
      try {
        // GET /api/diaries/date/{date}로 일기 상세 정보 조회
        const diary = await fetchDiaryDetails(emotion.date);
        return {
          date: emotion.date,
          emotion: emotion.emotion,
          emotionCategory: emotion.emotionCategory,
          title: diary?.title || '', // 일기 제목 가져오기
        };
      } catch (error) {
        // 일기 조회 실패 시 제목 없이 반환
        return {
          date: emotion.date,
          emotion: emotion.emotion,
          emotionCategory: emotion.emotionCategory,
          title: '',
        };
      }
    });

    return await Promise.all(statsPromises);
  } catch (error: any) {
    throw error;
  }
}

/**
 * 차트 데이터 포인트 인터페이스
 * - 감정 통계 페이지의 선 그래프에 사용
 */
/**
 * 차트 데이터 포인트
 * - 날짜별 7가지 감정 카운트
 */
export interface ChartDataPoint {
  date: string; // 날짜 (YYYY-MM-DD 또는 "MM월 N주차" 형식)
  displayLabel: string; // 차트 표시용 레이블 (예: "11월 1주차", "11월")
  // KoBERT 감정 7가지 (ERD: Diaries.emotion, ENUM)
  happy: number; // 행복 감정 카운트
  neutral: number; // 중립 감정 카운트
  surprised: number; // 당황 감정 카운트 (surprised로 매핑)
  sad: number; // 슬픔 감정 카운트
  angry: number; // 분노 감정 카운트
  anxious: number; // 불안 감정 카운트
  disgust: number; // 혐오 감정 카운트
  total: number; // 전체 일기 개수
}

/**
 * 최근 일기 목록 조회
 * - 위험 감지용 모니터링 기간 조회
 * @param startDate 시작일
 * @param endDate 종료일
 * @returns 일기 목록
 */
export async function fetchRecentDiaries(startDate: string, endDate: string): Promise<DiaryDetail[]> {
  try {
    const response = await apiClient.get('/diaries/search', {
      params: {
        startDate,
        endDate,
        limit: 100, // 모니터링 기간 내 일기 개수 제한 (최대 365일)
      },
    });

    if (response.data.success) {
      const diaries = response.data.data.diaries || [];
      // 날짜순 정렬 (최신순)
      return diaries
        .map((diary: any) => ({
          ...diary,
          id: diary.id != null ? String(diary.id) : '',
          activities: diary.activities || [],
          images: (diary.images || []).map((imgUrl: string) => getImageUrl(imgUrl) || imgUrl),
          imageUrl: getImageUrl(diary.imageUrl || diary.image_url),
          aiComment: diary.aiComment || diary.ai_comment,
          recommendedFood: diary.recommendedFood || diary.recommended_food,
          createdAt: diary.createdAt || diary.created_at,
          updatedAt: diary.updatedAt || diary.updated_at,
          emotionCategory: getEmotionCategory(diary.emotion),
        }))
        .sort((a: DiaryDetail, b: DiaryDetail) => {
          // 날짜순 정렬 (최신순)
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    } else {
      throw new Error(response.data.error?.message || '일기 데이터 조회에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

/**
 * GET /api/statistics/emotion-trend
 * 기간별 감정 변화 추이 데이터 조회
 * 
 * [참고] 이 함수는 통계 관련 기능이므로 statisticsApi.ts로 이동 예정입니다.
 * 
 * [API 명세서 Section 5.2.2]
 * - 엔드포인트: GET /api/statistics/emotion-trend
 * - Query Parameters: period (weekly, monthly), year, month
 * 
 * 용도:
 * - 감정 통계 페이지의 선 그래프 데이터
 * - 주별/월별 감정 변화 추이 분석
 * 
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @param type - 집계 타입 (weekly 또는 monthly)
 * @returns 차트 데이터 포인트 배열
 */
/**
 * 기간별 감정 변화 추이 조회
 * @param startDate 시작일
 * @param endDate 종료일
 * @param type 주간/월간
 * @returns 차트 데이터
 */
export async function fetchChartStats(
  startDate: string,
  endDate: string,
  type: 'weekly' | 'monthly'
): Promise<ChartDataPoint[]> {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const year = start.getFullYear();
    const month = start.getMonth() + 1;

    // [백엔드 코드 확인] StatsService.getEmotionTrend
    // - weekly일 때: getDailyTrendForMonth 호출 → year와 month가 필수 (validateYearAndMonth 호출)
    // - monthly일 때: getWeeklyTrendForMonth 호출 → year와 month가 필수
    // [API 명세서 Section 5.2.2] GET /api/statistics/emotion-trend
    // period: 'weekly' | 'monthly', year: number, month: number (weekly와 monthly 모두 필수)
    const response = await apiClient.get('/statistics/emotion-trend', {
      params: {
        period: type,
        year,
        month, // weekly와 monthly 모두 month 필수
      },
    });

    if (response.data.success) {
      const data = response.data.data;

      // API 응답을 ChartDataPoint 형식으로 변환
      // dates 배열과 emotions 배열을 결합하여 날짜별 감정 데이터 생성
      const dateEmotionMap: { [date: string]: { [emotion: string]: number } } = {};

      // 각 날짜별로 감정 카운트 집계
      // [ERD 설계서] KoBERT 감정: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오 (7가지)
      console.log('API 응답 emotions 데이터:', data.emotions);
      data.emotions.forEach((item: { date: string; emotion: string }) => {
        if (!dateEmotionMap[item.date]) {
          // KoBERT 감정 7가지에 맞게 초기화
          dateEmotionMap[item.date] = {
            happy: 0,      // 행복
            neutral: 0,   // 중립
            surprised: 0, // 당황
            sad: 0,       // 슬픔
            angry: 0,     // 분노
            anxious: 0,   // 불안
            disgust: 0,   // 혐오
            total: 0,
          };
        }

        // KoBERT 감정을 ChartDataPoint 형식으로 매핑
        // [ERD 설계서] KoBERT 감정 7가지: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
        const emotion = item.emotion;
        if (emotion === '행복') {
          dateEmotionMap[item.date].happy++;
        } else if (emotion === '중립') {
          dateEmotionMap[item.date].neutral++;
        } else if (emotion === '당황') {
          dateEmotionMap[item.date].surprised++;
        } else if (emotion === '슬픔') {
          dateEmotionMap[item.date].sad++;
        } else if (emotion === '분노') {
          dateEmotionMap[item.date].angry++;
        } else if (emotion === '불안') {
          dateEmotionMap[item.date].anxious++;
        } else if (emotion === '혐오') {
          dateEmotionMap[item.date].disgust++;
        } else {
          // 알 수 없는 감정은 로그로 기록
          console.warn('알 수 없는 감정:', emotion, 'date:', item.date);
        }

        dateEmotionMap[item.date].total++;
      });

      // 디버깅: 날짜별 감정 데이터 확인
      console.log('날짜별 감정 데이터 집계 결과:', dateEmotionMap);
      console.log('API 응답 dates 배열:', data.dates);

      // dates 배열을 기준으로 ChartDataPoint 배열 생성
      // 월간일 때는 주별로 그룹화된 데이터가 올 수 있음
      const chartData = data.dates.map((date: string) => {
        // KoBERT 감정 7가지에 맞게 초기화
        const emotionData = dateEmotionMap[date] || {
          happy: 0,      // 행복
          neutral: 0,   // 중립
          surprised: 0, // 당황
          sad: 0,       // 슬픔
          angry: 0,     // 분노
          anxious: 0,   // 불안
          disgust: 0,   // 혐오
          total: 0,
        };

        const point = {
          date,
          displayLabel: formatDateLabel(date, type),
          ...emotionData,
        };

        // 디버깅: 각 데이터 포인트 확인 (월간일 때만)
        if (type === 'monthly') {
          console.log(`월간 데이터 포인트 [${date}]:`, point);
        }

        return point;
      });

      console.log('최종 차트 데이터:', chartData);
      return chartData;
    } else {
      throw new Error(response.data.error?.message || '차트 데이터를 불러오는데 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

function formatDateLabel(dateStr: string, type: 'weekly' | 'monthly'): string {
  if (type === 'weekly') {
    // 주간: 일별 표시 (예: 12/10)
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } else {
    // 월간: 주별 표시 (예: 12월 2주차)
    // 백엔드에서 YYYY-MM-DD 형식의 날짜를 반환하므로 주차로 변환
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // 해당 날짜가 속한 주가 해당 월의 몇 번째 주인지 계산
    const firstDayOfMonth = new Date(year, date.getMonth(), 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)
    const dayOfMonth = date.getDate();

    // 주차 계산: (날짜 + 첫날의 요일 오프셋) / 7 올림
    const weekOfMonth = Math.ceil((dayOfMonth + firstDayOfWeek) / 7);

    return `${month}월 ${weekOfMonth}주차`;
  }
}

/**
 * 일기 검색 파라미터 인터페이스 (플로우 6.1, 6.2)
 * 
 * [API 명세서 Section 5.1]
 * - 엔드포인트: GET /api/diaries/search
 * - 파라미터:
 *   * keyword: 제목이나 내용으로 검색
 *   * startDate: 기간 검색 시작일 (YYYY-MM-DD)
 *   * endDate: 기간 검색 종료일 (YYYY-MM-DD)
 *   * emotions: 감정 필터 (여러 개 가능, 쉼표로 구분, 예: 행복,중립,슬픔)
 *     - KoBERT 감정 종류: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
 *     - 선택된 감정 중 하나라도 포함된 일기 검색
 *   * page: 현재 페이지 번호 (기본값: 1)
 *   * limit: 페이지당 항목 수 (기본값: 10)
 * 
 * 플로우 6.2 요구사항:
 * - 키워드 검색: 제목이나 내용에서 검색
 * - 기간 검색: 시작일 ~ 종료일 범위
 * - 감정별 검색: 여러 감정 중복 선택 가능 (체크박스 방식)
 * - 필터 변경 시 자동으로 검색 실행
 * - 검색 결과 최신순 표시
 * - 페이지당 10개 일기 표시
 */
export interface DiarySearchParams {
  keyword?: string; // 키워드 (제목 또는 내용)
  startDate?: string; // 기간 검색 시작일 (YYYY-MM-DD)
  endDate?: string; // 기간 검색 종료일 (YYYY-MM-DD)
  emotions?: string; // [API 명세서] 감정 필터 (콤마 구분: "행복,중립,슬픔", KoBERT 감정 종류)
  page?: number; // 현재 페이지 번호 (기본값: 1)
  limit?: number; // 페이지당 항목 수 (기본값: 10)
}

/**
 * 일기 검색 결과 인터페이스 (플로우 6.1, 6.2)
 * 
 * [백엔드 팀 작업 필요]
 * - 응답 형식:
 *   * diaries: 검색된 일기 목록 (최신순)
 *   * total: 총 일기 개수
 *   * page: 현재 페이지 번호
 *   * totalPages: 전체 페이지 수
 */
export interface DiarySearchResult {
  diaries: DiaryDetail[]; // 검색된 일기 목록
  total: number; // 총 일기 개수
  page: number; // 현재 페이지 번호
  totalPages: number; // 전체 페이지 수
}

/**
 * 일기 검색 API (플로우 6.1, 6.2)
 * 
 * [API 명세서 Section 5.1]
 * - 엔드포인트: GET /api/diaries/search
 * - 파라미터: DiarySearchParams
 * - 응답: { success: true, data: DiarySearchResult }
 * 
 * 검색 기능 (플로우 6.2):
 * 1. 키워드 검색: 제목이나 내용에 키워드 포함된 일기
 * 2. 기간 검색: 시작일 ~ 종료일 범위 내 일기
 * 3. 감정별 검색: 여러 감정 중복 선택 가능
 *    - emotions 파라미터: "행복,중립,슬픔" (콤마로 구분, KoBERT 감정 종류)
 *    - 선택된 감정 중 하나라도 포함된 일기를 검색 결과에 표시
 * 4. 정렬: 최신순 (날짜 내림차순)
 * 5. 페이지네이션: 페이지당 10개 항목
 * 
 * [API 명세서 Section 5.1]
 * - GET /api/diaries/search
 * - Headers: { Authorization: Bearer {accessToken} } (apiClient interceptor에서 자동 추가)
 * - Query Parameters: { keyword?, startDate?, endDate?, emotions?, page?, limit? }
 * - Response: { success: true, data: { total, page, limit, totalPages, diaries } }
 */
export async function searchDiaries(params: DiarySearchParams): Promise<DiarySearchResult> {
  try {
    const queryParams: any = {};

    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.emotions) queryParams.emotions = params.emotions; // 콤마로 구분된 감정 목록 (예: "행복,중립,슬픔")
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;

    const response = await apiClient.get('/diaries/search', { params: queryParams });

    if (response.data.success) {
      const result = response.data.data;
      return {
        diaries: result.diaries.map((diary: DiaryDetail) => ({
          ...diary,
          // ID 타입 처리: 백엔드에서 숫자로 올 수 있으므로 string으로 변환
          id: String(diary.id || diary.id),
          emotionCategory: getEmotionCategory(diary.emotion),
        })),
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      };
    } else {
      throw new Error(response.data.error?.message || '일기 검색에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/login';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}