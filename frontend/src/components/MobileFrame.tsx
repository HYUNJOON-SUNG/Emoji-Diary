/**
 * ========================================
 * 모바일 테두리 컴포넌트
 * ========================================
 * 
 * 사용자 화면에만 적용되는 모바일 기기 테두리
 * - 모바일 화면 크기 고정 (375px - iPhone SE/8 기준)
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
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 overflow-hidden">
      {/* 모바일 프레임 컨테이너 - 360px x 800px 완전 고정 (반응형 없음) */}
      <div 
        className="relative flex items-center justify-center shadow-2xl flex-shrink-0"
        style={{ 
          width: '360px', 
          height: '700px',
          minWidth: '360px',
          maxWidth: '360px',
          minHeight: '730px',
          maxHeight: '730px'
        }}
      >
        {/* 상단 노치 (아이폰 스타일) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-30" />
        
        {/* 스피커 (상단 중앙) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full z-30" />
        
        {/* 모바일 화면 컨테이너 - 검은색 베젤 */}
        <div className="relative bg-black rounded-[2.5rem] p-2.5 shadow-2xl w-full h-full flex flex-col" style={{ minHeight: 0 }}>
          {/* 화면 베젤 - 흰색 내부 */}
          <div className="bg-white rounded-[2rem] overflow-hidden relative flex-1 shadow-inner" style={{ minHeight: 0, maxHeight: '100%' }}>
            {/* 실제 콘텐츠 영역 - Safe Area 고려 */}
            <div className="relative w-full h-full bg-white" style={{ minHeight: 0, maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
              {children}
            </div>
          </div>
          
          {/* 하단 홈 인디케이터 (아이폰 스타일) */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full z-30" />
        </div>
      </div>
    </div>
  );
}

