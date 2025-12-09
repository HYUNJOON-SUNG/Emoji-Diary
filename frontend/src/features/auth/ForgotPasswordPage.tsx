import { useState, useEffect, useRef } from 'react';
import { BookHeart, Mail, Lock, Loader2, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
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
 * - 파란색 계열 톤온톤 테마
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
  const [codeSentAt, setCodeSentAt] = useState<number | null>(null);
  
  /** 비밀번호 재설정 토큰 (인증 코드 확인 후 받음) */
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  // ========== 입력 검증 에러 메시지 상태 ==========
  
  /** 새 비밀번호 검증 에러 */
  const [newPasswordError, setNewPasswordError] = useState('');
  
  /** 새 비밀번호 확인 검증 에러 */
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  /** 인증 코드 입력 필드 참조 배열 (자동 포커스 이동용) */
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    let interval: NodeJS.Timeout;
    
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
      setCodeSentAt(Date.now()); // [API 명세서] expiresIn만 반환되므로 현재 시간 저장
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
      setCodeSentAt(Date.now()); // [API 명세서] expiresIn만 반환되므로 현재 시간 저장
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
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    // Validate new password
    const passwordErr = validatePassword(newPassword);
    if (passwordErr) {
      setNewPasswordError(passwordErr);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
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
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl text-stone-800">비밀번호 찾기</h2>
              <p className="text-sm text-stone-600">
                {step === 'email' && '이메일로 인증 코드를 받아주세요'}
                {step === 'verify' && '인증 코드를 입력해주세요'}
                {step === 'password' && '새로운 비밀번호를 설정해주세요'}
              </p>
            </div>

            {/* Step 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="text-xs text-stone-600 block mb-1.5">
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
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg outline-none text-stone-800 placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg">
                    <p className="text-xs text-rose-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg">
                    <p className="text-xs text-emerald-700">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      발송 중...
                    </>
                  ) : (
                    '인증 코드 발송'
                  )}
                </button>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  disabled={isLoading}
                  className="w-full py-2 text-sm text-stone-600 hover:text-stone-800 transition-colors disabled:opacity-50"
                >
                  ← 로그인으로 돌아가기
                </button>
              </form>
            )}

            {/* Step 2: Verify Code */}
            {step === 'verify' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                
                {/* Timer */}
                <div className="text-center">
                  <p className={`text-sm ${timeLeft <= 30 ? 'text-rose-600' : 'text-blue-700'}`}>
                    남은 시간: {formatTime(timeLeft)}
                  </p>
                </div>

                {/* 6-digit input */}
                <div>
                  <label className="text-xs text-stone-600 block mb-1.5 text-center">
                    인증 코드 (6자리)
                  </label>
                  <div className="flex gap-2 justify-center">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        disabled={codeExpired || isLoading}
                        className="w-12 h-14 text-center text-xl bg-white border border-stone-300 rounded-lg outline-none text-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      />
                    ))}
                  </div>
                </div>

                {codeExpired && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
                    <p className="text-xs text-amber-700">
                      인증 시간이 만료되었습니다. 재발송 버튼을 눌러주세요.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg">
                    <p className="text-xs text-rose-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs text-emerald-700">{success}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={isLoading || codeExpired}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
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
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 rounded-lg transition-colors"
                  >
                    인증 코드 재발송
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  disabled={isLoading}
                  className="w-full py-2 text-sm text-stone-600 hover:text-stone-800 transition-colors disabled:opacity-50"
                >
                  ← 로그인으로 돌아가기
                </button>
              </form>
            )}

            {/* Step 3: Password */}
            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="text-xs text-stone-600 block mb-1.5">
                    새 비밀번호
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onBlur={handleNewPasswordBlur}
                      placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                      disabled={isLoading}
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-stone-300 rounded-lg outline-none text-stone-800 placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {newPasswordError && (
                    <p className="text-xs text-rose-500 mt-1">{newPasswordError}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs text-stone-600 block mb-1.5">
                    새 비밀번호 확인
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      placeholder="비밀번호를 다시 입력하세요"
                      disabled={isLoading}
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-stone-300 rounded-lg outline-none text-stone-800 placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs text-rose-500 mt-1">{confirmPasswordError}</p>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg">
                    <p className="text-xs text-rose-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs text-emerald-700">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      변경 중...
                    </>
                  ) : (
                    '비밀번호 변경'
                  )}
                </button>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  disabled={isLoading}
                  className="w-full py-2 text-sm text-stone-600 hover:text-stone-800 transition-colors disabled:opacity-50"
                >
                  ← 로그인으로 돌아가기
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}