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
  /** 상단 헤더 영역 */
  header?: React.ReactNode;
  /** 메인 콘텐츠 영역 */
  children: React.ReactNode;
  /** 하단 푸터 영역 */
  footer?: React.ReactNode;
  /** 추가 클래스명 */
  className?: string;
}

export function MobileLayout({ header, children, footer, className = '' }: MobileLayoutProps) {
  return (
    <div 
      className={`w-full h-full flex flex-col bg-white ${className}`} 
      style={{ 
        height: '100%',
        minHeight: 0, 
        maxHeight: '100%', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header 영역 - 고정 */}
      {header && (
        <div 
          className="flex-shrink-0 z-40" 
          style={{ 
            flexShrink: 0,
            flexGrow: 0
          }}
        >
          {header}
        </div>
      )}
      
      {/* Main 영역 - 스크롤 가능 (Header와 Footer를 제외한 나머지 공간) */}
      <div 
        className="relative" 
        style={{ 
          flex: '1 1 0%',
          minHeight: 0,
          maxHeight: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>
      
      {/* Footer 영역 - 고정 (항상 바닥에) */}
      {footer && (
        <div 
          className="flex-shrink-0 z-40" 
          style={{ 
            flexShrink: 0,
            flexGrow: 0
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

