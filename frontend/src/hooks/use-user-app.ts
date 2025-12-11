/**
 * 사용자 앱 상태 관리 Hook
 * 
 * @description
 * UserApp 컴포넌트의 상태 및 로직을 관리하는 hook
 * - 앱 화면 상태 관리 (landing, login, signup, diary 등)
 * - 사용자 정보 관리
 * - 인증 관련 핸들러
 */

import { useState, useCallback } from 'react';
import { TokenStorage } from '../services/authApi';

/**
 * 앱 상태 타입 정의
 */
export type AppState = 'landing' | 'login' | 'signup' | 'forgot-password' | 'persona-setup' | 'diary';

/**
 * 사용자 정보 타입
 */
export interface UserInfo {
  name: string;
  email: string;
}

export function useUserApp() {
  // ========== 상태 관리 ==========
  
  /**
   * 현재 앱 화면 상태
   * - 기본값: 'landing' (항상 랜딩 페이지에서 시작)
   */
  const [appState, setAppState] = useState<AppState>('landing');
  
  /**
   * 로그인한 사용자 정보
   * - null: 로그인 안됨
   * - { name, email }: 로그인됨
   */
  const [user, setUser] = useState<UserInfo | null>(null);

  // ========== 이벤트 핸들러 ==========
  
  /**
   * "일기장 열기" 버튼 클릭 핸들러 (플로우 1.2)
   * 
   * 동작:
   * 1. JWT 토큰 유효성 확인
   * 2. 로그인 상태이면: localStorage에서 사용자 정보 로드 후 다이어리로 이동
   * 3. 로그인 안됨이면: 로그인 화면으로 이동
   */
  const handleOpenBook = useCallback(() => {
    if (TokenStorage.hasValidToken()) {
      // 로그인 상태: user 정보 로드 후 다이어리로 이동
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser({ name: userData.name, email: userData.email });
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
      setAppState('diary');
    } else {
      // 로그인 안됨: 로그인 화면으로
      setAppState('login');
    }
  }, []);

  /**
   * 로그인 성공 핸들러 (플로우 1.1, 16.1)
   * 
   * 동작:
   * 1. localStorage에서 사용자 정보 로드
   * 2. 사용자 정보 상태 업데이트
   * 3. 다이어리 화면으로 바로 이동
   */
  const handleLoginSuccess = useCallback(() => {
    // 사용자 정보 로드 (플로우 16.1)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser({ name: userData.name, email: userData.email });
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    
    // 로그인 시에는 항상 다이어리로 바로 이동 (페르소나 설정 안 함)
    setAppState('diary');
  }, []);

  /**
   * 회원가입 성공 핸들러 (플로우 2 시작, 16.1)
   * 
   * 동작:
   * 1. localStorage에서 사용자 정보 로드
   * 2. 사용자 정보 상태 업데이트
   * 3. 페르소나 설정 화면으로 이동
   */
  const handleSignupSuccess = useCallback(() => {
    // 사용자 정보 로드 (플로우 16.1)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser({ name: userData.name, email: userData.email });
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    
    // 회원가입 직후에만 페르소나 설정 화면으로 이동
    setAppState('persona-setup');
  }, []);

  /**
   * 사용자 정보 업데이트 핸들러
   * - 다이어리에서 프로필 수정 시 사용
   */
  const handleUserUpdate = useCallback((updatedUser: UserInfo) => {
    setUser(updatedUser);
  }, []);

  /**
   * 로그아웃 핸들러
   * 
   * 동작:
   * 1. JWT 토큰 삭제 (localStorage)
   * 2. 사용자 정보 삭제
   * 3. 상태 초기화
   * 4. 랜딩 페이지로 이동
   */
  const handleLogout = useCallback(() => {
    TokenStorage.clearTokens();
    localStorage.removeItem('user');
    setUser(null);
    setAppState('landing');
  }, []);

  /**
   * 랜딩 페이지로 돌아가기
   * - 로그인/회원가입 화면에서 뒤로가기 버튼 클릭 시
   */
  const handleBackToLanding = useCallback(() => {
    setAppState('landing');
  }, []);

  /**
   * 회원가입 화면으로 이동
   * - 로그인 화면에서 "회원가입" 링크 클릭 시
   */
  const handleGoToSignup = useCallback(() => {
    setAppState('signup');
  }, []);

  /**
   * 비밀번호 찾기 화면으로 이동
   * - 로그인 화면에서 "비밀번호 찾기" 링크 클릭 시
   */
  const handleGoToForgotPassword = useCallback(() => {
    setAppState('forgot-password');
  }, []);

  /**
   * 로그인 화면으로 돌아가기
   * - 회원가입, 비밀번호 찾기 화면에서 뒤로가기 시
   */
  const handleBackToLogin = useCallback(() => {
    setAppState('login');
  }, []);

  /**
   * 페르소나 설정 완료 핸들러
   * - 페르소나 선택 완료 시 다이어리 화면으로 이동
   */
  const handlePersonaComplete = useCallback((personaId: string) => {
    console.log('Persona setup completed with:', personaId);
    // 페르소나 설정 완료 → 다이어리 메인 화면으로 이동
    setAppState('diary');
  }, []);

  /**
   * 계정 탈퇴 핸들러
   * - 세션 만료 및 랜딩페이지로 이동
   */
  const handleAccountDeleted = useCallback(() => {
    TokenStorage.clearTokens();
    localStorage.clear();
    setUser(null);
    setAppState('landing');
  }, []);

  return {
    appState,
    user,
    handleOpenBook,
    handleLoginSuccess,
    handleSignupSuccess,
    handleUserUpdate,
    handleLogout,
    handleBackToLanding,
    handleGoToSignup,
    handleGoToForgotPassword,
    handleBackToLogin,
    handlePersonaComplete,
    handleAccountDeleted,
  };
}

