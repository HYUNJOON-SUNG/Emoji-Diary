/**
 * ========================================
 * 카카오맵 장소 추천 컴포넌트
 * ========================================
 * 
 * 감정 기반 장소 추천 기능
 * - 일기 저장 시점에 추천된 음식을 기반으로 주변 장소 검색 및 표시
 * - 인라인 모드와 모달 모드 지원
 * 
 * [백엔드 API 연동]
 * - GET /api/places/recommendations 엔드포인트 사용
 * - 일기 ID(diaryId)를 받아서 일기의 recommendedFood 기반으로 장소 검색
 * - 현재는 Mock 데이터 사용, 백엔드 연동 시 실제 API 호출
 * 
 * [카카오맵 JavaScript API]
 * - 지도 표시 및 마커 표시용으로만 사용
 * - 장소 검색은 백엔드에서 카카오 로컬 API 사용
 * 
 * [플로우 8.2: 장소 추천 화면] (사용자 기반 상세기능명세서.md)
 * - AI 기반 음식 추천: 일기 저장 시점에 추천된 음식 조회 (DB에서 조회)
 * - 카카오 로컬 API 장소 검색: AI가 추천한 음식을 키워드로 카카오 로컬 API 호출
 * - 현재 위치 기준 반경 5km 이내 장소 검색
 * - 검색 결과 최대 15개까지 표시
 */

import { useState, useEffect, useRef } from 'react';
import { MapPin, X, ExternalLink, Loader2 } from 'lucide-react';
import { getPlaceRecommendations, type Place, type PlaceRecommendationResponse } from '@/services/placeApi';

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
}

/**
 * Place 인터페이스는 placeApi.ts에서 import
 * 여기서는 사용하지 않음 (중복 방지)
 */

export function KakaoMapRecommendation({
  isOpen,
  onClose,
  diaryId,
  emotion,
  emotionCategory,
  isInline = false,
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

  /**
   * [백엔드 API 호출] 장소 추천 가져오기
   * 
   * diaryId가 있으면 백엔드 API 호출 (권장 방식)
   * diaryId가 없으면 현재 위치만 가져와서 지도 표시
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

      // [백엔드 팀] 실제 API 호출
      // 현재는 Mock 데이터 사용
      console.log('[KakaoMapRecommendation] 장소 추천 요청:', { diaryId, lat: location.lat, lng: location.lng });
      
      const response: PlaceRecommendationResponse = await getPlaceRecommendations({
        diaryId,
        lat: location.lat,
        lng: location.lng,
        radius: 5000, // 5km 반경
      });

      console.log('[KakaoMapRecommendation] 장소 추천 응답:', response);

      // 음식 추천 정보 저장
      setRecommendedFood(response.recommendedFood);

      // 거리를 문자열로 변환 (표시용)
      const placesWithFormattedDistance: Place[] = response.places.map(place => ({
        ...place,
        distance: place.distance < 1000 
          ? `${Math.round(place.distance)}m` 
          : `${(place.distance / 1000).toFixed(1)}km`
      } as Place & { distance: string }));

      console.log('[KakaoMapRecommendation] 변환된 장소 목록:', placesWithFormattedDistance);
      setPlaces(placesWithFormattedDistance as any);
    } catch (err: any) {
      console.error('[KakaoMapRecommendation] 장소 추천 가져오기 실패:', err);
      setError(err.message || '장소 추천을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
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
      return false;
    }

    const container = mapContainerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('[KakaoMapRecommendation] Map container has no size, retrying...');
      setTimeout(() => initMap(centerLat, centerLng, placesToShow), 200);
      return false;
    }

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

      // 마커 클릭 시 인포윈도우 표시
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 인포윈도우 닫기
        markersRef.current.forEach(m => {
          if (m.infowindow) {
            m.infowindow.close();
          }
        });
        infowindow.open(mapRef.current, marker);
        marker.infowindow = infowindow;
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
    if (!isOpen || loading) {
      return;
    }

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

    // 이미 스크립트가 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
      window.kakao.maps.load(() => {
        setTimeout(initializeMap, 100);
      });
      return;
    }

    // 스크립트 로드 대기
    const checkInterval = setInterval(() => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        clearInterval(checkInterval);
        window.kakao.maps.load(() => {
          setTimeout(initializeMap, 100);
        });
      }
    }, 100);

    // 최대 10초 대기
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.kakao || !window.kakao.maps) {
        console.error('[KakaoMapRecommendation] API load timeout');
        setError('카카오맵 API를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      }
    }, 10000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [isOpen, loading, places, currentLocation]);

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

  // 카카오맵에서 장소 보기
  const handleViewOnMap = (place: Place) => {
    if (place.url) {
      window.open(place.url, '_blank');
    } else {
      // URL이 없으면 카카오맵 검색 URL 생성
      const searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(place.name)}`;
      window.open(searchUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  if (isInline) {
    return (
      <div className="w-full h-full bg-stone-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-stone-800">
              감정에 맞는 장소 추천
            </h3>
            {recommendedFood && (
              <p className="text-sm text-stone-600 mt-1">
                추천 음식: <span className="font-medium">{recommendedFood.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
          {/* 지도 영역 - 반응형 */}
          <div className="flex-1 min-w-0 min-h-[50vh] sm:min-h-0">
            <div
              ref={mapContainerRef}
              className="w-full h-full"
            />
          </div>

          {/* 장소 리스트 영역 - 반응형 */}
          <div className="w-full sm:w-80 md:w-96 border-t sm:border-t-0 sm:border-l border-stone-200 overflow-y-auto bg-white max-h-[40vh] sm:max-h-none">
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
                      className="bg-stone-50 rounded-lg p-4 border border-stone-200 hover:bg-stone-100 hover:border-blue-300 transition-all cursor-pointer"
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
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
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
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
    );
  }

  // 모달 모드
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-stone-800">
              감정에 맞는 장소 추천
            </h3>
            {recommendedFood && (
              <p className="text-sm text-stone-600 mt-1">
                추천 음식: <span className="font-medium">{recommendedFood.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
          {/* 지도 영역 - 반응형 */}
          <div className="flex-1 min-w-0 min-h-[50vh] sm:min-h-[60vh]">
            <div
              ref={mapContainerRef}
              className="w-full h-full"
            />
          </div>

          {/* 장소 리스트 영역 - 반응형 */}
          <div className="w-full sm:w-80 md:w-96 border-t sm:border-t-0 sm:border-l border-stone-200 overflow-y-auto bg-white max-h-[40vh] sm:max-h-none">
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
                      className="bg-stone-50 rounded-lg p-4 border border-stone-200 hover:bg-stone-100 hover:border-blue-300 transition-all cursor-pointer"
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
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
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
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
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

