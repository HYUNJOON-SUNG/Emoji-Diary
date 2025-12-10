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
    <div className="w-full h-full bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full space-y-8">
        {/* Main Content */}
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl">
            <BookHeart className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl text-slate-700 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              My Diary
            </h1>
            <p className="text-sm text-slate-600">
              나의 감정을 기록하는 특별한 공간
            </p>
          </div>
          
          {/* Button */}
          <button
            onClick={onOpenBook}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] touch-manipulation min-h-[56px]"
          >
            일기장 열기
          </button>
        </div>
        
        {/* Welcome text */}
        <div className="text-center space-y-2 pt-4">
          <h2 className="text-base text-slate-700">환영합니다</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            오늘 하루의 감정을 기록하고<br />
            소중한 순간들을 간직하세요
          </p>
        </div>
      </div>
    </div>
  );
}
