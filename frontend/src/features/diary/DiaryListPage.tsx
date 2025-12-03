/**
 * ========================================
 * 일기 검색 및 목록 페이지 컴포넌트 (DiaryListPage)
 * ========================================
 * 
 * 주요 기능 (모바일 웹 최적화):
 * - 일기 검색 (키워드, 기간, 감정별)
 * - 검색 결과 목록 표시
 * - 페이지네이션
 * - 일기 클릭 시 상세보기로 이동
 * 
 * 변경 사항 (모바일):
 * - 좌우 2페이지 레이아웃 → 단일 세로 스크롤 레이아웃
 * - 상단: 검색창 및 필터 토글
 * - 중단: 필터 옵션 (토글 시 확장)
 * - 하단: 검색 결과 리스트
 * - 도움말: 하단에 축소형으로 배치하거나 툴팁으로 처리
 */

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, CalendarDays, Loader2, X, HelpCircle } from 'lucide-react';
import { searchDiaries, DiarySearchParams, DiarySearchResult, DiaryDetail } from '../../services/diaryApi';

interface DiaryListPageProps {
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

const emotionLabels: { [key: string]: string } = {
  happy: '행복',
  love: '사랑',
  excited: '설렘',
  calm: '평온',
  grateful: '감사',
  hopeful: '희망',
  tired: '피곤',
  sad: '슬픔',
  angry: '화남',
  anxious: '불안',
  neutral: '평온',
};

export function DiaryListPage({ onDateClick }: DiaryListPageProps) {
  const [searchResult, setSearchResult] = useState<DiarySearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [keyword, setKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [emotionCategories, setEmotionCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    performSearch();
  }, [currentPage, emotionCategories]);

  const performSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: DiarySearchParams = {
        keyword,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        emotionCategory: emotionCategories.length > 0 ? emotionCategories.join(',') : undefined,
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch();
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
    if (onDateClick) {
      const date = new Date(diary.date);
      onDateClick(date);
    }
  };

  const hasActiveFilters = keyword || startDate || endDate || emotionCategories.length > 0;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="text-center space-y-1 pb-2 border-b border-stone-200/60 relative">
        <div className="flex items-center justify-center gap-2 text-blue-700">
          <Search className="w-5 h-5" />
          <span className="font-bold">일기 검색</span>
        </div>
        <p className="text-xs text-stone-500">과거의 기록을 찾아보세요</p>
        
        {/* Help Toggle Button */}
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="absolute right-0 top-0 p-1.5 text-stone-400 hover:text-blue-600 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Help Section (Collapsible) */}
      {showHelp && (
        <div className="bg-blue-50 p-3 rounded-lg text-xs text-stone-600 border border-blue-100 animate-in slide-in-from-top-2">
          <h4 className="font-semibold text-blue-800 mb-1">검색 도움말</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>제목이나 내용의 단어로 검색할 수 있어요.</li>
            <li>필터를 눌러 날짜나 감정별로 모아보세요.</li>
            <li>검색된 일기를 누르면 상세 내용을 볼 수 있어요.</li>
          </ul>
        </div>
      )}

      {/* Search Bar & Filter Toggle */}
      <form onSubmit={handleSearch} className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border transition-all ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-stone-300 text-stone-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-3 animate-in slide-in-from-top-2">
            {/* Date Range */}
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 min-w-0 px-2 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:border-blue-500 outline-none"
              />
              <span className="text-stone-400 text-xs">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 min-w-0 px-2 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:border-blue-500 outline-none"
              />
            </div>

            {/* Emotions */}
            <div>
              <label className="text-xs text-stone-500 mb-1.5 block">감정 선택</label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(emotionLabels).slice(0, 8).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleEmotionToggle(key)}
                    className={`px-2.5 py-1.5 text-xs rounded-full border transition-colors ${
                      emotionCategories.includes(key)
                        ? `${emotionColors[key]} border-stone-400 text-stone-900 font-medium`
                        : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 text-white text-xs rounded-lg font-medium hover:bg-blue-700"
              >
                검색 적용
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-2 bg-white text-rose-600 border border-rose-200 text-xs rounded-lg hover:bg-rose-50"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Results Info */}
      {searchResult && !isLoading && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-stone-500">
            총 <span className="text-blue-600">{searchResult.total}</span>개의 일기
          </span>
        </div>
      )}

      {/* Error & Loading */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 text-center">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pb-4">
        {!isLoading && searchResult && (
          <>
            {searchResult.diaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400 gap-2">
                <Search className="w-8 h-8 opacity-20" />
                <span className="text-sm">검색 결과가 없습니다.</span>
              </div>
            ) : (
              searchResult.diaries.map((diary) => {
                const date = new Date(diary.date);
                return (
                  <button
                    key={diary.id}
                    onClick={() => handleDiaryClick(diary)}
                    className="w-full flex items-start gap-3 p-3 bg-white/70 hover:bg-white rounded-xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all text-left group"
                  >
                    {/* Date Badge */}
                    <div className="flex flex-col items-center justify-center min-w-[50px] h-full py-1 border-r border-stone-100 pr-3">
                      <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                        {date.toLocaleDateString('ko-KR', { month: 'short' })}
                      </span>
                      <span className="text-xl font-serif text-stone-800 font-bold -mt-1">
                        {date.getDate()}
                      </span>
                      <span className="text-xs text-stone-400">
                        {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between mb-1">
                         <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${emotionColors[diary.emotionCategory]}`}>
                           <span>{diary.emotion}</span>
                           <span className="opacity-80">{emotionLabels[diary.emotionCategory] || '기타'}</span>
                         </div>
                         {diary.weather && (
                           <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                             {diary.weather}
                           </span>
                         )}
                      </div>
                      <h3 className="text-sm font-medium text-stone-800 mb-1 truncate group-hover:text-blue-700 transition-colors">
                        {diary.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {diary.note}
                      </p>
                    </div>
                  </button>
                );
              })
            )}

            {/* Pagination */}
            {searchResult.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md bg-white border border-stone-200 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 text-stone-600" />
                </button>
                <span className="text-xs font-medium text-stone-600">
                  {currentPage} / {searchResult.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(searchResult.totalPages, prev + 1))}
                  disabled={currentPage === searchResult.totalPages}
                  className="p-1.5 rounded-md bg-white border border-stone-200 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4 text-stone-600" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
