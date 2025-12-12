import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetCode, verifyPasswordResetCode, resetPassword } from '../../services/authApi';

/**
 * ========================================
 * ForgotPasswordPage 컴포넌트
 * ========================================
 * 
 * [플로우 1.4] 비밀번호 찾기 플로우
 * 
 * 사용자가 비밀번호를 잊어버렸을 때 재설정하는 페이지
 * - 나무 책상 위의 가죽 다이어리 디자인 (스큐어모피즘)
 * - 3단계 진행: 이메일 입력 → 인증 코드 확인 → 새 비밀번호 설정
 * - 초록색 계열 톤온톤 테마 (Green Glassmorphism)
 * 
 * [단계 1: 이메일 입력]
 * - 사용자: 이메일 입력
 * - "인증 코드 발송" 버튼 클릭
 * - 시스템: 이메일 형식 검증 → API 호출 → 인증 코드 이메일 발송
 * - 인증 코드 유효 시간: **5분** (발송 시점부터 계산)
 * - 성공 시: 단계 2로 이동
 * 
 * [단계 2: 인증 코드 확인]
 * - 사용자: 6자리 인증 코드 입력
 * - 화면에 남은 시간 타이머 표시 (예: "남은 시간: 4분 30초")
 * - "인증 확인" 버튼 클릭
 * - 시스템: 코드 검증 및 유효 시간 확인
 * - 인증 성공 → 단계 3으로 이동
 * - 인증 실패 (코드 불일치) → 에러 메시지: "인증 코드가 일치하지 않습니다"
 * - 인증 실패 (시간 만료) → 에러 메시지: "인증 시간이 만료되었습니다. 재발송해주세요"
 * - 시간 만료 시 → 인증 코드 입력 불가
 * - "인증 코드 재발송" 버튼 → 새 인증 코드 발송 (5분 시간 리셋)
 * 
 * [단계 3: 새 비밀번호 설정]
 * - 사용자: 새 비밀번호 입력 (표시/숨김 토글 가능)
 * - 시스템: 실시간 검증 (최소 8자, 영문/숫자/특수문자 포함)
 * - 조건 미충족 시 → 즉시 에러 메시지 표시
 * - 사용자: 새 비밀번호 확인 입력 (표시/숨김 토글 가능)
 * - 시스템: 비밀번호 일치 여부 실시간 검증
 * - 불일치 시 → 즉시 에러 메시지 표시
 * - "비밀번호 변경" 버튼 클릭
 * - 검증 통과 → 비밀번호 재설정 API 호출
 * 
 * [재설정 완료 시]
 * - 성공 메시지 표시
 * - 2초 후 자동으로 로그인 페이지로 이동
 * 
 * [백엔드 API 연동 필요]
 * - POST /api/auth/password-reset/send-code - 인증 코드 발송 (5분 유효)
 * - POST /api/auth/password-reset/verify-code - 인증 코드 검증 (resetToken 반환)
 * - POST /api/auth/password-reset/reset - 비밀번호 재설정
 * 
 * [참고]
 * - 실제 백엔드 API 연동 완료
 * - 테스트 시 실제 이메일 인증 코드를 사용해야 합니다
 */

interface ForgotPasswordPageProps {
  /** 로그인 페이지로 돌아가기 */
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  // ========== 입력 필드 ref (검증 실패 시 스크롤 및 강조용) ==========
  const newPasswordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  // ========== 기본 입력 필드 상태 ==========

  /** 이메일 입력값 */
  const [email, setEmail] = useState('');

