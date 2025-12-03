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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive
                  ? 'text-blue-600'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon 
                className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} 
              />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

