/**
 * ========================================
 * 장소 추천 API 서비스
 * ========================================
 * 
 * [참고] API 명세서에 장소 추천 API가 명시되어 있지 않습니다.
 * 백엔드 팀에서 구현 완료 후 사용 가능합니다.
 * 
 * [백엔드 팀 구현 필요]
 * - GET /api/places/recommendations 엔드포인트 구현 필요
 * - JWT 토큰은 apiClient의 interceptor에서 자동으로 추가됩니다.
 * 
 * [백엔드 팀 구현 가이드]
 * 
 * 1. API 엔드포인트: GET /api/places/recommendations
 * 
 * 2. Query Parameters:
 *    - diaryId: string (필수) - 일기 ID
 *    - lat?: number - 현재 위치 위도 (선택, 없으면 일기 작성 위치 사용)
 *    - lng?: number - 현재 위치 경도 (선택)
 *    - radius?: number - 검색 반경 미터 단위 (기본: 5000m)
 * 
 * 3. 처리 순서 (백엔드에서):
 *    a) 일기 조회 (diaryId로)
 *       - recommendedFood (음식 추천 정보) 조회
 *       - emotion (KoBERT 감정 분석 결과) 조회
 *    
 *    b) [AI 팀 작업 필요] AI 키워드 변환 (Gemini API)
 *       - 입력: recommendedFood.name, recommendedFood.reason, emotion
 *       - 출력: 검색 가능한 키워드 배열 (예: ["국밥", "순대국밥", "설렁탕"])
 *       - 프롬프트 예시:
 *         "다음 음식 추천을 바탕으로 실제 카카오맵에서 검색 가능한 키워드 3-5개를 추출해주세요.
 *          음식명: {recommendedFood.name}
 *          추천 이유: {recommendedFood.reason}
 *          감정: {emotion}
 *          
 *          반환 형식: JSON 배열 ['키워드1', '키워드2', ...]"
 *    
 *    c) [백엔드 팀 작업 필요] 카카오 로컬 API 검색
 *       - 각 키워드로 카카오 로컬 API 호출 (병렬 처리 권장)
 *       - 현재 위치(lat, lng) 기준 반경(radius) 이내 검색
 *       - 카테고리 필터: 음식점 관련 카테고리만 (선택적)
 *    
 *    d) 결과 병합 및 정렬
 *       - 중복 제거 (같은 장소 ID)
 *       - 거리순 정렬
 *       - 최대 15개 제한
 *    
 *    e) 감정 기반 추가 필터링 (선택적)
 *       - 예: 슬픔 → "조용한", "혼밥" 키워드 추가 검색
 * 
 * 4. Response 형식:
 *    {
 *      "success": true,
 *      "data": {
 *        "recommendedFood": {
 *          "name": "따뜻한 국밥",
 *          "reason": "몸을 따뜻하게 해주는 음식이 기분 전환에 도움이 될 수 있어요"
 *        },
 *        "places": [
 *          {
 *            "id": "1234567890",
 *            "name": "할매국밥",
 *            "address": "서울시 강남구 테헤란로 123",
 *            "roadAddress": "서울시 강남구 테헤란로 123",
 *            "phone": "02-1234-5678",
 *            "category": "한식 > 국밥",
 *            "distance": 450, // 미터 단위 (숫자)
 *            "rating": 4.5, // 평점 (있는 경우, 선택적)
 *            "x": 127.027610, // 경도
 *            "y": 37.497942, // 위도
 *            "url": "https://place.map.kakao.com/1234567890"
 *          }
 *        ],
 *        "searchKeywords": ["국밥", "순대국밥", "설렁탕"] // 실제 검색에 사용된 키워드
 *      }
 *    }
 * 
 * [AI 팀 작업 필요]
 * - 음식명을 검색 키워드로 변환하는 Gemini API 호출 로직 구현
 * - 프롬프트 최적화 및 키워드 추출 정확도 향상
 * 
 * [플로우 8.2: 장소 추천 화면] (사용자 기반 상세기능명세서.md)
 * - AI 기반 음식 추천: 일기 저장 시점에 추천된 음식 조회 (DB에서 조회)
 * - 카카오 로컬 API 장소 검색: AI가 추천한 음식을 키워드로 카카오 로컬 API 호출
 * - 현재 위치 기준 반경 5km 이내 장소 검색
 * - 검색 결과 최대 15개까지 표시
 */

import { apiClient } from '@/shared/api/client';

/**
 * 장소 정보 인터페이스
 */
export interface Place {
  id: string; // 카카오맵 장소 ID
  name: string; // 장소명
  address: string; // 지번 주소
  roadAddress?: string; // 도로명 주소
  phone?: string; // 전화번호
  category?: string; // 카테고리 (예: "한식 > 국밥")
  distance: number; // 거리 (미터 단위, 숫자)
  rating?: number; // 평점 (선택적)
  x: number; // 경도
  y: number; // 위도
  url?: string; // 카카오맵 URL
}

