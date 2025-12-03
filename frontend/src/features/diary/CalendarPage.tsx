/**
 * ========================================
 * 캘린더 페이지 컴포넌트 (CalendarPage)
 * ========================================
 * 
 * 주요 기능:
 * - 월별 캘린더 표시
 * - 일기 작성된 날짜에 감정 스티커 표시 (우측 상단)
 * - 날짜 선택 시 일기 상세보기로 이동 (플로우 3.1, 5.1)
 * - 월 변경 내비게이션 (< > 버튼)
 * - 오늘 날짜 강조 표시
 * 
 * 플로우 5.1 (캘린더 화면 조회):
 * - 양페이지 캘린더 모드:
 *   - 좌측 페이지: < 버튼만 표시 (이전 달로 이동)
 *   - 우측 페이지: > 버튼만 표시 (다음 달로 이동)
 *   - 월 이동 시 양쪽 페이지 모두 함께 이동
 * - 일기 상세보기 모드:
 *   - 좌측 캘린더: < > 버튼 모두 표시 (월 이동 가능)
 *   - 선택된 날짜가 속한 달 표시
 * - 초기 로드 시 현재 월 및 다음 월 감정 데이터 자동 로드
 * - 오늘 날짜: 파란색 테두리 및 배경
 * - 선택된 날짜: 파란색 강조 표시
 * - 작성된 일기: 감정 이모지 스티커 표시 (우측 상단)
 * 
 * 디자인:
 * - 날짜는 중앙 정렬
 * - 감정 스티커는 우측 상단 배치
 * - 파란색 톤온톤 색상
 * - 종이 질감 배경
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchMonthlyEmotions, EmotionData } from '../../services/diaryApi';

/**
 * CalendarPage 컴포넌트 Props
 */
/**
 * CalendarPage 컴포넌트 Props
 */
interface CalendarPageProps {
  onDateSelect: (date: Date) => void; // 날짜 선택 콜백
  selectedDate: Date | null; // 현재 선택된 날짜
  currentMonth: Date; // 현재 표시 중인 월
  onMonthChange: (date: Date) => void; // 월 변경 콜백
  refreshKey?: number; // 데이터 새로고침 트리거 (플로우 13.1)
  compact?: boolean; // 컴팩트 모드 (사용 안함)
  isRightPage?: boolean; // 오른쪽 페이지 여부 (양페이지 레이아웃)
  showBothButtons?: boolean; // 양쪽 버튼 모두 표시 (플로우 5.1: 일기 상세보기 모드)
}

