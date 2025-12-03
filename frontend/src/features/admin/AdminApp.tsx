import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout';
import { Dashboard } from './components/dashboard';
import { SystemSettings } from './components/system-settings';
import { NoticeManagement } from './components/notice-management';
import { ErrorLogs } from './components/error-logs';
import { LoginPage } from './components/login-page';
import { 
  isAuthenticated as checkAuth, 
  login, 
  logout,
  getAdminInfo,
  type AdminInfo 
} from './utils/session-manager';
// Import admin-specific CSS
import './index.css';
import './styles/admin-globals.css';

/**
 * ====================================================================================================
 * 관리자 대시보드 메인 애플리케이션
 * ====================================================================================================
 * 
 * @description
 * 전문적인 사무용 장부나 클립보드 스타일의 웹 관리자 대시보드
 * - 파일 바인더 탭(인덱스 탭) 스타일 네비게이션
 * - 깨끗한 흰색 종이 질감의 메인 콘텐츠 영역
 * - 미니멀하고 스큐어모피즘 디자인
 * 
 * @features
 * 1. 관리자 로그인/로그아웃
 * 2. 네비게이션 (4개 탭: 대시보드, 공지사항, 설정, 에러 로그)
 * 3. 데이터 동기화 및 자동 업데이트
 * 4. 에러 처리 및 로딩 상태
 * 5. 관리자 세션 관리
 * 
 * @flow_coverage
 * - 대시보드: 전체 사용자 수, 일지 작성 통계
 * - 공지사항 관리: CRUD 기능
 * - 시스템 설정: 위험 신호 기준, 상담 기관 관리
 * - 에러 로그 조회: 시스템 에러 모니터링
 * 
 * ====================================================================================================
 */

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ========================================
  // State 관리
  // ========================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 8.1 네비게이션 현재 탭

  /**
   * 초기 로드 시 세션 확인 (9.1 관리자 세션 관리)
   * 
   * @description
   * - localStorage에서 JWT 토큰 확인 (admin_jwt_token)
   * - 관리자 정보 확인 (admin_info)
   * - 유효한 세션이 있으면 자동 로그인
   * - 토큰 만료 시 자동 로그아웃 (9.1)
   */
  useEffect(() => {
    // Check authentication status (9.1)
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    
    // Log admin info if authenticated
    if (isAuth) {
      const adminInfo = getAdminInfo();
      console.log('[AdminApp] Admin session restored:', adminInfo);
    }
  }, []);

  /**
   * URL 변경 시 activeTab 업데이트
   */
  useEffect(() => {
    if (isAuthenticated) {
      const path = location.pathname.split('/admin/')[1];
      if (path) {
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
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [location.pathname, isAuthenticated]);

  /**
   * 관리자 로그인 처리 (9.1 관리자 세션 관리)
   * 
   * @param email - 관리자 이메일
   * @param password - 관리자 비밀번호
   * @returns 로그인 결과
   */
  const handleLogin = (email: string, password: string) => {
    // Mock authentication - In real app, this would call backend API
    // Valid credentials: admin@example.com / admin123
    if (email === 'admin@example.com' && password === 'admin123') {
      // Generate mock JWT token
      const mockToken = btoa(JSON.stringify({
        email,
        role: 'admin',
        exp: Date.now() + 3600000 // 1 hour
      }));
      
      // Mock admin info (9.1)
      const adminInfo: AdminInfo = {
        id: 'admin-001',
        name: '관리자',
        email: email,
        role: 'super_admin',
        department: 'IT 운영팀'
      };
      
      // Save session (9.1)
      login(mockToken, adminInfo);
      setIsAuthenticated(true);
      navigate('/admin/dashboard');
      
      return { success: true };
    } else {
      return { 
        success: false, 
        message: 'ID 또는 비밀번호가 일치하지 않거나 관리자 권한이 없습니다.' 
      };
    }
  };

  /**
   * 관리자 로그아웃 (7.1, 9.1 관리자 세션 관리)
   * 
   * @description
   * - 관리자 JWT 토큰 삭제 (localStorage에서 admin_jwt_token 제거)
   * - 관리자 정보 삭제 (localStorage에서 admin_info 제거)
   * - 인증 상태 초기화 (isAuthenticated = false)
   * - 관리자 로그인 페이지로 자동 이동
   * 
   * @flow
   * 1. NavigationTabs의 "로그아웃" 버튼 클릭
   * 2. 로그아웃 확인 모달 표시 ("정말 로그아웃하시겠습니까?")
   * 3. "로그아웃" 확인 → handleLogout() 실행
   * 4. JWT 토큰 삭제 및 관리자 정보 삭제
   * 5. 인증 상태 초기화
   * 6. LoginPage 컴포넌트 표시 (자동 리디렉션)
   */
  const handleLogout = () => {
    // Logout and clear session (7.1, 9.1)
    logout();
    
    // Clear admin authentication state
    setIsAuthenticated(false);
    
    // Reset to dashboard tab
    setActiveTab('dashboard');
    navigate('/admin');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="notices" element={<NoticeManagement />} />
        <Route path="errorlogs" element={<ErrorLogs />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="/" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

