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
import { ChevronLeft, ChevronRight, CalendarDays, Activity, Loader2, TrendingUp, Info } from 'lucide-react';
import { fetchDailyStats, DailyStats } from '../../services/diaryApi';
import { EmotionChartView } from './EmotionChartView';

interface EmotionStatsPageProps {
  onDateClick?: (date: Date) => void;
}

const emotionColors: { [key: string]: string } = {
  happy: 'bg-sky-200',
  love: 'bg-blue-200',
  excited: 'bg-indigo-200',
  calm: 'bg-cyan-200',
  grateful: 'bg-teal-200',
  hopeful: 'bg-sky-300',
  tired: 'bg-rose-200',
  sad: 'bg-red-200',
  angry: 'bg-rose-300',
  anxious: 'bg-pink-200',
  neutral: 'bg-stone-200',
};

export function EmotionStatsPage({ onDateClick }: EmotionStatsPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'chart'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [periodType, setPeriodType] = useState<'week' | 'month'>('week'); // 주간/월간 선택

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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
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
          className={`aspect-square rounded-lg border transition-all relative group p-1 ${ 
            isToday ? 'ring-2 ring-blue-600' : ''
          } ${
            stats
              ? `${emotionColors[stats.emotionCategory]} border-blue-400`
              : 'bg-white/50 border-stone-300'
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm ${isToday ? 'font-bold text-blue-800' : 'text-stone-700'}`}>
              {day}
            </span>
          </div>
          
          {stats && (
            <span className="absolute top-0.5 right-0.5 text-xs leading-none">{stats.emotion}</span>
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
              className={`text-center text-xs ${
                i === 0 ? 'text-rose-600' : i === 6 ? 'text-blue-600' : 'text-stone-600'
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
          return (
            <button
              key={stat.date}
              onClick={() => handleDateClick(date)}
              className="w-full flex items-center gap-4 p-3 bg-white/60 hover:bg-white/90 rounded-lg border border-stone-300 transition-all shadow-sm text-left"
            >
              <div className="flex flex-col items-center min-w-[50px]">
                <span className="text-xs text-stone-500">
                  {date.getDate()}일
                </span>
                <span className="text-xs text-stone-400">
                  {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                </span>
              </div>

              <div className={`w-10 h-10 rounded-full ${emotionColors[stat.emotionCategory]} flex items-center justify-center text-xl shrink-0`}>
                {stat.emotion}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-800 truncate">{stat.title}</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderSelectedDateSummary = () => {
    if (!selectedDate) return null;

    const stats = getStatsForDate(selectedDate);
    const dateString = selectedDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    return (
      <div className="mt-4 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-sm animate-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-stone-700">{dateString}</h3>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-xs text-stone-400 hover:text-stone-600 bg-white px-3 py-2 rounded border border-stone-200 min-h-[44px] flex items-center"
          >
            닫기
          </button>
        </div>
        
        {stats ? (
          <div className="flex items-center gap-4">
            <span className="text-4xl filter drop-shadow-sm">{stats.emotion}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-stone-800 mb-2 line-clamp-1">{stats.title}</p>
              <button
                onClick={() => onDateClick && onDateClick(selectedDate)}
                className="text-xs text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full transition-colors shadow-sm min-h-[44px] flex items-center"
              >
                일기 보러가기
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-500">작성된 일기가 없습니다.</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="text-center space-y-1 pb-2 border-b border-stone-200/60">
        <div className="flex items-center justify-center gap-2 text-blue-700">
          <Activity className="w-5 h-5" />
          <span className="font-bold">감정 통계</span>
        </div>
        <p className="text-xs text-stone-500">나의 감정 흐름을 확인해보세요</p>
      </div>

      {/* View Toggle */}
      <div className="flex p-1 bg-stone-100 rounded-xl">
        {[
          { id: 'calendar', icon: CalendarDays, label: '캘린더' },
          { id: 'timeline', icon: Activity, label: '타임라인' },
          { id: 'chart', icon: TrendingUp, label: '차트' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              setViewMode(mode.id as any);
              setSelectedDate(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-all ${
              viewMode === mode.id
                ? 'bg-white text-blue-600 shadow-sm font-medium'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <mode.icon className="w-3.5 h-3.5" />
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Month Navigation */}
      {viewMode !== 'chart' && (
        <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg border border-stone-200">
          <button onClick={handlePrevMonth} className="p-1.5 rounded-md hover:bg-stone-100">
            <ChevronLeft className="w-4 h-4 text-stone-600" />
          </button>
          <h3 className="text-sm font-medium text-stone-800">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h3>
          <button onClick={handleNextMonth} className="p-1.5 rounded-md hover:bg-stone-100">
            <ChevronRight className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      )}

      {/* Loading & Error */}
      {isLoading && viewMode !== 'chart' && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
      {error && viewMode !== 'chart' && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!isLoading && !error && viewMode !== 'chart' && (
          <div className="space-y-4">
            {viewMode === 'calendar' ? renderCalendarView() : renderTimelineView()}
            
            {/* Selected Date Summary (Always shown below content if selected) */}
            {selectedDate && renderSelectedDateSummary()}

            {/* Legend / Info (Only shown when nothing selected) */}
            {!selectedDate && viewMode === 'calendar' && (
               <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="text-xs font-medium text-stone-600 mb-3 flex items-center gap-1">
                    <Info className="w-3 h-3" /> 감정 범례
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '행복', emoji: '😊' },
                      { label: '중립', emoji: '😐' },
                      { label: '당황', emoji: '😳' },
                      { label: '슬픔', emoji: '😢' },
                      { label: '분노', emoji: '😠' },
                      { label: '불안', emoji: '😰' },
                      { label: '혐오', emoji: '🤢' },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-1.5 bg-white rounded border border-stone-100">
                        <div className="text-lg">{item.emoji}</div>
                        <div className="text-[10px] text-stone-500">{item.label}</div>
                      </div>
                    ))}
                  </div>
               </div>
            )}
          </div>
        )}

        {/* Chart View */}
        {viewMode === 'chart' && (
          <div className="space-y-4">
            <EmotionChartView />
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <h4 className="text-xs font-medium text-blue-800 mb-2">💡 차트 활용 팁</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                그래프를 통해 나의 감정 변화 추이를 한눈에 파악할 수 있습니다.
                주간/월간 버튼을 눌러 기간을 변경해보세요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}