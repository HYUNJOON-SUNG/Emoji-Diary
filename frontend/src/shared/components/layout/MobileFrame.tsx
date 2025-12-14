/**
 * ========================================
 * 모바일 레이아웃 컨테이너
 * ========================================
 * 
 * 모바일 화면 비율을 유지하기 위한 단순 컨테이너
 * - 중앙 정렬
 * - 최대 너비 제한 (460px)
 * - 전체 높이 사용
 */

interface MobileFrameProps {
  children: React.ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="w-full min-h-screen flex justify-center bg-zinc-50 transition-colors duration-500">
      <div
        className="w-full max-w-[480px] h-[100dvh] overflow-hidden bg-white shadow-xl relative flex flex-col transition-all duration-500"
      >
        {children}
      </div>
    </div>
  );
}

