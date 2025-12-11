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

import { LandingPage, LoginPage, SignupPage, ForgotPasswordPage } from './pages';
import { DiaryBook } from './features/diary/DiaryBook';
import { MobileFrame } from './components/MobileFrame';
import { InitialPersonaSetup } from './components/InitialPersonaSetup';
import { useUserApp } from './hooks/use-user-app';

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
   * 플로우 1.1: 랜딩 페이지
   * - 앱의 첫 화면
   * - "일기장 열기" 버튼 표시
   */
  if (appState === 'landing') {
    return (
      <MobileFrame>
        <LandingPage onOpenBook={handleOpenBook} />
      </MobileFrame>
    );
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
   * 회원가입 페이지
   * - 이메일, 비밀번호, 이름 입력
   * - 회원가입 성공 시 페르소나 설정 화면으로 이동
   * 
   * [백엔드 팀] POST /api/auth/signup API 연동 필요
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
   * 비밀번호 찾기 페이지
   * - 이메일 입력 후 재설정 링크 전송
   * 
   * [백엔드 팀] POST /api/auth/forgot-password API 연동 필요
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
    return (
      <MobileFrame>
        <InitialPersonaSetup 
          onComplete={handlePersonaComplete}
        />
      </MobileFrame>
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
   * - 모바일 테두리 적용 (사용자 화면만)
   * - 반응형으로 작동 (갤럭시 -> 탭 -> 노트북)
   */
  return (
    <MobileFrame>
      <DiaryBook onUserUpdate={handleUserUpdate} onLogout={handleLogout} onAccountDeleted={handleAccountDeleted} />
    </MobileFrame>
  );
}

