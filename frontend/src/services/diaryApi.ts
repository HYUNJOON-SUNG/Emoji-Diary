/**
 * ========================================
 * 일기 API 서비스
 * ========================================
 * 
 * [백엔드 연동 완료]
 * - 모든 API는 실제 백엔드 서버와 통신합니다.
 * - JWT 토큰은 apiClient의 interceptor에서 자동으로 추가됩니다.
 * - AI 기능(KoBERT 감정 분석, 이미지 생성, 코멘트 생성, 음식 추천)은 백엔드에서 자동 처리됩니다.
 * 
 * [플로우 14: 에러 처리 플로우]
 * 
 * **플로우 14.2: API 에러** (명세서)
 * - 네트워크 에러: 에러 메시지 표시 (예: "일기를 불러오는 데 실패했습니다.")
 * - 인증 에러: 로그인 페이지로 리다이렉트
 * - 기타 에러: 각 화면에서 적절한 에러 메시지 표시
 * 
 * **플로우 14.3: 로딩 상태** (명세서)
 * - API 호출 중: 로딩 스피너 표시
 * - 버튼: "저장 중...", "검색 중..." 등 텍스트 변경
 * - 화면 전체: 중앙에 로딩 스피너
 * 
 * [백엔드 팀] 에러 처리 가이드:
 * - 400: 잘못된 요청 → "입력값을 확인해주세요"
 * - 401: 인증 실패 → 로그인 페이지 리다이렉트
 * - 403: 권한 없음 → "접근 권한이 없습니다"
 * - 404: 리소스 없음 → "요청한 데이터를 찾을 수 없습니다"
 * - 500: 서버 에러 → "서버 오류가 발생했습니다"
 */

/**
 * 감정 데이터 인터페이스
 * - 캘린더 히트맵에 표시되는 일별 감정 정보
 */
export interface EmotionData {
  date: string; // 날짜 (YYYY-MM-DD 형식)
  emotion: string; // 감정 이모지 (예: '😊', '😢')
  emotionCategory: string; // 감정 카테고리 (예: 'happy', 'sad', 'anxious')
}

/**
 * 일기 상세 정보 인터페이스
 * - 일기 조회/작성/수정 시 사용되는 전체 데이터 구조
 * 
 * [API 명세서 참고]
 * - GET /api/diaries/{diaryId} 또는 GET /api/diaries/date/{date} 응답 형식
 * 
 * [ERD 설계서 참고 - Diaries 테이블]
 * - id: BIGINT (PK) → string (일기 고유 ID)
 * - date: DATE → string (YYYY-MM-DD 형식)
 * - title: VARCHAR(255) → string (일기 제목)
 * - content: TEXT → string (일기 본문, KoBERT 분석 대상)
 * - emotion: ENUM → string (KoBERT 분석 결과: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
 * - mood: VARCHAR(255) → string (기분, 자유 텍스트)
 * - weather: ENUM → string (날씨: 맑음, 흐림, 비, 천둥, 눈, 안개)
 * - image_url: VARCHAR(500) → imageUrl (AI 생성 그림일기 이미지 URL)
 * - ai_comment: TEXT → aiComment (AI 코멘트, Gemini API로 생성)
 * - recommended_food: JSON → recommendedFood (음식 추천 정보, JSON 형식)
 * - kobert_analysis: JSON → (백엔드 내부 처리용, API 응답에 포함되지 않음)
 * - created_at: DATETIME → createdAt (ISO 8601 형식)
 * - updated_at: DATETIME → updatedAt (ISO 8601 형식)
 * 
 * [ERD 설계서 참고 - 관련 테이블]
 * - Diary_Images 테이블: 사용자 업로드 이미지는 별도 테이블로 관리되지만, API 응답에서는 images 배열로 반환
 * - Diary_Activities 테이블: 활동 목록은 별도 테이블로 관리되지만, API 응답에서는 activities 배열로 반환
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
  createdAt?: string; // 생성일시 (ERD: Diaries.created_at, DATETIME, ISO 8601 형식)
  updatedAt?: string; // 수정일시 (ERD: Diaries.updated_at, DATETIME, ISO 8601 형식)
}

/**
 * 일기 작성 요청 인터페이스
 * - POST /api/diaries API에 전송되는 데이터 구조
 * 
 * [API 명세서 참고]
 * - emotion 필드는 제거됨 (KoBERT가 자동으로 분석하여 저장)
 * - KoBERT는 일기 본문(content)만 분석하여 감정을 결정
 * 
 * [플로우 3.3: 일기 작성 저장 및 처리]
 * - 사용자 업로드 이미지는 서버에 업로드 후 URL 배열로 전송
 * - AI 생성 이미지는 백엔드에서 자동 생성되므로 Request Body에 포함하지 않음
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
 * 일기 수정 요청 인터페이스
 * - PUT /api/diaries/{diaryId} API에 전송되는 데이터 구조
 * 
 * [API 명세서 참고]
 * - emotion 필드는 제거됨 (KoBERT가 수정된 본문을 재분석하여 자동으로 업데이트)
 * - KoBERT는 수정된 일기 본문(content)만 분석
 * - imageUrl 필드는 제거됨 (AI가 수정된 일기 내용을 바탕으로 자동 재생성)
 * 
 * [ERD 설계서 참고]
 * - title: Diaries.title (VARCHAR(255), 필수)
 * - content: Diaries.content (TEXT, 필수, KoBERT 재분석 대상)
 * - mood: Diaries.mood (VARCHAR(255), 선택)
 * - weather: Diaries.weather (ENUM, 선택)
 * - activities: Diary_Activities 테이블 업데이트 (별도 테이블, API 요청에서는 배열로 전송)
 * - images: Diary_Images 테이블 업데이트 (별도 테이블, API 요청에서는 배열로 전송)
 * - imageUrl: Response에서만 받음 (AI가 자동 재생성한 이미지 URL)
 * 
 * [플로우 4.3: 일기 수정 저장 및 처리]
 * - 사용자 업로드 이미지는 수정된 내용(삭제/추가된 이미지) 반영
 * - 백엔드에서 activities와 images 배열을 각각 Diary_Activities, Diary_Images 테이블에 업데이트
 * - AI 생성 이미지(imageUrl)는 백엔드에서 자동 재생성되어 Response에 포함됨
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

import { apiClient, BASE_URL } from './api';

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
 * 감정 이모지 매핑 (캘린더 표시용)
 */
