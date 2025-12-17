/**
 * 장소 추천 API 서비스
 * - 일기 내용 기반 카카오맵 장소 추천
 * - 검색 키워드 추출 및 장소 검색
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
 * 장소 추천 조회
 * - 일기 ID 및 위치 정보를 기반으로 추천 장소 목록 조회
 * @param params 요청 파라미터 (diaryId, lat, lng, radius)
 * @returns 추천 장소 목록 및 음식 정보
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