export function CalendarPage({ onDateSelect, selectedDate, currentMonth, onMonthChange, refreshKey, compact = false, isRightPage = false, showBothButtons = false }: CalendarPageProps) {
  // ========== 상태 관리 ==========
  
  /**
   * 감정 데이터 맵
   * - 키: 날짜 (YYYY-MM-DD)
   * - 값: 감정 이모지
   */
  const [emotions, setEmotions] = useState<{ [key: string]: string }>({});
  
  /**
   * 데이터 로딩 상태
   */
  const [isLoading, setIsLoading] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // ========== 데이터 로드 ==========
  
  /**
   * 월이 변경되거나 일기 작성/수정/삭제 시 감정 데이터 다시 로드 (플로우 5.1, 13.1)
   * 
   * [플로우 13.1: 자동 새로고침]
   * 
   * **트리거 상황** (명세서):
   * 1. 일기 작성/수정/삭제 후
   * 2. 캘린더 화면으로 돌아올 때
   * 3. 월 변경 시
   * 
   * 구체적 트리거:
   * 1. year, month 변경 시 (월 이동):
   *    - 월 변경 시 자동 새로고침 ✅
   *    - 해당 월의 감정 데이터 자동 로드
   * 
   * 2. refreshKey 변경 시 (일기 작성/수정/삭제 후):
   *    - 일기 작성 후 (handleFinishWriting → handleDataChange) ✅
   *    - 일기 삭제 후 (DaySummaryPage의 handleDelete → onDataChange) ✅
   *    - 캘린더 화면으로 돌아올 때 자동 업데이트 ✅
   *    - 일기 수정 후 (현재 미구현, 추후 추가 필요)
   * 
   * **처리 과정** (명세서):
   * 1. 관련 데이터 자동 재조회 ✅
   *    - loadMonthlyEmotions() 실행
   *    - fetchMonthlyEmotions() API 호출
   *    - 월별 감정 데이터 가져오기
   * 
   * 2. 화면 자동 업데이트 ✅
   *    - emotionData 상태 업데이트
   *    - 캘린더 히트맵 재렌더링
   * 
   * 3. 감정 스티커 자동 갱신 ✅
   *    - 작성된 일기가 있는 날짜: 감정 이모지 표시
   *    - 일기 삭제 후: 해당 날짜의 감정 이모지 제거, 빈 날짜로 표시
   * 
   * 플로우 5.1 요구사항:
   * - 초기 로드 시 현재 월 및 다음 월 감정 데이터 자동 로드
   * - 월 이동 시 해당 월 감정 데이터 자동 로드
   * 
   * 플로우 13.1 명세서 요구사항:
   * - ✅ 일기 작성/수정/삭제 후 자동 새로고침
   * - ✅ 캘린더 화면으로 돌아올 때 자동 새로고침
   * - ✅ 월 변경 시 자동 새로고침
   * - ✅ 관련 데이터 자동 재조회
   * - ✅ 화면 자동 업데이트
   * - ✅ 감정 스티커 자동 갱신
   * - ✅ 일기 삭제 후: 해당 날짜의 감정 이모지 제거, 빈 날짜로 표시
   */
  useEffect(() => {
    loadMonthlyEmotions();
  }, [year, month, refreshKey]);

  /**
   * 월별 감정 데이터 로드 (플로우 5.1, 13.1)
   * 
   * API:
   * - fetchMonthlyEmotions(year, month)
   * - GET /api/diaries/heatMap?year={year}&month={month}
   * - 응답 형식: EmotionData[] (date, emotion)
   * 
   * 동작 (플로우 13.1):
   * 1. API 호출하여 해당 월의 모든 일기 날짜와 감정 조회
   * 2. 날짜별로 감정 이모지 매핑:
   *    - 예: { "2024-11-15": "😊", "2024-11-20": "😢" }
   * 3. 캘린더에 감정 스티커 표시 (우측 상단)
   * 4. 일기 삭제 후:
   *    - 해당 날짜의 감정 이모지 제거
   *    - 빈 날짜로 표시 (감정 스티커 없음)
   * 
   * 호출 시점 (플로우 13.1):
   * - 컴포넌트 마운트 시 (초기 로드)
   * - 월 변경 시 (year, month 변경)
   * - 일기 작성/수정/삭제 후 (refreshKey 변경)
   * 
   * 플로우 5.1 요구사항:
   * - 작성된 일기가 있는 날짜: 감정 이모지 스티커 표시
   * - 스티커 위치: 날짜 셀의 우측 상단
   * 
   * 플로우 13.1 요구사항:
   * - 관련 데이터 자동 재조회
   * - 화면 자동 업데이트
   * - 감정 스티커 자동 갱신
   * - 일기 삭제 후: 해당 날짜의 감정 이모지 제거
   * 
   * [백엔드 팀] 실제 구현 시:
   * - JWT 토큰으로 사용자 인증
   * - DB에서 해당 사용자의 해당 월 일기 조회
   * - 날짜별 감정 이모지 반환
   * - 캐싱 전략 권장 (Redis, TTL: 5분)
   */
  const loadMonthlyEmotions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMonthlyEmotions(year, month);
      const emotionMap: { [key: string]: string } = {};
      data.forEach((item: EmotionData) => {
        emotionMap[item.date] = item.emotion;
      });
      setEmotions(emotionMap);
    } catch (error) {
      console.error('Failed to load emotions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 캘린더 계산 ==========
  
  /**
   * 해당 월의 첫 날
   */
  const firstDayOfMonth = new Date(year, month, 1);
  
  /**
   * 해당 월의 마지막 날
   */
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  /**
   * 첫 날의 요일 (0: 일요일 ~ 6: 토요일)
   * - 캘린더 시작 위치 계산에 사용
   */
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  /**
   * 해당 월의 총 일수
   */
  const daysInMonth = lastDayOfMonth.getDate();

  /**
   * 월 이름 배열 (영문)
   */
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  /**
   * 요일 이름 배열 (약자)
   * S: Sunday/Saturday, M: Monday, T: Tuesday/Thursday, W: Wednesday, F: Friday
   */
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // ========== 이벤트 핸들러 ==========
  
  /**
   * 이전 월로 이동 (플로우 5.1)
   * 
   * 동작:
   * - 현재 월에서 1개월 이전으로 변경
   * - onMonthChange 콜백 호출 → DiaryBook에서 양쪽 페이지 모두 업데이트
   * - 페이지 플립 애니메이션 표시
   * 
   * 플로우 5.1 요구사항:
   * - 좌측 < 버튼 클릭 시: 양쪽 다 한 달씩 이전으로 이동
   */
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  /**
   * 다음 월로 이동 (플로우 5.1)
   * 
   * 동작:
   * - 현재 월에서 1개월 다음으로 변경
   * - onMonthChange 콜백 호출 → DiaryBook에서 양쪽 페이지 모두 업데이트
   * - 페이지 플립 애니메이션 표시
   * 
   * 플로우 5.1 요구사항:
   * - 우측 > 버튼 클릭 시: 양쪽 다 한 달씩 다음으로 이동
   */
  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  // ========== 유틸리티 함수 ==========
  
  /**
   * 날짜를 YYYY-MM-DD 형식의 키로 변환
   * - emotions 맵에서 감정 조회 시 사용
   */
  const getDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  /**
   * 해당 날짜가 선택된 날짜인지 확인 (플로우 5.1)
   * 
   * 플로우 5.1 요구사항:
   * - 선택된 날짜: 파란색 강조 표시
   * - 스타일: bg-blue-200 + ring-2 ring-blue-500
   */
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  /**
   * 해당 날짜가 오늘인지 확인 (플로우 5.1)
   * 
   * 플로우 5.1 요구사항:
   * - 오늘 날짜: 파란색 테두리 및 배경
   * - 스타일: bg-blue-100 + ring-1 ring-blue-400
   * - 좌우 달력 모두 적용
   */
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  /**
   * 캘린더 날짜 렌더링 함수 (플로우 5.1)
   * 
   * 동작:
   * 1. 빈 공간 채우기 (월의 첫 날이 시작되는 요일까지)
   * 2. 날짜 버튼 렌더링 (1일 ~ 마지막 날)
   * 
   * 플로우 5.1 시각적 표시:
   * - 오늘 날짜: bg-blue-100 + ring-1 ring-blue-400 (파란색 배경 + 테두리)
   * - 선택된 날짜: bg-blue-200 + ring-2 ring-blue-500 (진한 파란색 + 굵은 테두리)
   * - 작성된 일기: 감정 이모지 스티커 (우측 상단 배치)
   * - 날짜 숫자: 중앙 정렬
   */
  const renderCalendarDays = () => {
    const days = [];
    
    // 빈 공간 채우기 (월의 첫 날 이전)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // 날짜 버튼 렌더링
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(day);
      const emotion = emotions[dateKey]; // 해당 날짜의 감정 이모지
      const selected = isSelected(day); // 선택된 날짜인지
      const today = isToday(day); // 오늘 날짜인지

      days.push(
        <button
          key={day}
          onClick={() => onDateSelect(new Date(year, month, day))}
          disabled={isLoading}
          className={`aspect-square rounded-lg relative flex items-center justify-center transition-all text-slate-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed p-2
            ${selected ? 'bg-blue-200 ring-2 ring-blue-500 shadow-md' : today ? 'bg-blue-100 ring-1 ring-blue-400' : 'bg-white/30'}`}
        >
          {/* 날짜 숫자 - 항상 중앙 정렬 (플로우 5.1) */}
          <span className="text-sm">{day}</span>
          
          {/* 감정 스티커 - 우측 상단 배치 (플로우 5.1) */}
          {emotion && (
            <span className="absolute top-1 right-1 text-base leading-none">{emotion}</span>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`space-y-4 ${compact ? 'space-y-2' : 'space-y-4'} pt-8`}>
      {/* 
        Month Header 
        
        버튼 표시 로직 (플로우 5.1):
        - showBothButtons=true: 양쪽 버튼 모두 표시 (일기 상세보기 모드)
        - showBothButtons=false:
          - isRightPage=false: 왼쪽 < 버튼만 표시 (양페이지 캘린더 좌측)
          - isRightPage=true: 오른쪽 > 버튼만 표시 (양페이지 캘린더 우측)
      */}
      <div className="flex items-center justify-between mb-4">
        {(showBothButtons || !isRightPage) && (
          <button
            onClick={goToPreviousMonth}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-slate-600`} />
          </button>
        )}
        {!showBothButtons && isRightPage && <div className="w-9" />}
        
        <div className="text-center flex items-center gap-2">
          <div>
            <div className={`text-slate-800 ${compact ? 'text-base' : 'text-lg'}`}>{monthNames[month]}</div>
            <div className={`text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>{year}</div>
          </div>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          )}
        </div>

        {(showBothButtons || isRightPage) && (
          <button
            onClick={goToNextMonth}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-slate-600`} />
          </button>
        )}
        {!showBothButtons && !isRightPage && <div className="w-9" />}
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day, index) => (
          <div key={index} className={`text-center text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {renderCalendarDays()}
      </div>
    </div>
  );
}