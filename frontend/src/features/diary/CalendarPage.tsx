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
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchMonthlyEmotions, EmotionData } from '../../services/diaryApi';
import { getEmotionImage } from '../../utils/emotionImages';

interface CalendarPageProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  refreshKey?: number;
  compact?: boolean;
  isRightPage?: boolean;
  showBothButtons?: boolean;
}

export function CalendarPage({ onDateSelect, selectedDate, currentMonth, onMonthChange, refreshKey, compact = false, isRightPage = false, showBothButtons = false }: CalendarPageProps) {
  // ========== 상태 관리 ==========
  const [emotions, setEmotions] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // ========== 데이터 로드 ==========
  useEffect(() => {
    loadMonthlyEmotions();
  }, [year, month, refreshKey]);

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
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // ========== 이벤트 핸들러 ==========
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  // ========== 유틸리티 함수 ==========
  const getDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const renderCalendarDays = () => {
    const days = [];

    // 빈 공간 채우기
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // 날짜 버튼 렌더링
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(day);
      const emotion = emotions[dateKey];
      const selected = isSelected(day);
      const today = isToday(day);

      days.push(
        <button
          key={day}
          onClick={() => onDateSelect(new Date(year, month, day))}
          disabled={isLoading}
          className={`aspect-square rounded-2xl relative flex flex-col items-center justify-center transition-all p-1 touch-manipulation group
            ${selected
              ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 scale-105 z-10'
              : today
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold border-2 border-emerald-200 dark:border-emerald-800'
                : 'bg-white/50 dark:bg-stone-900/50 hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
            }
            ${!selected && !today ? 'hover:shadow-md hover:scale-105' : ''}
          `}
        >
          {/* 날짜 숫자 */}
          <span className={`text-sm leading-tight relative z-10 ${selected ? 'font-bold' : ''}`}>{day}</span>

          {/* 감정 스티커 */}
          {emotion && (
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">
              <img
                src={getEmotionImage(emotion)}
                alt={emotion}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* 오늘 날짜 표시 점 (선택되지 않았을 때만) */}
          {today && !selected && (
            <div className="absolute bottom-1.5 w-1 h-1 bg-emerald-500 rounded-full" />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`w-full space-y-4 ${compact ? 'space-y-2' : 'space-y-4'} pt-4`}>
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        {(showBothButtons || !isRightPage) && (
          <button
            onClick={goToPreviousMonth}
            disabled={isLoading}
            className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-stone-500 hover:text-emerald-600 dark:text-stone-400"
          >
            <ChevronLeft className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
          </button>
        )}
        {!showBothButtons && isRightPage && <div className="w-10" />}

        <div className="text-center flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className={`text-stone-800 dark:text-stone-100 font-bold ${compact ? 'text-lg' : 'text-xl'}`}>
              {monthNames[month]}
            </span>
            <span className={`text-emerald-600 dark:text-emerald-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
              {year}
            </span>
          </div>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          )}
        </div>

        {(showBothButtons || isRightPage) && (
          <button
            onClick={goToNextMonth}
            disabled={isLoading}
            className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-stone-500 hover:text-emerald-600 dark:text-stone-400"
          >
            <ChevronRight className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
          </button>
        )}
        {!showBothButtons && !isRightPage && <div className="w-10" />}
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1.5 mb-2 px-1">
        {dayNames.map((day, index) => {
          const isSunday = index === 0;
          const isSaturday = index === 6;
          const dayColorClass = isSunday
            ? 'text-rose-500 font-bold'
            : isSaturday
              ? 'text-indigo-500 font-bold'
              : 'text-stone-400 dark:text-stone-500 font-medium';

          return (
            <div key={index} className={`text-center ${dayColorClass} ${compact ? 'text-xs' : 'text-sm'}`}>
              {day}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 px-1 pb-4">
        {renderCalendarDays()}
      </div>
    </div>
  );
}