/**
 * ========================================
 * 모바일 테두리 컴포넌트
 * ========================================
 * 
 * 사용자 화면에만 적용되는 모바일 기기 테두리
 * - 반응형으로 작동 (갤럭시 -> 탭 -> 노트북)
 * - 실제 모바일 기기를 사용하는 것처럼 보이게 함
 */

interface MobileFrameProps {
  children: React.ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 overflow-hidden">
      {/* 모바일 테두리 - 웹페이지를 가득 채우도록 크기 조정 (비율 유지) */}
      <div className="w-full h-full max-w-[375px] sm:max-w-[414px] md:max-w-[500px] lg:max-w-[600px] mx-auto relative flex items-center justify-center">
        {/* 상단 노치 (아이폰 스타일) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 sm:w-36 md:w-44 h-6 sm:h-7 md:h-8 bg-black rounded-b-3xl z-30 shadow-2xl" />
        
        {/* 스피커 (상단 중앙) */}
        <div className="absolute top-2 sm:top-2.5 md:top-3 left-1/2 -translate-x-1/2 w-14 sm:w-18 md:w-22 h-1 sm:h-1.5 md:h-2 bg-gray-700 rounded-full z-30" />
        
        {/* 모바일 화면 컨테이너 - 높이를 가득 채움, 테두리 두껍게 */}
        <div className="relative bg-black rounded-[2.5rem] sm:rounded-[3rem] md:rounded-[3.5rem] p-2.5 sm:p-3 md:p-4 shadow-2xl w-full h-full flex flex-col">
          {/* 화면 베젤 */}
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative flex-1 shadow-inner">
            {/* 실제 콘텐츠 영역 - 전체 화면을 채우고 하단 메뉴도 포함 */}
            <div className="relative w-full h-full bg-white overflow-hidden">
              {children}
            </div>
          </div>
          
          {/* 하단 홈 인디케이터 (아이폰 스타일) */}
          <div className="absolute bottom-2.5 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 w-28 sm:w-36 md:w-44 h-1 sm:h-1.5 md:h-2 bg-gray-700 rounded-full z-30" />
        </div>
      </div>
    </div>
  );
}

