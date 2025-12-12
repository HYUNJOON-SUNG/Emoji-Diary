/**
 * ========================================
 * 일기 상세보기 페이지 컴포넌트 (DaySummaryPage)
 * ========================================
 * 
 * 주요 기능 (플로우 3.1, 4.1, 5.2, 6.3):
 * - 선택한 날짜의 일기 조회
 * - 일기가 있는 경우: 전체 내용 표시 + 수정/삭제/장소 추천 버튼
 * - 일기가 없는 경우: \"일기 작성하기\" 버튼 표시
 * - 감정 기반 장소 추천 (카카오맵)
 * - 뒤로가기 버튼 (플로우 6.3)
 * 
 * [플로우 4.1: 일기 수정 시작]
 * 
 * **진입 경로**:
 * 1. 캘린더 화면에서 날짜 클릭
 * 2. → 일기 상세보기 페이지 표시
 * 3. → 해당 날짜에 일기 있음
 * 4. → "수정하기" 버튼 클릭
 * 5. → 일기 작성 페이지로 이동
 * 
 * - DiaryWritingPage에서 기존 데이터 자동 로드
 * 
 * [플로우 5.2: 일기 상세보기]
 * 
 * **화면**: 일기 상세보기 페이지 (좌우 2페이지)
 * - 좌측 페이지: 선택된 날짜가 속한 달의 캘린더 + `<` `>` (월 이동) 버튼
 * - 우측 페이지: 선택된 날짜의 일기 내용
 * 
 * **월 이동 (우측이 일기 상세보기일 때)**:
 * - 좌측 페이지의 `<` (이전 달) 버튼 클릭:
 *   * 좌측: 이전 달 캘린더로 변경
 *   * 우측: 일기 상세보기 유지 (해당 날짜가 다른 달로 이동한 경우 달력만 업데이트)
 *   * 해당 월 감정 데이터 자동 로드
 * - 좌측 페이지의 `>` (다음 달) 버튼 클릭:
 *   * 좌측: 다음 달 캘린더로 변경
 *   * 우측: 일기 상세보기 유지
 *   * 해당 월 감정 데이터 자동 로드
 * 
 * **일기 있는 경우 표시 내용**:
 * - 날짜 및 요일 표시
 * - 제목
 * - 감정 이모지
 * - 기분 및 활동 태그
 * - 날씨
 * - 본문 내용
 * - AI 생성 이미지 (있는 경우)
 * - AI 코멘트 (선택한 페르소나 말투)
 * 
 * **사용자 액션**:
 * 1. **"수정하기" 버튼**:
 *    - 클릭 → 일기 작성 페이지로 이동 (기존 내용 로드)
 * 
 * 2. **"장소 추천" 버튼** (일기 있는 경우에만 표시):
 *    - 클릭 → 장소 추천 화면으로 이동
 *    - 감정 카테고리 기반으로 주변 장소 추천
 * 
 * 3. **"삭제" 버튼**:
 *    - 클릭 → 삭제 확인 모달 표시
 *    - 모달에서 "삭제" 확인 → 일기 삭제 API 호출
 *    - 삭제 성공 시:
 *      * 해당 날짜의 일기 데이터 삭제
 *      * 캘린더로 이동
 *      * 해당 날짜의 감정 이모지 자동 제거 (빈 날짜로 표시)
 *    - "취소" → 모달 닫기
 * 
 * 4. **날짜 클릭 (좌측 캘린더)**:
 *    - 다른 날짜 선택 → 우측 페이지가 해당 날짜 상세보기로 전환
 *    - 좌측 페이지: 선택된 날짜가 속한 달의 캘린더로 업데이트
 * 
 * 5. **캘린더로 돌아가기**:
 *    - 우측 페이지 상단 "뒤로가기" 또는 "X" 버튼 클릭
 *    - 우측 페이지가 다시 다음 달 캘린더로 전환
 *    - 좌측 페이지의 `<` 버튼, 우측 페이지의 `>` 버튼으로 변경
 * 
 * **일기 없는 경우**:
 * - "아직 작성된 일기가 없어요" 메시지 표시
 * - "일기 작성하기" 버튼 클릭 → 일기 작성 페이지로 이동
 * 
 * [플로우 6.3: 검색 결과 상세보기]
 * - 검색 페이지에서 일기 클릭 시 상세보기로 이동
 * - 우측 상단 "X" 버튼 클릭 시 검색 페이지로 복귀
 * - 검색 키워드 및 필터 상태 유지
 * - 선택했던 페이지 위치 유지
 * 
 * 디자인:
 * - 양페이지 레이아웃 (왼쪽: 캘린더, 오른쪽: 일기 내용)
 * - 종이 질감 배경
 * - 파란색 톤온톤 컬러
 */

