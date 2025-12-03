/**
 * ========================================
 * 감정 일기 앱 - 사용자 애플리케이션 컴포넌트
 * ========================================
 * 
 * 주요 기능:
 * - 앱 전체 상태 관리 (화면 전환, 사용자 정보)
 * - JWT 토큰 기반 인증 처리
 * - 랜딩 → 로그인/회원가입 → 페르소나 설정 → 다이어리 플로우 관리
 * 
 * 화면 흐름 (플로우 1, 2):
 * 1. 랜딩 페이지: "일기장 열기" 버튼
 * 2. 로그인 상태 확인
 *    - 로그인됨: 다이어리로 이동
 *    - 로그인 안됨: 로그인 화면
 * 3. 회원가입 시: 페르소나 설정 화면 (필수)
 * 4. 다이어리 메인 화면
 */

import { useState, useEffect } from 'react';
import { LandingPage, LoginPage, SignupPage, ForgotPasswordPage } from './pages';
import { DiaryBook } from './features/diary/DiaryBook';
import { InitialPersonaSetup } from './components/InitialPersonaSetup';
import { ImageWithFallback } from './components/shared/ImageWithFallback';
import { TokenStorage } from './services/authApi';
import { LogOut, UserCircle } from 'lucide-react';

/**
 * 앱 상태 타입 정의
 * - landing: 랜딩 페이지 (앱 시작)
 * - login: 로그인 화면
 * - signup: 회원가입 화면
 * - forgot-password: 비밀번호 찾기 화면
 * - persona-setup: AI 페르소나 초기 설정 (회원가입 직후에만)
 * - diary: 다이어리 메인 화면
 */
type AppState = 'landing' | 'login' | 'signup' | 'forgot-password' | 'persona-setup' | 'diary';

