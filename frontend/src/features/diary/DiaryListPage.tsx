/**
 * ========================================
 * 일기 검색 및 목록 페이지 컴포넌트 (DiaryListPage)
 * ========================================
 * 
 * 주요 기능 (플로우 6.1, 6.2, 6.3):
 * - 일기 검색 (키워드, 기간, 감정별)
 * - 검색 결과 목록 표시
 * - 페이지네이션
 * - 일기 클릭 시 상세보기로 이동 (플로우 6.3)
 */

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2, X, HelpCircle, ArrowLeft } from 'lucide-react';
import { searchDiaries, DiarySearchParams, DiarySearchResult, DiaryDetail } from '../../services/diaryApi';

import happyImg from '../../assets/행복.png';
import neutralImg from '../../assets/중립.png';
import embarrassedImg from '../../assets/당황.png';
import sadImg from '../../assets/슬픔.png';
import angerImg from '../../assets/분노.png';
import anxietyImg from '../../assets/불안.png';
import disgustImg from '../../assets/혐오.png';

interface DiaryListPageProps {
  onDateClick?: (date: Date) => void;
  onDiaryClick?: (date: Date) => void;
  onBack?: () => void;
}

const KOBERT_EMOTIONS = ['행복', '중립', '당황', '슬픔', '분노', '불안', '혐오'];

const KOBERT_EMOTIONS_MAP: { [key: string]: { image: string } } = {
  '행복': { image: happyImg },
  '중립': { image: neutralImg },
  '당황': { image: embarrassedImg },
  '슬픔': { image: sadImg },
  '분노': { image: angerImg },
  '불안': { image: anxietyImg },
  '혐오': { image: disgustImg },
};

