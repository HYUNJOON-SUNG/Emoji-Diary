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
import { CalendarDays, Loader2, Edit, Trash2, MapPin, Sparkles, X, ArrowLeft } from 'lucide-react';
import { fetchDiaryDetails, DiaryDetail, deleteDiary } from '../../services/diaryApi';
import { KakaoMapRecommendation } from './KakaoMapRecommendation';

/**
 * DaySummaryPage 컴포넌트 Props
 */
interface DaySummaryPageProps {
  selectedDate: Date | null; // 선택된 날짜
  onDataChange?: () => void; // 데이터 변경 콜백 (플로우 13.1: 삭제 후 새로고침)
  onEdit?: () => void; // 수정 버튼 클릭 콜백
  onStartWriting?: () => void; // "일기 작성하기" 버튼 클릭 콜백
  onBackToCalendar?: () => void; // 뒤로가기 콜백 (플로우 6.3: 이전 화면으로 복귀)
  onMapRecommendation?: (emotion: string, emotionCategory: string) => void; // 장소 추천 콜백
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
  }, [selectedDate]);

  /**
   * 일기 상세 데이터 로드 (플로우 3.1, 5.2)
   * 
   * [백엔드 팀 작업 필요]
   * - 엔드포인트: GET /api/diaries/details?date={YYYY-MM-DD}
   * - 응답 형식: DiaryDetail (제목, 본문, 감정, 기분, 날씨, 활동, AI 이미지, AI 코멘트 등)
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
    if (!selectedDate) return;

    setIsLoading(true);
    try {
      const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const data = await fetchDiaryDetails(dateKey);
      setEntry(data);
    } catch (error) {
      console.error('Failed to load diary details:', error);
      setEntry(null);
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
   * [백엔드 팀] 실제 구현 시:
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

  const formattedDate = selectedDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

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
        <div className="h-full flex flex-col">
          {/* 좌우 페이지 레이아웃 */}
          <div className="flex-1 grid grid-cols-2 gap-6 relative">
            {/* 왼쪽 페이지 - 지도만 크게 */}
            <div className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-lg overflow-hidden shadow-sm">
              {/* 지도 헤더 */}
              <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-blue-200 px-4 py-3 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{entry.emotion}</span>
                  <span className="text-xl">🗺️</span>
                  <div className="flex-1">
                    <p className="text-xs text-stone-700">주변 추천 장소</p>
                  </div>
                </div>
              </div>

              {/* 지도 영역 */}
              <div className="absolute inset-0 pt-14">
                <div className="relative w-full h-full">
                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-8 grid-rows-8 h-full">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className="border border-blue-200" />
                      ))}
                    </div>
                  </div>
                  
                  {/* Center location marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping" />
                      <MapPin className="w-10 h-10 text-blue-600 fill-blue-200 relative z-10" />
                    </div>
                  </div>
                  
                  {/* Restaurant markers */}
                  <div className="absolute top-1/4 left-1/3">
                    <MapPin className="w-7 h-7 text-rose-600 fill-rose-200" />
                  </div>
                  <div className="absolute top-2/3 left-1/4">
                    <MapPin className="w-7 h-7 text-rose-600 fill-rose-200" />
                  </div>
                  <div className="absolute top-1/3 right-1/4">
                    <MapPin className="w-7 h-7 text-rose-600 fill-rose-200" />
                  </div>
                  <div className="absolute bottom-1/4 right-1/3">
                    <MapPin className="w-7 h-7 text-rose-600 fill-rose-200" />
                  </div>
                  <div className="absolute top-1/2 right-1/5">
                    <MapPin className="w-7 h-7 text-rose-600 fill-rose-200" />
                  </div>
                  
                  {/* Info badge */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-lg px-3 py-1.5 shadow-lg">
                      <p className="text-xs text-stone-700">
                        카카오 지도 API 연동 시 실제 지도 표시
                      </p>
                    </div>
                  </div>
                  
                  {/* Map controls */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <div className="bg-white rounded-lg shadow-md px-2 py-1 text-xs text-stone-600 border border-stone-200">
                      일반지도
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-1.5 flex flex-col gap-1">
                      <div className="w-5 h-5 bg-stone-100 rounded flex items-center justify-center text-xs font-medium">+</div>
                      <div className="w-5 h-5 bg-stone-100 rounded flex items-center justify-center text-xs font-medium">-</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 페이지 - 장소 리스트만 */}
            <KakaoMapRecommendation
              isOpen={true}
              onClose={() => setShowMapRecommendation(false)}
              emotion={entry.emotion}
              emotionCategory={entry.emotionCategory}
              isInline={true}
            />
          </div>
        </div>
      );
    }

    // 일반 일기 보기 모드
    return (
      <div className="p-4 space-y-4"> {/* 모바일 최적화: 패딩 추가 */}
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
        <div className="relative bg-white rounded-lg p-4 shadow-sm">
          {/* X 버튼 - 우측 상단에 배치 */}
          {onBackToCalendar && (
            <button
              onClick={onBackToCalendar}
              className="absolute top-3 right-3 p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
              title="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          <div className="flex items-start justify-between pr-8">
            <div>
              <div className="text-xs text-slate-500 mb-1">오늘의 일기</div>
              <div className="text-sm text-slate-800">{formattedDate}</div>
            </div>
            <div className="flex items-center">
              <span className="text-4xl">{entry.emotion}</span>
            </div>
          </div>
        </div>

        {/* Title Card */}
        <div className="relative bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-slate-800">{entry.title}</h3>
        </div>

        {/* Mood & Weather Card - 2 Column */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">내용</div>
            <div className="text-sm text-slate-700">{entry.mood}</div>
            
            {entry.activities && entry.activities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {entry.activities.map((activity, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="relative bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">날씨</div>
            <div className="text-sm text-slate-700">{entry.weather || '맑음'}</div>
          </div>
        </div>

        {/* AI Generated Image */}
        {entry.imageUrl && (
          <div className="relative bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-slate-500 mb-2">AI 그림 일기</div>
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={entry.imageUrl} 
                alt="AI Generated Diary Illustration"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}

        {/* Note Card */}
        <div className="relative bg-white rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-2">메모</div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {entry.note}
          </p>
        </div>

        {/* AI Comment Card */}
        {entry.aiComment && (
          <div className="relative bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-4 shadow-sm">
            <div className="text-xs text-blue-700 mb-2 flex items-center gap-1.5">
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
              if (onMapRecommendation) {
                onMapRecommendation(entry.emotion, entry.emotionCategory);
              }
            }}
            className="flex items-center justify-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 transition-colors px-4 py-3 bg-teal-100 rounded-xl hover:bg-teal-200"
          >
            <MapPin className="w-3.5 h-3.5" />
            장소 추천
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
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-4 shadow-xl max-w-xs">
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
        {showMapRecommendation && (
          <KakaoMapRecommendation
            isOpen={showMapRecommendation}
            onClose={() => setShowMapRecommendation(false)}
            emotion={entry.emotion}
            emotionCategory={entry.emotionCategory}
          />
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
    <div className="h-full flex flex-col py-4">
      {/* 
        X 버튼 (플로우 6.3)
        
        우측 상단에 배치
        검색 페이지에서 온 경우 검색 페이지로 복귀
      */}
      {onBackToCalendar && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onBackToCalendar}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
            title="닫기"
          >
            <X className="w-4 h-4" />
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