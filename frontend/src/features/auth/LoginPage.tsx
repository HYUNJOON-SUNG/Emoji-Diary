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
 * - 초록색 계열 톤온톤 테마 (Green Glassmorphism)
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
    } catch (err: any) {
      // API 에러 처리 (플로우 14.2)
      let errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';

      // DB/서버 내부 오류 메시지 필터링 (사용자에게 적나라한 SQL 에러 노출 방지)
      if (
        errorMessage.includes('JDBC') ||
        errorMessage.includes('SQL') ||
        errorMessage.includes('Table') ||
        errorMessage.includes('doesn\'t exist')
      ) {
        errorMessage = '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false); // 로딩 종료 (플로우 14.3)
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto scrollbar-hide relative z-10" style={{ minHeight: 0 }}>
      <div className="w-full flex-shrink-0 max-w-md">
        {/* Login Form */}
        <div className="glass p-8 rounded-[2rem] shadow-2xl backdrop-blur-md bg-white/40 dark:bg-black/40 border border-white/20">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg ring-4 ring-white/20">
                <BookHeart className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">로그인</h2>
                <p className="text-sm text-emerald-800/80 dark:text-emerald-200/60 mt-1">오늘의 감정을 기록해보세요</p>
              </div>
            </div>

            {/* Login Form - Native validation disabled for custom UI */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-900/70 dark:text-emerald-100/70 ml-1">
                  이메일
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600/50 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3.5 text-sm bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-xl outline-none text-emerald-950 dark:text-emerald-50 placeholder:text-emerald-800/40 dark:placeholder:text-emerald-200/30 disabled:opacity-50 transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white/80 dark:focus:bg-black/40 hover:bg-white/60 dark:hover:bg-black/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-900/70 dark:text-emerald-100/70 ml-1">
                  비밀번호
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600/50 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3.5 text-sm bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-xl outline-none text-emerald-950 dark:text-emerald-50 placeholder:text-emerald-800/40 dark:placeholder:text-emerald-200/30 disabled:opacity-50 transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white/80 dark:focus:bg-black/40 hover:bg-white/60 dark:hover:bg-black/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600/50 hover:text-emerald-600 p-2 rounded-lg hover:bg-emerald-50/50 transition-colors"
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

              {error && (
                <div className="p-3 bg-red-50/80 border border-red-200/50 rounded-xl backdrop-blur-sm animate-shake">
                  <p className="text-xs text-red-600 font-medium text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 font-semibold tracking-wide mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </form>

            <div className="space-y-4 pt-2">
              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  onClick={onForgotPassword}
                  disabled={isLoading}
                  className="text-xs text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200 transition-colors disabled:opacity-50 font-medium"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-900/10 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-transparent px-2 text-emerald-900/40 dark:text-white/40 font-medium">또는</span>
                </div>
              </div>

              {/* Signup Link */}
              <button
                onClick={onSignup}
                disabled={isLoading}
                className="w-full py-3.5 bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-50 text-emerald-900 dark:text-emerald-100 rounded-xl transition-all font-medium border border-white/20 dark:border-white/5"
              >
                이메일로 회원가입
              </button>

              {/* Back Button */}
              <button
                onClick={onBack}
                disabled={isLoading}
                className="w-full py-2 text-xs text-emerald-800/60 hover:text-emerald-800 dark:text-emerald-200/40 dark:hover:text-emerald-200 transition-colors disabled:opacity-50"
              >
                ← 처음으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}