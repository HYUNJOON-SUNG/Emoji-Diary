import { useState, useRef, useEffect } from 'react';
import { BookHeart, Mail, Lock, UserRound, Loader2, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';
import { signup, TokenStorage, checkEmailDuplicate, sendVerificationCodeForSignup, verifyCode } from '../../services/authApi';
import { TermsAgreement } from './TermsAgreement';
import { termsData } from '../../services/termsData';

/**
 * ========================================
 * SignupPage 컴포넌트
 * ========================================
 * 
 * [플로우 1.3] 회원가입 플로우
 * 
 * 사용자가 새 계정을 생성하는 페이지
 * - 나무 책상 위의 가죽 다이어리 디자인 (스큐어모피즘)
 * - 중앙 배치 카드 레이아웃
 * - 파란색 계열 톤온톤 테마
 * 
 * [주요 기능]
 * 1. 이름 입력 (2자 이상 실시간 검증)
 * 2. 이메일 중복 확인 버튼
 * 3. 이메일 인증 코드 발송/확인 (5분 타이머)
 * 4. 비밀번호 입력 (영문/숫자/특수문자 포함 8자 이상)
 * 5. 비밀번호 확인 (실시간 일치 검증)
 * 6. 필수 약관 동의 (선택 약관 없음)
 * 7. 회원가입 완료 → 페르소나 설정 화면 이동
 * 
 * [사용자 액션 순서]
 * Step 1: 이름 입력 → 실시간 검증 (2자 이상)
 * Step 2: 이메일 입력 → "중복 확인" 버튼 클릭 → 서버 검증
 *   - 중복 없음: "사용 가능한 이메일입니다"
 *   - 이미 가입됨: "이미 가입된 이메일입니다"
 * Step 3: "인증 코드 발송" 버튼 클릭 → 이메일로 6자리 코드 발송 (5분 유효)
 * Step 4: 6자리 인증 코드 입력 → "인증 확인" 버튼 클릭
 *   - 타이머 표시: "남은 시간: 4분 30초"
 *   - 인증 성공: "이메일 인증이 완료되었습니다"
 *   - 인증 실패: "인증 코드가 일치하지 않습니다"
 *   - 시간 만료: "인증 시간이 만료되었습니다. 재발송해주세요"
 *   - "인증 코드 재발송" 버튼: 새 코드 발송 (5분 리셋)
 * Step 5: 비밀번호 입력 (영문/숫자/특수문자 포함 8자 이상)
 * Step 6: 비밀번호 확인 입력 (실시간 일치 검증)
 * Step 7: 필수 약관 동의
 *   - 전체 약관 동의/해제 버튼
 *   - 개별 약관 체크박스
 *   - 약관 제목 클릭 → 상세 내용 모달 표시
 *   - **필수 약관만 존재** (마케팅 정보 수신 동의 등 선택 약관 없음)
 * Step 8: "회원가입" 버튼 클릭 → 최종 검증
 * Step 9: 회원가입 성공 → JWT 토큰 저장 → 페르소나 설정 화면 이동
 * 
 * [백엔드 API 연동 필요]
 * - POST /api/auth/check-email-duplicate - 이메일 중복 확인
 * - POST /api/auth/send-verification-code-for-signup - 인증 코드 발송 (이메일, 5분 유효)
 * - POST /api/auth/verify-code - 인증 코드 검증 (5분 유효 시간)
 * - POST /api/auth/signup - 회원가입 (이메일, 비밀번호, 이름)
 * 
 * [로컬 스토리지 저장 데이터]
 * - accessToken (JWT 토큰)
 * - refreshToken (리프레시 토큰)
 * - user (사용자 정보: id, email, name)
 * 
 * [약관 동의]
 * - **필수 약관만 존재** (선택 약관 없음)
 * - 서비스 이용약관 (필수)
 * - 개인정보 처리방침 (필수)
 * - 전체 약관 동의 시: 모든 필수 약관 일괄 동의
 * - 개별 약관 동의: 체크박스 클릭
 * - 약관 상세 보기: 제목 클릭 → 모달 표시
 */

interface SignupPageProps {
  onSignupSuccess: () => void; // 회원가입 성공 시 콜백 (페르소나 설정으로 이동)
  onBackToLogin: () => void; // 로그인 페이지로 돌아가기
}

export function SignupPage({ onSignupSuccess, onBackToLogin }: SignupPageProps) {
  // ========== 기본 입력 필드 상태 ==========
  
  /** 이름 입력값 (2자 이상 필수) */
  const [name, setName] = useState('');
  
  /** 이메일 입력값 (예: user@example.com) */
  const [email, setEmail] = useState('');
  
  /** 비밀번호 입력값 (영문, 숫자, 특수문자 포함 8자 이상) */
  const [password, setPassword] = useState('');
  
  /** 비밀번호 확인 입력값 (password와 일치해야 함) */
  const [confirmPassword, setConfirmPassword] = useState('');
  
  /** 비밀번호 표시/숨김 토글 */
  const [showPassword, setShowPassword] = useState(false);
  
  /** 비밀번호 확인 표시/숨김 토글 */
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  /** 약관 동의 상태 { termId: true/false } */
  const [agreements, setAgreements] = useState<{ [key: string]: boolean }>({});
  
  /** 성별 선택 (필수, AI 이미지 생성 시 주인공 성별 결정) */
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');

  // ========== 로딩 및 에러 상태 ==========
  
  /** 전체 로딩 상태 (API 호출 중) */
  const [isLoading, setIsLoading] = useState(false);
  
  /** 이메일 중복 확인 로딩 상태 */
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  /** 전역 에러 메시지 (화면 하단 빨간색 박스) */
  const [error, setError] = useState('');
  
  /** 성공 메시지 (화면 하단 파란색 박스) */
  const [success, setSuccess] = useState('');

  // ========== 이메일 인증 코드 관련 상태 ==========
  
  /**
   * 인증 코드 입력 배열 (6자리)
   * 예: ['1', '2', '3', '4', '5', '6']
   */
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  
  /** 이메일 중복 확인 완료 여부 */
  const [emailDuplicateChecked, setEmailDuplicateChecked] = useState(false);
  
  /** 이메일 사용 가능 여부 (중복 아님) */
  const [emailAvailable, setEmailAvailable] = useState(false);
  
  /** 인증 코드 발송 완료 여부 */
  const [codeSent, setCodeSent] = useState(false);
  
  /** 인증 코드 검증 완료 여부 */
  const [codeVerified, setCodeVerified] = useState(false);
  
  /** 인증 코드 발송 시각 (timestamp) */
  const [codeSentAt, setCodeSentAt] = useState<number>(0);
  
  /** 타이머 남은 시간 (초 단위, 300초 = 5분) */
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  /** 타이머 활성화 여부 */
  const [timerActive, setTimerActive] = useState(false);
  
  /** 인증 코드 만료 여부 (5분 경과) */
  const [codeExpired, setCodeExpired] = useState(false);
  
  /**
   * 인증 코드 입력 필드 참조 배열
   * - 자동 포커스 이동에 사용
   */
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ========== 입력 검증 에러 메시지 상태 ==========
  
  /** 이름 검증 에러 (예: "이름은 2자 이상이어야 합니다.") */
  const [nameError, setNameError] = useState('');
  
  /** 이메일 검증 에러 (예: "이미 가입된 이메일입니다.") */
  const [emailError, setEmailError] = useState('');
  
  /** 비밀번호 검증 에러 (예: "영문, 숫자, 특수문자 포함 8자 이상이어야 합니다.") */
  const [passwordError, setPasswordError] = useState('');
  
  /** 비밀번호 확인 검증 에러 (예: "밀번호가 일치하지 않습니다.") */
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // ========== 타이머 로직 (5분 = 300초) ==========
  
  /**
   * 인증 코드 타이머 Effect
   * 
   * 동작:
   * - timerActive가 true일 때 매 1초마다 timeRemaining 감소
   * - timeRemaining이 0이 되면 타이머 중지 및 만료 처리
   * 
   * [백엔드 팀]
   * 서버에서도 5분 유효 시간을 검증해야 합니다.
   * 프론트엔드 타이머는 UX를 위한 것이며, 실제 검증은 서버에서 해야 합니다.
   */
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          setCodeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

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

  // ========== 입력 검증 함수 (플로우 1.3) ==========

  /**
   * 이름 검증 - Focus Out 이벤트
   * 
   * [플로우 1.3 Step 1]
   * 검증 규칙:
   * - 2자 이상
   * 
   * 동작:
   * - 포커스 아웃 시 검증
   * - 조건 미충족 시: 에러 메시지 표시
   * - 조건 충족 시: 에러 메시지 제거
   */
  const handleNameBlur = () => {
    if (name.trim().length > 0 && name.trim().length < 2) {
      setNameError('이름은 2자 이상이어야 합니다.');
    } else {
      setNameError('');
    }
  };

  /**
   * 이메일 중복 확인 버튼 클릭 핸들러
   * 
   * [플로우 1.3 Step 2]
   * 동작:
   * 1. 이메일 형식 검증 (정규식)
   * 2. API 호출: POST /api/auth/check-email-duplicate
   * 3. 응답에 따라 상태 업데이트
   * 
   * [백엔드 API]
   * POST /api/auth/check-email-duplicate
   * Request: { email: string }
   * Response: { available: boolean, message: string }
   * 
   * [Cursor AI 연동 코드]
   * ```typescript
   * // 실제 API 호출 시:
   * const response = await fetch('/api/auth/check-email-duplicate', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ email })
   * });
   * const data = await response.json();
   * ```
   */
  const handleCheckEmailDuplicate = async () => {
    if (!email.trim()) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }

    // 1단계: 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      setEmailAvailable(false);
      setEmailDuplicateChecked(false);
      return;
    }

    // 2단계: 중복 검사 (API 호출)
    setIsCheckingEmail(true);
    setEmailError('');
    
    try {
      // [백엔드 팀] 이메일 중복 확인 API 구현 필요
      const response = await checkEmailDuplicate(email);
      
      if (response.available) {
        setEmailError('');
        setEmailAvailable(true);
        setEmailDuplicateChecked(true);
        setSuccess('사용 가능한 이메일입니다.');
      } else {
        setEmailError(response.message); // "이미 가입된 이메일입니다."
        setEmailAvailable(false);
        setEmailDuplicateChecked(false);
      }
    } catch (err) {
      setEmailError('이메일 확인 중 오류가 발생했습니다.');
      setEmailAvailable(false);
      setEmailDuplicateChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  /**
   * 인증 코드 발송 버튼 클릭 핸들러
   * 
   * [플로우 1.3 Step 4]
   * 동작:
   * 1. API 호출: POST /api/auth/send-verification-code-for-signup
   * 2. 이메일로 6자리 인증 코드 발송
   * 3. 타이머 시작 (5분 = 300초)
   * 4. 인증 코드 입력 UI 표시
   * 
   * [백엔드 API]
   * POST /api/auth/send-verification-code-for-signup
   * Request: { email: string }
   * Response: { message: string, sentAt: number }
   * 
   * [백엔드 팀 작업 필요]
   * 1. 6자리 랜덤 숫자 생성
   * 2. 이메일 발송 (SMTP 또는 이메일 서비스)
   * 3. 서버에 코드 저장 (5분 유효 시간 포함)
   * 4. Redis 등 임시 저장소 사용 권장
   * 
   * [Cursor AI 연동 코드]
   * ```typescript
   * // 실제 이메일 발송 서비스 연동:
   * import nodemailer from 'nodemailer';
   * 
   * const transporter = nodemailer.createTransport({
   *   service: 'gmail',
   *   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
   * });
   * 
   * await transporter.sendMail({
   *   from: 'noreply@yourapp.com',
   *   to: email,
   *   subject: '감정 일기 - 이메일 인증 코드',
   *   text: `인증 코드: ${code}`
   * });
   * ```
   */
  const handleSendVerificationCode = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // [백엔드 팀] 인증 코드 발송 API 구현 필요
      const response = await sendVerificationCodeForSignup({ email });
      setSuccess(response.message);
      setCodeSentAt(response.sentAt);
      setTimeRemaining(300); // 5분 = 300초
      setTimerActive(true);
      setCodeExpired(false);
      setVerificationCode(['', '', '', '', '', '']);
      setCodeSent(true);
      
      // 첫 번째 입력 필드에 자동 포커스
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
   * 인증 코드 재발송 버튼 클릭 핸들러
   * 
   * [플로우 1.3 - 타이머 만료 시]
   * 동작:
   * 1. 새로운 인증 코드 발송
   * 2. 타이머 리셋 (5분)
   * 3. 입력 필드 초기화
   * 
   * [백엔드 팀]
   * 기존 인증 코드 무효화 후 새 코드 발송
   */
  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await sendVerificationCodeForSignup({ email });
      setSuccess(response.message);
      setCodeSentAt(response.sentAt);
      setTimeRemaining(300); // 5분 리셋
      setTimerActive(true);
      setCodeExpired(false);
      setVerificationCode(['', '', '', '', '', '']);
      
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
   * 인증 코드 입력 처리 (6자리 개별 입력)
   * 
   * [플로우 1.3 Step 5]
   * 동작:
   * - 숫자만 입력 가능
   * - 한 글자 입력 시 자동으로 다음 필드로 포커스 이동
   * 
   * @param index - 입력 필드 인덱스 (0~5)
   * @param value - 입력된 값 (한 글자)
   */
  const handleCodeChange = (index: number, value: string) => {
    // 숫자만 허용
    if (!/^\d*$/.test(value)) {
      return;
    }
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // 자동 포커스 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * 인증 코드 입력 필드 키보드 이벤트
   * 
   * 동작:
   * - Backspace 키: 현재 필드가 비어있으면 이전 필드로 포커스 이동
   */
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * 인증 코드 확인 버튼 클릭 핸들러
   * 
   * [플로우 1.3 Step 6]
   * 동작:
   * 1. 6자리 코드 완성 여부 확인
   * 2. 타이머 만료 여부 확인
   * 3. API 호출: POST /api/auth/verify-code
   * 4. 검증 성공 시: 비밀번호 입력 단계로 진행
   * 
   * [백엔드 API]
   * POST /api/auth/verify-code
   * Request: { email: string, code: string }
   * Response: { message: string }
   * 
   * [백엔드 팀 작업 필요]
   * 1. 이메일-코드 매칭 확인
   * 2. 5분 유효 시간 검증 (서버 시각 기준)
   * 3. 검증 성공 시 인증 완료 플래그 저장
   * 4. 일회용 코드 (검증 후 삭제)
   * 
   * [Cursor AI 연동 코드]
   * ```typescript
   * // Redis 저장소 예시:
   * const storedCode = await redis.get(`verification:${email}`);
   * const expiresAt = await redis.get(`verification:${email}:expires`);
   * 
   * if (!storedCode || storedCode !== code) {
   *   throw new Error('인증 코드가 일치하지 않습니다');
   * }
   * 
   * if (Date.now() > expiresAt) {
   *   throw new Error('인증 시간이 만료되었습니다');
   * }
   * 
   * // 검증 완료 후 삭제
   * await redis.del(`verification:${email}`);
   * ```
   */
  const handleVerifyCode = async () => {
    setError('');
    setSuccess('');
    
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError('인증 코드 6자리를 모두 입력해주세요.');
      return;
    }

    if (codeExpired) {
      setError('인증 시간이 만료되었습니다. 재발송해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // [백엔드 팀] 인증 코드 검증 API 구현 필요
      const response = await verifyCode(email, code);
      setSuccess(response.message);
      setTimerActive(false);
      setCodeVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 비밀번호 검증 함수
   * 
   * [플로우 1.3 Step 8]
   * 검증 규칙:
   * - 최소 8자
   * - 영문 포함
   * - 숫자 포함
   * - 특수문자 포함
   * 
   * @param value - 비밀번호 문자열
   * @returns 에러 메시지 (유효하면 빈 문자열)
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
   * 비밀번호 입력 필드 포커스 아웃 이벤트
   */
  const handlePasswordBlur = () => {
    if (password) {
      setPasswordError(validatePassword(password));
    }
  };

  /**
   * 비밀번호 확인 입력 핸들러 (실시간 검증)
   * 
   * [플로우 1.3 Step 9]
   * 동작:
   * - 입력 즉시 password와 일치 여부 확인
   * - 불일치 시 즉시 에러 메시지 표시
   */
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    if (value && value !== password) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setConfirmPasswordError('');
    }
  };

  /**
   * 회원가입 제출 핸들러
   * 
   * [플로우 1.3 Step 11~12]
   * 동작:
   * 1. 모든 필드 최종 검증
   * 2. 이메일 인증 완료 여부 확인
   * 3. 필수 약관 동의 확인
   * 4. API 호출: POST /api/auth/signup
   * 5. JWT 토큰 저장
   * 6. 사용자 정보 저장
   * 7. 페르소나 설정 화면으로 이동
   * 
   * [백엔드 API]
   * POST /api/auth/signup
   * Request: { email: string, password: string, name: string }
   * Response: {
   *   accessToken: string,
   *   refreshToken: string,
   *   user: { id: string, email: string, name: string, notificationEnabled: boolean }
   * }
   * 
   * [백엔드 팀 작업 필요]
   * 1. 비밀번호 해싱 (bcrypt 권장)
   * 2. 사용자 DB 저장
   * 3. JWT 토큰 발급 (accessToken, refreshToken)
   * 4. 초기 설정값 생성 (알림 설정 등)
   * 
   * [Cursor AI 연동 코드]
   * ```typescript
   * import bcrypt from 'bcrypt';
   * import jwt from 'jsonwebtoken';
   * 
   * // 비밀번호 해싱
   * const hashedPassword = await bcrypt.hash(password, 10);
   * 
   * // 사용자 DB 저장
   * const user = await db.users.create({
   *   email,
   *   password: hashedPassword,
   *   name,
   *   notificationEnabled: true
   * });
   * 
   * // JWT 토큰 발급
   * const accessToken = jwt.sign(
   *   { userId: user.id, email: user.email },
   *   process.env.JWT_SECRET,
   *   { expiresIn: '1h' }
   * );
   * 
   * const refreshToken = jwt.sign(
   *   { userId: user.id },
   *   process.env.JWT_REFRESH_SECRET,
   *   { expiresIn: '7d' }
   * );
   * ```
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('=== 🔍 회원가입 검증 시작 ===');
    
    // ===== 최종 검증 =====
    let hasError = false;
    
    // 이름 검증
    console.log('1️⃣ 이름 검증:', { name, length: name.trim().length });
    if (!name.trim()) {
      setNameError('이름을 입력해주세요.');
      hasError = true;
      console.log('❌ 이름 에러: 입력 안 됨');
    } else if (name.trim().length < 2) {
      setNameError('이름은 2자 이상이어야 합니다.');
      hasError = true;
      console.log('❌ 이름 에러: 2자 미만');
    } else {
      console.log('✅ 이름 검증 통과');
    }
    
    // 이메일 검증
    console.log('2️⃣ 이메일 검증:', { email, emailDuplicateChecked, emailAvailable });
    if (!email.trim()) {
      setEmailError('이메일을 입력해주세요.');
      hasError = true;
      console.log('❌ 이메일 에러: 입력 안 됨');
    } else if (!emailDuplicateChecked || !emailAvailable) {
      setEmailError('이메일 중복 확인이 필요합니다.');
      hasError = true;
      console.log('❌ 이메일 에러: 중복 확인 필요');
    } else {
      console.log('✅ 이메일 검증 통과');
    }
    
    // 이메일 인증 검증
    console.log('3️⃣ 이메일 인증 검증:', { codeVerified });
    if (!codeVerified) {
      setError('이메일 인증이 완료되지 않았습니다.');
      hasError = true;
      console.log('❌ 이메일 인증 에러: 인증 미완료');
    } else {
      console.log('✅ 이메일 인증 통과');
    }
    
    // 비밀번호 검증
    console.log('4️⃣ 비밀번호 검증:', { password: password ? '입력됨' : '입력 안 됨', length: password.length });
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      hasError = true;
      console.log('❌ 비밀번호 에러: 입력 안 됨');
    } else {
      const pwdErr = validatePassword(password);
      if (pwdErr) {
        setPasswordError(pwdErr);
        hasError = true;
        console.log('❌ 비밀번호 에러:', pwdErr);
      } else {
        console.log('✅ 비밀번호 검증 통과');
      }
    }
    
    // 비밀번호 확인 검증
    console.log('5️⃣ 비밀번호 확인 검증:', { confirmPassword: confirmPassword ? '입력됨' : '입력 안 됨', match: confirmPassword === password });
    if (!confirmPassword) {
      setConfirmPasswordError('비밀번호 확인을 입력해주세요.');
      hasError = true;
      console.log('❌ 비밀번호 확인 에러: 입력 안 됨');
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      hasError = true;
      console.log('❌ 비밀번호 확인 에러: 불일치');
    } else {
      console.log('✅ 비밀번호 확인 통과');
    }
    
    // 성별 검증
    console.log('6️⃣ 성별 검증:', { gender });
    if (!gender || (gender !== 'MALE' && gender !== 'FEMALE')) {
      setError('성별을 선택해주세요.');
      hasError = true;
      console.log('❌ 성별 에러: 미선택');
    } else {
      console.log('✅ 성별 검증 통과');
    }
    
    // 필수 약관 동의 확인
    const requiredTerms = termsData.filter(t => t.required);
    const allRequiredAgreed = requiredTerms.every(term => !!agreements[term.id]);
    
    console.log('7️⃣ 약관 동의 검증:');
    console.log('  - agreements 객체:', agreements);
    console.log('  - 필수 약관 ID 목록:', requiredTerms.map(t => t.id));
    console.log('  - 각 약관 동의 상태:', requiredTerms.map(t => ({ id: t.id, agreed: agreements[t.id] })));
    console.log('  - 모든 필수 약관 동의:', allRequiredAgreed);
    
    if (!allRequiredAgreed) {
      setError('필수 약관에 모두 동의해주세요.');
      hasError = true;
      console.log('❌ 약관 동의 에러: 미동의');
    } else {
      console.log('✅ 약관 동의 통과');
    }
    
    console.log('=== 최종 검증 결과 ===');
    console.log('hasError:', hasError);
    
    if (hasError) {
      console.log('❌ 회원가입 실패: 검증 에러 발생');
      return;
    }
    
    // 모든 검증 통과 시 에러 메시지 초기화
    setError('');
    console.log('✅ 모든 검증 통과! 회원가입 API 호출');
    
    // ===== API 호출: 회원가입 =====
    setIsLoading(true);
    
    try {
      // [API 명세서 Section 2.2.4] 회원가입 API 호출
      const response = await signup({ 
        email, 
        password, 
        name,
        emailVerified: true, // 이메일 인증 완료 (codeVerified가 true이므로)
        gender: gender as 'MALE' | 'FEMALE', // 성별 (필수)
        verificationCode: verificationCode.join(''), // 프론트엔드에서만 사용 (백엔드 전송 전에 verifyCode로 검증 완료)
        termsAccepted: true // 약관 동의 (여기까지 왔다면 필수 약관 동의 완료)
      });
      
      // JWT 토큰 localStorage 저장
      TokenStorage.setTokens(response.accessToken, response.refreshToken);
      
      // 사용자 정보 localStorage 저장
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // 회원가입 성공 → 페르소나 설정 화면으로 이동 (App.tsx에서 처리)
      onSignupSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 flex items-center justify-center p-4 sm:p-6 py-8">
      <div className="w-full max-w-lg">
        {/* Signup Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <BookHeart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-stone-800 mb-1">회원가입</h2>
                <p className="text-sm text-stone-600">
                  감정 일기와 함께 시작하세요
                </p>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs text-stone-600 block mb-2">
                  이름
                </label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameBlur}
                    placeholder="홍길동"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-stone-300 rounded-lg outline-none text-stone-800 placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 min-h-[44px]"
                  />
                </div>
                {nameError && (
                  <p className="text-xs text-rose-500 mt-1.5">{nameError}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs text-stone-600 block mb-2">
                  이메일
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                        setEmailAvailable(false);
                        setEmailDuplicateChecked(false);
                        setCodeSent(false);
                        setCodeVerified(false);
                        setSuccess('');
                      }}
                      placeholder="example@email.com"
                      disabled={isLoading || isCheckingEmail || codeVerified}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-stone-300 rounded-lg outline-none text-stone-800 placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 min-h-[44px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckEmailDuplicate}
                    disabled={isLoading || isCheckingEmail || !email || codeVerified}
                    className="px-4 py-2.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white rounded-lg transition-colors whitespace-nowrap disabled:cursor-not-allowed"
                  >
                    {isCheckingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      '중복 확인'
                    )}
                  </button>
                </div>
                {emailError && (
                  <p className="text-xs text-rose-500 mt-1">{emailError}</p>
                )}
                {success && !codeSent && (
                  <p className="text-xs text-emerald-600 mt-1">{success}</p>
                )}
              </div>

              {/* 인증 코드 발송 버튼 (중복 확인 완료 후 표시) */}
              {emailDuplicateChecked && emailAvailable && !codeVerified && (
                <div>
                  {!codeSent ? (
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-stone-300 text-white rounded-lg transition-colors text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          발송 중...
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          인증 코드 발송
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              )}

              {/* 인증 코드 입력 (발송 후 표시) */}
              {codeSent && !codeVerified && (
                <div className="space-y-3">
                  
                  {/* Timer */}
                  <div className="text-center">
                    <p className={`text-sm ${codeExpired ? 'text-rose-600' : 'text-blue-600'}`}>
                      {codeExpired ? (
                        '인증 시간이 만료되었습니다'
                      ) : (
                        `남은 시간: ${formatTime(timeRemaining)}`
                      )}
                    </p>
                  </div>

                  {/* 인증 코드 입력 */}
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
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          disabled={isLoading || codeExpired}
                          className="w-10 h-12 text-center text-lg bg-white border-2 border-stone-300 rounded-lg outline-none text-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                        />
                      ))}
                    </div>
                  </div>

                  {/* 인증 확인 버튼 */}
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isLoading || codeExpired || verificationCode.join('').length !== 6}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white rounded-lg transition-colors text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        확인 중...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        인증 확인
                      </>
                    )}
                  </button>

                  {/* 재발송 버튼 */}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 rounded-lg transition-colors text-sm"
                  >
                    인증 코드 재발송
                  </button>
                </div>
              )}

              {/* 인증 완료 메시지 */}
              {codeVerified && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-emerald-700">이메일 인증이 완료되었습니다</p>
                </div>
              )}

              {/* Password (인증 완료 후에만 표시) */}
              {codeVerified && (
                <>
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
                        onBlur={handlePasswordBlur}
                        placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                        disabled={isLoading}
                        className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-stone-300 rounded-lg outline-none text-stone-800 placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-rose-500 mt-1.5">{passwordError}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs text-stone-600 block mb-2">
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                        placeholder="비밀번호를 다시 입력하세요"
                        disabled={isLoading}
                        className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-stone-300 rounded-lg outline-none text-stone-800 placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 min-h-[44px]"
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
                      <p className="text-xs text-rose-500 mt-1.5">{confirmPasswordError}</p>
                    )}
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className="text-xs text-stone-600 block mb-2">
                      성별 <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="MALE"
                          checked={gender === 'MALE'}
                          onChange={(e) => {
                            setGender(e.target.value as 'MALE');
                            setError('');
                          }}
                          disabled={isLoading}
                          className="w-4 h-4 text-blue-600 border-stone-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-stone-700">남성</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="FEMALE"
                          checked={gender === 'FEMALE'}
                          onChange={(e) => {
                            setGender(e.target.value as 'FEMALE');
                            setError('');
                          }}
                          disabled={isLoading}
                          className="w-4 h-4 text-blue-600 border-stone-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-stone-700">여성</span>
                      </label>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">AI 그림일기 주인공 성별 결정에 사용됩니다</p>
                  </div>

                  {/* Terms Agreement */}
                  <TermsAgreement 
                    agreements={agreements}
                    onAgreementChange={setAgreements}
                  />
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg">
                  <p className="text-xs text-rose-700">{error}</p>
                </div>
              )}

              {/* Success Message (인증 코드 발송/확인) */}
              {success && codeSent && (
                <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
                  <p className="text-xs text-blue-700">{success}</p>
                </div>
              )}

              {/* Submit Button (인증 완료 후에만 표시) */}
              {codeVerified && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      회원가입 중...
                    </>
                  ) : (
                    '회원가입'
                  )}
                </button>
              )}

              {/* Back to Login */}
              <button
                type="button"
                onClick={onBackToLogin}
                disabled={isLoading}
                className="w-full py-2 text-sm text-stone-600 hover:text-stone-800 transition-colors disabled:opacity-50"
              >
                ← 로그인으로 돌아가기
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}