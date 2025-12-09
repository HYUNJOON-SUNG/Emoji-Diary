/**
 * ========================================
 * 하단 탭 바 컴포넌트
 * ========================================
 * 
 * 다이어리 앱의 주요 화면 간 이동을 위한 하단 네비게이션 바
 * - 홈(캘린더), 목록, 통계, 마이페이지 탭
 */

import { Home, List, BarChart3, User } from 'lucide-react';

export type TabType = 'home' | 'list' | 'stats' | 'mypage';

interface BottomTabBarProps {
  /** 현재 활성화된 탭 */
  activeTab: TabType;
  /** 탭 변경 핸들러 */
  onTabChange: (tab: TabType) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const tabs: { id: TabType; label: string; icon: typeof Home }[] = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'list', label: '목록', icon: List },
    { id: 'stats', label: '통계', icon: BarChart3 },
    { id: 'mypage', label: '마이', icon: User },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-500 active:text-gray-700'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                <Icon 
                  className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} 
                />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

