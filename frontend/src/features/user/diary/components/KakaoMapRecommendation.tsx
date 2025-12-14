/**
 * ========================================
 * 카카오맵 장소 추천 컴포넌트
 * ========================================
 * 
 * 감정 기반 장소 추천 기능
 * - 일기 저장 시점에 추천된 음식을 기반으로 주변 장소 검색 및 표시
 * - 인라인 모드와 모달 모드 지원
 * 
 * [프론트엔드 직접 구현]
 * - 일기 ID(diaryId)로 일기 조회하여 recommendedFood 정보 가져오기
 * - recommendedFood.name을 키워드로 카카오 로컬 API 직접 호출
 * - 현재 위치 기반으로 반경 5km 이내 장소 검색
 * 
 * [카카오맵 JavaScript API]
 * - 지도 표시 및 마커 표시용으로만 사용
 * 
 * [카카오 로컬 API]
 * - 프론트엔드에서 직접 호출 (환경 변수 VITE_KAKAO_REST_API_KEY 필요)
 * - 엔드포인트: https://dapi.kakao.com/v2/local/search/keyword.json
 * 
 * [플로우 8.2: 장소 추천 화면] (사용자 기반 상세기능명세서.md)
 * - AI 기반 음식 추천: 일기 저장 시점에 추천된 음식 조회 (DB에서 조회)
 * - 카카오 로컬 API 장소 검색: AI가 추천한 음식을 키워드로 카카오 로컬 API 호출
 * - 현재 위치 기준 반경 5km 이내 장소 검색
 * - 검색 결과 최대 15개까지 표시
 */

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, X, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import { type Place } from '@/shared/api/placeApi';
import { fetchDiaryById } from '@/features/user/diary/api/diaryApi';

// 카카오맵 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapRecommendationProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 일기 ID (권장: 일기의 recommendedFood를 기반으로 장소 검색) */
  diaryId?: string;
  /** 감정 타입 (하위 호환성: diaryId가 없을 때 사용) */
  emotion?: string;
  /** 감정 카테고리 (하위 호환성: diaryId가 없을 때 사용) */
  emotionCategory?: string;
  /** 인라인 모드 (모달이 아닌 페이지 내 표시) */
  isInline?: boolean;
  /** AI 음식 추천 섹션 숨김 (일기 상세 조회에서는 이미 AI 코멘트가 표시되므로 중복 방지) */
  hideFoodRecommendation?: boolean;
}

/**
 * Place 인터페이스는 placeApi.ts에서 import
 * 여기서는 사용하지 않음 (중복 방지)
 */