/**
 * 음식 추천 정보 인터페이스
 */
export interface RecommendedFood {
  name: string; // 음식명 (예: "따뜻한 국밥")
  reason: string; // 추천 이유
}

/**
 * 장소 추천 응답 인터페이스
 */
export interface PlaceRecommendationResponse {
  recommendedFood: RecommendedFood; // 일기 저장 시점에 추천된 음식
  places: Place[]; // 추천 장소 목록 (최대 15개)
  searchKeywords: string[]; // 실제 검색에 사용된 키워드 (디버깅/표시용)
}

/**
 * 장소 추천 요청 파라미터
 */
export interface PlaceRecommendationParams {
  diaryId: string; // 일기 ID (필수)
  lat?: number; // 현재 위치 위도 (선택)
  lng?: number; // 현재 위치 경도 (선택)
  radius?: number; // 검색 반경 미터 단위 (기본: 5000)
}


/**
 * GET /api/places/recommendations
 * 장소 추천 API
 * 
 * [API 명세서] - 장소 추천 API (추가 필요)
 * [플로우 8.2: 장소 추천 화면]
 * 
 * 일기 저장 시점에 추천된 음식을 기반으로 주변 장소를 검색합니다.
 * 
 * 처리 순서 (백엔드에서):
 * 1. 일기 조회 (diaryId로) → recommendedFood, emotion 조회
 * 2. [AI 팀] AI 키워드 변환 (Gemini API) → 검색 키워드 배열 생성
 * 3. [백엔드 팀] 카카오 로컬 API 검색 (여러 키워드 병렬 검색)
 * 4. 결과 병합, 정렬, 필터링 (거리순, 최대 15개)
 * 5. 프론트엔드에 반환
 * 
 * [백엔드 팀] 실제 구현 시:
 * ```typescript
 * export async function getPlaceRecommendations(
 *   params: PlaceRecommendationParams
 * ): Promise<PlaceRecommendationResponse> {
 *   const queryParams = new URLSearchParams();
 *   queryParams.append('diaryId', params.diaryId);
 *   if (params.lat) queryParams.append('lat', params.lat.toString());
 *   if (params.lng) queryParams.append('lng', params.lng.toString());
 *   if (params.radius) queryParams.append('radius', params.radius.toString());
 * 
 *   const response = await apiClient.get(`/places/recommendations?${queryParams}`);
 *   return response.data.data;
 * }
 * ```
 * 
 * [백엔드 팀] 에러 처리:
 * - 400: 잘못된 요청 (diaryId 없음 등) → "일기 정보를 찾을 수 없습니다"
 * - 401: 인증 실패 → 로그인 페이지 리다이렉트 (apiClient interceptor에서 처리)
 * - 404: 일기 없음 → "일기를 찾을 수 없습니다"
 * - 500: 서버 에러 → "장소 추천에 실패했습니다"
 */
export async function getPlaceRecommendations(
  params: PlaceRecommendationParams
): Promise<PlaceRecommendationResponse> {
  // [참고] API 명세서에 장소 추천 API가 명시되어 있지 않습니다.
  // 백엔드 팀에서 구현 완료 후 아래 코드를 활성화하세요.
  
  const queryParams = new URLSearchParams();
  queryParams.append('diaryId', params.diaryId);
  if (params.lat) queryParams.append('lat', params.lat.toString());
  if (params.lng) queryParams.append('lng', params.lng.toString());
  if (params.radius) queryParams.append('radius', params.radius.toString());

  try {
    // [백엔드 구현 필요] GET /api/places/recommendations 엔드포인트가 구현되어야 합니다.
    // 현재 백엔드에서 "No static resource api/places/recommendations" 에러가 발생하는 경우,
    // 해당 엔드포인트가 아직 구현되지 않았거나 컨트롤러가 등록되지 않은 상태입니다.
    
    const response = await apiClient.get(`/places/recommendations?${queryParams.toString()}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error?.message || '장소 추천에 실패했습니다.');
    }
  } catch (error: any) {
    // 500 에러 처리 (백엔드에서 "No static resource" 에러가 발생하는 경우)
    if (error.response?.status === 500) {
      const errorMessage = error.response?.data?.error?.message || '';
      if (errorMessage.includes('No static resource') || errorMessage.includes('NoResourceFoundException')) {
        throw new Error('장소 추천 API가 아직 구현되지 않았습니다. 백엔드 팀에서 GET /api/places/recommendations 엔드포인트를 구현해주세요.');
      }
      throw new Error('서버 오류가 발생했습니다. 백엔드 서버 로그를 확인해주세요.');
    }
    // 404 에러 처리
    if (error.response?.status === 404) {
      throw new Error('장소 추천 API를 찾을 수 없습니다. 백엔드에서 GET /api/places/recommendations 엔드포인트가 구현되었는지 확인해주세요.');
    }
    // 네트워크 에러 처리
    if (error.isNetworkError || !error.response) {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
    // 기타 에러
    throw error;
  }
}