import { useState, useEffect } from 'react';
import { CalendarDays, Loader2, Edit, Trash2, MapPin, Sparkles, X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchDiaryDetails, DiaryDetail, deleteDiary } from '../../services/diaryApi';
import { KakaoMapRecommendation } from './KakaoMapRecommendation';
// HMR Force Update

import { getEmotionImage } from '../../utils/emotionImages';



/**
 * 감정 한글 → 카테고리 변환 함수
 * 
 * [API 명세서 참고]
 * - emotionCategory는 프론트엔드에서 계산 (positive/neutral/negative)
 */
const getEmotionCategory = (emotion: string): string => {
  const emotionCategoryMap: { [key: string]: string } = {
    '행복': 'positive',
    '중립': 'neutral',
    '당황': 'neutral',
    '슬픔': 'negative',
    '분노': 'negative',
    '불안': 'negative',
    '혐오': 'negative',
  };
  // 이미 카테고리인 경우 그대로 반환, 한글인 경우 변환
  if (emotion === 'positive' || emotion === 'neutral' || emotion === 'negative') {
    return emotion;
  }
  return emotionCategoryMap[emotion] || 'neutral';
};

/**
 * DaySummaryPage 컴포넌트 Props
 */
interface DaySummaryPageProps {
  selectedDate: Date | null; // 선택된 날짜
  onDataChange?: () => void; // 데이터 변경 콜백 (플로우 13.1: 삭제 후 새로고침)
  onEdit?: () => void; // 수정 버튼 클릭 콜백
  onStartWriting?: () => void; // "일기 작성하기" 버튼 클릭 콜백
  onBackToCalendar?: () => void; // 뒤로가기 콜백 (플로우 6.3: 이전 화면으로 복귀)
  onMapRecommendation?: (emotion: string, emotionCategory: string, diaryId?: string) => void; // 장소 추천 콜백 (diaryId 포함)
}

