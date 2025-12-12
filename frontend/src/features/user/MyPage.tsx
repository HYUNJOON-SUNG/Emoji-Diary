/**
 * ========================================
 * 마이페이지 컴포넌트
 * ========================================
 * 
 * 주요 기능 (모바일 웹 최적화):
 * - 사용자 정보 확인 (이메일, 이름)
 * - 알림 설정 (위험 신호 알림 활성화/비활성화)
 * - AI 코멘트 말투 변경 (페르소나 선택)
 * - 공지사항 조회 및 비밀번호 변경
 * - 계정 탈퇴
 * 
 * 변경 사항 (모바일):
 * - 좌우 2페이지 레이아웃 → 단일 세로 스크롤 레이아웃
 * - 섹션별 카드 형태로 정리 (프로필, 설정, 계정 관리)
 * - 비밀번호 변경 등은 아코디언 또는 모달 대신 인라인 확장 형태로 간소화
 */

import { useState, useEffect, useRef } from 'react';
import {
  UserCircle,
  Mail,
  Lock,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Heart,
  FileText,
  LogOut,
  UserX
} from 'lucide-react';
import { getCurrentUser, updatePersona, deleteAccount, sendPasswordResetCode, verifyPasswordResetCode, resetPassword } from '../../services/authApi';
import { User as UserType } from '../../types';
import { PERSONAS } from './PersonaSelectionModal';
import { AnnouncementPage } from './AnnouncementPage';
import manProfile from '../../assets/man.png';
import womanProfile from '../../assets/woman.png';

interface MyPageProps {
  onBack?: () => void;
  onUserUpdate?: (user: { name: string; email: string }) => void;
  onAccountDeleted: () => void;
  onGoToSupport?: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
  onLogout?: () => void;
}

