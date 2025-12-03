/**
 * ========================================
 * 카카오맵 장소 추천 컴포넌트
 * ========================================
 * 
 * 감정 기반 장소 추천 기능
 * - 감정에 맞는 장소를 카카오맵 API로 검색 및 표시
 * - 인라인 모드와 모달 모드 지원
 * 
 * [카카오맵 API 연동]
 * - JavaScript 키: 1a1db627800887a2a4531fa6e4bd07bc
 * - Places API를 사용하여 장소 검색
 * - 사용자 위치 기반 주변 장소 추천
 */

import { useState, useEffect, useRef } from 'react';
import { MapPin, X, ExternalLink, Loader2 } from 'lucide-react';

// 카카오맵 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

interface Place {
  id: string;
  name: string;
  address: string;
  roadAddress?: string;
  phone?: string;
  distance?: string;
  x: number; // 경도
  y: number; // 위도
  category?: string;
  url?: string;
}

interface KakaoMapRecommendationProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 감정 타입 */
  emotion: string;
  /** 감정 카테고리 */
  emotionCategory: string;
  /** 인라인 모드 (모달이 아닌 페이지 내 표시) */
  isInline?: boolean;
}

export function KakaoMapRecommendation({
  isOpen,
  onClose,
  emotion,
  emotionCategory,
  isInline = false,
}: KakaoMapRecommendationProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 감정에 따른 장소 추천 키워드 매핑
  const getRecommendationKeywords = (emotion: string, category: string): string[] => {
    const keywordMap: { [key: string]: string[] } = {
      happy: ['카페', '공원', '전시회', '영화관'],
      sad: ['카페', '서점', '도서관', '공원'],
      angry: ['운동', '헬스장', '산책로', '공원'],
      anxious: ['요가', '명상', '카페', '공원'],
      excited: ['놀이공원', '전시회', '카페', '영화관'],
      calm: ['카페', '서점', '공원', '도서관'],
      neutral: ['카페', '공원', '서점', '전시회'],
    };

    return keywordMap[emotion] || keywordMap[category] || ['카페', '공원'];
  };

  // 카카오맵 API로 장소 검색 (현재 위치 기반)
  const searchPlaces = async (keyword: string): Promise<Place[]> => {
    return new Promise((resolve, reject) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        reject(new Error('카카오맵 API가 로드되지 않았습니다.'));
        return;
      }

      const ps = new window.kakao.maps.services.Places();

      // 현재 위치 가져오기 (기본값: 서울시청)
      getCurrentLocation().then((location) => {
        performSearch(keyword, location.lat, location.lng, ps, resolve, reject);
      });
    });
  };

  const performSearch = (
    keyword: string,
    lat: number,
    lng: number,
    ps: any,
    resolve: (places: Place[]) => void,
    reject: (error: Error) => void
  ) => {
    // 키워드로 장소 검색
    ps.keywordSearch(keyword, (data: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        // 거리순으로 정렬
        const placesWithDistance = data
          .slice(0, 5) // 최대 5개만
          .map((place) => {
            const placeLat = parseFloat(place.y);
            const placeLng = parseFloat(place.x);
            const distance = calculateDistance(lat, lng, placeLat, placeLng);
            
            return {
              id: place.id,
              name: place.place_name,
              address: place.address_name,
              roadAddress: place.road_address_name,
              phone: place.phone,
              distance: distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`,
              x: placeLng,
              y: placeLat,
              category: place.category_name,
              url: place.place_url,
            };
          })
          .sort((a, b) => {
            const distA = parseFloat(a.distance?.replace('km', '') || '0');
            const distB = parseFloat(b.distance?.replace('km', '') || '0');
            return distA - distB;
          });

        resolve(placesWithDistance);
      } else {
        reject(new Error('장소 검색에 실패했습니다.'));
      }
    }, {
      location: new window.kakao.maps.LatLng(lat, lng),
      radius: 5000, // 5km 반경
    });
  };

  // 두 좌표 간 거리 계산 (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // 현재 위치 가져오기
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
            console.warn('Geolocation error:', error);
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
        console.warn('Geolocation is not supported by this browser.');
        resolve(defaultLocation);
      }
    });
  };

  // 카카오맵 지도 초기화 (위치 기반)
  const initMapWithLocation = (lat: number, lng: number) => {
    if (!mapContainerRef.current || !window.kakao || !window.kakao.maps) {
      return false;
    }

    // 지도 컨테이너의 실제 크기 확인
    const container = mapContainerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // 컨테이너 크기가 0이면 지도 초기화 불가
    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('Map container has no size, retrying...');
      setTimeout(() => initMapWithLocation(lat, lng), 200);
      return false;
    }

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 기존 지도가 있으면 제거
    if (mapRef.current) {
      mapRef.current = null;
    }

    const mapOption = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 5, // 확대 레벨
    };

    try {
      mapRef.current = new window.kakao.maps.Map(container, mapOption);

      // 지도 크기 조정 (반응형 대응)
      window.kakao.maps.event.addListener(mapRef.current, 'resize', () => {
        mapRef.current.relayout();
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize map:', error);
      return false;
    }
  };

  // 장소 마커 추가
  const addPlaceMarkers = (places: Place[]) => {
    if (!mapRef.current || !window.kakao || !window.kakao.maps || places.length === 0) {
      return;
    }

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 모든 장소에 마커 표시
    places.forEach((place) => {
      const markerPosition = new window.kakao.maps.LatLng(place.y, place.x);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: mapRef.current,
      });

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;">${place.name}</div>`,
      });

      // 마커 클릭 시 인포윈도우 표시
      window.kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // 모든 마커가 보이도록 지도 범위 조정
    if (places.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      places.forEach((place) => {
        bounds.extend(new window.kakao.maps.LatLng(place.y, place.x));
      });
      mapRef.current.setBounds(bounds);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때 지도 및 마커 정리
      if (mapRef.current) {
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
        mapRef.current = null;
      }
      return;
    }

    setLoading(true);
    setError(null);
    setPlaces([]);

    // 블로그 글 방식: 지도만 표시 (기본 위치: 서울시청)
    const initMap = () => {
      if (!mapContainerRef.current || !window.kakao || !window.kakao.maps) {
        console.warn('[KakaoMap] Map container or API not ready');
        return;
      }

      const container = mapContainerRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      if (containerWidth === 0 || containerHeight === 0) {
        console.warn('[KakaoMap] Container has no size, retrying...');
        setTimeout(initMap, 200);
        return;
      }

      // 기존 지도 제거
      if (mapRef.current) {
        mapRef.current = null;
      }

      // 기본 위치: 서울시청
      const defaultLat = 37.5665;
      const defaultLng = 126.9780;

      const options = {
        center: new window.kakao.maps.LatLng(defaultLat, defaultLng),
        level: 3,
      };

      try {
        mapRef.current = new window.kakao.maps.Map(container, options);
        console.log('[KakaoMap] Map initialized successfully');
        setLoading(false);

        // 지도 크기 조정 (반응형 대응)
        window.kakao.maps.event.addListener(mapRef.current, 'resize', () => {
          mapRef.current.relayout();
        });
      } catch (error) {
        console.error('[KakaoMap] Failed to initialize map:', error);
        setError('지도를 초기화할 수 없습니다.');
        setLoading(false);
      }
    };

    // 이미 스크립트가 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
      console.log('[KakaoMap] API already loaded');
      window.kakao.maps.load(() => {
        setTimeout(initMap, 100);
      });
      return;
    }

    // index.html에 스크립트가 이미 있으므로 로드 완료만 대기
    console.log('[KakaoMap] Waiting for script to load from index.html...');
    
    const checkInterval = setInterval(() => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        clearInterval(checkInterval);
        console.log('[KakaoMap] API loaded, initializing maps...');
        window.kakao.maps.load(() => {
          console.log('[KakaoMap] Maps API ready');
          setTimeout(initMap, 100);
        });
      }
    }, 100);

    // 최대 10초 대기
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.kakao || !window.kakao.maps) {
        console.error('[KakaoMap] API load timeout');
        console.error('[KakaoMap] window.kakao:', window.kakao);
        setError('카카오맵 API를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
        setLoading(false);
      }
    }, 10000);

    // cleanup 함수
    return () => {
      // 스크립트는 전역적으로 사용되므로 제거하지 않음
    };
  }, [isOpen, isInline]);

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
          <h3 className="text-lg font-semibold text-stone-800">
            감정에 맞는 장소 추천
          </h3>
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
                            {place.distance && (
                              <span className="text-xs text-stone-500">{place.distance}</span>
                            )}
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
          <h3 className="text-lg font-semibold text-stone-800">
            감정에 맞는 장소 추천
          </h3>
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
                            {place.distance && (
                              <span className="text-xs text-stone-500">{place.distance}</span>
                            )}
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

