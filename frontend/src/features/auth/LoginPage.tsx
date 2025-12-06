import { useState } from 'react';
import { BookHeart, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { login, TokenStorage } from '../../services/authApi';

/**
 * ========================================
 * LoginPage 컴포넌트
 * ========================================
 * 
 * [플로우 1.2] 로그인 플로우
 * 
 * 사용자가 이메일/비밀번호로 로그인하는 페이지
 * - 나무 책상 위의 가죽 다이어리 디자인 (스큐어모피즘)
 * - 파란색 계열 톤온톤 테마
 * 
 * [사용자 액션 순서]
 * 1. 이메일 입력 (실시간 검증 없음)
 * 2. 비밀번호 입력 (비밀번호 표시/숨김 토글 가능)
 * 3. "로그인" 버튼 클릭
 *    - 클라이언트 검증 없이 즉시 로그인 API 호출
 *    - 로딩 상태 표시 (버튼 텍스트: "로그인" → "로그인 중...")
 * 
 * [로그인 성공 시]
 * - 토큰 저장 (accessToken, refreshToken)
 * - 사용자 정보 localStorage 저장
 * - 다이어리 메인(캘린더) 화면으로 이동
 * 
 * [로그인 실패 시]
 * - 서버에서 검증 (이메일 형식, 빈 필드, 비밀번호 불일치 등)
 * - 하단에 통합 에러 메시지 표시 (예: "아이디 또는 비밀번호가 일치하지 않습니다.")
 * - 필드별 에러 메시지 없음
 * 
 * [네비게이션]
 * - "회원가입" 버튼 → 회원가입 페이지
 * - "비밀번호를 잊으셨나요?" 링크 → 비밀번호 찾기 페이지
 * - "← 뒤로 가기" 버튼 → 랜딩 페이지
 * 
 * [플로우 14.2] API 에러 처리
 * - 네트워크 에러: "로그인에 실패했습니다."
 * - 인증 에러: 서버 메시지 표시
 * 
 * [플로우 14.3] 로딩 상태 UI
 * - API 호출 중: 로딩 스피너 + "로그인 중..." 표시
 * - 버튼 비활성화 (중복 클릭 방지)
 * 
 * [백엔드 API 연동 필요]
 * - POST /api/auth/login
 *   - Body: { email, password }
 *   - Response: { accessToken, refreshToken, user }
 */

interface LoginPageProps {
  /** 로그인 성공 시 콜백 */
  onLoginSuccess: () => void;
  /** 뒤로 가기 (랜딩 페이지) */
  onBack: () => void;
  /** 회원가입 페이지로 이동 */
  onSignup: () => void;
  /** 비밀번호 찾기 페이지로 이동 */
  onForgotPassword: () => void;
}

export function LoginPage({ onLoginSuccess, onBack, onSignup, onForgotPassword }: LoginPageProps) {
  // ========== 상태 관리 ==========
  
  /**
   * 입력 필드 상태
   */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  /**
   * 로딩 상태 (플로우 14.3)
   * - API 호출 중: true
   * - 완료/에러 시: false
   * - 버튼 텍스트: "로그인" → "로그인 중..."
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * API 에러 메시지 (플로우 14.2)
   * - 네트워크 에러: "로그인에 실패했습니다."
   * - 인증 에러: 서버에서 반환된 메시지
   * - 표시 위치: 폼 상단, 빨간색 텍스트
   */
  const [error, setError] = useState('');

  // ========== 이벤트 핸들러 ==========

  /**
   * 로그인 제출 핸들러 (플로우 1.1, 14.2, 14.3)
   * 
   * 동작:
   * 1. 기존 에러 메시지 제거 (플로우 14.2)
   * 2. 로딩 시작 (플로우 14.3)
   * 3. API 호출:
   *    - POST /api/auth/login
   *    - Body: { email, password }
   * 4. 성공 시:
   *    - 토큰 저장 (localStorage)
   *    - 사용자 정보 저장
   *    - 다이어리 메인 화면으로 이동
   * 5. 실패 시 (플로우 14.2):
   *    - API 에러 처리
   *    - 에러 메시지 표시
   * 6. 로딩 종료 (플로우 14.3)
   * 
   * 플로우 14.2 (API 에러):
   * - 네트워크 에러: "로그인에 실패했습니다."
   * - 인증 에러: 서버 메시지 (예: "이메일 또는 비밀번호가 일치하지 않습니다.")
   * - 표시: 폼 상단, 빨간색 텍스트
   * 
   * 플로우 14.3 (로딩 상태):
   * - isLoading = true → 버튼 비활성화
   * - 버튼 텍스트: "로그인 중..."
   * - 딩 아이콘 표시
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // 기존 에러 제거 (플로우 14.2)
    
    // 클라이언트 검증 없이 즉시 API 호출
    setIsLoading(true); // 로딩 시작 (플로우 14.3)
    
    try {
      const response = await login({ email, password });
      
      // Store tokens in localStorage
      TokenStorage.setTokens(response.accessToken, response.refreshToken);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Success
      onLoginSuccess();
    } catch (err) {
      // API 에러 처리 (플로우 14.2)
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false); // 로딩 종료 (플로우 14.3)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <BookHeart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-slate-800 mb-1">로그인</h2>
                <p className="text-sm text-slate-600">
                  일기장을 열기 위해 로그인하세요
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs text-stone-600 block mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-stone-300 rounded-lg outline-none text-stone-800 placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-stone-600 block mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 text-sm bg-white border border-stone-300 rounded-lg outline-none text-stone-800 placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 
                API 에러 메시지 (플로우 14.2)
                
                표시 조건:
                - error 상태가 있을 때만 표시
                
                디자인:
                - 배경: bg-rose-50 (연한 빨강)
                - 테두리: border-rose-300 (빨간색)
                - 텍스트: text-rose-700 (어두운 빨강)
                - 위치: 폼 상단 (제출 버튼 위)
                
                에러 메시지 예:
                - 네트워크 에러: "로그인에 실패했습니다."
                - 인증 에러: "이메일 또는 비밀번호가 일치하지 않습니다."
                - 서버 에러: "서버 오류가 발생했습니다."
              */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg">
                  <p className="text-xs text-rose-700">{error}</p>
                </div>
              )}

              {/* Demo Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>테스트 계정:</strong><br />
                  이메일: test@example.com<br />
                  비밀번호: password123
                </p>
              </div>

              {/* 
                로그인 버튼 (플로우 14.3)
                
                로딩 상태:
                - isLoading = true:
                  - disabled 속성 활성화 (클릭 불가)
                  - 버튼 배경: bg-blue-400 (연한 파랑)
                  - 커서: cursor-not-allowed
                  - 텍스트: "로그인 중..."
                  - 아이콘: 회전하는 로딩 스피너 (Loader2)
                
                - isLoading = false:
                  - 버튼 활성화
                  - 버튼 배경: bg-blue-600 (진한 파랑)
                  - hover: bg-blue-700
                  - 텍스트: "로그인"
                
                플로우 14.3 요구사항:
                - API 호출 중: 로딩 스피너 표시
                - 버튼: 텍스트 변경 ("로그인" → "로그인 중...")
              */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md min-h-[48px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                onClick={onForgotPassword}
                disabled={isLoading}
                className="text-sm text-blue-700 hover:text-blue-800 transition-colors disabled:opacity-50 min-h-[44px] py-2"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-300" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-blue-50 px-2 text-stone-500">또는</span>
              </div>
            </div>

            {/* Signup Link */}
            <button
              onClick={onSignup}
              disabled={isLoading}
              className="w-full py-3 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 rounded-lg transition-colors min-h-[48px]"
            >
              회원가입
            </button>

            {/* Back Button */}
            <button
              onClick={onBack}
              disabled={isLoading}
              className="w-full py-2 text-sm text-stone-600 hover:text-stone-800 transition-colors disabled:opacity-50"
            >
              ← 뒤로 가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}