export function DiaryListPage({ onDateClick, onDiaryClick, onBack }: DiaryListPageProps) {
  const [searchResult, setSearchResult] = useState<DiarySearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [emotionCategories, setEmotionCategories] = useState<string[]>([]); // KoBERT 감정 배열
  const [currentPage, setCurrentPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 초기 로드 시 전체 일기 조회
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      performSearch();
    }
  }, []);

  // 페이지 변경 시 검색 실행
  useEffect(() => {
    if (!isInitialLoad) {
      performSearch();
    }
  }, [currentPage]);

  // 필터 변경 시 자동 검색 실행
  useEffect(() => {
    if (!isInitialLoad) {
      setCurrentPage(1);
      performSearch();
    }
  }, [keyword, startDate, endDate, emotionCategories.join(',')]);

  const performSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: DiarySearchParams = {
        keyword,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        emotions: emotionCategories.length > 0 ? emotionCategories.join(',') : undefined,
        page: currentPage,
        limit: 10,
      };

      const result = await searchDiaries(params);
      setSearchResult(result);
    } catch (err) {
      setError('일기를 불러오는 데 실패했습니다.');
      console.error('Failed to search diaries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setEmotionCategories([]);
    setCurrentPage(1);
  };

  const handleEmotionToggle = (emotion: string) => {
    setEmotionCategories(prev => {
      if (prev.includes(emotion)) {
        return prev.filter(e => e !== emotion);
      } else {
        return [...prev, emotion];
      }
    });
  };

  const handleDiaryClick = (diary: DiaryDetail) => {
    const date = new Date(diary.date);
    if (onDiaryClick) {
      onDiaryClick(date);
    } else if (onDateClick) {
      onDateClick(date);
    }
  };

  const hasActiveFilters = keyword || startDate || endDate || emotionCategories.length > 0;

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-stone-950">
      {/* Header - Glass Effect */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-emerald-100/50 dark:border-emerald-900/30 px-4 py-3 shadow-sm">
        <div className="relative flex items-center justify-center min-h-[44px]">
          {/* 뒤로가기 버튼 */}
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-300"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}

          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" />
              일기 검색
            </h1>
            <p className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60 font-medium">
              소중한 추억을 찾아보세요
            </p>
          </div>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`absolute right-0 p-2 rounded-full transition-colors ${showHelp ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            aria-label="도움말"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="p-4 space-y-4 pb-24">

          {/* Help Section (Collapsible) */}
          {showHelp && (
            <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-4 rounded-2xl text-xs text-stone-600 dark:text-stone-300 border border-emerald-100 dark:border-emerald-800 animate-in slide-in-from-top-2 shadow-sm">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                검색 도움말
              </h4>
              <ul className="space-y-1.5 pl-4 relative before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-px before:bg-emerald-200 dark:before:bg-emerald-800">
                <li className="relative pl-2 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-px before:bg-emerald-200">제목이나 내용의 단어로 검색할 수 있어요.</li>
                <li className="relative pl-2 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-px before:bg-emerald-200">필터를 눌러 날짜나 감정별로 모아보세요.</li>
                <li className="relative pl-2 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-px before:bg-emerald-200">검색된 일기를 누르면 상세 내용을 볼 수 있어요.</li>
              </ul>
            </div>
          )}

          {/* Search Bar & Filter Toggle */}
          <form onSubmit={(e) => { e.preventDefault(); }} className="sticky top-2 z-20 space-y-2" noValidate>
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="w-full pl-10 pr-4 py-3.5 text-sm bg-white dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none shadow-sm transition-all placeholder:text-stone-400"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 rounded-2xl border transition-all flex items-center justify-center ${showFilters
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-inner'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:border-emerald-300 hover:text-emerald-600 shadow-sm'
                  }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Expanded Filters - Glass Panel */}
            {showFilters && (
              <div className="p-4 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-stone-700 space-y-4 animate-in slide-in-from-top-2 shadow-lg ring-1 ring-black/5">
                {/* Date Range */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-500 ml-1">날짜 범위</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        setStartDate(newStartDate);
                        if (newStartDate && endDate && newStartDate > endDate) {
                          setEndDate(newStartDate);
                        }
                      }}
                      max={endDate || undefined}
                      className="flex-1 min-w-0 px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                    <span className="text-stone-300">~</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        const newEndDate = e.target.value;
                        if (startDate && newEndDate < startDate) return;
                        setEndDate(newEndDate);
                      }}
                      min={startDate || undefined}
                      className="flex-1 min-w-0 px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Emotions */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-500 ml-1">감정 선택</label>
                  <div className="flex flex-wrap gap-2">
                    {KOBERT_EMOTIONS.map((emotion) => (
                      <button
                        key={emotion}
                        type="button"
                        onClick={() => handleEmotionToggle(emotion)}
                        className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${emotionCategories.includes(emotion)
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-700 font-bold shadow-sm'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700'
                          }`}
                      >
                        {emotion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="w-full py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 text-xs rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 font-medium transition-colors"
                    >
                      필터 초기화
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Results Info */}
          {searchResult && !isLoading && (
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-100/50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">
                총 <span className="text-emerald-600 dark:text-emerald-400">{searchResult.total}</span>개의 일기
              </span>
            </div>
          )}

          {/* Error & Loading */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 text-center flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </div>
              {error}
            </div>
          )}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-xs text-stone-400 font-medium animate-pulse">일기를 불러오는 중...</p>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-3">
            {!isLoading && searchResult && (
              <>
                {searchResult.diaries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                      <Search className="w-8 h-8 opacity-20" />
                    </div>
                    <span className="text-sm font-medium">검색 결과가 없습니다.</span>
                  </div>
                ) : (
                  searchResult.diaries.map((diary) => {
                    const date = new Date(diary.date);
                    return (
                      <button
                        key={diary.id}
                        onClick={() => handleDiaryClick(diary)}
                        className="w-full flex items-start gap-4 p-4 bg-white/70 dark:bg-stone-900/70 backdrop-blur-sm hover:bg-white dark:hover:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all text-left group"
                      >
                        {/* Date Badge - Green Style */}
                        <div className="flex flex-col items-center justify-center min-w-[52px] h-full py-1 border-r border-emerald-100/50 dark:border-emerald-900/30 pr-4">
                          <span className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60 font-bold uppercase tracking-wider">
                            {date.toLocaleDateString('ko-KR', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-serif text-emerald-900 dark:text-emerald-100 font-bold -mt-1 group-hover:scale-110 transition-transform origin-center">
                            {date.getDate()}
                          </span>
                          <span className="text-xs text-stone-400">
                            {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {KOBERT_EMOTIONS_MAP[diary.emotion]?.image && (
                                <img
                                  src={KOBERT_EMOTIONS_MAP[diary.emotion]?.image}
                                  alt={diary.emotion}
                                  className="w-5 h-5 object-contain drop-shadow-sm"
                                />
                              )}
                              <div className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                {diary.emotion}
                              </div>
                            </div>
                            {diary.weather && (
                              <span className="text-sm grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                {diary.weather}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 mb-1 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {diary.title}
                          </h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                            {diary.content}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}

                {/* Pagination */}
                {searchResult.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 disabled:opacity-30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-stone-600 dark:text-stone-400 font-mono bg-white/50 dark:bg-stone-900/50 px-3 py-1 rounded-lg">
                      {currentPage} / {searchResult.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(searchResult.totalPages, prev + 1))}
                      disabled={currentPage === searchResult.totalPages}
                      className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 disabled:opacity-30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-colors shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
