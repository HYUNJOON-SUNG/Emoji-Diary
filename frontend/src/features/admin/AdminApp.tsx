import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { Dashboard } from './components/dashboard';
import { SystemSettings } from './components/system-settings';
import { NoticeManagement } from './components/notice-management';
import { ErrorLogs } from './components/error-logs';
import { LoginPage } from './components/login-page';
import { login, logout, type AdminInfo } from './utils/session-manager';
import { useAuth } from './hooks/useAuth';
import { adminLogin, adminLogout } from '../../services/adminApi';
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
  
  // Custom hook으로 인증 로직 분리
  const { isAuthenticated, activeTab, setActiveTab, setIsAuthenticated } = useAuth();

  /**
   * 관리자 로그인 처리 (9.1 관리자 세션 관리)
   * 
   * @param email - 관리자 이메일
   * @param password - 관리자 비밀번호
   * @returns 로그인 결과
   */
  const handleLogin = async (email: string, password: string) => {
    try {
      // POST /api/admin/auth/login
      const response = await adminLogin(email, password);
      
      if (response.success && response.data) {
        // Admin info from response
        const adminInfo: AdminInfo = {
          id: response.data.admin.id.toString(),
          name: response.data.admin.name || '관리자',
          email: response.data.admin.email,
          role: 'super_admin',
          department: 'IT 운영팀'
        };
        
        // [명세서 1.1] 관리자 세션 저장
        // adminLogin 함수에서 이미 admin_access_token과 admin_refresh_token을 localStorage에 저장함
        login(response.data.accessToken, adminInfo);
        setIsAuthenticated(true);
        navigate('/admin/dashboard');
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.error?.message || 'ID 또는 비밀번호가 일치하지 않거나 관리자 권한이 없습니다.' 
        };
      }
    } catch (error: any) {
      console.error('관리자 로그인 실패:', error);
      return { 
        success: false, 
        message: error.message || 'ID 또는 비밀번호가 일치하지 않거나 관리자 권한이 없습니다.' 
      };
    }
  };

  /**
   * 관리자 로그아웃 (7.1, 9.1 관리자 세션 관리)
   * 
   * [API 명세서 Section 10.1.3]
   * POST /api/admin/auth/logout
   * - 관리자 Access Token 및 Refresh Token 무효화 처리 (DB에서 Refresh Token 삭제)
   * 
   * @description
   * - 관리자 로그아웃 API 호출 (서버에서 Refresh Token 무효화)
   * - 관리자 Access Token 삭제 (localStorage에서 admin_access_token 제거, 명세서 1.1)
   * - 관리자 Refresh Token 삭제 (localStorage에서 admin_refresh_token 제거, 명세서 1.1)
   * - 관리자 정보 삭제 (localStorage에서 admin_info 제거)
   * - 인증 상태 초기화 (isAuthenticated = false)
   * - 관리자 로그인 페이지로 자동 이동
   * 
   * @flow
   * 1. NavigationTabs의 "로그아웃" 버튼 클릭
   * 2. 로그아웃 확인 모달 표시 ("정말 로그아웃하시겠습니까?")
   * 3. "로그아웃" 확인 → handleLogout() 실행
   * 4. POST /api/admin/auth/logout API 호출 (서버에서 Refresh Token 무효화)
   * 5. JWT 토큰 삭제 및 관리자 정보 삭제
   * 6. 인증 상태 초기화
   * 7. LoginPage 컴포넌트 표시 (자동 리디렉션)
   */
  const handleLogout = async () => {
    try {
      // [API 명세서 Section 10.1.3] POST /api/admin/auth/logout
      // 서버에서 관리자 Refresh Token 무효화 처리
      await adminLogout();
    } catch (error: any) {
      // API 호출 실패해도 클라이언트 측 로그아웃은 진행
      console.error('관리자 로그아웃 API 호출 실패:', error);
    } finally {
      // Logout and clear session (7.1, 9.1)
      // adminLogout 함수에서 이미 localStorage의 토큰을 제거함
      logout();
      
      // Clear admin authentication state
      setIsAuthenticated(false);
      
      // Reset to dashboard tab
      setActiveTab('dashboard');
      navigate('/admin');
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  // 인증 상태 확인 중 (로딩 중)
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-600">인증 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우
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