export function KakaoMapRecommendation({
  isOpen,
  onClose,
  diaryId,
  isInline = false,
  hideFoodRecommendation = false,
}: KakaoMapRecommendationProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [recommendedFood, setRecommendedFood] = useState<{ name: string; reason: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const currentLocationMarkerRef = useRef<any>(null); // 현재 위치 마커
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 정렬 옵션 (플로우 8.2)
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance'); // 기본값: 거리순
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null); // 선택된 장소 (상세 정보 표시용)

  /**
   * [프론트엔드 직접 구현] 장소 추천 가져오기
   * 
   * 1. diaryId가 있으면 일기 조회 API를 호출하여 recommendedFood 정보 가져오기
   * 2. recommendedFood.name을 키워드로 카카오 로컬 API 호출
   * 3. 현재 위치 기반으로 반경 5km 이내 장소 검색
   * 4. 검색 결과를 지도에 표시
   */
  const fetchPlaceRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // 현재 위치 가져오기 (항상 필요)
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      if (!diaryId) {
        // [하위 호환성] diaryId가 없으면 현재 위치만 설정하고 지도만 표시
        console.warn('[KakaoMapRecommendation] diaryId가 제공되지 않았습니다. 지도만 표시합니다.');
        setLoading(false);
        return;
      }

      // 1. 일기 조회하여 recommendedFood 정보 가져오기
      console.log('[KakaoMapRecommendation] 일기 조회:', { diaryId });
      const diary = await fetchDiaryById(diaryId);

      if (!diary) {
        throw new Error('일기를 찾을 수 없습니다.');
      }

      if (!diary.recommendedFood) {
        throw new Error('음식 추천 정보가 없습니다. 일기를 다시 저장해주세요.');
      }

      // 음식 추천 정보 저장
      setRecommendedFood(diary.recommendedFood);
      const foodName = diary.recommendedFood.name;

      // 2. 카카오 로컬 API로 장소 검색
      console.log('[KakaoMapRecommendation] 카카오 로컬 API 호출:', {
        keyword: foodName,
        lat: location.lat,
        lng: location.lng
      });

      const places = await searchPlacesWithKakaoLocalAPI(
        foodName,
        location.lat,
        location.lng,
        5000 // 5km 반경
      );

      console.log('[KakaoMapRecommendation] 검색된 장소 목록:', places);

      // 정렬 적용 (기본값: 거리순)
      const sortedPlaces = sortPlaces(places, sortBy);
      setPlaces(sortedPlaces);
    } catch (err: any) {
      console.error('[KakaoMapRecommendation] 장소 추천 가져오기 실패:', err);

      // 에러 메시지 개선
      let errorMessage = '장소 추천을 가져오는데 실패했습니다.';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (err.response?.status === 404) {
        errorMessage = '일기를 찾을 수 없습니다.';
      } else if (err.isNetworkError || !err.response) {
        errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 카카오 로컬 API로 장소 검색
   * 
   * [카카오 로컬 API 문서]
   * - 엔드포인트: https://dapi.kakao.com/v2/local/search/keyword.json
   * - 헤더: Authorization: KakaoAK {REST_API_KEY}
   * - Query Parameters:
   *   - query: 검색 키워드 (필수)
   *   - x: 경도 (longitude, 필수)
   *   - y: 위도 (latitude, 필수)
   *   - radius: 반경 (미터, 선택, 기본값: 20000)
   *   - size: 결과 개수 (선택, 기본값: 15, 최대: 45)
   * 
   * [환경 변수 설정 필요]
   * - VITE_KAKAO_REST_API_KEY: 카카오 개발자 콘솔에서 발급받은 REST API 키
   * - .env 파일에 추가: VITE_KAKAO_REST_API_KEY=your_api_key_here
   * 
   * [CORS 문제 해결]
   * - 카카오 로컬 API는 브라우저에서 직접 호출 시 CORS 문제가 발생할 수 있습니다.
   * - 해결 방법:
   *   1. 카카오 개발자 콘솔에서 플랫폼 설정에 localhost:3000 추가
   *   2. 또는 백엔드에서 프록시 역할을 하도록 구현
   */
  const searchPlacesWithKakaoLocalAPI = async (
    keyword: string,
    lat: number,
    lng: number,
    radius: number = 5000
  ): Promise<Place[]> => {
    const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

    if (!KAKAO_REST_API_KEY) {
      throw new Error('카카오 REST API 키가 설정되지 않았습니다. 환경 변수 VITE_KAKAO_REST_API_KEY를 설정해주세요.');
    }

    try {
      // 카카오 로컬 API 호출
      // [참고] 현재 위치를 중심으로 검색하기 위해 x, y 파라미터 사용
      // 카카오 로컬 API는 x(경도), y(위도)를 중심으로 반경 내 장소를 검색합니다.
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?` +
        `query=${encodeURIComponent(keyword)}&` +
        `x=${lng}&` + // 경도 (현재 위치 중심)
        `y=${lat}&` + // 위도 (현재 위치 중심)
        `radius=${radius}&` + // 반경 (미터 단위)
        `size=15`, // 최대 15개
        {
          method: 'GET',
          headers: {
            'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('카카오 API 인증에 실패했습니다. REST API 키를 확인해주세요.');
        } else if (response.status === 400) {
          throw new Error('카카오 API 요청 형식이 잘못되었습니다.');
        } else {
          throw new Error(`카카오 API 호출 실패: ${response.status}`);
        }
      }

      const data = await response.json();

      if (!data.documents || data.documents.length === 0) {
        console.warn('[KakaoMapRecommendation] 검색 결과가 없습니다.');
        return [];
      }

      // 카카오 API 응답을 Place 인터페이스로 변환
      const places: Place[] = data.documents.map((doc: any) => {
        // 현재 위치와 장소 위치 간 거리 계산 (미터 단위)
        const distance = calculateDistance(
          lat,
          lng,
          parseFloat(doc.y),
          parseFloat(doc.x)
        );

        return {
          id: doc.id,
          name: doc.place_name,
          address: doc.address_name,
          roadAddress: doc.road_address_name || doc.address_name,
          phone: doc.phone || undefined,
          category: doc.category_name || undefined,
          distance: distance, // 숫자로 저장 (정렬에 사용)
          rating: undefined, // 카카오 로컬 API는 평점 정보를 제공하지 않음
          x: parseFloat(doc.x), // 경도
          y: parseFloat(doc.y), // 위도
          // 카카오맵 링크 생성 (참고: https://imdaxsz.tistory.com/47)
          // /link/map/장소ID 패턴 사용 (모바일/PC 모두 지원)
          url: doc.place_url || `https://map.kakao.com/link/map/${doc.id}`,
        };
      });

      return places;
    } catch (error: any) {
      console.error('[KakaoMapRecommendation] 카카오 로컬 API 호출 실패:', error);

      // CORS 에러 감지
      if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
        throw new Error('CORS 오류가 발생했습니다. 카카오 개발자 콘솔에서 플랫폼 설정을 확인하거나, 백엔드 프록시를 사용해주세요.');
      }

      throw error;
    }
  };

  /**
   * 두 지점 간 거리 계산 (Haversine 공식)
   * 
   * @param lat1 - 첫 번째 지점의 위도
   * @param lng1 - 첫 번째 지점의 경도
   * @param lat2 - 두 번째 지점의 위도
   * @param lng2 - 두 번째 지점의 경도
   * @returns 거리 (미터 단위)
   */
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // 지구 반경 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // 미터 단위로 반환
  };

  /**
   * 장소 목록 정렬 함수 (플로우 8.2)
   * 
   * 정렬 옵션:
   * - 거리순 (기본): 현재 위치로부터의 거리 기준 오름차순
   * - 이름순: 장소명 기준 가나다순
   * 
   * [주의사항]
   * - distance는 숫자 타입으로 전달되어야 함 (API 응답에서 숫자로 오므로)
   * - 표시용 포맷팅은 UI에서 처리
   */
  const sortPlaces = (placesToSort: Place[], sortType: 'distance' | 'name'): Place[] => {
    const sorted = [...placesToSort];

    switch (sortType) {
      case 'distance':
        // 거리순 정렬 (숫자 기준 오름차순)
        return sorted.sort((a, b) => {
          // distance가 문자열인 경우 숫자로 변환 (하위 호환성)
          const distanceA = typeof a.distance === 'string'
            ? parseFloat((a.distance as string).replace(/[^0-9.]/g, '')) || 0
            : (a.distance || 0);
          const distanceB = typeof b.distance === 'string'
            ? parseFloat((b.distance as string).replace(/[^0-9.]/g, '')) || 0
            : (b.distance || 0);
          return distanceA - distanceB;
        });



      case 'name':
        // 이름순 정렬 (가나다순)
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

      default:
        return sorted;
    }
  };

  /**
   * 정렬 옵션 변경 핸들러 (플로우 8.2)
   * 
   * [주의사항]
   * - places 배열의 distance는 숫자로 유지되어야 정렬이 정확하게 작동함
   * - 표시용으로는 UI에서 포맷팅
   */
  const handleSortChange = (newSort: 'distance' | 'name') => {
    setSortBy(newSort);
    // places 배열을 복사하여 정렬 (원본 배열 변경 방지)
    // distance는 이미 숫자로 저장되어 있으므로 그대로 사용
    const sorted = sortPlaces(places, newSort);
    setPlaces(sorted);
  };

  /**
   * 현재 위치 가져오기
   * Geolocation API 사용, 실패 시 기본 위치(서울시청) 반환
   */

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      const defaultLocation = { lat: 37.5665, lng: 126.9780 }; // 서울시청 기본값

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.warn('[KakaoMapRecommendation] Geolocation error:', error);
            // 위치 권한 거부 시 기본 위치 사용
            resolve(defaultLocation);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000, // 1분 캐시
          }
        );
      } else {
        // Geolocation 미지원 시 기본 위치 사용
        console.warn('[KakaoMapRecommendation] Geolocation is not supported by this browser.');
        resolve(defaultLocation);
      }
    });
  };

  /**
   * 카카오맵 지도 초기화
   * 현재 위치 또는 장소들의 중심으로 지도 표시
   */
  const initMap = (centerLat?: number, centerLng?: number, placesToShow: Place[] = places) => {
    if (!mapContainerRef.current || !window.kakao || !window.kakao.maps) {
      console.warn('[KakaoMapRecommendation] Map container or API not ready', {
        hasContainer: !!mapContainerRef.current,
        hasKakao: !!window.kakao,
        hasMaps: !!(window.kakao && window.kakao.maps)
      });
      return false;
    }

    const container = mapContainerRef.current;

    // getBoundingClientRect를 사용하여 실제 렌더링된 크기 확인
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width || container.offsetWidth;
    const containerHeight = rect.height || container.offsetHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('[KakaoMapRecommendation] Map container has no size, retrying...', {
        width: containerWidth,
        height: containerHeight,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        rect: { width: rect.width, height: rect.height }
      });
      setTimeout(() => initMap(centerLat, centerLng, placesToShow), 200);
      return false;
    }

    console.log('[KakaoMapRecommendation] 컨테이너 크기 확인:', {
      width: containerWidth,
      height: containerHeight,
      offsetWidth: container.offsetWidth,
      offsetHeight: container.offsetHeight
    });

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 기존 지도가 있으면 제거
    if (mapRef.current) {
      mapRef.current = null;
    }

    // 중심 좌표 결정: 장소가 있으면 장소들의 중심, 없으면 현재 위치 또는 기본 위치
    let lat = centerLat || currentLocation?.lat || 37.5665;
    let lng = centerLng || currentLocation?.lng || 126.9780;

    // 장소가 있으면 모든 장소가 보이도록 bounds 설정
    if (placesToShow.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      placesToShow.forEach(place => {
        bounds.extend(new window.kakao.maps.LatLng(place.y, place.x));
      });

      const mapOption = {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 5,
      };

      try {
        mapRef.current = new window.kakao.maps.Map(container, mapOption);
        mapRef.current.setBounds(bounds); // 모든 장소가 보이도록 조정

        window.kakao.maps.event.addListener(mapRef.current, 'resize', () => {
          mapRef.current.relayout();
        });

        return true;
      } catch (error) {
        console.error('[KakaoMapRecommendation] Failed to initialize map:', error);
        return false;
      }
    } else {
      // 장소가 없으면 현재 위치 중심으로 지도 표시
      const mapOption = {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 5,
      };

      try {
        mapRef.current = new window.kakao.maps.Map(container, mapOption);

        window.kakao.maps.event.addListener(mapRef.current, 'resize', () => {
          mapRef.current.relayout();
        });

        return true;
      } catch (error) {
        console.error('[KakaoMapRecommendation] Failed to initialize map:', error);
        return false;
      }
    }
  };

  /**
   * 현재 위치 마커 추가 (핑 모양)
   * 파란색 원형 마커로 현재 위치 표시
   */
  const addCurrentLocationMarker = (lat: number, lng: number) => {
    if (!mapRef.current || !window.kakao || !window.kakao.maps) {
      return;
    }

    // 기존 현재 위치 마커 제거
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
      currentLocationMarkerRef.current = null;
    }

    // 현재 위치 마커 생성 (커스텀 이미지 사용)
    const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'; // 빨간색 핑
    const imageSize = new window.kakao.maps.Size(24, 35);
    const imageOption = { offset: new window.kakao.maps.Point(12, 35) };
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

    const markerPosition = new window.kakao.maps.LatLng(lat, lng);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      image: markerImage,
      map: mapRef.current,
      zIndex: 1000, // 다른 마커보다 위에 표시
    });

    // 인포윈도우 생성
    const infowindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:5px;font-size:12px;text-align:center;">📍 현재 위치</div>',
    });

    // 마커 클릭 시 인포윈도우 표시
    window.kakao.maps.event.addListener(marker, 'click', () => {
      infowindow.open(mapRef.current, marker);
    });

    currentLocationMarkerRef.current = marker;
  };

  /**
   * 장소 마커 추가
   * 카카오맵에 장소 위치를 마커로 표시
   */
  const addPlaceMarkers = (placesToShow: Place[]) => {
    if (!mapRef.current || !window.kakao || !window.kakao.maps) {
      return;
    }

    // 기존 장소 마커만 제거 (현재 위치 마커는 유지)
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 장소가 없으면 마커 추가하지 않음
    if (placesToShow.length === 0) {
      return;
    }

    // 모든 장소에 마커 표시
    placesToShow.forEach((place) => {
      const markerPosition = new window.kakao.maps.LatLng(place.y, place.x);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: mapRef.current,
      });

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;white-space:nowrap;">${place.name}</div>`,
      });

      // 마커 클릭 시 인포윈도우 표시 및 장소 항목 강조 (플로우 8.2)
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 인포윈도우 닫기
        markersRef.current.forEach(m => {
          if (m.infowindow) {
            m.infowindow.close();
          }
        });
        infowindow.open(mapRef.current, marker);
        marker.infowindow = infowindow;

        // 해당 장소 항목 강조 표시 및 상세 정보 표시
        setSelectedPlace(place);

        // 지도 중심을 해당 장소로 이동
        const moveLatLon = new window.kakao.maps.LatLng(place.y, place.x);
        mapRef.current.setCenter(moveLatLon);
        mapRef.current.setLevel(3);
      });

      markersRef.current.push(marker);
    });

    // 모든 마커가 보이도록 지도 범위 조정 (현재 위치 포함)
    const bounds = new window.kakao.maps.LatLngBounds();
    placesToShow.forEach((place) => {
      bounds.extend(new window.kakao.maps.LatLng(place.y, place.x));
    });
    // 현재 위치도 bounds에 포함
    if (currentLocation) {
      bounds.extend(new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng));
    }
    mapRef.current.setBounds(bounds);
  };

  /**
   * 모달이 열릴 때 장소 추천 가져오기 및 지도 초기화
   */
  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때 지도 및 마커 정리
      if (mapRef.current) {
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
        if (currentLocationMarkerRef.current) {
          currentLocationMarkerRef.current.setMap(null);
          currentLocationMarkerRef.current = null;
        }
        mapRef.current = null;
      }
      setPlaces([]);
      setRecommendedFood(null);
      setCurrentLocation(null);
      return;
    }

    // [백엔드 API 호출] 장소 추천 가져오기
    fetchPlaceRecommendations();
  }, [isOpen, diaryId]);

  /**
   * 카카오맵 API 로드 및 지도 초기화
   * 장소가 없어도 지도는 표시되어야 함 (현재 위치 중심)
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // 로딩 중이어도 지도는 기본 위치로 표시 (currentLocation이 없어도)
    // 다만 currentLocation이 설정되면 지도가 업데이트됨

    // 카카오맵 API 로드 확인 및 지도 초기화
    const initializeMap = () => {
      if (!mapContainerRef.current || !window.kakao || !window.kakao.maps) {
        console.warn('[KakaoMapRecommendation] Map container or API not ready');
        return;
      }

      // 현재 위치가 있으면 사용, 없으면 기본 위치 사용
      const centerLat = currentLocation?.lat || 37.5665;
      const centerLng = currentLocation?.lng || 126.9780;

      // 지도 초기화 (장소가 없어도 지도는 표시)
      if (initMap(centerLat, centerLng)) {
        // 현재 위치 마커 추가 (핑 모양)
        if (currentLocation) {
          addCurrentLocationMarker(currentLocation.lat, currentLocation.lng);
        }

        // 장소가 있으면 마커 추가
        if (places.length > 0) {
          addPlaceMarkers(places);
        }
      }
    };

    // 카카오맵 JavaScript API 로드 확인 및 지도 초기화
    // index.html에 스크립트가 로드되어 있으므로 window.kakao가 존재해야 함
    const checkKakaoAPI = () => {
      if (window.kakao && window.kakao.maps) {
        // autoload=false이므로 수동으로 load 호출 필요
        if (window.kakao.maps.load) {
          window.kakao.maps.load(() => {
            // 지도 컨테이너가 준비될 때까지 대기
            const checkContainer = () => {
              if (mapContainerRef.current) {
                const width = mapContainerRef.current.offsetWidth;
                const height = mapContainerRef.current.offsetHeight;

                if (width > 0 && height > 0) {
                  console.log('[KakaoMapRecommendation] 컨테이너 준비 완료:', { width, height });
                  initializeMap();
                } else {
                  // 컨테이너가 아직 준비되지 않았으면 재시도
                  console.log('[KakaoMapRecommendation] 컨테이너 대기 중...', { width, height });
                  setTimeout(checkContainer, 100);
                }
              } else {
                setTimeout(checkContainer, 100);
              }
            };

            // 초기 지연 후 컨테이너 확인
            setTimeout(checkContainer, 200);
          });
        } else {
          // load 함수가 없으면 컨테이너 확인 후 초기화
          const checkContainer = () => {
            if (mapContainerRef.current) {
              const width = mapContainerRef.current.offsetWidth;
              const height = mapContainerRef.current.offsetHeight;

              if (width > 0 && height > 0) {
                initializeMap();
              } else {
                setTimeout(checkContainer, 100);
              }
            } else {
              setTimeout(checkContainer, 100);
            }
          };

          setTimeout(checkContainer, 200);
        }
        return true;
      }
      return false;
    };

    // 즉시 확인
    if (checkKakaoAPI()) {
      return;
    }

    // 스크립트가 아직 로드되지 않았으면 대기
    const checkInterval = setInterval(() => {
      if (checkKakaoAPI()) {
        clearInterval(checkInterval);
      }
    }, 100);

    // 최대 10초 대기
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.kakao || !window.kakao.maps) {
        console.error('[KakaoMapRecommendation] 카카오맵 API 로드 타임아웃');
        setError('카카오맵 API를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      }
    }, 10000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [isOpen, places, currentLocation]);

  // 지도 컨테이너 크기 변경 감지 및 지도 리사이즈
  useEffect(() => {
    if (!mapRef.current || !isOpen || places.length === 0) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        // 지도 크기 재조정
        mapRef.current.relayout();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isOpen, places.length]);

  /**
   * 장소 항목 선택 핸들러 (플로우 8.2)
   * - 해당 장소의 지도 마커로 지도 중심 이동
   * - 지도에서 해당 마커 강조 표시
   * - 상세 정보 영역에 확장 표시
   */
  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);

    // 지도 중심을 해당 장소로 이동
    if (mapRef.current && window.kakao && window.kakao.maps) {
      const moveLatLon = new window.kakao.maps.LatLng(place.y, place.x);
      mapRef.current.setCenter(moveLatLon);
      mapRef.current.setLevel(3);

      // 해당 마커의 인포윈도우 열기
      const marker = markersRef.current.find(m => {
        const markerPos = m.getPosition();
        return markerPos && Math.abs(markerPos.getLat() - place.y) < 0.0001 && Math.abs(markerPos.getLng() - place.x) < 0.0001;
      });

      if (marker && marker.infowindow) {
        // 다른 인포윈도우 닫기
        markersRef.current.forEach(m => {
          if (m.infowindow && m !== marker) {
            m.infowindow.close();
          }
        });
        marker.infowindow.open(mapRef.current, marker);
      }
    }
  };

  /**
   * 카카오맵에서 장소 보기 (플로우 8.2)
   * - 카카오맵 장소 상세 페이지 새 창으로 열기
   */
  /**
   * 카카오맵에서 장소 보기 (플로우 8.2)
   * - 카카오맵 장소 상세 페이지 새 창으로 열기
   * 
   * [참고: https://imdaxsz.tistory.com/47 - 4번 기능]
   * - /link/map/장소ID 패턴 사용 (모바일/PC 모두 지원)
   * - 모바일: '설치 없이 지도 보기' 또는 '카카오맵앱에서 열기' 옵션 제공
   * - PC: 바로 지도 화면으로 이동
   */
  const handleViewOnMap = (place: Place) => {
    // 카카오맵 링크 생성 (참고 사이트 4번 기능)
    // /link/map/장소ID 패턴 사용
    const mapUrl = place.url || `https://map.kakao.com/link/map/${place.id}`;
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * 지도 컨트롤 함수들 (플로우 8.2)
   */
  const handleZoomIn = () => {
    if (mapRef.current) {
      const level = mapRef.current.getLevel();
      mapRef.current.setLevel(level - 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const level = mapRef.current.getLevel();
      mapRef.current.setLevel(level + 1);
    }
  };

  /**
   * 지도 타입 전환 (플로우 8.2) - 현재 미사용 (추후 확장 가능)
   * - 일반지도, 스카이뷰, 하이브리드 전환
   */
  // const [mapType, setMapType] = useState<'ROADMAP' | 'SKYVIEW' | 'HYBRID'>('ROADMAP');

  // const handleMapTypeChange = () => {
  //   if (mapRef.current && window.kakao && window.kakao.maps) {
  //     // 지도 타입 순환: ROADMAP -> SKYVIEW -> HYBRID -> ROADMAP
  //     const nextType = mapType === 'ROADMAP' ? 'SKYVIEW' : mapType === 'SKYVIEW' ? 'HYBRID' : 'ROADMAP';
  //     setMapType(nextType);
  //     mapRef.current.setMapTypeId(window.kakao.maps.MapTypeId[nextType]);
  //   }
  // };

  const handleReloadLocation = async () => {
    const location = await getCurrentLocation();
    setCurrentLocation(location);

    if (mapRef.current && window.kakao && window.kakao.maps) {
      const moveLatLon = new window.kakao.maps.LatLng(location.lat, location.lng);
      mapRef.current.setCenter(moveLatLon);
      mapRef.current.setLevel(5);

      // 현재 위치 마커 업데이트
      addCurrentLocationMarker(location.lat, location.lng);
    }
  };

  if (!isOpen) return null;

  if (isInline) {
    return (
      <div className="w-full h-full bg-stone-50 flex flex-col min-h-0">
        <div className="p-4 border-b border-stone-200 bg-white shrink-0">
          <div className="flex items-start gap-3">
            <button
              onClick={onClose}
              className="mt-0.5 p-1.5 rounded-lg transition-colors text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 shrink-0"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-stone-800 break-keep leading-snug">
                {recommendedFood ? `오늘 같은 날 ${recommendedFood.name}은(는) 어때요?` : '오늘 같은 날 맛집은 어때요?'}
              </h3>
            </div>
          </div>
          {recommendedFood && recommendedFood.reason && (
            <div className="mt-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3.5 shadow-sm border border-orange-100/50">
              <div className="text-xs text-orange-700 mb-1.5 flex items-center gap-1.5 font-medium">
                <span>🍽️</span>
                <span>AI 음식 추천</span>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed font-medium break-words">
                {recommendedFood.reason}
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col min-h-0">
          {/* 지도 영역 - 별도 박스로 표시 */}
          <div className="w-full flex-shrink-0 relative border-b border-stone-200 overflow-hidden" style={{ height: '350px' }}>
            <div
              ref={mapContainerRef}
              className="w-full h-full bg-stone-100"
            />

            {/* 지도 컨트롤 버튼들 (플로우 8.2) - 지도 우측 상단에 배치 */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-50 pointer-events-auto">
              {/* 줌 인/아웃 */}
              {/* 줌 인/아웃 및 현재 위치 (하나의 그룹으로 통합) */}
              <div className="bg-white rounded-lg shadow-lg border border-stone-200 overflow-hidden flex flex-col">
                <button
                  onClick={handleZoomIn}
                  className="p-2.5 hover:bg-stone-50 active:bg-stone-100 transition-colors border-b border-stone-200"
                  aria-label="줌 인"
                  title="줌 인"
                >
                  <ZoomIn className="w-4 h-4 text-stone-700" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2.5 hover:bg-stone-50 active:bg-stone-100 transition-colors border-b border-stone-200"
                  aria-label="줌 아웃"
                  title="줌 아웃"
                >
                  <ZoomOut className="w-4 h-4 text-stone-700" />
                </button>
                <button
                  onClick={handleReloadLocation}
                  className="p-2.5 hover:bg-stone-50 active:bg-stone-100 transition-colors"
                  aria-label="현재 위치 재확인"
                  title="현재 위치 재확인"
                >
                  <Navigation className="w-4 h-4 text-emerald-600" />
                </button>
              </div>
            </div>
          </div>

          {/* AI 기반 음식 추천 표시 (플로우 8.2) - hideFoodRecommendation이 false일 때만 표시 */}
          {!hideFoodRecommendation && recommendedFood && (
            <div className="p-4 border-b border-stone-200 bg-gradient-to-r from-orange-50 to-amber-50 shrink-0">
              <div className="text-xs text-orange-700 mb-1 flex items-center gap-1.5">
                <span>🍽️</span>
                <span className="font-medium">AI 음식 추천</span>
              </div>
              <div className="text-sm font-semibold text-slate-800 mb-1">
                {recommendedFood.name}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {recommendedFood.reason}
              </p>
            </div>
          )}

          {/* 장소 리스트 영역 - 항상 아래에 표시 */}
          <div className="flex-1 bg-white min-h-0">

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 p-4">
                <Loader2 className="w-6 h-6 text-stone-400 animate-spin mb-2" />
                <div className="text-stone-500 text-sm">장소를 검색하는 중...</div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 p-4">
                <div className="text-red-500 mb-2">
                  <X className="w-8 h-8" />
                </div>
                <p className="text-stone-700 text-sm text-center font-medium mb-2">{error}</p>
                <p className="text-stone-500 text-xs text-center">
                  백엔드 서버가 실행 중인지 확인하거나, 잠시 후 다시 시도해주세요.
                </p>
              </div>
            ) : places.length === 0 ? (
              <div className="flex items-center justify-center h-64 p-4">
                <p className="text-stone-500 text-sm text-center">추천할 장소를 찾지 못했습니다.</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* 정렬 옵션 (플로우 8.2) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-600 font-medium">정렬:</span>
                  <div className="flex bg-stone-100 p-1 rounded-lg">
                    <button
                      onClick={() => handleSortChange('distance')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === 'distance'
                        ? 'bg-white text-stone-800 shadow-sm'
                        : 'text-stone-500 hover:text-stone-700'
                        }`}
                    >
                      거리순
                    </button>
                    <button
                      onClick={() => handleSortChange('name')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === 'name'
                        ? 'bg-white text-stone-800 shadow-sm'
                        : 'text-stone-500 hover:text-stone-700'
                        }`}
                    >
                      이름순
                    </button>
                  </div>
                </div>

                {/* 장소 목록 */}
                <div className="space-y-3">
                  {places.map((place) => {
                    // 거리 포맷팅 (표시용)
                    const distanceStr = typeof place.distance === 'string'
                      ? place.distance
                      : place.distance < 1000
                        ? `${Math.round(place.distance)}m`
                        : `${(place.distance / 1000).toFixed(1)}km`;

                    const isSelected = selectedPlace?.id === place.id;

                    return (
                      <div
                        key={place.id}
                        className={`bg-stone-50 rounded-lg p-4 border transition-all cursor-pointer ${isSelected
                          ? 'bg-emerald-50 border-emerald-400 shadow-md'
                          : 'border-stone-200 hover:bg-stone-100 hover:border-emerald-300'
                          }`}
                        onClick={() => handlePlaceSelect(place)}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className={`w-5 h-5 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-emerald-600'}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-stone-800 mb-1 truncate">{place.name}</h4>
                            {place.category && (
                              <p className="text-xs text-stone-500 mb-1">{place.category}</p>
                            )}
                            <p className="text-sm text-stone-600 mb-1 line-clamp-2">
                              {place.roadAddress || place.address}
                            </p>

                            {/* 상세 정보 (플로우 8.2) - 선택된 장소에만 확장 표시 */}
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-stone-200 space-y-2 animate-in slide-in-from-top-2">
                                {place.phone && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-stone-500">전화번호:</span>
                                    <span className="text-xs text-stone-700">{place.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {place.distance && (
                                      <span className="text-xs text-stone-500">
                                        거리: {distanceStr}
                                      </span>
                                    )}
                                    {place.rating && (
                                      <span className="text-xs text-stone-500">
                                        평점: ⭐ {place.rating.toFixed(1)}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewOnMap(place);
                                    }}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                                  >
                                    카카오맵에서 자세히 보기
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* 기본 정보 (선택되지 않은 경우) */}
                            {!isSelected && (
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  {place.distance && (
                                    <span className="text-xs text-stone-500">
                                      {distanceStr}
                                    </span>
                                  )}
                                  {place.rating && (
                                    <span className="text-xs text-stone-500">
                                      ⭐ {place.rating.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 모달 모드
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">
        <div className="p-5 border-b border-stone-200 bg-white">
          <div className="flex items-start gap-3">
            <button
              onClick={onClose}
              className="mt-1 p-1.5 rounded-lg transition-colors text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 shrink-0"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-stone-800 break-keep leading-tight">
                {recommendedFood ? `오늘 같은 날 ${recommendedFood.name}은(는) 어때요?` : '오늘 같은 날 맛집은 어때요?'}
              </h3>
            </div>
          </div>
          {recommendedFood && recommendedFood.reason && (
            <div className="mt-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 shadow-sm border border-orange-100/50">
              <div className="text-xs text-orange-700 mb-2 flex items-center gap-1.5 font-medium">
                <span>🍽️</span>
                <span>AI 음식 추천</span>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed font-medium break-words">
                {recommendedFood.reason}
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
          {/* 지도 영역 - 반응형 */}
          <div className="flex-1 min-w-0 min-h-[50vh] sm:min-h-[60vh] relative">
            <div
              ref={mapContainerRef}
              className="w-full h-full"
            />

            {/* 지도 컨트롤 버튼들 (플로우 8.2) - 지도 우측 상단에 배치 */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-50">
              {/* 줌 인/아웃 */}
              {/* 줌 인/아웃 및 현재 위치 (하나의 그룹으로 통합) */}
              <div className="bg-white rounded-lg shadow-lg border border-stone-300 overflow-hidden flex flex-col">
                <button
                  onClick={handleZoomIn}
                  className="p-2.5 hover:bg-stone-50 active:bg-stone-100 transition-colors border-b border-stone-200"
                  aria-label="줌 인"
                  title="줌 인"
                >
                  <ZoomIn className="w-4 h-4 text-stone-700" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2.5 hover:bg-stone-50 active:bg-stone-100 transition-colors border-b border-stone-200"
                  aria-label="줌 아웃"
                  title="줌 아웃"
                >
                  <ZoomOut className="w-4 h-4 text-stone-700" />
                </button>
                <button
                  onClick={handleReloadLocation}
                  className="p-2.5 hover:bg-stone-50 active:bg-stone-100 transition-colors"
                  aria-label="현재 위치 재확인"
                  title="현재 위치 재확인"
                >
                  <Navigation className="w-4 h-4 text-emerald-600" />
                </button>
              </div>
            </div>
          </div>

          {/* 장소 리스트 영역 - 반응형 */}
          <div className="w-full sm:w-80 md:w-96 border-t sm:border-t-0 sm:border-l border-stone-200 overflow-y-auto scrollbar-hide bg-white max-h-[40vh] sm:max-h-none">
            <div className="p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="w-6 h-6 text-stone-400 animate-spin mb-2" />
                  <div className="text-stone-500 text-sm">장소를 검색하는 중...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-stone-500 text-sm">{error}</p>
                </div>
              ) : places.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-stone-500 text-sm">추천할 장소를 찾지 못했습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {places.map((place) => (
                    <div
                      key={place.id}
                      className="bg-stone-50 rounded-lg p-4 border border-stone-200 hover:bg-stone-100 hover:border-emerald-300 transition-all cursor-pointer"
                      onClick={() => {
                        // 클릭 시 해당 장소로 지도 이동
                        if (mapRef.current) {
                          const moveLatLon = new window.kakao.maps.LatLng(place.y, place.x);
                          mapRef.current.setCenter(moveLatLon);
                          mapRef.current.setLevel(3);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-stone-800 mb-1 truncate">{place.name}</h4>
                          <p className="text-sm text-stone-600 mb-1 line-clamp-2">
                            {place.roadAddress || place.address}
                          </p>
                          {place.phone && (
                            <p className="text-xs text-stone-500 mb-2">{place.phone}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              {place.distance && (
                                <span className="text-xs text-stone-500">
                                  {typeof place.distance === 'string' ? place.distance : `${place.distance}m`}
                                </span>
                              )}
                              {place.rating && (
                                <span className="text-xs text-stone-500">
                                  ⭐ {place.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewOnMap(place);
                              }}
                              className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              지도에서 보기
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

