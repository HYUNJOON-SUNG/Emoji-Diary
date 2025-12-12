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
 * 
 * [API 명세서 Section 5.1]
 * - GET /api/diaries/search
 * - Query Parameters: keyword, startDate, endDate, emotions, page, limit
 * - emotions: 감정 필터 (여러 개 가능, 쉼표로 구분, 예: "행복,중립,슬픔")
 *   - KoBERT 감정 종류: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
 * - Response: { total, page, limit, totalPages, diaries }
 * 
 * [ERD 설계서 참고 - Diaries 테이블]
 * - 검색은 Diaries 테이블의 title, content 필드에서 수행
 * - FULLTEXT 인덱스: idx_diaries_title_content (일기 검색 최적화)
 * - emotion 필터는 Diaries.emotion 컬럼 기준 (ENUM: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
 * 
 * 변경 사항 (모바일):
 * - 좌우 2페이지 레이아웃 → 단일 세로 스크롤 레이아웃
 * - 상단: 검색창 및 필터 토글
 * - 중단: 필터 옵션 (토글 시 확장)
 * - 하단: 검색 결과 리스트
 * - 도움말: 하단에 축소형으로 배치하거나 툴팁으로 처리
 */

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, CalendarDays, Loader2, X, HelpCircle, ArrowLeft } from 'lucide-react';
import { searchDiaries, DiarySearchParams, DiarySearchResult, DiaryDetail } from '../../services/diaryApi';

import happyImg from '../../assets/행복.png';
import neutralImg from '../../assets/중립.png';
import embarrassedImg from '../../assets/당황.png';
import sadImg from '../../assets/슬픔.png';
import angerImg from '../../assets/분노.png';
import anxietyImg from '../../assets/불안.png';
import disgustImg from '../../assets/혐오.png';

// ... imports

interface DiaryListPageProps {
  onDateClick?: (date: Date) => void;
  onDiaryClick?: (date: Date) => void;
  onBack?: () => void;
}

const KOBERT_EMOTIONS = ['행복', '중립', '당황', '슬픔', '분노', '불안', '혐오'];
// ...

const KOBERT_EMOTIONS_MAP: { [key: string]: { image: string } } = {
  '행복': { image: happyImg },
  '중립': { image: neutralImg },
  '당황': { image: embarrassedImg },
  '슬픔': { image: sadImg },
  '분노': { image: angerImg },
  '불안': { image: anxietyImg },
  '혐오': { image: disgustImg },
};

/**
 * KoBERT 감정별 색상 매핑 (삭제됨 - 모노크롬 스타일 적용)
 */
// const emotionColors = ...





// ... (inside component)

// ...



export function DiaryListPage({ onDateClick, onDiaryClick, onBack }: DiaryListPageProps) {
  const [searchResult, setSearchResult] = useState<DiarySearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [keyword, setKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [emotionCategories, setEmotionCategories] = useState<string[]>([]); // KoBERT 감정 배열 (예: ['행복', '슬픔'])
  const [currentPage, setCurrentPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 초기 로드 여부

  // 초기 로드 시 전체 일기 조회
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      // 필터 없이 전체 일기 조회
      performSearch();
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 페이지 변경 시 검색 실행
  useEffect(() => {
    if (!isInitialLoad) {
      performSearch();
    }
  }, [currentPage]);

  // 필터 변경 시 자동 검색 실행 (요구사항: 필터 변경 시 자동으로 검색 실행)
  useEffect(() => {
    if (!isInitialLoad) {
      setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
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
        emotions: emotionCategories.length > 0 ? emotionCategories.join(',') : undefined, // API 명세서: emotions 파라미터 사용 (KoBERT 감정)
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
    // 필터 초기화 후 즉시 전체 일기 조회 (useEffect가 자동으로 검색 실행)
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
    // onDiaryClick이 있으면 우선 사용, 없으면 onDateClick 사용
    if (onDiaryClick) {
      onDiaryClick(date);
    } else if (onDateClick) {
      onDateClick(date);
    }
  };

  const hasActiveFilters = keyword || startDate || endDate || emotionCategories.length > 0;

  return (
    <div className="w-full min-h-full flex flex-col space-y-4">
      {/* Header - 뒤로가기 버튼 포함 */}
      <div className="text-center space-y-1 pb-2 border-b border-stone-200/60 relative">
        {/* 뒤로가기 버튼 - 왼쪽 상단 고정 (요구사항 12) */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-0 left-0 p-2 active:bg-gray-100 rounded-xl transition-colors text-blue-600 active:text-blue-700 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center justify-center gap-2 text-blue-700">
          <Search className="w-5 h-5" />
          <span className="font-bold">일기 검색</span>
        </div>
        <p className="text-xs text-stone-500">과거의 기록을 찾아보세요</p>
        
        {/* Help Toggle Button */}
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="absolute right-0 top-0 p-1.5 text-stone-400 hover:text-blue-600 transition-colors"
          title="도움말"
          aria-label="도움말"
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
      <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-2">
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
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  setStartDate(newStartDate);
                  // 시작일이 종료일보다 늦으면 종료일을 시작일로 설정
                  if (newStartDate && endDate && newStartDate > endDate) {
                    setEndDate(newStartDate);
                  }
                }}
                max={endDate || undefined} // 종료일이 있으면 종료일 이후 선택 불가
                className="flex-1 min-w-0 px-2 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:border-blue-500 outline-none"
                title="시작 날짜"
                aria-label="시작 날짜"
              />
              <span className="text-stone-400 text-xs">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  const newEndDate = e.target.value;
                  // 시작일이 있으면 시작일 이전은 선택 불가
                  if (startDate && newEndDate < startDate) {
                    return; // 유효하지 않은 날짜는 무시
                  }
                  setEndDate(newEndDate);
                }}
                min={startDate || undefined} // 시작일이 있으면 시작일 이전 선택 불가
                className="flex-1 min-w-0 px-2 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:border-blue-500 outline-none"
                title="종료 날짜"
                aria-label="종료 날짜"
              />
            </div>

            {/* Emotions */}
            <div>
              <label className="text-xs text-stone-500 mb-1.5 block">감정 선택 (KoBERT 감정)</label>
              <div className="flex flex-wrap gap-1.5">
                {KOBERT_EMOTIONS.map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => handleEmotionToggle(emotion)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      emotionCategories.includes(emotion)
                        ? 'bg-white border-stone-900 text-stone-900 font-bold shadow-sm'
                        : 'bg-white border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full py-2 bg-white text-rose-600 border border-rose-200 text-xs rounded-lg hover:bg-rose-50 font-medium"
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
                    title={`${diary.title} - ${date.toLocaleDateString('ko-KR')}`}
                    aria-label={`${diary.title} 일기 보기`}
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
                         <div className="flex items-center gap-2">
                           <div className="px-2.5 py-0.5 rounded-full text-[10px] font-medium border bg-white border-stone-200 text-stone-600">
                             {diary.emotion}
                           </div>
                           {KOBERT_EMOTIONS_MAP[diary.emotion]?.image && (
                             <img 
                               src={KOBERT_EMOTIONS_MAP[diary.emotion]?.image} 
                               alt={diary.emotion} 
                               className="w-5 h-5 object-contain"
                             />
                           )}
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
                        {diary.content}
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
                  title="이전 페이지"
                  aria-label="이전 페이지"
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
                  title="다음 페이지"
                  aria-label="다음 페이지"
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
