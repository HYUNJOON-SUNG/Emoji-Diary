import { BookHeart } from 'lucide-react';

/**
 * ========================================
 * LandingPage 컴포넌트
 * ========================================
 * 
 * [플로우 1.1] 랜딩 페이지 진입
 * 
 * 앱 최초 진입 시 표시되는 랜딩 페이지
 * - 전체 화면 모바일 웹 디자인
 * - "일기장 열기" 버튼 클릭 시 → onOpenBook 콜백 호출
 * - 파란색 계열 톤온톤 테마
 * - 모바일 웹 최적화
 */

interface LandingPageProps {
  /** 일기장 열기 버튼 클릭 핸들러 */
  onOpenBook: () => void;
}

export function LandingPage({ onOpenBook }: LandingPageProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 overflow-y-auto text-primary-foreground relative z-10">
      <div className="w-full space-y-12 flex-shrink-0">
        {/* Main Content */}
        <div className="text-center space-y-8 glass p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg ring-4 ring-white/20">
            <BookHeart className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl text-emerald-950 dark:text-emerald-50 font-bold tracking-tight" style={{ fontFamily: 'Pretendard, sans-serif' }}>
              Emoji Diary
            </h1>
            <p className="text-base text-emerald-800 dark:text-emerald-200/80 font-medium">
              나의 감정을 기록하는<br />특별한 숲속 공간
            </p>
          </div>

          {/* Button */}
          <button
            onClick={onOpenBook}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 active:scale-[0.98] touch-manipulation min-h-[60px] font-semibold text-lg tracking-wide border border-white/10"
          >
            일기장 열기
          </button>
        </div>
      </div>
    </div>
  );
}