const emotionEmojiMap: { [key: string]: string } = {
  '행복': '😊',
  '중립': '😐',
  '당황': '😳',
  '슬픔': '😢',
  '분노': '😠',
  '불안': '😰',
  '혐오': '🤢',
};

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
 * GET /api/diaries/calendar
 * 캘린더 월별 조회 API
 * 
 * [API 명세서 참고]
 * - 엔드포인트: GET /api/diaries/calendar
 * - Query Parameters: year (연도), month (월, 1-12)
 * - Response 200: { success: true, data: { year, month, diaries: [{ date, emotion }] } }
 * 
 * [백엔드 팀] 실제 API 호출로 대체
 * - 헤더: Authorization: Bearer {accessToken}
 * - 응답 형식: { success: true, data: { year, month, diaries: EmotionData[] } }
 * 
 * 용도:
 * - 캘린더 히트맵에 감정 스티커 표시
 * - 해당 월에 작성된 모든 일기의 날짜와 감정 정보 반환
 * 
 * @param year - 연도 (예: 2025)
 * @param month - 월 (0-11, JavaScript Date 형식)
 * @returns 해당 월의 감정 데이터 배열
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
        emotion: emotionEmojiMap[diary.emotion] || diary.emotion, // 한글 감정을 이모지로 변환 ("행복" -> "😊")
        emotionCategory: getEmotionCategory(diary.emotion),
      }));
    } else {
      throw new Error(response.data.error?.message || '캘린더 데이터를 불러오는데 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/login';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

/**
 * GET /api/diaries/date/{date}
 * 일기 조회 API (날짜 기준)
 * 
 * [API 명세서 참고]
 * - 엔드포인트: GET /api/diaries/date/{date}
 * - URL Parameters: date (YYYY-MM-DD 형식)
 * - Response 200: DiaryDetail
 * - Response 404: 일기 없음 (DIARY_NOT_FOUND)
 * 
 * [백엔드 팀] 실제 API 호출로 대체
 * - 헤더: Authorization: Bearer {accessToken}
 * - 응답 형식: { success: true, data: DiaryDetail } 또는 { success: false, error: {...} }
 * 
 * @param date - 날짜 (YYYY-MM-DD 형식)
 * @returns 일기 상세 정보 또는 null
 */
export async function fetchDiaryDetails(date: string): Promise<DiaryDetail | null> {
  try {
    const response = await apiClient.get(`/diaries/date/${date}`);

    if (response.data.success) {
      const diary = response.data.data;
      return {
        ...diary,
        // 백엔드에서 snake_case로 올 수 있는 필드들을 camelCase로 변환
        // 이미지 경로가 상대 경로인 경우 백엔드 URL 추가
        imageUrl: getImageUrl(diary.imageUrl || diary.image_url),
        aiComment: diary.aiComment || diary.ai_comment,
        recommendedFood: diary.recommendedFood || diary.recommended_food,
        images: (diary.images || []).map((imgUrl: string) => getImageUrl(imgUrl) || imgUrl),
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
      window.location.href = '/login';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

/**
 * POST /api/diaries
 * 일기 작성 API
 * 
 * [API 명세서 Section 4.1]
 * [플로우 3.3: 일기 작성 저장 및 처리]
 * 
 * 처리 순서:
 * 1. KoBERT 감정 분석 실행 (본문 분석) → 주요 감정 추출
 *    - 일기 본문(`content`)만 분석하여 7가지 감정 중 하나로 분류
 *    - 분석 결과: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
 *    - KoBERT 분석 결과가 사용자에게 표시되는 감정이 됨
 * 2. AI 이미지 생성 (NanoVana API) - 일기 작성 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과 활용
 *    - 생성 완료 → 이미지 URL 획득
 * 3. 일기 데이터 저장 (제목, 본문, 기분, 날씨, 활동, 사용자 업로드 이미지 URL 목록, KoBERT 감정 분석 결과, AI 생성 이미지 URL)
 *    - 감정 분석 결과는 `emotion` 컬럼에 저장됨
 *    - AI 생성 이미지 URL은 별도 컬럼에 저장됨
 * 4. AI 코멘트 생성 (Gemini API) - 일기 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과, 페르소나 스타일 활용
 * 5. 음식 추천 생성 (Gemini API) - 일기 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과 활용 (DB에 저장)
 * 
 * [ERD 설계서 참고 - 데이터 저장 구조]
 * - Diaries 테이블: 일기 기본 정보 저장 (id, user_id, date, title, content, emotion, mood, weather, image_url, ai_comment, recommended_food, kobert_analysis)
 * - Diary_Activities 테이블: activities 배열의 각 항목을 별도 레코드로 저장 (diary_id, activity)
 * - Diary_Images 테이블: images 배열의 각 항목을 별도 레코드로 저장 (diary_id, image_url)
 * - kobert_analysis: JSON 타입으로 저장 (예: {"emotion": "슬픔", "confidence": 0.85})
 * - recommended_food: JSON 타입으로 저장 (예: {"name": "따뜻한 국밥", "reason": "..."})
 * 
 * [백엔드 팀 작업 필요]
 * - 엔드포인트: POST /api/diaries
 * - 헤더: Authorization: Bearer {JWT_TOKEN}
 * - 요청 본문: CreateDiaryRequest 인터페이스 참고
 * - 응답: DiaryDetail 인터페이스 참고
 * - activities 배열을 Diary_Activities 테이블에 저장 (CASCADE 관계)
 * - images 배열을 Diary_Images 테이블에 저장 (CASCADE 관계)
 * 
 * [AI 팀 작업 필요]
 * 1. KoBERT 모델로 일기 본문 감정 분석
 *    - 입력: data.content (일기 본문, API 명세서: content)
 *    - 출력: { emotion: string, confidence: number }
 *      - emotion: "행복" | "중립" | "당황" | "슬픔" | "분노" | "불안" | "혐오"
 *    - KoBERT 분석 결과가 사용자에게 표시되는 감정이 됨
 * 
 * 2. 제미나이 API로 AI 코멘트 생성
 *    - 입력: 일기 내용(제목, 본문, 기분, 날씨, 활동) + KoBERT 감정 분석 결과 + 페르소나
 *    - 페르소나: localStorage.getItem('aiPersona')
 *    - 페르소나 종류: friend(베프), parent(부모님), expert(전문가), 
 *                      mentor(멘토), therapist(상담사), poet(시인)
 *    - 각 페르소나에 맞는 말투와 스타일로 코멘트 생성
 * 
 * 3. 제미나이 API로 음식 추천 생성
 *    - 입력: 일기 내용(제목, 본문, 기분, 날씨, 활동) + KoBERT 감정 분석 결과
 *    - 출력: { name: string, reason: string }
 *    - 추천된 음식을 DB에 저장
 */
export async function createDiary(data: CreateDiaryRequest): Promise<DiaryDetail> {
  try {
    const response = await apiClient.post('/diaries', data);

    if (response.data.success) {
      const diary = response.data.data;
      // 백엔드에서 KoBERT 감정 분석, AI 이미지 생성, AI 코멘트 생성, 음식 추천 생성이 모두 처리됨
      return {
        ...diary,
        emotionCategory: getEmotionCategory(diary.emotion),
      };
    } else {
      throw new Error(response.data.error?.message || '일기 작성에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/login';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

/**
 * PUT /api/diaries/{diaryId}
 * 일기 수정 API
 * 
 * [API 명세서 Section 4.2]
 * - 엔드포인트: PUT /api/diaries/{diaryId}
 * - emotion 필드는 제거됨 (KoBERT가 수정된 본문을 재분석하여 자동으로 업데이트)
 * 
 * [플로우 4.3: 일기 수정 저장 및 처리]
 * 
 * 처리 순서 (API 명세서 Section 4.2):
 * 1. KoBERT 감정 분석 실행 (수정된 본문 분석) → 새로운 감정 추출
 *    - 수정된 본문을 분석하여 7가지 감정 중 하나로 재분류
 *    - 주요 감정을 추출하여 `emotion` 컬럼에 업데이트
 * 2. AI 이미지 재생성 (NanoVana API) - 수정된 일기 본문, 날씨, KoBERT 감정 분석 결과를 활용하여 그림일기 형태의 이미지 재생성
 *    - 기존 이미지는 삭제되고 새로운 이미지로 대체됨
 * 3. 일기 데이터 저장 (수정된 일기 데이터 전송: 제목, 본문, 기분, 날씨, 활동, 사용자 업로드 이미지 URL 목록)
 *    - 새로운 `emotion` 값, 재생성된 `imageUrl`, 업데이트된 `kobert_analysis` JSON 저장
 * 4. AI 코멘트 재생성 (Gemini API) - 수정된 일기 본문, 날씨, KoBERT 감정 분석 결과, 페르소나 스타일을 반영하여 새로운 AI 코멘트 생성
 * 5. 음식 추천 재생성 (Gemini API) - 수정된 일기 본문, 날씨, KoBERT 감정 분석 결과를 반영하여 음식 추천 재생성 (DB에 업데이트)
 * 
 * [ERD 설계서 참고 - 데이터 업데이트 구조]
 * - Diaries 테이블: 일기 기본 정보 업데이트 (title, content, emotion, mood, weather, image_url, ai_comment, recommended_food, kobert_analysis, updated_at)
 * - Diary_Activities 테이블: 기존 활동 삭제 후 새로 저장 (CASCADE 관계로 기존 레코드 삭제 후 재생성)
 * - Diary_Images 테이블: 기존 이미지 삭제 후 새로 저장 (CASCADE 관계로 기존 레코드 삭제 후 재생성)
 * - image_url: AI가 수정된 내용을 반영하여 자동 재생성됨 (ERD: Diaries.image_url)
 * 
 * [백엔드 팀 작업 필요]
 * - 엔드포인트: PUT /api/diaries/{diaryId}
 * - 헤더: Authorization: Bearer {JWT_TOKEN}
 * - 요청 본문: UpdateDiaryRequest 인터페이스 참고
 * - 응답: DiaryDetail 인터페이스 참고
 * - activities 배열 업데이트: Diary_Activities 테이블에서 기존 레코드 삭제 후 새로 저장
 * - images 배열 업데이트: Diary_Images 테이블에서 기존 레코드 삭제 후 새로 저장
 * 
 * [AI 팀 작업 필요]
 * - createDiary와 동일하게 KoBERT + 제미나이 API 호출
 * - 수정된 내용을 기반으로 새로운 감정 분석 및 AI 코멘트 생성
 * - 음식 추천도 재생성
 * 
 * @param id - 일기 고유 ID
 * @param date - 일기 날짜 (YYYY-MM-DD)
 * @param data - 수정할 일기 데이터
 */
export async function updateDiary(id: string, date: string, data: UpdateDiaryRequest): Promise<DiaryDetail> {
  try {
    const response = await apiClient.put(`/diaries/${id}`, data);

    if (response.data.success) {
      const diary = response.data.data;
      // 백엔드에서 KoBERT 감정 재분석, AI 이미지 재생성, AI 코멘트 재생성, 음식 추천 재생성이 모두 처리됨
      return {
        ...diary,
        emotionCategory: getEmotionCategory(diary.emotion),
      };
    } else {
      throw new Error(response.data.error?.message || '일기 수정에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/login';
      throw new Error('로그인이 필요합니다.');
    }
    if (error.response?.status === 404) {
      throw new Error('일기를 찾을 수 없습니다.');
    }
    throw error;
  }
}

/**
 * DELETE /api/diaries/{diaryId}
 * 일기 삭제
 * 
 * [API 명세서 Section 4.6]
 * [백엔드 팀] 엔드포인트: DELETE /api/diaries/{diaryId}
 * 
 * 동작:
 * 1. 일기 데이터 삭제
 * 2. 캘린더 히트맵 데이터도 함께 삭제
 * 
 * @param id - 일기 고유 ID
 * @param date - 일기 날짜 (YYYY-MM-DD)
 */
export async function deleteDiary(id: string, date: string): Promise<void> {
  try {
    const response = await apiClient.delete(`/diaries/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || '일기 삭제에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/login';
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
 * GET /stats/daily?month={YYYY-MM}
 * 해당 월의 일별 감정 통계 조회
 * 
 * [참고] 이 함수는 통계 관련 기능이므로 statisticsApi.ts로 이동 예정입니다.
 * 현재는 일기 API와 함께 관리되지만, 향후 통계 API로 분리될 수 있습니다.
 * 
 * [백엔드 팀] 엔드포인트: GET /api/statistics/emotions (또는 별도 엔드포인트)
 * 
 * 용도:
 * - 감정 통계 페이지에서 해당 월의 모든 일기 감정 데이터 조회
 * - 월별 감정 히트맵 표시
 * 
 * @param yearMonth - 연월 (YYYY-MM 형식)
 * @returns 일별 감정 통계 배열
 */
export async function fetchDailyStats(yearMonth: string): Promise<DailyStats[]> {
  // [백엔드 팀] 통계 API로 이동 예정
  // 현재는 캘린더 API를 사용하여 구현 가능
  try {
    const [year, month] = yearMonth.split('-').map(Number);
    const emotions = await fetchMonthlyEmotions(year, month - 1);
    
    // 캘린더 데이터를 DailyStats 형식으로 변환
    // 제목 정보는 별도 조회가 필요할 수 있음
    return emotions.map(emotion => ({
      date: emotion.date,
      emotion: emotion.emotion,
      emotionCategory: emotion.emotionCategory,
      title: '', // 제목은 별도 조회 필요
    }));
  } catch (error: any) {
    throw error;
  }
}

/**
 * 차트 데이터 포인트 인터페이스
 * - 감정 통계 페이지의 선 그래프에 사용
 */
export interface ChartDataPoint {
  date: string; // 날짜 (YYYY-MM-DD)
  displayLabel: string; // 차트 표시용 레이블 (예: "11월 1주차", "11월")
  happy: number; // 행복 감정 카운트
  love: number; // 사랑 감정 카운트
  excited: number; // 설렘 감정 카운트
  calm: number; // 평온 감정 카운트
  grateful: number; // 감사 감정 카운트
  hopeful: number; // 희망 감정 카운트
  tired: number; // 피곤 감정 카운트
  sad: number; // 슬픔 감정 카운트
  angry: number; // 화남 감정 카운트
  anxious: number; // 불안 감정 카운트
  neutral: number; // 중립 감정 카운트
  total: number; // 전체 일기 개수
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
export async function fetchChartStats(
  startDate: string,
  endDate: string,
  type: 'weekly' | 'monthly'
): Promise<ChartDataPoint[]> {
  // [백엔드 팀] 통계 API로 이동 예정
  // 현재는 GET /api/statistics/emotion-trend API를 사용하여 구현 가능
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const year = start.getFullYear();
    const month = start.getMonth() + 1;
    
    const response = await apiClient.get('/statistics/emotion-trend', {
      params: {
        period: type,
        year,
        month,
      },
    });

    if (response.data.success) {
      const data = response.data.data;
      // API 응답을 ChartDataPoint 형식으로 변환
      // API 응답 형식에 따라 변환 로직 필요
      return data.emotions.map((emotion: any) => ({
        date: emotion.date,
        displayLabel: formatDateLabel(emotion.date, type),
        happy: emotion.emotion === '행복' ? 1 : 0,
        love: 0,
        excited: 0,
        calm: 0,
        grateful: 0,
        hopeful: 0,
        tired: 0,
        sad: emotion.emotion === '슬픔' ? 1 : 0,
        angry: emotion.emotion === '분노' ? 1 : 0,
        anxious: emotion.emotion === '불안' ? 1 : 0,
        neutral: emotion.emotion === '중립' || emotion.emotion === '당황' ? 1 : 0,
        total: 1,
      }));
    } else {
      throw new Error(response.data.error?.message || '차트 데이터를 불러오는데 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/login';
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

function formatDateLabel(dateStr: string, type: 'weekly' | 'monthly'): string {
  const date = new Date(dateStr);
  if (type === 'weekly') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } else {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
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