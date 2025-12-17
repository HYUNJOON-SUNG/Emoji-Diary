/**
 * ========================================
 * 감정 통계 페이지 컴포넌트 (EmotionStatsPage)
 * ========================================
 * 
 * 주요 기능 (플로우 7.1, 7.2, 7.3, 7.4, 7.5):
 * - 감정 통계 조회 (3가지 뷰 모드)
 * - 캘린더 뷰 (플로우 7.3): 월별 캘린더 형태로 감정 표시
 * - 타임라인 뷰 (플로우 7.4): 시간순으로 일기 목록 표시
 * - 차트 뷰 (플로우 7.5): 감정 분포 차트 및 통계 데이터
 * 
 * [API 명세서 Section 5.2]
 * - GET /api/statistics/emotions: 감정 통계 조회 (기간별)
 * - GET /api/statistics/emotion-trend: 감정 변화 추이 조회
 * - GET /api/diaries/calendar: 캘린더 월별 조회
 * 
 * [ERD 설계서 참고 - Diaries 테이블]
 * - 통계는 Diaries 테이블의 emotion 컬럼 기준으로 집계됨
 * - emotion: ENUM (행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
 * - KoBERT가 일기 본문(content)만 분석하여 자동으로 저장
 * - 인덱스: idx_diaries_emotion, idx_diaries_emotion_date (통계 조회 최적화)
 * 
 * 변경 사항 (모바일):
 * - 좌우 2페이지 레이아웃 → 단일 세로 스크롤 레이아웃
 * - 상단: 헤더, 뷰 모드 선택, 월 이동
 * - 중단: 메인 콘텐츠 (캘린더/리스트/차트)
 * - 하단: 상세 정보, 범례, 가이드
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, Activity, Loader2, TrendingUp, Info, ArrowLeft } from 'lucide-react';
import { fetchDailyStats, DailyStats } from '@/features/user/diary/api/diaryApi';
import { EmotionChartView } from './EmotionChartView';
import { getEmotionImage } from '@/shared/utils/emotionImages';

interface EmotionStatsPageProps {
  onDateClick?: (date: Date) => void;
  onBack?: () => void;
  selectedDateFromParent?: Date | null; // 부모에서 전달받은 선택된 날짜 (뒤로가기 시 복원용)
  onSelectedDateChange?: (date: Date | null) => void; // 선택된 날짜 변경 콜백
  savedViewMode?: 'calendar' | 'timeline' | 'chart'; // 저장된 뷰 모드 (뒤로가기 시 복원용)
  onViewModeChange?: (mode: 'calendar' | 'timeline' | 'chart') => void; // 뷰 모드 변경 콜백
}

export type StatsViewMode = 'calendar' | 'timeline' | 'chart';

const emotionColors: { [key: string]: string } = {
  happy: 'bg-emerald-200',
  love: 'bg-green-200',
  excited: 'bg-teal-200',
  calm: 'bg-cyan-200',
  grateful: 'bg-lime-200',
  hopeful: 'bg-emerald-300',
  tired: 'bg-rose-200',
  sad: 'bg-red-200',
  angry: 'bg-rose-300',
  anxious: 'bg-pink-200',
  neutral: 'bg-white', // 테두리 제거 (흰색 배경 유지)
  embarrassed: 'bg-white', // 테두리 제거 (흰색 배경 유지)
};

export function EmotionStatsPage({ onDateClick, onBack, selectedDateFromParent, onSelectedDateChange, savedViewMode, onViewModeChange }: EmotionStatsPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<StatsViewMode>(savedViewMode || 'calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(selectedDateFromParent || null);
  const [direction, setDirection] = useState(0); // -1: prev, 1: next


  // 부모에서 전달받은 선택된 날짜가 변경되면 동기화
  useEffect(() => {
    if (selectedDateFromParent !== undefined) {
      setSelectedDate(selectedDateFromParent);
    }
  }, [selectedDateFromParent]);

  useEffect(() => {
    if (viewMode !== 'chart') {
      loadMonthData();
    }
  }, [currentDate, viewMode]);

  const loadMonthData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const data = await fetchDailyStats(yearMonth);
      setDailyStats(data);
    } catch (err) {
      setError('과거 기록을 불러오는 데 실패했습니다.');
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    // 이미 선택된 날짜를 클릭하면 선택 해제 (토글)
    if (selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()) {
      setSelectedDate(null);
      if (onSelectedDateChange) {
        onSelectedDateChange(null);
      }
    } else {
      setSelectedDate(date);
      // 부모에게 선택된 날짜 변경 알림
      if (onSelectedDateChange) {
        onSelectedDateChange(date);
      }
    }
  };

  const getStatsForDate = (date: Date): DailyStats | null => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return dailyStats.find(stat => stat.date === dateKey) || null;
  };

  const renderCalendarView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    const weeks = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const stats = getStatsForDate(date);
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`aspect-square rounded-xl border transition-all relative group p-1 ${isToday ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : ''
            } ${stats
              ? 'bg-white/80 dark:bg-white/5 border-emerald-200/50 dark:border-emerald-700/50 shadow-sm'
              : 'bg-white/40 dark:bg-black/20 border-white/20 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
            }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm ${isToday ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-600 dark:text-stone-400'}`}>
              {day}
            </span>
          </div>

          {stats && (
            <img
              src={getEmotionImage(stats.emotion)}
              alt={stats.emotion}
              className="absolute top-0.5 right-0.5 w-4 h-4 object-contain filter drop-shadow-sm"
            />
          )}
        </button>
      );
    }

    while (days.length > 0) {
      weeks.push(days.splice(0, 7));
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-emerald-500' : 'text-stone-500 dark:text-stone-400'
                }`}
            >
              {day}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week}
          </div>
        ))}
      </div>
    );
  };

  const renderTimelineView = () => {
    if (dailyStats.length === 0) {
      return (
        <div className="text-center py-12 text-stone-500 bg-white/30 rounded-xl border border-stone-200 border-dashed">
          이번 달에 작성된 일기가 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {dailyStats.map((stat) => {
          const date = new Date(stat.date);
          // 선택된 상태 확인
          const isSelected = selectedDate &&
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();

          return (
            <div key={stat.date} className="transition-all">
              <button
                onClick={() => handleDateClick(date)}
                className={`w-full flex items-center gap-4 p-3 rounded-lg border transition-all shadow-sm text-left
                  ${isSelected
                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-md'
                    : 'bg-white/60 hover:bg-white/90 border-stone-300'
                  }`}
              >
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className={`text-xs ${isSelected ? 'text-emerald-600 font-bold' : 'text-stone-500'}`}>
                    {date.getDate()}일
                  </span>
                  <span className="text-xs text-stone-400">
                    {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                  </span>
                </div>

                <div className={`w-10 h-10 rounded-full ${emotionColors[stat.emotionCategory]} flex items-center justify-center overflow-hidden shrink-0`}>
                  <img
                    src={getEmotionImage(stat.emotion)}
                    alt={stat.emotion}
                    className="w-7 h-7 object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isSelected ? 'text-emerald-900 font-medium' : 'text-stone-800'}`}>
                    {stat.title}
                  </p>
                </div>
              </button>

              {/* 인라인 요약 정보 (Accordion) */}
              {isSelected && renderSummaryCard(stat, date, () => {
                // 인라인에서는 닫기 버튼이 개별적으로 동작하거나
                // 단순히 setSelectedDate(null) 호출
                // 하지만 사용자가 '다른거 누르면 닫힘'을 원했으므로
                // 닫기 버튼 누르면 선택 해제
                setSelectedDate(null);
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSummaryCard = (stats: DailyStats | null, date: Date, onClose: () => void) => {
    const dateString = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    return (
      <div className="mt-4 p-4 sm:p-6 bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/30 rounded-2xl shadow-sm animate-in slide-in-from-bottom-2 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-stone-700 dark:text-stone-300 whitespace-nowrap">{dateString}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 bg-white/50 dark:bg-black/30 px-3 py-2 rounded-lg border border-white/20 dark:border-white/10 min-h-[44px] flex items-center transition-colors"
          >
            닫기
          </button>
        </div>

        {stats ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/40 dark:bg-white/10 blur-xl rounded-full" />
              <img
                src={getEmotionImage(stats.emotion)}
                alt={stats.emotion}
                className="relative w-16 h-16 object-contain filter drop-shadow-md"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-emerald-900 dark:text-emerald-100 mb-2 line-clamp-1">{stats.title}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDateClick && onDateClick(date);
                }}
                className="text-xs text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-full transition-all shadow-lg shadow-emerald-500/20 min-h-[44px] flex items-center font-medium"
              >
                일기 보러가기
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-500 dark:text-stone-400">작성된 일기가 없습니다.</p>
        )}
      </div>

    );
  };

  // 슬라이드 애니메이션 변수 define
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0
    })
  };

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="min-h-full flex flex-col space-y-4">
      {/* Header - 뒤로가기 버튼 포함 */}
      <div className="relative text-center space-y-1 pb-2 pt-6 border-b border-white/20">
        {/* 뒤로가기 버튼 - 왼쪽 상단 고정 (요구사항 12) */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-6 left-0 p-2 rounded-xl transition-colors text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-stone-400 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 active:bg-emerald-100 dark:active:bg-emerald-800/30 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300">
          <Activity className="w-5 h-5" />
          <span className="font-bold">감정 통계</span>
        </div>
        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">나의 감정 흐름을 확인해보세요</p>
      </div>

      {/* View Toggle */}
      <div className="flex p-1 bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20">
        {[
          { id: 'calendar', icon: CalendarDays, label: '캘린더' },
          { id: 'timeline', icon: Activity, label: '타임라인' },
          { id: 'chart', icon: TrendingUp, label: '차트' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              if (mode.id === viewMode) return;
              const newMode = mode.id as StatsViewMode;
              setViewMode(newMode);
              if (onViewModeChange) {
                onViewModeChange(newMode);
              }
              setSelectedDate(null);
            }}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-all ${viewMode === mode.id
              ? 'text-emerald-700 dark:text-emerald-300 font-medium'
              : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
          >
            {viewMode === mode.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/80 dark:bg-emerald-950/50 rounded-lg shadow-sm ring-1 ring-black/5"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <mode.icon className="w-3.5 h-3.5" />
              <span>{mode.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Month Navigation */}
      {viewMode !== 'chart' && (
        <div className="flex items-center justify-between bg-white/40 dark:bg-black/20 p-2 rounded-lg border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-sm">
          <button onClick={handlePrevMonth} className="p-1.5 rounded-md text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-stone-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h3>
          <button onClick={handleNextMonth} className="p-1.5 rounded-md text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-stone-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading & Error */}
      {isLoading && viewMode !== 'chart' && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      )}
      {error && viewMode !== 'chart' && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 relative">
        <AnimatePresence mode="wait">
          {!isLoading && !error && viewMode !== 'chart' && (
            <motion.div
              key={viewMode} // calendar or timeline
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={currentDate.toISOString()}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'tween', duration: 0.2 }}
                >
                  {viewMode === 'calendar' ? renderCalendarView() : renderTimelineView()}
                </motion.div>
              </AnimatePresence>

              {/* Selected Date Summary (Only shown for calendar view) */}
              <AnimatePresence>
                {selectedDate && viewMode === 'calendar' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    {renderSummaryCard(
                      getStatsForDate(selectedDate),
                      selectedDate,
                      () => setSelectedDate(null)
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend / Info (Only shown when nothing selected) */}
              {!selectedDate && viewMode === 'calendar' && (
                <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="text-xs font-medium text-stone-600 mb-3 flex items-center gap-1">
                    <Info className="w-3 h-3" /> 감정 범례
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      '행복', '중립', '당황', '슬픔',
                      '분노', '불안', '혐오'
                    ].map((emotionName) => (
                      <div key={emotionName} className="text-center p-1.5 bg-white rounded border border-stone-100 flex flex-col items-center">
                        <div className="w-8 h-8 flex items-center justify-center mb-1">
                          <img
                            src={getEmotionImage(emotionName)}
                            alt={emotionName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-[10px] text-stone-500">{emotionName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Chart View */}
          {viewMode === 'chart' && (
            <motion.div
              key="chart"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <EmotionChartView />
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <h4 className="text-xs font-medium text-emerald-800 mb-2">💡 차트 활용 팁</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  그래프를 통해 나의 감정 변화 추이를 한눈에 파악할 수 있습니다.
                  주간/월간 버튼을 눌러 기간을 변경해보세요.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}