export default function UserApp() {
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
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // ========== 플로우 1: 앱 시작 및 초기 진입 ==========
  
  /**
   * 자동 로그인 체크 제거
   * - 앱 시작 시 항상 랜딩 페이지 표시
   * - "일기장 열기" 버튼 클릭 시에만 로그인 상태 확인
   * - 사용자 경험 개선: 매번 랜딩 페이지의 감성적인 디자인을 보여줌
   */

  // ========== 이벤트 핸들러 ==========
  
  /**
   * "일기장 열기" 버튼 클릭 핸들러 (플로우 1.2)
   * 
   * 동작:
   * 1. JWT 토큰 유효성 확인
   * 2. 로그인 상태이면:
   *    - localStorage에서 사용자 정보 로드
   *    - 다이어리 화면으로 이동
   * 3. 로그인 안됨이면:
   *    - 로그인 화면으로 이동
   * 
   * [백엔드 팀] TokenStorage.hasValidToken()에서 토큰 검증 필요
   */
  const handleOpenBook = () => {
    if (TokenStorage.hasValidToken()) {
      // 로그인 상태: user 정보 로드 후 다이어리로 이동
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
      setAppState('diary');
    } else {
      // 로그인 안됨: 로그인 화면으로
      setAppState('login');
    }
  };

  /**
   * 로그인 성공 핸들러 (플로우 1.1, 16.1)
   * 
   * 동작:
   * 1. localStorage에서 사용자 정보 로드 (플로우 16.1):
   *    - 키: 'user'
   *    - 값: JSON 문자열 { id, email, name, notificationEnabled }
   *    - 파싱: JSON.parse(userStr)
   * 2. 사용자 정보 상태 업데이트 (setUser)
   * 3. 다이어리 화면으로 바로 이동 (setAppState('diary'))
   * 
   * 참고:
   * - 로그인 시에는 페르소나 설정 건너뜀
   * - 페르소나 설정은 회원가입 직후에만 진행
   * - 기존 사용자는 설정에서 페르소나 변경 가능
   * 
   * 플로우 16.1 요구사항:
   * - 로그인 토큰 저장 (LoginPage에서 TokenStorage.setTokens() 호출)
   * - 사용자 정보 저장 (LoginPage에서 localStorage.setItem('user', ...) 호출)
   */
  const handleLoginSuccess = () => {
    // 사용자 정보 로드 (플로우 16.1)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    // 로그인 시에는 항상 다이어리로 바로 이동 (페르소나 설정 안 함)
    setAppState('diary');
  };

  /**
   * 회원가입 성공 핸들러 (플로우 2 시작, 16.1)
   * 
   * 동작:
   * 1. localStorage에서 사용자 정보 로드 (플로우 16.1):
   *    - 키: 'user'
   *    - 값: JSON 문자열 { id, email, name, notificationEnabled }
   *    - 파싱: JSON.parse(userStr)
   * 2. 사용자 정보 상태 업데이트 (setUser)
   * 3. 페르소나 설정 화면으로 이동 (setAppState('persona-setup'))
   * 
   * 참고:
   * - 회원가입 직후에만 페르소나 설정 화면 표시
   * - 페르소나 설정은 필수 단계
   * 
   * 플로우 16.1 요구사항:
   * - 로그인 토큰 저장 (SignupPage에서 TokenStorage.setTokens() 호출)
   * - 사용자 정보 저장 (SignupPage에서 localStorage.setItem('user', ...) 호출)
   */
  const handleSignupSuccess = () => {
    // 사용자 정보 로드 (플로우 16.1)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    // 회원가입 직후에만 페르소나 설정 화면으로 이동
    setAppState('persona-setup');
  };

  /**
   * 사용자 정보 업데이트 핸들러
   * - 다이어리에서 프로필 수정 시 사용
   */
  const handleUserUpdate = (updatedUser: { name: string; email: string }) => {
    setUser(updatedUser);
  };

  /**
   * 로그아웃 핸들러
   * 
   * 동작:
   * 1. JWT 토큰 삭제 (localStorage)
   * 2. 사용자 정보 삭제
   * 3. 상태 초기화
   * 4. 랜딩 페이지로 이동
   */
  const handleLogout = () => {
    TokenStorage.clearTokens();
    localStorage.removeItem('user');
    setUser(null);
    setAppState('landing');
  };

  /**
   * 랜딩 페이지로 돌아가기
   * - 로그인/회원가입 화면에서 뒤로가기 버튼 클릭 시
   */
  const handleBackToLanding = () => {
    setAppState('landing');
  };

  /**
   * 회원가입 화면으로 이동
   * - 로그인 화면에서 "회원가입" 링크 클릭 시
   */
  const handleGoToSignup = () => {
    setAppState('signup');
  };

  /**
   * 비밀번호 찾기 화면으로 이동
   * - 로그인 화면에서 "비밀번호 찾기" 링크 클릭 시
   */
  const handleGoToForgotPassword = () => {
    setAppState('forgot-password');
  };

  /**
   * 로그인 화면으로 돌아가기
   * - 회원가입, 비밀번호 찾기 화면에서 뒤로가기 시
   */
  const handleBackToLogin = () => {
    setAppState('login');
  };

  // ========== 화면 렌더링 ==========
  
  /**
   * 플로우 1.1: 랜딩 페이지
   * - 앱의 첫 화면
   * - "일기장 열기" 버튼 표시
   */
  if (appState === 'landing') {
    return <LandingPage onOpenBook={handleOpenBook} />;
  }

  /**
   * 로그인 페이지
   * - JWT 토큰 기반 인증
   * - 로그인 성공 시 다이어리로 이동
   * - 회원가입, 비밀번호 찾기 링크 제공
   * 
   * [백엔드 팀] POST /api/auth/login API 연동 필요
   */
  if (appState === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        onBack={handleBackToLanding}
        onSignup={handleGoToSignup}
        onForgotPassword={handleGoToForgotPassword}
      />
    );
  }

  /**
   * 회원가입 페이지
   * - 이메일, 비밀번호, 이름 입력
   * - 회원가입 성공 시 페르소나 설정 화면으로 이동
   * 
   * [백엔드 팀] POST /api/auth/signup API 연동 필요
   */
  if (appState === 'signup') {
    return (
      <SignupPage 
        onSignupSuccess={() => {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            setUser(JSON.parse(userStr));
          }
          // 회원가입 후 항상 페르소나 설정 화면 표시
          console.log('Signup success, going to persona setup...');
          setAppState('persona-setup');
        }} 
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  /**
   * 비밀번호 찾기 페이지
   * - 이메일 입력 후 재설정 링크 전송
   * 
   * [백엔드 팀] POST /api/auth/forgot-password API 연동 필요
   */
  if (appState === 'forgot-password') {
    return (
      <ForgotPasswordPage 
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  /**
   * 플로우 2: AI 페르소나 초기 설정 페이지
   * 
   * [플로우 2.1] 페르소나 설정 (회원가입 직후)
   * 
   * 표시 시점:
   * - 회원가입 성공 직후 (필수 단계)
   * - 로그인 시에는 표시 안 함 (기존 사용자는 이미 설정 완료)
   * 
   * 화면 구성:
   * - **단계 1: 환영 화면**
   *   - 환영 메시지 및 앱 소개
   *   - AI 친구 기능 설명 (3가지 카드)
   *   - "AI 친구 선택하기" 버튼 클릭 → 단계 2로 이동
   * 
   * - **단계 2: 페르소나 선택**
   *   - 6가지 페르소나 그리드 표시:
   *     1. 베프 (friend) - 친근하고 공감적
   *     2. 부모님 (parent) - 따뜻하고 지지적
   *     3. 전문가 (expert) - 전문적이고 분석적
   *     4. 멘토 (mentor) - 동기부여하는 성장 코치
   *     5. 상담사 (therapist) - 심리 분석 중심 치유자
   *     6. 시인 (poet) - 감성적이고 철학적
   *   - 사용자: 페르소나 카드 클릭 → 선택됨 (체크 표시)
   *   - 선택 시: 우측 미리보기 영역에 해당 페르소나 말투 예시 표시
   *   - "시작하기" 버튼 클릭 (선택 필수)
   * 
   * 저장 및 완료:
   * - 선택한 페르소나 localStorage 저장 ('aiPersona')
   * - 설정 완료 플래그 저장 ('personaSetupCompleted': 'true')
   * - **다이어리 메인(캘린더) 화면으로 이동**
   * 
   * [AI 팀] 제미나이 API에서 페르소나 정보 활용 필요
   * - localStorage.getItem('aiPersona')에서 페르소나 ID 가져오기
   * - 페르소나별 프롬프트 스타일 적용
   * - 예: friend → "친근하고 공감적인 친구처럼 말하세요"
   */
  if (appState === 'persona-setup') {
    console.log('Rendering InitialPersonaSetup...');
    return (
      <InitialPersonaSetup 
        onComplete={(personaId) => {
          console.log('Persona setup completed with:', personaId);
          // ✅ 페르소나 설정 완료 → 다이어리 메인 화면으로 이동
          setAppState('diary');
        }}
      />
    );
  }

  /**
   * 플로우 3+: 다이어리 메인 페이지
   * - 캘린더 뷰 (월별 감정 히트맵)
   * - 일기 작성/수정/삭제
   * - 감정 통계 차트
   * - 검색 기능
   * - 설정 (프로필, 페르소나 변경)
   * 
   * 배경:
   * - 파란색 계열 그라데이션 배경
   * - 중앙 정렬 레이아웃
   */
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100">
      {/* 메인 컨텐츠 영역 - 모바일 최적화 */}
      <div className="relative z-10 min-h-screen w-full">
        <div className="w-full">
          <DiaryBook onUserUpdate={handleUserUpdate} onLogout={handleLogout} />
        </div>
      </div>
    </div>
  );
}

