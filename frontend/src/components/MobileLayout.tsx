/**
 * ========================================
 * 모바일 레이아웃 컴포넌트 (Header, Main, Footer 고정)
 * ========================================
 * 
 * 모든 화면에 적용되는 모바일 레이아웃 구조
 * - Header: 상단 고정 (상태바, 네비게이션 등)
 * - Main: 메인 콘텐츠 영역 (스크롤 가능)
 * - Footer: 하단 고정 (하단 탭바 등)
 * 
 * 특징:
 * - Header와 Footer는 고정되어 화면 크기에 따라 변하지 않음
 * - Main 영역만 스크롤 가능
 * - 모바일 화면 크기에 최적화
 */

interface MobileLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function MobileLayout({ header, children, footer, className = '' }: MobileLayoutProps) {
  return (
    <div
      className={`w-full h-full flex flex-col bg-transparent ${className}`}
    // 부모(MobileFrame)가 overflow-hidden이므로 여기서 h-full이 정확히 화면 크기가 됩니다.
    >
      {/* Header: 고정 */}
      {header && (
        <header className="flex-shrink-0 z-40 relative">
          {header}
        </header>
      )}

      {/* Main: 나머지 공간 차지 + 내부 스크롤 */}
      <main
        id="mobile-main-content"
        className="flex-1 w-full relative overflow-y-auto scrollbar-hide"
        style={{
          WebkitOverflowScrolling: 'touch', // iOS 부드러운 스크롤
        }}
      >
        {children}
      </main>

      {/* Footer: 고정 */}
      {footer && (
        <footer className="flex-shrink-0 z-40 relative">
          {footer}
        </footer>
      )}
    </div>
  );
}
