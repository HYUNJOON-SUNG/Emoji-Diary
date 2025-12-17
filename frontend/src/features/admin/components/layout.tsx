import { NavigationTabs } from './navigation-tabs';

/**
 * ====================================================================================================
 * 관리자 레이아웃 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자 대시보드의 공통 레이아웃 구조를 정의하는 컴포넌트
 * - 상단 네비게이션 탭 (NavigationTabs) 포함
 * - 메인 컨텐츠 영역 스타일링 (종이 질감 배경)
 * - 반응형 최대 너비 및 여백 설정
 * 
 * @features
 * 1. 전체 화면 배경:
 *    - Slate 그라데이션 배경 적용
 * 2. 상단 네비게이션:
 *    - 탭 방식의 네비게이션 바
 * 3. 컨텐츠 컨테이너:
 *    - 중앙 정렬 및 최대 너비 제한 (1600px)
 *    - 종이 질감 패턴 배경 적용 (스큐어모피즘)
 *    - 그림자 및 테두리 효과
 * 
 * @props
 * - children: 메인 컨텐츠 요소
 * - activeTab: 현재 활성화된 탭 ID
 * - onTabChange: 탭 변경 핸들러 함수
 * - onLogout: 로그아웃 핸들러 함수
 * 
 * ====================================================================================================
 */

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function Layout({ children, activeTab, onTabChange, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Navigation */}
      <NavigationTabs activeTab={activeTab} onTabChange={onTabChange} onLogout={onLogout} />
      
      {/* Main Content Area */}
      <main className="w-full max-w-[1600px] mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* Paper Background Container */}
        <div 
          className="bg-white rounded-xl shadow-2xl border-2 sm:border-4 border-slate-300 min-h-[calc(100vh-180px)] p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 overflow-x-hidden w-full"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 19px, rgba(200, 200, 200, 0.15) 20px),
              linear-gradient(90deg, transparent 19px, rgba(200, 200, 200, 0.1) 20px)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}