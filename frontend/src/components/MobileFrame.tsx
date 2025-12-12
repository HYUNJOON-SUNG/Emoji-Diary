/**
 * ========================================
 * 모바일 테두리 컴포넌트
 * ========================================
 * 
 * 사용자 화면에만 적용되는 모바일 기기 테두리
 * - 좌우: 반응형 (최소 320px, 최대 420px)
 * - 상하: 반응형 (최소 600px, 늘리는 건 제한 없음)
 * - 실제 모바일 기기를 사용하는 것처럼 보이게 함
 * - Safe Area 고려 (상단 노치, 하단 홈 인디케이터)
 * 
 * 참고: https://velog.io/@jihukimme/React-%EB%AA%A8%EB%B0%94%EC%9D%BC-%EC%9B%B9-%EB%A7%8C%EB%93%A4%EA%B8%B0
 */

interface MobileFrameProps {
  children: React.ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div 
      className="w-full min-h-screen min-h-[700px] flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 py-2 sm:py-8"
    >
      {/* 모바일 프레임 컨테이너 */}
      <div 
        className="relative flex items-center justify-center shadow-2xl flex-shrink-0"
        style={{ 
          width: 'clamp(320px, 90vw, 460px)',
          height: 'clamp(600px, 95vh, 1000px)'
        }}
      >
        {/* 상단 노치, 스피커 등은 그대로 유지... */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-30 pointer-events-none" />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full z-30 pointer-events-none" />
        
        {/* 모바일 화면 컨테이너 */}
        <div className="relative bg-black rounded-[2.5rem] p-3 shadow-2xl w-full h-full flex flex-col box-border">
          {/* 화면 베젤 */}
          <div className="bg-white rounded-[2rem] overflow-hidden relative flex-1 shadow-inner w-full h-full">
            
            {/* [수정 포인트] overflow-y-auto 제거 -> overflow-hidden 변경 */}
            {/* 실제 기기 화면은 스스로 스크롤되지 않습니다. 내부 앱(MobileLayout)이 스크롤을 담당합니다. */}
            <div className="relative w-full h-full bg-white overflow-hidden flex flex-col">
              {children}
            </div>

          </div>
          
          {/* 하단 홈 인디케이터 */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full z-30 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

