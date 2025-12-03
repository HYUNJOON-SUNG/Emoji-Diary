/**
 * ====================================================================================================
 * 네비게이션 탭 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자 대시보드의 상단 네비게이션 바
 * - 파일 바인더 탭(인덱스 탭) 스타일
 * - 클립보드/장부 스타일 디자인
 * 
 * @features
 * 1. 네비게이션 탭 (4개):
 *    - Dashboard (대시보드)
 *    - Notices (공지사항 관리)
 *    - Settings (시스템 설정)
 *    - Error Logs (에러 로그)
 *    - Logout (로그아웃, 우측 상단)
 * 2. 현재 탭 표시:
 *    - 활성화된 탭은 시각적으로 강조 (밑줄, 색상 변경)
 * 3. 로그아웃 버튼:
 *    - 우측 상단 빨간색 버튼
 *    - 로그아웃 확인 모달
 * 
 * ====================================================================================================
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Megaphone, AlertTriangle, LogOut } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function NavigationTabs({ activeTab, onTabChange, onLogout }: NavigationTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // URL에서 현재 탭 추출
  const currentPath = location.pathname.split('/').pop() || 'dashboard';
  const effectiveActiveTab = currentPath === 'admin' ? 'dashboard' : currentPath;

  // Main tabs (4개만 유지)
  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
    { id: 'notices', label: 'Notices', icon: Megaphone, path: 'notices' },
    { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
    { id: 'errorlogs', label: 'Error Logs', icon: AlertTriangle, path: 'errorlogs' }
  ];

  const handleTabClick = (tabId: string, path: string) => {
    onTabChange(tabId);
    navigate(`/admin/${path}`);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <nav className="bg-gradient-to-b from-slate-700 to-slate-600 shadow-xl border-b-2 sm:border-b-4 border-slate-800">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 overflow-x-auto">
        <div className="flex items-end justify-between pt-6">
          <div className="flex items-end space-x-1">
            {/* Main Tabs */}
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = effectiveActiveTab === tab.path || activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.path)}
                  className={`
                    relative px-5 py-3 transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-slate-800 shadow-xl -mb-1' 
                      : 'bg-slate-500/80 text-slate-100 hover:bg-slate-400 mb-0'
                    }
                    rounded-t-lg border-t-2 border-x-2 
                    ${isActive ? 'border-white border-b-0' : 'border-slate-400 border-b-2 border-b-slate-600'}
                    flex items-center space-x-2
                    transform ${isActive ? 'scale-105 translate-y-[2px]' : 'scale-100'}
                  `}
                  style={{
                    clipPath: isActive 
                      ? 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)' 
                      : 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)',
                    boxShadow: isActive 
                      ? '0 -4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8)' 
                      : 'inset 0 -3px 6px rgba(0,0,0,0.3)'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm whitespace-nowrap">{tab.label}</span>
                  
                  {/* Tab Index Style Edge - Enhanced */}
                  {isActive && (
                    <>
                      <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-r from-transparent via-slate-50 to-transparent opacity-40 pointer-events-none"></div>
                      {/* Paper texture on active tab */}
                      <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{
                          backgroundImage: `
                            linear-gradient(0deg, transparent 11px, rgba(100, 100, 100, 0.1) 12px),
                            linear-gradient(90deg, transparent 11px, rgba(100, 100, 100, 0.05) 12px)
                          `,
                          backgroundSize: '12px 12px'
                        }}
                      ></div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Logout Button - Enhanced */}
          <div className="mb-2">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-5 py-2.5 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-md transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl border border-red-800"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">로그아웃</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal (7.1) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-slate-300">
            {/* 모달 헤더 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-slate-800 text-xl">로그아웃 확인</h3>
            </div>
            
            {/* 모달 본문 */}
            <p className="text-slate-600 mb-6 leading-relaxed">
              정말 로그아웃하시겠습니까?
            </p>
            
            {/* 모달 액션 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}