export function MyPage({ onBack, onAccountDeleted, onGoToSupport, onModalStateChange, onLogout }: MyPageProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // UI States
  const [viewMode, setViewMode] = useState<'main' | 'announcement'>('main');
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Password Change (Email Verification Flow)
  const [passwordStep, setPasswordStep] = useState<'email' | 'verify' | 'password'>('email');
  const [emailForPassword, setEmailForPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [passwordError, setPasswordError] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [timerActive, setTimerActive] = useState(false);
  const [codeExpired, setCodeExpired] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const passwordInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newPasswordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  // Persona
  const [currentPersona, setCurrentPersona] = useState('friend');
  const [tempPersonaId, setTempPersonaId] = useState(''); // 모달 내부 임시 선택 상태
  const [isUpdatingPersona, setIsUpdatingPersona] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (user?.email && !emailForPassword) {
      setEmailForPassword(user.email);
    }
  }, [user, emailForPassword]);

  // 사용자 정보 로드 후 persona 설정
  useEffect(() => {
    if (user?.persona) {
      // DB에서 받은 한글 persona를 영어 id로 변환
      const personaId = PERSONAS.find(p => p.name === user.persona)?.id || 'friend';
      setCurrentPersona(personaId);
      // localStorage도 동기화
      localStorage.setItem('aiPersona', personaId);
    }
  }, [user]);

  // 모달이 열릴 때 임시 상태를 현재 설정된 페르소나로 초기화
  useEffect(() => {
    if (showPersonaModal) {
      setTempPersonaId(currentPersona);
    }
    if (onModalStateChange) onModalStateChange(showPersonaModal);
  }, [showPersonaModal, currentPersona, onModalStateChange]);

  const loadUserInfo = async () => {
    setIsLoading(true);
    setError('');

    // 먼저 localStorage에서 사용자 정보를 가져와서 표시 (API 호출 실패 시 fallback)
    const savedUserStr = localStorage.getItem('user');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        setUser(savedUser as UserType);
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
      }
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setError(''); // 성공 시 에러 메시지 초기화
    } catch (err: any) {
      // CORS 오류인 경우 특별한 메시지 표시
      if (err?.isCorsError || err?.message?.includes('CORS')) {
        setError('CORS 오류: 백엔드 서버의 CORS 설정을 확인해주세요. 백엔드에서 http://localhost:3000을 허용하도록 설정해야 합니다.');
      } else if (err?.isNetworkError || err?.code === 'ERR_NETWORK' || err?.code === 'ERR_FAILED' || err?.response === undefined) {
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else if (err?.response?.status === 401) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        // localStorage의 사용자 정보는 유지 (API 호출 실패 시 fallback으로 사용)
      } else {
        setError('사용자 정보를 불러오지 못했습니다. ' + (err?.message || ''));
      }
      // localStorage에 사용자 정보가 있으면 계속 표시 (오프라인 모드)
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset Timer Effect
  useEffect(() => {
    let interval: any;
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
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

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

  const handlePasswordEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPasswordError('');
    const email = emailForPassword.trim();
    if (!email) {
      setPasswordError('이메일을 입력해주세요.');
      return;
    }
    // 이메일 형식 검사 (브라우저 기본 툴팁 대체)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setPasswordError('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await sendPasswordResetCode({ email });
      setSuccess(response.message);
      setTimeLeft(300);
      setTimerActive(true);
      setCodeExpired(false);
      setVerificationCode(['', '', '', '', '', '']);
      setPasswordStep('verify');
      setTimeout(() => {
        passwordInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '인증 코드 발송에 실패했습니다.';
      setPasswordError(errorMessage);
      console.error('인증 코드 발송 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    if (value && index < 5) {
      passwordInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      passwordInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPasswordError('');
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setPasswordError('인증 코드 6자리를 모두 입력해주세요.');
      return;
    }
    if (codeExpired) {
      setPasswordError('인증 시간이 만료되었습니다. 재발송 버튼을 눌러주세요.');
      return;
    }
    const email = emailForPassword.trim();
    if (!email) {
      setPasswordError('이메일이 설정되지 않았습니다. 다시 시도해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      console.log('인증 코드 확인 요청:', { email, code });
      const response = await verifyPasswordResetCode({ email, code });
      console.log('인증 코드 확인 응답:', response);
      setSuccess('인증이 완료되었습니다.');
      setResetToken(response.resetToken);
      setTimerActive(false);
      setTimeout(() => {
        setPasswordStep('password');
        setSuccess('');
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '인증 코드 확인에 실패했습니다.';
      setPasswordError(errorMessage);
      console.error('인증 코드 확인 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setPasswordError('');
    const email = emailForPassword.trim();
    if (!email) {
      setPasswordError('이메일이 설정되지 않았습니다. 다시 시도해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      console.log('인증 코드 재발송 요청:', { email });
      const response = await sendPasswordResetCode({ email });
      console.log('인증 코드 재발송 응답:', response);
      setSuccess(response.message);
      setTimeLeft(300);
      setTimerActive(true);
      setCodeExpired(false);
      setVerificationCode(['', '', '', '', '', '']);
      setTimeout(() => {
        passwordInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '인증 코드 재발송에 실패했습니다.';
      setPasswordError(errorMessage);
      console.error('인증 코드 재발송 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPasswordBlur = () => {
    if (newPassword) {
      setNewPasswordError(validatePassword(newPassword));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmNewPassword(value);
    if (value && value !== newPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    let hasError = false;
    if (!newPassword.trim()) {
      setNewPasswordError('비밀번호를 입력해주세요.');
      hasError = true;
      newPasswordInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      newPasswordInputRef.current?.focus();
    }
    if (!confirmNewPassword.trim()) {
      setConfirmPasswordError('비밀번호 확인을 입력해주세요.');
      hasError = true;
      if (!newPassword.trim()) {
        setTimeout(() => {
          confirmPasswordInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          confirmPasswordInputRef.current?.focus();
        }, 300);
      } else {
        confirmPasswordInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        confirmPasswordInputRef.current?.focus();
      }
    }
    if (newPassword.trim()) {
      const passwordErr = validatePassword(newPassword);
      if (passwordErr) {
        setNewPasswordError(passwordErr);
        hasError = true;
        newPasswordInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        newPasswordInputRef.current?.focus();
      }
    }
    if (confirmNewPassword.trim() && newPassword !== confirmNewPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      hasError = true;
      confirmPasswordInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      confirmPasswordInputRef.current?.focus();
    }
    if (hasError) return;
    if (!resetToken) {
      setPasswordError('인증이 필요합니다.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword({
        email: emailForPassword,
        resetToken,
        newPassword,
        confirmPassword: confirmNewPassword,
      });
      setSuccess('비밀번호가 변경되었습니다.');
      setShowPasswordEdit(false);
      setPasswordStep('email');
      setEmailForPassword('');
      setVerificationCode(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordError('');
      setNewPasswordError('');
      setConfirmPasswordError('');
      setResetToken(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // deleteAccount는 password를 받지만, 계정 탈퇴는 비밀번호 없이도 가능하도록 수정 필요
      // 일단 빈 문자열로 호출 (백엔드에서 처리)
      await deleteAccount('');
      // 세션 만료 및 랜딩페이지로 이동
      localStorage.clear();
      onAccountDeleted();
    } catch (err) {
      setError('계정 탈퇴 실패');
    }
  };

  const handlePersonaSelect = async (id: string) => {
    // personaId (영어 소문자)를 한글 이름으로 변환
    const persona = PERSONAS.find(p => p.id === id);
    if (!persona) {
      setError('페르소나를 선택해주세요.');
      return;
    }

    setIsUpdatingPersona(true);
    setError('');

    try {
      // [API 명세서 Section 3.2] PUT /api/users/me/persona
      // DB에 페르소나 저장
      await updatePersona({ persona: persona.name });

      // 상태 업데이트
      setCurrentPersona(id);
      localStorage.setItem('aiPersona', id);

      // 사용자 정보 다시 로드하여 DB 값과 동기화
      await loadUserInfo();

      setShowPersonaModal(false);
      setShowPersonaModal(false);
    } catch (err: any) {
      console.error('페르소나 변경 실패:', err);
      setError(err?.message || '페르소나 변경에 실패했습니다.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsUpdatingPersona(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // localStorage에 사용자 정보가 없고 API 호출도 실패한 경우
  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-stone-700">사용자 정보를 불러올 수 없습니다</p>
          <p className="text-xs text-stone-500">{error || '로그인이 필요합니다.'}</p>
        </div>
        <button
          onClick={loadUserInfo}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (viewMode === 'announcement') {
    return <AnnouncementPage onBack={() => setViewMode('main')} />;
  }

  return (
    <div className="min-h-full flex flex-col space-y-4 pb-6">
      {/* Header - 뒤로가기 버튼 포함 */}
      <div className="relative text-center space-y-1 pb-2 pt-6 border-b border-white/20">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-6 left-0 p-2 active:bg-white/20 rounded-xl transition-colors text-emerald-800 dark:text-emerald-200 active:text-emerald-900 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300">
          <UserCircle className="w-5 h-5" />
          <span className="font-bold">마이페이지</span>
        </div>
      </div>

      {/* Messages */}
      {success && <div className="bg-emerald-50/80 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 px-4 py-3 rounded-xl text-sm text-center animate-in fade-in zoom-in backdrop-blur-sm shadow-sm">{success}</div>}
      {error && <div className="bg-rose-50/80 dark:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 px-4 py-3 rounded-xl text-sm text-center animate-in fade-in zoom-in backdrop-blur-sm shadow-sm">{error}</div>}

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 space-y-4">

        {/* Profile Section */}
        <section className="bg-white/40 dark:bg-black/20 rounded-2xl border border-white/30 dark:border-white/10 p-5 space-y-4 shadow-sm backdrop-blur-md">
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-400 rounded-full inline-block" />
            내 정보
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/50 dark:border-white/20 shadow-md">
              <img
                src={user.gender === 'FEMALE' ? womanProfile : manProfile}
                alt="프로필 이미지"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-950 dark:text-emerald-50">{user.name}</p>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">{user.email}</p>
            </div>
          </div>
        </section>

        {/* Settings Section */}
        <section className="bg-white/40 dark:bg-black/20 rounded-2xl border border-white/30 dark:border-white/10 overflow-hidden shadow-sm backdrop-blur-md">
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 p-5 pb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-400 rounded-full inline-block" />
            설정
          </h3>

          {/* Persona Setting */}
          <button
            onClick={() => setShowPersonaModal(true)}
            className="w-full flex items-center justify-between p-5 border-b border-white/10 hover:bg-white/20 dark:hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm text-stone-800 dark:text-stone-200 block font-medium">AI 말투 설정</span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  현재: {PERSONAS.find(p => p.id === currentPersona)?.name || user?.persona || '베프'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* Password Change Accordion */}
          <div className="border-b border-white/10">
            <button
              onClick={() => setShowPasswordEdit(!showPasswordEdit)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/20 dark:hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-300">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-sm text-stone-800 dark:text-stone-200 font-medium">비밀번호 변경</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${showPasswordEdit ? 'rotate-90' : ''}`} />
            </button>

            {showPasswordEdit && (
              <div className="p-5 bg-white/30 dark:bg-black/10 space-y-3 animate-in slide-in-from-top-2 border-t border-white/10">
                {/* Step 1: Email */}
                {passwordStep === 'email' && (
                  <form onSubmit={handlePasswordEmailSubmit} className="space-y-4" noValidate>
                    <div>
                      <label className="text-xs text-stone-600 dark:text-stone-400 block mb-1.5 ml-1 font-medium">이메일</label>
                      <div className="relative group">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${passwordError ? 'text-rose-500' : 'text-stone-400 group-focus-within:text-emerald-500'}`} />
                        <input
                          type="email"
                          value={emailForPassword}
                          onChange={(e) => {
                            setEmailForPassword(e.target.value);
                            if (passwordError) setPasswordError(''); // 입력 시 에러 즉시 해제
                          }}
                          placeholder="name@example.com"
                          disabled={isLoading}
                          className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-black/20 border rounded-xl outline-none transition-all placeholder:text-stone-400
                            ${passwordError
                              ? 'border-rose-500 text-rose-900 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/50'
                              : 'border-white/20 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            }
                          `}
                        />
                      </div>
                      {/* Stylish Error Message */}
                      {passwordError && (
                        <div className="flex items-center gap-1.5 mt-2 ml-1 text-rose-500 animate-in slide-in-from-left-1 duration-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <p className="text-xs font-medium">{passwordError}</p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '인증 코드 발송'}
                    </button>
                  </form>
                )}

                {/* Step 2: Verify Code */}
                {passwordStep === 'verify' && (
                  <form onSubmit={handleVerifyCode} className="space-y-4" noValidate>
                    <div className="text-center">
                      <p className={`text-xs font-semibold ${timeLeft <= 30 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        남은 시간: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-stone-600 dark:text-stone-400 block mb-2 text-center">인증 코드 (6자리)</label>
                      <div className="flex gap-2 justify-center flex-wrap max-w-full">
                        {verificationCode.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => { passwordInputRefs.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleCodeKeyDown(index, e)}
                            disabled={codeExpired || isLoading}
                            className="w-10 h-12 text-center text-lg font-bold bg-white/50 dark:bg-black/20 border border-emerald-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none disabled:opacity-50 flex-shrink-0 transition-all shadow-sm"
                            style={{ minWidth: '40px', maxWidth: '40px' }}
                          />
                        ))}
                      </div>
                    </div>
                    {codeExpired && (
                      <p className="text-xs text-amber-600 dark:text-amber-500 text-center">인증 시간이 만료되었습니다. 재발송 버튼을 눌러주세요.</p>
                    )}
                    {passwordError && <p className="text-xs text-rose-500 text-center">{passwordError}</p>}
                    <div className="space-y-2">
                      <button
                        type="submit"
                        disabled={isLoading || codeExpired}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '인증 확인'}
                      </button>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="w-full py-2.5 bg-white/50 dark:bg-white/10 text-stone-600 dark:text-stone-300 text-sm rounded-xl font-medium hover:bg-white/80 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                      >
                        인증 코드 재발송
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: New Password */}
                {passwordStep === 'password' && (
                  <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          ref={newPasswordInputRef}
                          type={showPasswords.new ? 'text' : 'password'}
                          placeholder="새 비밀번호 (8자 이상)"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (e.target.value) {
                              const err = validatePassword(e.target.value);
                              setNewPasswordError(err);
                            } else {
                              setNewPasswordError('');
                            }
                          }}
                          onBlur={handleNewPasswordBlur}
                          className={`w-full px-4 py-2.5 text-sm bg-white/50 dark:bg-black/20 border rounded-xl outline-none transition-all placeholder:text-stone-400
                            ${newPasswordError
                              ? 'border-rose-500 text-rose-900 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/50'
                              : 'border-white/20 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {newPasswordError && (
                        <div className="flex items-center gap-1.5 mt-2 ml-1 text-rose-500 animate-in slide-in-from-left-1 duration-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <p className="text-xs font-medium">{newPasswordError}</p>
                        </div>
                      )}

                      <div className="relative">
                        <input
                          ref={confirmPasswordInputRef}
                          type={showPasswords.confirm ? 'text' : 'password'}
                          placeholder="새 비밀번호 확인"
                          value={confirmNewPassword}
                          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-stone-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPasswordError && <p className="text-xs text-rose-500 ml-1">{confirmPasswordError}</p>}
                    </div>

                    {passwordError && <p className="text-xs text-rose-500 text-center">{passwordError}</p>}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '비밀번호 변경하기'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Support & Info */}
        <section className="bg-white/40 dark:bg-black/20 rounded-2xl border border-white/30 dark:border-white/10 overflow-hidden shadow-sm backdrop-blur-md">
          <button
            onClick={onGoToSupport}
            className="w-full flex items-center justify-between p-5 border-b border-white/10 hover:bg-white/20 dark:hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100/50 dark:bg-rose-900/30 rounded-lg text-rose-500 dark:text-rose-300">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-sm text-stone-800 dark:text-stone-200 font-medium">상담 연결 리소스</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            onClick={() => setViewMode('announcement')}
            className="w-full flex items-center justify-between p-5 hover:bg-white/20 dark:hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-300">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm text-stone-800 dark:text-stone-200 font-medium">공지사항</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </section>

        {/* Logout Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 rounded-2xl transition-all border border-white/20 dark:border-white/5 text-stone-600 dark:text-stone-300 backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 pb-6">
          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="w-full py-3 text-xs text-stone-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-1"
          >
            <UserX className="w-3 h-3" />
            계정 탈퇴
          </button>

          {showDeleteConfirm && (
            <div className="mt-2 p-4 bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl animate-in slide-in-from-bottom-2 text-center backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
              <p className="text-xs text-rose-800 dark:text-rose-200 mb-3 font-medium leading-relaxed">
                정말로 탈퇴하시겠습니까?<br />
                모든 데이터가 영구적으로 삭제됩니다.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-white dark:bg-white/10 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs rounded-lg font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-rose-600 dark:bg-rose-700 text-white text-xs rounded-lg hover:bg-rose-700 dark:hover:bg-rose-600 font-bold shadow-sm transition-colors"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-10">
            <h3 className="text-lg font-bold text-stone-800 text-center mb-4">AI 말투 선택</h3>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg">
                <p className="text-xs text-rose-700">{error}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PERSONAS.map(persona => (
                <button
                  key={persona.id}
                  onClick={() => setTempPersonaId(persona.id)}
                  disabled={isUpdatingPersona}
                  className={`p-3 rounded-xl border text-left transition-all relative ${tempPersonaId === persona.id
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 shadow-md'
                    : 'border-stone-200 hover:bg-stone-50'
                    } ${isUpdatingPersona ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="w-14 h-14 mb-2 mx-auto">
                    <img src={persona.icon} alt={persona.name} className="w-full h-full object-contain" />
                  </div>
                  <div className={`font-bold text-sm text-center mb-1 ${tempPersonaId === persona.id ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {persona.name}
                  </div>
                  <div className={`text-[10px] text-center ${tempPersonaId === persona.id ? 'text-emerald-600' : 'text-stone-500'}`}>
                    {persona.style}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPersonaModal(false)}
                disabled={isUpdatingPersona}
                className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={() => handlePersonaSelect(tempPersonaId)}
                disabled={isUpdatingPersona || tempPersonaId === currentPersona}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isUpdatingPersona ? <Loader2 className="w-4 h-4 animate-spin" /> : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <LogOut className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-800 text-center">로그아웃 하시겠습니까?</h3>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}