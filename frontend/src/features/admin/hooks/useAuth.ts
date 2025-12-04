import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  isAuthenticated as checkAuth, 
  getAdminInfo,
  type AdminInfo 
} from '../utils/session-manager';

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    
    if (isAuth) {
      const adminInfo = getAdminInfo();
      console.log('[AdminApp] Admin session restored:', adminInfo);
      
      if (location.pathname === '/admin' || location.pathname === '/admin/') {
        navigate('/admin/dashboard', { replace: true });
      }
    } else {
      if (location.pathname !== '/admin' && location.pathname !== '/admin/') {
        navigate('/admin', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

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
        const tab = path.split('/')[0];
        if (tabMap[tab]) {
          setActiveTab(tabMap[tab]);
        } else {
          setActiveTab('dashboard');
        }
      }
    }
  }, [location.pathname, isAuthenticated, navigate]);

  // 인증 상태를 외부에서 업데이트할 수 있도록 함수 제공
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