  /** 6자리 인증 코드 입력 배열 */
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);

  /** 새 비밀번호 입력값 */
  const [newPassword, setNewPassword] = useState('');

  /** 새 비밀번호 확인 입력값 */
  const [confirmPassword, setConfirmPassword] = useState('');

  /** 새 비밀번호 표시/숨김 토글 */
  const [showNewPassword, setShowNewPassword] = useState(false);

  /** 새 비밀번호 확인 표시/숨김 토글 */
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /** 로딩 상태 (API 호출 중) */
  const [isLoading, setIsLoading] = useState(false);

  /** 에러 메시지 */
  const [error, setError] = useState('');

  /** 성공 메시지 */
  const [success, setSuccess] = useState('');

  /** 현재 단계: 'email' | 'verify' | 'password' */
  const [step, setStep] = useState<'email' | 'verify' | 'password'>('email');

  // ========== 타이머 관련 상태 (5분 = 300초) ==========

  /**
   * 타이머 남은 시간 (초 단위)
   * 
   * [플로우 1.4 명세서 요구사항]
   * - 인증 코드 유효 시간: **5분** (300초)
   * - 발송 시점부터 카운트다운
   */
  const [timeLeft, setTimeLeft] = useState(300); // ✅ 5분 = 300초

  /** 타이머 활성화 여부 */
  const [timerActive, setTimerActive] = useState(false);

  /** 인증 코드 만료 여부 (5분 경과) */
  const [codeExpired, setCodeExpired] = useState(false);

  /** 인증 코드 발송 시각 (timestamp) */
  // const [codeSentAt, setCodeSentAt] = useState<number | null>(null);

  /** 비밀번호 재설정 토큰 (인증 코드 확인 후 받음) */
  const [resetToken, setResetToken] = useState<string | null>(null);

  // ========== 입력 검증 에러 메시지 상태 ==========

  /** 새 비밀번호 검증 에러 */
  const [newPasswordError, setNewPasswordError] = useState('');

  /** 새 비밀번호 확인 검증 에러 */
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  /** 인증 코드 입력 필드 참조 배열 (자동 포커스 이동용) */
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /** 성공 모달 표시 여부 */
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ========== 타이머 로직 (5분 = 300초) ==========

  /**
   * 인증 코드 타이머 Effect
   * 
   * 동작:
   * - timerActive가 true일 때 매 1초마다 timeLeft 감소
   * - timeLeft가 0이 되면 타이머 중지 및 만료 처리
   * 
   * [API 명세서 Section 2.3.1, 2.3.2, 2.3.3]
   * 서버에서도 5분 유효 시간을 검증해야 합니다.
   * 프론트엔드 타이머는 UX를 위한 것이며, 실제 검증은 서버에서 해야 합니다.
   */
  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setCodeExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  /**
   * 시간 포맷 함수 (초 → "분:초")
   * @param seconds - 총 초 (예: 270)
   * @returns 포맷된 문자열 (예: "4:30")
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 이메일로 인증 코드 발송 핸들러
   * @param e - 폼 제출 이벤트
   */
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await sendPasswordResetCode({ email });
      setSuccess(response.message);
      // setCodeSentAt(Date.now()); // [API 명세서] expiresIn만 반환되므로 현재 시간 저장
      setTimeLeft(300); // Reset to 5 minutes
      setTimerActive(true);
      setCodeExpired(false);
      setVerificationCode(['', '', '', '', '', '']);
      setStep('verify');

      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 인증 코드 재발송 핸들러
   */
  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await sendPasswordResetCode({ email });
      setSuccess(response.message);
      // setCodeSentAt(Date.now()); // [API 명세서] expiresIn만 반환되므로 현재 시간 저장
      setTimeLeft(300); // Reset to 5 minutes
      setTimerActive(true);
      setCodeExpired(false);
      setVerificationCode(['', '', '', '', '', '']);

      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드 재발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 인증 코드 입력 핸들러
   * @param index - 입력 필드 인덱스 (0~5)
   * @param value - 입력된 값 (단일 숫자)
   */
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * 인증 코드 입력 필드 키다운 핸들러
   * @param index - 입력 필드 인덱스 (0~5)
   * @param e - 키다운 이벤트
   */
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * 인증 코드 확인 핸들러
   * @param e - 폼 제출 이벤트
   */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const code = verificationCode.join('');

    if (code.length !== 6) {
      setError('인증 코드 6자리를 모두 입력해주세요.');
      return;
    }

    if (codeExpired) {
      setError('인증 시간이 만료되었습니다. 재발송 버튼을 눌러주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyPasswordResetCode({ email, code });
      setSuccess('인증이 완료되었습니다.');
      setResetToken(response.resetToken); // [API 명세서] resetToken 저장
      setTimerActive(false);

      // Move to password step after 1 second
      setTimeout(() => {
        setStep('password');
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 비밀번호 유효성 검증 함수
   * @param value - 비밀번호 입력값
   * @returns 에러 메시지 (유효하지 않으면)
   */
  const validatePassword = (value: string): string => {
    if (value.length < 8) {
      return '영문, 숫자, 특수문자 포함 8자 이상이어야 합니다.';
    }
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!hasLetter || !hasNumber || !hasSpecialChar) {
      return '영문, 숫자, 특수문자 포함 8자 이상이어야 합니다.';
    }
    return '';
  };

  /**
   * 새 비밀번호 입력 시 실시간 유효성 검증 핸들러
   */
  const handleNewPasswordBlur = () => {
    if (newPassword) {
      setNewPasswordError(validatePassword(newPassword));
    }
  };

  /**
   * 새 비밀번호 확인 입력 핸들러
   * @param value - 비밀번호 확인 입력값
   */
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    // Real-time validation
    if (value && value !== newPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setConfirmPasswordError('');
    }
  };

  /**
   * 비밀번호 재설정 핸들러
   * @param e - 폼 제출 이벤트
   */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 검증 플래그
    let hasError = false;

    if (!newPassword.trim()) {
      setNewPasswordError('비밀번호를 입력해주세요.');
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('비밀번호 확인을 입력해주세요.');
      hasError = true;
    }

    // Validate new password
    if (newPassword.trim()) {
      const passwordErr = validatePassword(newPassword);
      if (passwordErr) {
        setNewPasswordError(passwordErr);
        hasError = true;
      }
    }

    if (confirmPassword.trim() && newPassword !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      hasError = true;
    }

    // 검증 실패 시 첫 번째 오류 필드로 스크롤하고 강조
    if (hasError) {
      if (newPasswordError && newPasswordInputRef.current) {
        newPasswordInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        newPasswordInputRef.current.focus();
        newPasswordInputRef.current.classList.add('border-rose-500', 'ring-2', 'ring-rose-500/20');
        setTimeout(() => {
          newPasswordInputRef.current?.classList.remove('border-rose-500', 'ring-2', 'ring-rose-500/20');
        }, 3000);
      } else if (confirmPasswordError && confirmPasswordInputRef.current) {
        confirmPasswordInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        confirmPasswordInputRef.current.focus();
        confirmPasswordInputRef.current.classList.add('border-rose-500', 'ring-2', 'ring-rose-500/20');
        setTimeout(() => {
          confirmPasswordInputRef.current?.classList.remove('border-rose-500', 'ring-2', 'ring-rose-500/20');
        }, 3000);
      }
      return;
    }

    setIsLoading(true);

    try {
      if (!resetToken) {
        setError('인증이 완료되지 않았습니다. 다시 시도해주세요.');
        setIsLoading(false);
        return;
      }

      const response = await resetPassword({
        email,
        resetToken, // [API 명세서] verifyPasswordResetCode에서 받은 resetToken 사용
        newPassword,
        confirmPassword, // [API 명세서] 새 비밀번호 확인 필드 추가
      });

      setSuccess(response.message);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto scrollbar-hide relative z-10" style={{ minHeight: 0 }}>
      <div className="w-full flex-shrink-0 max-w-md">
        {/* Card */}
        <div className="glass p-8 rounded-[2rem] shadow-2xl backdrop-blur-md bg-white/40 dark:bg-black/40 border border-white/20">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg ring-4 ring-white/20">
                <KeyRound className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">비밀번호 찾기</h2>
                <p className="text-sm text-emerald-800/80 dark:text-emerald-200/60 mt-1">
                  {step === 'email' && '이메일로 인증 코드를 받아주세요'}
                  {step === 'verify' && '인증 코드를 입력해주세요'}
                  {step === 'password' && '새로운 비밀번호를 설정해주세요'}
                </p>
              </div>
            </div>

            {/* Step 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-5" noValidate>
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

                {error && (
                  <div className="p-3 bg-red-50/80 border border-red-200/50 rounded-xl backdrop-blur-sm animate-shake">
                    <p className="text-xs text-red-600 font-medium text-center">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200/50 rounded-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs text-emerald-700 font-medium text-center">{success}</p>
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
                      발송 중...
                    </>
                  ) : (
                    '인증 코드 발송'
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    disabled={isLoading}
                    className="inline-block py-2 text-xs font-medium text-emerald-800/60 hover:text-emerald-800 dark:text-emerald-200/40 dark:hover:text-emerald-200 transition-colors disabled:opacity-50"
                  >
                    ← 로그인으로 돌아가기
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Verify Code */}
            {step === 'verify' && (
              <form onSubmit={handleVerifyCode} className="space-y-5" noValidate>

                {/* Timer */}
                <div className="text-center">
                  <p className={`text-sm font-medium ${timeLeft <= 30 ? 'text-red-500' : 'text-emerald-600'}`}>
                    남은 시간: {formatTime(timeLeft)}
                  </p>
                </div>

                {/* 6-digit input */}
                <div>
                  <label className="text-xs font-semibold text-emerald-900/70 dark:text-emerald-100/70 block mb-3 text-center">
                    인증 코드 (6자리)
                  </label>
                  <div className="flex gap-2 justify-center flex-wrap max-w-full">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        disabled={codeExpired || isLoading}
                        className="w-12 h-14 text-center text-xl font-bold bg-white/70 dark:bg-black/30 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-xl outline-none text-emerald-950 dark:text-emerald-50 disabled:opacity-50 transition-all focus:border-emerald-500 focus:scale-110 shadow-sm flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>

                {codeExpired && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200/50 rounded-xl backdrop-blur-sm">
                    <p className="text-xs text-amber-700 font-medium text-center">
                      인증 시간이 만료되었습니다. 재발송 버튼을 눌러주세요.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50/80 border border-red-200/50 rounded-xl backdrop-blur-sm animate-shake">
                    <p className="text-xs text-red-600 font-medium text-center">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200/50 rounded-xl backdrop-blur-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs text-emerald-700 font-medium">{success}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || codeExpired}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 font-semibold tracking-wide"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        확인 중...
                      </>
                    ) : (
                      '인증 확인'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="w-full py-3 bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-50 text-emerald-900 dark:text-emerald-100 rounded-xl transition-all font-medium border border-white/20 dark:border-white/5"
                  >
                    인증 코드 재발송
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    disabled={isLoading}
                    className="inline-block py-2 text-xs font-medium text-emerald-800/60 hover:text-emerald-800 dark:text-emerald-200/40 dark:hover:text-emerald-200 transition-colors disabled:opacity-50"
                  >
                    ← 로그인으로 돌아가기
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Password */}
            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-900/70 dark:text-emerald-100/70 ml-1">
                    새 비밀번호
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600/50 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      ref={newPasswordInputRef}
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onBlur={handleNewPasswordBlur}
                      placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                      disabled={isLoading}
                      className="w-full pl-12 pr-12 py-3.5 text-sm bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-xl outline-none text-emerald-950 dark:text-emerald-50 placeholder:text-emerald-800/40 dark:placeholder:text-emerald-200/30 disabled:opacity-50 transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white/80 dark:focus:bg-black/40 hover:bg-white/60 dark:hover:bg-black/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600/50 hover:text-emerald-600 p-2 rounded-lg hover:bg-emerald-50/50 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {newPasswordError && (
                    <p className="text-xs text-red-500 font-medium ml-1 animate-shake">{newPasswordError}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-900/70 dark:text-emerald-100/70 ml-1">
                    새 비밀번호 확인
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600/50 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      ref={confirmPasswordInputRef}
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      placeholder="비밀번호를 다시 입력하세요"
                      disabled={isLoading}
                      className="w-full pl-12 pr-12 py-3.5 text-sm bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-xl outline-none text-emerald-950 dark:text-emerald-50 placeholder:text-emerald-800/40 dark:placeholder:text-emerald-200/30 disabled:opacity-50 transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white/80 dark:focus:bg-black/40 hover:bg-white/60 dark:hover:bg-black/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600/50 hover:text-emerald-600 p-2 rounded-lg hover:bg-emerald-50/50 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs text-red-500 font-medium ml-1 animate-shake">{confirmPasswordError}</p>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50/80 border border-red-200/50 rounded-xl backdrop-blur-sm animate-shake">
                    <p className="text-xs text-red-600 font-medium text-center">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200/50 rounded-xl backdrop-blur-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs text-emerald-700 font-medium">{success}</p>
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
                      변경 중...
                    </>
                  ) : (
                    '비밀번호 변경'
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    disabled={isLoading}
                    className="inline-block py-2 text-xs font-medium text-emerald-800/60 hover:text-emerald-800 dark:text-emerald-200/40 dark:hover:text-emerald-200 transition-colors disabled:opacity-50"
                  >
                    ← 로그인으로 돌아가기
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass bg-white/90 dark:bg-stone-900/90 rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center space-y-6 animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
                비밀번호가 재설정되었습니다
              </h3>
              <p className="text-sm text-emerald-800/80 dark:text-emerald-200/60">
                새로운 비밀번호로 로그인해주세요.
              </p>
            </div>

            <button
              onClick={onBackToLogin}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white rounded-xl transition-all shadow-lg flex items-center justify-center font-semibold"
            >
              로그인으로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}