export function DaySummaryPage({ selectedDate, onDataChange, onEdit, onStartWriting, onBackToCalendar, onMapRecommendation }: DaySummaryPageProps) {
  // ========== 상태 관리 ==========
  
  /**
   * 일기 데이터
   * - null: 일기 없음 (작성 안됨)
   * - DiaryDetail: 일기 데이터 (작성됨)
   */
  const [entry, setEntry] = useState<DiaryDetail | null>(null);
  
  /**
   * 로딩 상태 (일기 조회 중 또는 삭제 중)
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * 삭제 확인 모달 표시 여부
   */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  /**
   * 장소 추천 모달 표시 여부
   */
  const [showMapRecommendation, setShowMapRecommendation] = useState(false);
  
  /**
   * 이미지 갤러리 모달 표시 여부
   */
  const [showImageGallery, setShowImageGallery] = useState(false);
  
  /**
   * 이미지 갤러리에서 현재 보고 있는 이미지 인덱스
   */
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ========== 데이터 로드 ==========
  
  /**
   * 선택된 날짜가 변경되면 일기 데이터 로드
   */
  useEffect(() => {
    if (selectedDate) {
      loadDiaryDetails();
    } else {
      setEntry(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  /**
   * 일기 상세 데이터 로드 (플로우 3.1, 5.2)
   * 
   * [API 명세서 Section 4.4]
   * - 엔드포인트: GET /api/diaries/date/{date}
   * - URL Parameters: date (YYYY-MM-DD 형식)
   * - 응답 형식: DiaryDetail (제목, 본문, 감정, 기분, 날씨, 활동, AI 이미지, AI 코멘트 등)
   * - Response 404: 일기 없음 (해당 날짜에 작성된 일기가 없습니다)
   * 
   * [ERD 설계서 참고 - Diaries 테이블]
   * - Diaries 테이블에서 date 컬럼으로 조회
   * - 인덱스: idx_diaries_date, idx_diaries_user_date (조회 최적화)
   * - 관계: Diary_Activities, Diary_Images 테이블과 JOIN하여 activities, images 배열 반환
   * 
   * 동작:
   * 1. 날짜를 YYYY-MM-DD 형식으로 변환
   * 2. fetchDiaryDetails API 호출
   * 3. 데이터가 있으면: entry 상태에 저장 → 일기 내용 표시 (플로우 5.2)
   * 4. 데이터가 없으면: entry = null → "일기 작성하기" 버튼 표시 (플로우 5.2)
   * 
   * 플로우 5.2 표시 내용:
   * - 날짜 및 요일, 제목, 감정 이모지, 기분 및 활동 태그
   * - 날씨, 본문 내용, AI 생성 이미지, AI 코멘트
   */
  const loadDiaryDetails = async () => {
    if (!selectedDate) {
      setEntry(null);
      return;
    }

    setIsLoading(true);
    setEntry(null); // 로딩 시작 시 이전 데이터 초기화
    try {
      const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const data = await fetchDiaryDetails(dateKey);
      setEntry(data); // null이거나 DiaryDetail 객체
    } catch (error: any) {
      // 404 에러는 정상 (일기 없음), 콘솔에 에러로 표시하지 않음
      if (error?.response?.status === 404) {
        setEntry(null);
        // 404는 정상적인 경우이므로 콘솔 로그만 출력 (에러 아님)
        console.log('[일기 상세 조회] 해당 날짜에 작성된 일기가 없습니다:', dateKey);
      } else {
        // 404가 아닌 다른 에러만 콘솔에 에러로 표시
        console.error('Failed to load diary details:', error);
        setEntry(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 이벤트 핸들러 ==========
  
  /**
   * 일기 삭제 핸들러 (플로우 5.2, 13.1)
   * 
   * API:
   * - deleteDiary(id, dateKey)
   * - DELETE /api/diaries/{id}
   * - 응답: 성공 여부
   * 
   * 동작 (플로우 5.2):
   * 1. 삭제 확인 모달 표시 → 사용자 확인
   * 2. deleteDiary API 호출
   * 3. 해당 날짜의 일기 데이터 삭제
   * 4. entry 상태 초기화 (null)
   * 5. 삭제 확인 모달 닫기
   * 6. 데이터 변경 콜백 호출 (플로우 13.1):
   *    - onDataChange() → DiaryBook의 handleDataChange()
   *    - refreshKey 증가
   *    - CalendarPage의 useEffect 트리거
   *    - 월별 감정 데이터 자동 재조회
   *    - 캘린더 히트맵 자동 업데이트
   *    - 해당 날짜의 감정 이모지 자동 제거
   *    - 빈 날짜로 표시
   * 7. 캘린더로 돌아가기
   * 
   * 플로우 5.2 요구사항:
   * - 삭제 성공 시 해당 날짜의 감정 이모지 자동 제거 (빈 날짜로 표시)
   * - 캘린더로 이동
   * 
   * 플로우 13.1 요구사항:
   * - 일기 삭제 후 자동 새로고침
   * - 관련 데이터 자동 재조회
   * - 화면 자동 업데이트
   * - 감정 스티커 자동 갱신
   * - 해당 날짜의 감정 이모지 제거, 빈 날짜로 표시
   * 
   * [API 명세서 Section 4.6] DELETE /api/diaries/{diaryId}
   * [ERD 설계서 참고 - Diaries 테이블] 소프트 삭제 (deleted_at 컬럼 업데이트)
   * 실제 구현:
   * - JWT 토큰으로 사용자 인증
   * - 해당 일기가 현재 사용자 것인지 권한 확인
   * - DB에서 일기 삭제
   * - 관련 데이터 삭제 (이미지 등)
   * - 성공 응답 반환
   */
  const handleDelete = async () => {
    if (!entry || !selectedDate) return;

    setIsLoading(true);
    try {
      const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      await deleteDiary(entry.id, dateKey);
      setEntry(null);
      setShowDeleteConfirm(false);
      
      // 데이터 새로고침 (플로우 13.1)
      if (onDataChange) {
        onDataChange(); // DiaryBook의 handleDataChange() 호출 → refreshKey 증가 → CalendarPage 자동 업데이트
      }
      
      // 삭제 후 캘린더로 돌아가기
      if (onBackToCalendar) {
        onBackToCalendar();
      }
    } catch (error) {
      console.error('Failed to delete diary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedDate) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2 py-12">
        <CalendarDays className="w-8 h-8" />
        <p className="text-xs text-center">날짜를 선택하면<br />일기를 확인할 수 있어요</p>
      </div>
    );
  }

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();
  const weekday = selectedDate.toLocaleDateString('ko-KR', { weekday: 'long' });
  const formattedDate = `${year}. ${month}. ${day}. ${weekday}`;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs">불러오는 중...</p>
      </div>
    );
  }

  // View Mode - Entry exists
  if (entry) {
    // 장소 추천 모드
    if (showMapRecommendation) {
      return (
        <div className="h-full w-full flex flex-col">
          <KakaoMapRecommendation
            isOpen={true}
            onClose={() => setShowMapRecommendation(false)}
            diaryId={entry.id} // 일기 ID 전달 (장소 추천 API 호출에 사용)
            emotion={entry.emotion}
            emotionCategory={entry.emotionCategory || getEmotionCategory(entry.emotion)}
            isInline={true}
            hideFoodRecommendation={true} // 일기 상세 조회에서는 AI 음식 추천 숨김 (중복 방지)
          />
        </div>
      );
    }

    // 일반 일기 보기 모드
    return (
      <div className="h-full w-full overflow-y-auto scrollbar-hide p-4 space-y-4"> {/* 모바일 최적화: 패딩 추가, 스크롤 가능 */}
        {/* 
          Date Header (플로우 6.3)
          
          구성:
          - 좌측: "오늘의 일기" + 날짜
          - 우측 상단: X 버튼 (뒤로가기)
          - 중앙: 감정 이모지
          
          플로우 6.3 요구사항:
          - X 버튼 클릭 시 onBackToCalendar 호출
          - 이전 화면으로 복귀 (검색 페이지 또는 캘린더)
          - 검색 키워드 및 필터 상태 유지
        */}
        <div className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {/* 뒤로가기 버튼 - 좌측 상단에 배치 */}
          {onBackToCalendar && (
            <button
              onClick={onBackToCalendar}
              className="absolute top-4 left-4 p-2 active:bg-gray-100 rounded-xl transition-colors text-blue-600 active:text-blue-700 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="뒤로가기"
            >
              {/* [디버깅용] 파란색 텍스트 - 테스트 완료 후 제거 가능 */}
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-start justify-between pr-10 pl-10">
            <div>
              <div className="text-xs text-stone-400 mb-1 font-medium">{formattedDate}</div>
              <div className="text-base text-gray-900 font-semibold whitespace-normal leading-snug pr-2">{entry.title}</div>
              
              {/* 활동 태그 (Header로 이동) */}
              {entry.activities && entry.activities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {entry.activities.map((activity, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg font-medium"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center">
              <img src={getEmotionImage(entry.emotion)} alt={entry.emotion} className="w-14 h-14 object-contain" />
            </div>
          </div>
        </div>



        {/* 사용자 업로드 이미지 (플로우 3.2, 4.3) */}


        {/* Mood & Weather Card - 2 Column */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 mb-1 font-medium">기분</div>
            <div className="text-sm text-gray-900 font-medium">{entry.mood || '-'}</div>
          </div>

          <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 mb-1 font-medium">날씨</div>
            <div className="text-sm text-gray-900 font-medium">{entry.weather || '맑음'}</div>
          </div>
        </div>

        {/* Activities Card */}


        {/* AI Generated Image */}
        {entry.imageUrl && (
          <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 mb-3 font-medium">AI 그림 일기</div>
            <div className="relative rounded-lg overflow-hidden bg-slate-100">
              <img 
                src={entry.imageUrl} 
                alt="AI Generated Diary Illustration"
                className="w-full rounded-lg"
                style={{
                  maxHeight: '400px',
                  objectFit: 'contain',
                  objectPosition: 'center'
                }}
              />
            </div>
          </div>
        )}

        {/* Content Card */}
        <div className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-500 mb-3 font-medium">오늘의 이야기</div>
          <div className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap break-words" style={{ 
            wordBreak: 'break-word', 
            overflowWrap: 'break-word',
            hyphens: 'auto'
          }}>
            {entry.content}
          </div>
        </div>

        {/* AI Comment Card */}
        {entry.aiComment && (
          <div className="relative bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-5 shadow-sm border border-blue-100">
            <div className="text-xs text-stone-800 mb-3 flex items-center gap-1.5 font-medium">
              <span>{(() => {
                const persona = localStorage.getItem('aiPersona') || 'friend';
                const personaMap: { [key: string]: string } = {
                  'friend': '💙',
                  'parent': '🤗',
                  'expert': '💼',
                  'mentor': '🎯',
                  'therapist': '🌸',
                  'poet': '✨'
                };
                return personaMap[persona] || '✨';
              })()}</span>
              <span>{(() => {
                const persona = localStorage.getItem('aiPersona') || 'friend';
                const nameMap: { [key: string]: string } = {
                  'friend': '베프',
                  'parent': '부모님',
                  'expert': '전문가',
                  'mentor': '멘토',
                  'therapist': '상담사',
                  'poet': '시인'
                };
                return nameMap[persona] || '베프';
              })()}의 코멘트</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {entry.aiComment}
            </p>
          </div>
        )}

        {/* 음식 추천 카드 (플로우 3.3, 4.3) */}
        {entry.recommendedFood && (
          <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 shadow-sm">
            <div className="text-xs text-orange-700 mb-2 flex items-center gap-1.5">
              <span>🍽️</span>
              <span>AI 음식 추천</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-800">
                {entry.recommendedFood.name}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {entry.recommendedFood.reason}
              </p>
            </div>
          </div>
        )}

        {/* 
          액션 버튼 영역 (플로우 4.1, 5.2)
          
          일기가 있을 때 표시되는 버튼:
          1. 수정하기 (파란색) - 플로우 4.1, 5.2
             - 클릭 시 일기 작성 페이지로 이동
             - 기존 일기 데이터 자동 로드
          2. 장소 추천 (초록색) - 플로우 5.2
             - 클릭 시 장소 추천 화면으로 이동
             - 감정 카테고리 기반으로 주변 장소 추천 (카카오맵)
          3. 삭제 (빨간색) - 플로우 5.2
             - 클릭 시 삭제 확인 모달 표시
        */}
        {/* 사용자 업로드 이미지 (플로우 3.2, 4.3) - 위치 이동됨: 음식 추천 아래, 버튼 위 */}
        {entry.images && entry.images.length > 0 && (
          <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <div className="text-xs text-gray-500 mb-3 font-medium">📷 내가 올린 사진</div>
            <div className="relative">
              {/* 이미지 컨테이너 - 유동적 높이 */}
              <div className="relative rounded-lg overflow-hidden bg-slate-100 w-full" style={{ minHeight: '200px' }}>
                <img
                  src={entry.images[currentImageIndex]}
                  alt={`사용자 업로드 이미지 ${currentImageIndex + 1}`}
                  className="w-full h-auto rounded-lg"
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                    display: 'block'
                  }}
                  onError={(e) => {
                    // 이미지 로드 실패 시 대체 처리
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                
                {/* 이전 이미지 버튼 (2장 이상인 경우) - 이미지 박스 안에 */}
                {entry.images.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => 
                        prev === 0 ? entry.images!.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors z-10 shadow-lg"
                    aria-label="이전 이미지"
                    style={{ minWidth: '40px', minHeight: '40px' }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* 다음 이미지 버튼 (2장 이상인 경우) - 이미지 박스 안에 */}
                {entry.images.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => 
                        prev === entry.images!.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors z-10 shadow-lg"
                    aria-label="다음 이미지"
                    style={{ minWidth: '40px', minHeight: '40px' }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* 이미지 인덱스 표시 (2장 이상인 경우) - 이미지 박스 안에 */}
                {entry.images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm shadow-lg z-10">
                    {currentImageIndex + 1} / {entry.images.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {/* 
            수정하기 버튼 (플로우 4.1, 5.2)
            
            동작:
            - 클릭 시 onEdit 콜백 호출
            - DiaryBook에서 일기 작성 모드(writing)로 전환
            - DiaryWritingPage에서 기존 데이터 자동 로드
          */}
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 transition-colors px-4 py-3 bg-blue-100 rounded-xl hover:bg-blue-200"
          >
            <Edit className="w-3.5 h-3.5" />
            수정하기
          </button>
          
          {/* 
            장소 추천 버튼 (플로우 5.2, 8.1 경로 B)
            
            동작 (플로우 8.1):
            - 클릭 시 onMapRecommendation 콜백 호출
            - DiaryBook의 handleMapRecommendationFromReading 실행
            - setShowMapRecommendation(true) 설정
            - viewMode = 'reading' 유지
            - 좌측: 카카오 지도 / 우측: 장소 리스트 표시
            
            전달 데이터:
            - emotion: entry.emotion (일기에 저장된 감정 이모지)
            - emotionCategory: entry.emotionCategory (AI 분석 감정 카테고리)
            
            플로우 5.2 요구사항:
            - 일기 있는 경우에만 표시
            - 감정 카테고리 기반 장소 추천
            
            플로우 8.1 요구사항 (경로 B):
            - 일기 상세보기 화면에서 "장소 추천" 버튼 클릭
            - 해당 일기의 감정 카테고리 기반으로 장소 추천
            - → 장소 추천 화면으로 이동
          */}
          <button
            onClick={() => {
              // 장소 추천 화면 표시
              setShowMapRecommendation(true);
              
              // 부모 컴포넌트에 알림 (DiaryBook에서 상태 관리하는 경우) - 중복 렌더링 방지를 위해 제거
              // if (onMapRecommendation) {
              //    // emotionCategory가 없으면 계산
              //    const emotionCategory = entry.emotionCategory || getEmotionCategory(entry.emotion);
              //    // 일기 ID 전달 (장소 추천 API 호출에 사용)
              //    onMapRecommendation(entry.emotion, emotionCategory, entry.id);
              // }
            }}
            className="flex items-center justify-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 transition-colors px-4 py-3 bg-teal-100 rounded-xl hover:bg-teal-200"
          >
            <MapPin className="w-3.5 h-3.5" />
            {/* [디버깅용] 파란색 텍스트 - 테스트 완료 후 제거 가능 */}
            <span className="text-teal-700 font-medium">
              {entry.recommendedFood?.name ? `${entry.recommendedFood.name} 맛집 추천` : '맛집 추천'}
            </span>
          </button>
          
          {/* 
            삭제 버튼 (플로우 5.2)
            
            동작:
            - 클릭 시 삭제 확인 모달 표시
            - 확인 시 일기 삭제 API 호출
            - 삭제 성공 시 캘린더로 이동 + 감정 이모지 자동 제거
          */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-1.5 text-xs text-rose-700 hover:text-rose-800 transition-colors px-4 py-3 bg-rose-100 rounded-xl hover:bg-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            삭제
          </button>
        </div>

        {/* 
          삭제 확인 모달 (플로우 5.2)
          
          표시 조건:
          - "삭제" 버튼 클릭 시 표시
          
          내용:
          - 제목: "일기 삭제"
          - 메시지: "정말 이 일기를 삭제하시겠어요? 삭제하면 복구할 수 없어요."
          - 버튼:
            1. 취소 → 모달 닫기
            2. 삭제 (빨간색) → handleDelete 호출 → 일기 삭제 + 캘린더로 이동
          
          플로우 5.2 요구사항:
          - 삭제 성공 시 해당 날짜의 감정 이모지 자동 제거
          - 캘린더로 이동
        */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
            <div className="bg-white rounded-xl p-4 shadow-xl max-w-xs w-full">
              <h4 className="text-stone-800 mb-2">일기 삭제</h4>
              <p className="text-sm text-stone-600 mb-4">
                정말 이 일기를 삭제하시겠어요?<br />
                삭제하면 복구할 수 없어요.
              </p>
              <div className="flex gap-2">
                {/* 취소 버튼 - 모달 닫기 */}
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 text-sm px-3 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200"
                >
                  취소
                </button>
                {/* 삭제 버튼 - 일기 삭제 실행 */}
                <button
                  onClick={handleDelete}
                  className="flex-1 text-sm px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Recommendation Modal */}
        {showMapRecommendation && entry && (
          <KakaoMapRecommendation
            isOpen={showMapRecommendation}
            onClose={() => setShowMapRecommendation(false)}
            diaryId={entry.id} // 일기 ID 전달 (권장 방식)
            emotion={entry.emotion} // 하위 호환성 (diaryId가 없을 때 사용)
            emotionCategory={entry.emotionCategory || getEmotionCategory(entry.emotion)} // 하위 호환성
            hideFoodRecommendation={true} // 일기 상세 조회에서는 AI 음식 추천 숨김 (중복 방지)
          />
        )}

        {/* 이미지 갤러리 모달 */}
        {showImageGallery && entry && entry.images && entry.images.length > 0 && (
          <div className="absolute inset-0 bg-black/90 z-[9999] flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center" style={{ padding: '16px' }}>
              {/* 닫기 버튼 - 우측 상단, 항상 보이도록 */}
              <button
                onClick={() => {
                  setShowImageGallery(false);
                }}
                className="absolute top-4 right-4 p-3 bg-black/80 hover:bg-black text-white rounded-full transition-colors z-50 shadow-lg border-2 border-white/50"
                aria-label="닫기"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <X className="w-6 h-6" />
              </button>

              {/* 이전 이미지 버튼 - 좌측 중앙, 항상 보이도록 */}
              {entry.images.length > 1 && (
                <button
                  onClick={() => {
                    setCurrentImageIndex((prev) => 
                      prev === 0 ? entry.images!.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/80 hover:bg-black text-white rounded-full transition-colors z-50 shadow-lg border-2 border-white/50"
                  aria-label="이전 이미지"
                  style={{ minWidth: '48px', minHeight: '48px' }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* 현재 이미지 - 박스 크기를 넘지 않도록 엄격히 제한 */}
              <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
                <img
                  src={entry.images[currentImageIndex]}
                  alt={`사용자 업로드 이미지 ${currentImageIndex + 1}`}
                  className="object-contain rounded-lg"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    display: 'block',
                    margin: 'auto'
                  }}
                  onError={(e) => {
                    // 이미지 로드 실패 시 대체 처리
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>

              {/* 다음 이미지 버튼 - 우측 중앙, 항상 보이도록 */}
              {entry.images.length > 1 && (
                <button
                  onClick={() => {
                    setCurrentImageIndex((prev) => 
                      prev === entry.images!.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/80 hover:bg-black text-white rounded-full transition-colors z-50 shadow-lg border-2 border-white/50"
                  aria-label="다음 이미지"
                  style={{ minWidth: '48px', minHeight: '48px' }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* 이미지 인덱스 표시 (2장 이상인 경우) - 하단 중앙, 항상 보이도록 */}
              {entry.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 text-white text-sm rounded-full backdrop-blur-sm border-2 border-white/50 shadow-lg z-50">
                  {currentImageIndex + 1} / {entry.images.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * 일기 없는 경우 (플로우 5.2, 6.3)
   * 
   * 표시 내용:
   * - 뒤로가기 버튼 (플로우 6.3)
   * - 캘린더 아이콘
   * - 메시지: "아직 작성된 일기가 없어요"
   * - 버튼: "일기 작성하기"
   * 
   * 동작:
   * - "일기 작성하기" 버튼 클릭 → onStartWriting 콜백 호출
   * - DiaryBook에서 일기 작성 모드로 전환
   * - 선택된 날짜로 새 일기 작성 시작
   * - 뒤로가기 버튼 클릭 → onBackToCalendar 호출 (플로우 6.3)
   */
  return (
    <div className="min-h-full flex flex-col overflow-y-auto scrollbar-hide py-4">
      {/* 
        X 버튼 (플로우 6.3)
        
        우측 상단에 배치
        검색 페이지에서 온 경우 검색 페이지로 복귀
      */}
      {onBackToCalendar && (
        <div className="flex justify-start mb-2">
          {/* [디버깅용] 파란색 텍스트 - 테스트 완료 후 제거 가능 */}
          <button
            onClick={onBackToCalendar}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-blue-600 hover:text-blue-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="flex-1 flex flex-col items-center justify-center text-stone-400 space-y-3">
        <CalendarDays className="w-8 h-8" />
        <div className="text-center">
          <div className="text-sm text-stone-600 mb-3">
            아직 작성된 일기가 없어요
          </div>
          <button 
            onClick={onStartWriting}
            className="text-xs text-blue-700 hover:text-blue-800 transition-colors px-4 py-2 bg-blue-100/50 rounded-lg hover:bg-blue-100"
          >
            일기 작성하기
          </button>
        </div>
      </div>
    </div>
  );
}