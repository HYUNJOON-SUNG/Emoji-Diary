/**
 * 사용자 애플리케이션 컴포넌트
 * - 사용자 앱의 전체 상태 및 흐름 관리
 * - 로그인/회원가입/메인 화면 전환 처리
 */


import { LandingPage } from '@/features/user/landing/components/LandingPage';
import { LoginPage } from '@/features/user/auth/components/LoginPage';
import { SignupPage } from '@/features/user/auth/components/SignupPage';
import { ForgotPasswordPage } from '@/features/user/auth/components/ForgotPasswordPage';
import { DiaryBook } from '@/features/user/diary/components/DiaryBook';
import { MobileFrame } from '@/shared/components/layout/MobileFrame';
import { InitialPersonaSetup } from '@/shared/components/InitialPersonaSetup';
import { useUserApp } from '@/features/user/auth/hooks/use-user-app';

export default function UserApp() {
  // ========== 상태 및 핸들러 관리 (hooks로 분리) ==========
  const {
    appState,
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
  } = useUserApp();

  // ========== 화면 렌더링 ==========
  
  /**
   * 랜딩 페이지 렌더링
   */
  if (appState === 'landing') {
    return (
      <MobileFrame>
        <LandingPage onOpenBook={handleOpenBook} />
      </MobileFrame>
    );
  }

  /**
   * 로그인 페이지 렌더링
   */
  if (appState === 'login') {
    return (
      <MobileFrame>
        <LoginPage 
          onLoginSuccess={handleLoginSuccess} 
          onBack={handleBackToLanding}
          onSignup={handleGoToSignup}
          onForgotPassword={handleGoToForgotPassword}
        />
      </MobileFrame>
    );
  }

  /**
   * 회원가입 페이지 렌더링
   */
  if (appState === 'signup') {
    return (
      <MobileFrame>
        <SignupPage 
          onSignupSuccess={handleSignupSuccess}
          onBackToLogin={handleBackToLogin}
        />
      </MobileFrame>
    );
  }

  /**
   * 비밀번호 찾기 페이지 렌더링
   */
  if (appState === 'forgot-password') {
    return (
      <MobileFrame>
        <ForgotPasswordPage 
          onBackToLogin={handleBackToLogin}
        />
      </MobileFrame>
    );
  }

  /**
   * 초기 페르소나 설정 페이지 렌더링
   * - 회원가입 직후 필수 설정 단계
   */
  if (appState === 'persona-setup') {
    return (
      <MobileFrame>
        <InitialPersonaSetup 
          onComplete={handlePersonaComplete}
        />
      </MobileFrame>
    );
  }

  /**
   * 다이어리 메인(메인북) 렌더링
   */
  return (
    <MobileFrame>
      <DiaryBook onUserUpdate={handleUserUpdate} onLogout={handleLogout} onAccountDeleted={handleAccountDeleted} />
    </MobileFrame>
  );
}

