import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  isAuthenticated as checkAuth, 
  getAdminInfo,
  type AdminInfo 
} from '../utils/session-manager';

/**
 * 관리자 인증 처리 및 라우팅 제어 Hook
 * - 세션 상태 확인 및 자동 리다이렉트
 * - 대시보드 탭 관리
 */
export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // 초기 인증 상태 확인 및 리다이렉트
  useEffect(() => {
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    
    if (isAuth) {
      const adminInfo = getAdminInfo();
      console.log('[AdminApp] Admin session restored:', adminInfo);
      
      // 루트나 /admin으로 접근 시 대시보드로 이동
      if (location.pathname === '/admin' || location.pathname === '/admin/') {
        navigate('/admin/dashboard', { replace: true });
      }
    } else {
      // 비로그인 상태에서 보호된 라우트 접근 시 로그인 페이지로 이동
      if (location.pathname !== '/admin' && location.pathname !== '/admin/') {
        navigate('/admin', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  // 탭 상태 동기화 및 라우팅 관리
  useEffect(() => {
    if (isAuthenticated === null) return;

    const path = location.pathname.split('/admin/')[1];
    if (isAuthenticated) {
      if (!path || path === '') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const tabMap: Record<string, string> = {
          'dashboard': 'dashboard',
          'notices': 'notices',
          'settings': 'settings',
          'errorlogs': 'errorlogs'
        };
        // URL 경로의 첫 번째 세그먼트로 탭 결정
        const tab = path.split('/')[0];
        if (tabMap[tab]) {
          setActiveTab(tabMap[tab]);
        } else {
          setActiveTab('dashboard');
        }
      }
    }
  }, [location.pathname, isAuthenticated, navigate]);

  /**
   * 인증 상태 갱신 (외부 호출용)
   */
  const refreshAuth = () => {
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
  };

  return { 
    isAuthenticated, 
    activeTab, 
    setActiveTab,
    setIsAuthenticated, // handleLogin/handleLogout에서 사용
    refreshAuth // 세션 변경 후 인증 상태 갱신용
  };
}

