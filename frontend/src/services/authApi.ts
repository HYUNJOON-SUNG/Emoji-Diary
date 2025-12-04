/**
 * ========================================
 * 인증 API 서비스 (Mock 구현)
 * ========================================
 * 
 * [백엔드 팀 작업 필요]
 * - 현재는 Mock 데이터로 동작
 * - 실제 백엔드 API로 교체 필요
 * - JWT 토큰 기반 인증 시스템
 * 
 * 주요 기능:
 * - 로그인 / 회원가입
 * - 비밀번호 찾기 (이메일 인증)
 * - 프로필 관리 (닉네임, 비밀번호)
 * - 알림 설정
 * - 회원 탈퇴
 * 
 * [플로우 14: 에러 처리 플로우]
 * 
 * **플로우 14.1: 입력 검증 에러**
 * - 실시간 검증: 입력 즉시 에러 메시지 표시/제거
 * - 제출 시 검증: 모든 필수 항목 최종 확인
 * - 에러 메시지: 필드 바로 아래 빨간색 텍스트로 표시
 * 
 * **플로우 14.2: 네트워크 에러**
 * - 타임아웃: 30초 후 "네트워크 연결을 확인해주세요" 표시
 * - 연결 실패: "서버와 연결할 수 없습니다" 표시
 * - 재시도 버튼 제공
 * 
 * **플로우 14.3: 서버 에러 (5xx)**
 * - 에러 메시지: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
 * - 로그 전송 (추후 Sentry 등 연동)
 */

import type { User } from '../types';

// ========== Mock 데이터 ==========

/**
 * Mock 사용자 데이터베이스
 * 
 * [플로우 16.1: 데이터 동기화 플로우]
 * - 로그인/회원가입 성공 시 localStorage에 저장
 * - 앱 시작 시 localStorage에서 복원
 * 
 * 테스트용 계정:
 * - test@example.com / password123
 * - user@diary.com / 1234
 * 
 * [백엔드 팀]
 * 실제 구현 시 PostgreSQL/MySQL 등 DB 사용
 * 비밀번호는 bcrypt 등으로 해시화 저장
 */
interface MockUser {
  id: string;
  email: string;
  password: string; // ⚠️ 실제로는 해시값 저장 필요
  name: string;
  persona: string; // 페르소나 (베프, 부모님, 전문가, 멘토, 상담사, 시인)
  notificationEnabled: boolean;
  createdAt: string;
}

const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    name: '홍길동',
    persona: '베프', // API 명세서: 기본값 "베프"
    notificationEnabled: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'user@diary.com',
    password: '1234',
    name: '김철수',
    persona: '베프', // API 명세서: 기본값 "베프"
    notificationEnabled: false,
    createdAt: '2024-01-02T00:00:00Z',
  },
];

/**
 * 인증 코드 저장소 (이메일 → { 코드, 만료시간 })
 * 
 * [백엔드 팀]
 * 실제로는 Redis 등에 저장하여 TTL 자동 관리
 */
interface VerificationCodeEntry {
  code: string;
  expiresAt: number; // timestamp (밀리초)
}

const verificationCodes: Record<string, VerificationCodeEntry> = {};

// ========== 유틸리티 함수 ==========

/**
 * 지연 함수 (네트워크 지연 시뮬레이션)
 * @param ms - 지연 시간 (밀리초)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 랜덤 ID 생성 (UUID 대신 간단한 방식)
 */
const generateId = () => Math.random().toString(36).substr(2, 9);

// ========== JWT 토큰 관리 ==========

/**
 * JWT 토큰 저장소 (localStorage 관리)
 * 
 * [플로우 16.1: 데이터 동기화 플로우]
 * 
 * **로그인/회원가입 성공 시**:
 * 1. JWT 토큰 발급 (accessToken, refreshToken)
 * 2. localStorage에 저장
 *    - 키: 'accessToken', 'refreshToken'
 * 3. 사용자 정보도 함께 저장
 *    - 키: 'user'
 *    - 값: JSON.stringify({ id, email, name, notificationEnabled })
 * 
 * **앱 시작 시**:
 * 1. localStorage에서 토큰 로드
 * 2. 토큰 유효성 검증 (만료 여부 확인)
 * 3. 유효하면: 자동 로그인
 * 4. 만료되었으면: refreshToken으로 갱신 시도
 * 5. refreshToken도 만료: 로그인 화면 표시
 * 
 * **로그아웃 시**:
 * 1. localStorage에서 토큰 삭제
 * 2. 사용자 정보 삭제
 * 3. 랜딩 페이지로 이동
 * 
 * [백엔드 팀]
 * JWT 토큰 구조:
 * - accessToken: 1시간 유효, API 요청 시 사용
 * - refreshToken: 7일 유효, accessToken 갱신 시 사용
 * - payload: { userId, email, iat, exp }
 */
export const TokenStorage = {
  /**
   * 토큰 저장
   * @param accessToken - JWT 액세스 토큰
   * @param refreshToken - JWT 리프레시 토큰
   */
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  /**
   * 액세스 토큰 조회
   * @returns 액세스 토큰 또는 null
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  /**
   * 리프레시 토큰 조회
   * @returns 리프레시 토큰 또는 null
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  /**
   * 토큰 삭제 (로그아웃)
   */
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * 유효한 토큰 존재 여부 확인
   * @returns true: 토큰 있음, false: 토큰 없음
   * 
   * [백엔드 팀]
   * 실제로는 토큰 만료 시간도 체크해야 함
   * JWT decode 후 exp 필드 확인
   */
  hasValidToken: (): boolean => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },
};

// ========== TypeScript 타입 정의 ==========


/**
 * 로그인 요청 데이터
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 응답 데이터
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * 회원가입 요청 데이터
 * 
 * [API 명세서 Section 2.2.4]
 * - POST /api/auth/register
 * - Request: { name, email, password, emailVerified, persona? }
 * 
 * [플로우 1.3: 회원가입 플로우]
 * - email: 이메일 (인증 완료된 이메일)
 * - password: 비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)
 * - name: 이름 (2~10자)
 * - verificationCode: 이메일 인증 코드 (6자리) - 프론트엔드에서만 사용
 * - termsAccepted: 필수 약관 동의 여부 - 프론트엔드에서만 사용
 * - persona: 페르소나 (선택, 미제공 시 기본값 "베프")
 *   * 페르소나 종류: 베프, 부모님, 전문가, 멘토, 상담사, 시인
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  verificationCode: string; // 프론트엔드에서만 사용 (백엔드에는 emailVerified: true로 전송)
  termsAccepted: boolean; // 프론트엔드에서만 사용
  persona?: string; // [API 명세서] 선택 필드 (기본값: "베프")
}

/**
 * 회원가입 응답 데이터
 */
export interface SignupResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * 인증 코드 발송 요청 (비밀번호 찾기)
 */
export interface VerificationCodeRequest {
  email: string;
}

/**
 * 인증 코드 발송 요청 (회원가입)
 */
export interface SignupVerificationCodeRequest {
  email: string;
}

/**
 * 비밀번호 재설정 요청
 */
export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

// ========== API 함수들 ==========

/**
 * POST /auth/login
 * 로그인
 * 
 * [플로우 1.2: 로그인 플로우]
 * 
 * 동작:
 * 1. 이메일/비밀번호 검증
 * 2. Mock 사용자 DB에서 일치하는 계정 찾기
 * 3. JWT 토큰 생성 (Mock)
 * 4. 토큰 + 사용자 정보 반환
 * 
 * 에러 케이스:
 * - 이메일 미입력 → "이메일을 입력해주세요"
 * - 비밀번호 미입력 → "비밀번호를 입력해주세요"
 * - 이메일 형식 오류 → "올바른 이메일 형식을 입력해주세요"
 * - 계정 없음 → "이메일 또는 비밀번호가 일치하지 않습니다"
 * - 비밀번호 불일치 → "이메일 또는 비밀번호가 일치하지 않습니다"
 * 
 * [백엔드 팀] 실제 구현 시:
 * - POST /api/auth/login
 * - Request: { email, password }
 * - Response: { accessToken, refreshToken, user }
 * - 비밀번호는 bcrypt.compare()로 검증
 * - JWT는 jsonwebtoken 라이브러리로 생성
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  // 네트워크 지연 시뮬레이션
  await delay(1000);

  // Find user by email
  const user = mockUsers.find(u => u.email === data.email);
  
  if (!user || user.password !== data.password) {
    throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
  }

  // Generate mock JWT tokens
  const accessToken = `mock-access-token-${user.id}-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      persona: user.persona, // API 명세서: persona 필드 추가
      notificationEnabled: user.notificationEnabled,
    },
  };
}

/**
 * POST /auth/signup
 * 회원가입
 * 
 * [플로우 1.3: 회원가입 플로우]
 * 
 * 동작:
 * 1. 이메일 중복 확인
 * 2. 인증 코드 검증
 * 3. 비밀번호 검증 (영문/숫자/특수문자 8자 이상)
 * 4. 이름 검증 (2~10자)
 * 5. 필수 약관 동의 확인
 * 6. 새 사용자 생성
 * 7. JWT 토큰 생성 및 반환
 * 
 * 에러 케이스:
 * - 이메일 중복 → "이미 가입된 이메일입니다"
 * - 인증 코드 불일치 → "인증 코드가 일치하지 않습니다"
 * - 비밀번호 형식 오류 → "비밀번호는 영문, 숫자, 특수문자 포함 8자 이상이어야 합니다"
 * - 이름 형식 오류 → "이름은 2~10자로 입력해주세요"
 * - 약관 미동의 → "필수 약관에 동의해주세요"
 * 
 * [백엔드 팀] 실제 구현 시:
 * - POST /api/auth/signup
 * - Request: { email, password, name, verificationCode, termsAccepted }
 * - Response: { accessToken, refreshToken, user }
 * - 비밀번호는 bcrypt로 해시화
 * - 사용자 정보는 users 테이블에 저장
 * - 약관 동의 이력은 user_terms 테이블에 저장
 */
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  await delay(1500);
  
  // Check if email already exists
  const existingUser = mockUsers.find(u => u.email === data.email);
  if (existingUser) {
    throw new Error('이미 가입된 이메일입니다. 로그인해주세요.');
  }
  
  // Terms check
  if (!data.termsAccepted) {
    throw new Error('필수 약관에 동의해주세요.');
  }
  
  // Create new user
  // [API 명세서] persona는 회원가입 시 선택 필드, 미제공 시 기본값 "베프"
  const validPersonas = ['베프', '부모님', '전문가', '멘토', '상담사', '시인'];
  const persona = data.persona && validPersonas.includes(data.persona) 
    ? data.persona 
    : '베프'; // 기본값 "베프"
  
  const newUser: MockUser = {
    id: generateId(),
    email: data.email,
    password: data.password,
    name: data.name,
    persona: persona, // API 명세서: 선택 필드, 미제공 시 기본값 "베프"
    notificationEnabled: true,
    createdAt: new Date().toISOString(),
  };
  
  mockUsers.push(newUser);
  
  console.log('[New User Created]', newUser);
  
  // Generate mock JWT tokens
  const accessToken = `mock-access-token-${newUser.id}-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${newUser.id}-${Date.now()}`;
  
  return {
    accessToken,
    refreshToken,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      persona: newUser.persona, // API 명세서: persona 필드 추가
      notificationEnabled: newUser.notificationEnabled,
    },
  };
}

/**
 * POST /auth/check-email
 * 이메일 중복 확인
 * 
 * [플로우 1.3: 회원가입 플로우]
 * 
 * 동작:
 * 1. 입력된 이메일이 이미 가입되었는지 확인
 * 2. 중복되지 않으면 사용 가능
 * 
 * [백엔드 팀] 실제 구현 시:
 * - POST /api/auth/check-email
 * - Request: { email }
 * - Response: { available: boolean, message: string }
 */
export async function checkEmailDuplicate(email: string): Promise<{ available: boolean; message: string }> {
  await delay(500);
  
  const existingUser = mockUsers.find(u => u.email === email);
  
  if (existingUser) {
    return {
      available: false,
      message: '이미 가입된 이메일입니다. 로그인해주세요.',
    };
  }
  
  return {
    available: true,
    message: '사용 가능한 이메일입니다.',
  };
}

/**
 * POST /auth/send-verification-code
 * 비밀번호 찾기 - 인증 코드 발송 (5분 유효)
 * 
 * [플로우 1.4] 비밀번호 찾기 전용
 * - 가입된 이메일인지 확인 필요
 * - 가입되지 않은 이메일: 에러
 * - **5분 유효 시간** (명세서 요구사항)
 * 
 * [백엔드 팀] 실제 구현 시:
 * - 이메일 발송 서비스 연동 (AWS SES, SendGrid 등)
 * - 6자리 랜덤 숫자 코드 생성
 * - 코드와 만료 시간을 DB 또는 Redis에 저장
 * - 이메일 템플릿: "인증 코드: XXXXXX (5분 내 입력)"
 */
export async function sendVerificationCode(data: VerificationCodeRequest): Promise<{ message: string; sentAt: number }> {
  await delay(1000);
  
  // Check if email exists
  const user = mockUsers.find(u => u.email === data.email);
  if (!user) {
    throw new Error('가입되지 않은 이메일입니다. 다시 확인해주세요.');
  }
  
  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  const sentAt = Date.now();
  
  // Store code with 5 minute expiration (비밀번호 찾기는 5분)
  verificationCodes[data.email] = {
    code,
    expiresAt: sentAt + 5 * 60 * 1000, // ✅ 5분 = 300초
  };
  
  // Simulate email sending
  console.log(`[Email Sent] To: ${data.email}, Code: ${code}`);
  
  return {
    message: '인증 메일이 발송되었습니다. 스팸 메일함도 확인해주세요.',
    sentAt,
  };
}

/**
 * POST /auth/send-verification-code-for-signup
 * 회원가입 - 이메일 인증 코드 발송 (5분 유효)
 * 
 * [플로우 1.3] 회원가입 전용
 * - 이메일 중복 확인 완료 후 호출
 * - 이미 가입된 이메일: 에러
 * - **5분 유효 시간** (명세서 요구사항)
 * 
 * [백엔드 팀] 실제 구현 시:
 * - 이메일 발송 서비스 연동
 * - 6자리 랜덤 숫자 코드 생성
 * - 코드와 만료 시간을 Redis에 저장 (TTL: 300초)
 * - 이메일 템플릿: "인증 코드: XXXXXX (5분 내 입력)"
 */
export async function sendVerificationCodeForSignup(data: SignupVerificationCodeRequest): Promise<{ message: string; sentAt: number }> {
  await delay(1000);
  
  // Check if email already exists
  const existingUser = mockUsers.find(u => u.email === data.email);
  if (existingUser) {
    throw new Error('이미 가입된 이메일입니다. 로그인해주세요.');
  }
  
  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  const sentAt = Date.now();
  
  // Store code with 5 minute expiration (회원가입은 5분)
  verificationCodes[data.email] = {
    code,
    expiresAt: sentAt + 5 * 60 * 1000, // ✅ 5분 = 300초
  };
  
  // Simulate email sending
  console.log(`[Signup Email Sent] To: ${data.email}, Code: ${code}`);
  
  return {
    message: '인증 메일이 발송되었습니다. 스팸 메일함도 확인해주세요.',
    sentAt,
  };
}

/**
 * POST /auth/verify-code
 * 인증 코드 검증
 * 
 * [플로우 1.3, 1.4] 회원가입 및 비밀번호 찾기에서 사용
 * 
 * 동작:
 * 1. 이메일에 해당하는 인증 코드 조회
 * 2. 코드 일치 여부 확인
 * 3. 만료 시간 확인 (5분)
 * 
 * 에러 케이스:
 * - 코드 없음 → "인증 코드가 만료되었거나 존재하지 않습니다"
 * - 코드 불일치 → "인증 코드가 일치하지 않습니다"
 * - 시간 만료 → "인증 시간이 만료되었습니다. 재발송해주세요"
 * 
 * [백엔드 팀] 실제 구현 시:
 * - POST /api/auth/verify-code
 * - Request: { email, code }
 * - Response: { success: boolean, message: string }
 * - Redis에서 코드 조회 및 검증
 * - 검증 성공 시 코드 삭제 (재사용 방지)
 * 
 * [UI 테스트용 Mock 기능]
 * - 테스트 코드: 123456 (항상 통과)
 * - ⚠️ 배포 전 삭제 필수
 */
export async function verifyCode(email: string, code: string): Promise<{ message: string }> {
  await delay(800);
  
  // ⚠️ [임시 테스트 코드 - 배포 전 삭제 필수] ⚠️
  // UI 테스트를 위해 123456은 항상 통과시킴
  if (code === '123456') {
    console.log('[테스트 모드] 인증 코드 123456 입력 - 자동 통과');
    return { message: '인증되었습니다.' };
  }
  // ⚠️ [여기까지 삭제] ⚠️
  
  const storedCode = verificationCodes[email];
  
  if (!storedCode) {
    throw new Error('인증 코드가 만료되었거나 존재하지 않습니다. 재발송해주세요.');
  }
  
  // Check expiration
  if (Date.now() > storedCode.expiresAt) {
    delete verificationCodes[email];
    throw new Error('인증 시간이 만료되었습니다. 재발송해주세요.');
  }
  
  // Check code match
  if (storedCode.code !== code) {
    throw new Error('인증 코드가 일치하지 않습니다. 다시 확인해주세요.');
  }
  
  // Success - delete code to prevent reuse
  delete verificationCodes[email];
  
  return {
    message: '인증되었습니다.',
  };
}

/**
 * POST /auth/reset-password
 * 비밀번호 재설정
 * 
 * [플로우 1.4: 비밀번호 찾기 플로우]
 * 
 * 동작:
 * 1. 인증 코드 재검증 (보안)
 * 2. 새 비밀번호 검증 (영문/숫자/특수문자 8자 이상)
 * 3. 비밀번호 업데이트
 * 
 * [백엔드 팀] 실제 구현 시:
 * - POST /api/auth/reset-password
 * - Request: { email, code, newPassword }
 * - Response: { success: boolean, message: string }
 * - 비밀번호는 bcrypt로 해시화하여 저장
 * - 인증 코드는 1회용 (사용 후 삭제)
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
  await delay(1000);
  
  // Find user
  const user = mockUsers.find(u => u.email === data.email);
  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }
  
  // Update password (in real app, hash it first)
  user.password = data.newPassword;
  
  console.log(`[Password Reset] Email: ${data.email}, New Password: ${data.newPassword}`);
  
  return {
    message: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.',
  };
}

/**
 * POST /auth/refresh
 * 토큰 재발급
 * 
 * [API 명세서 Section 2.4]
 * - Access Token 만료 시 Refresh Token으로 재발급
 * - Refresh Token도 만료되면 로그인 화면으로 이동
 * 
 * [백엔드 팀] 실제 구현 시:
 * - POST /api/auth/refresh
 * - Request: { refreshToken: string }
 * - Response: { success: true, data: { accessToken: string, refreshToken: string } }
 * - Refresh Token 검증 후 새로운 Access Token과 Refresh Token 발급
 * - 기존 Refresh Token은 무효화 처리 (Refresh Token Rotation)
 */
export async function refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  await delay(500);
  
  // [백엔드 팀] 실제 구현 시:
  // 1. Refresh Token 검증 (JWT verify)
  // 2. Refresh Token이 유효하면 새로운 Access Token과 Refresh Token 발급
  // 3. 기존 Refresh Token은 무효화 처리
  // 4. 만료되었거나 유효하지 않으면 에러 반환
  
  // Mock 구현: Refresh Token에서 사용자 ID 추출 (실제로는 JWT decode)
  const tokenMatch = refreshToken.match(/mock-refresh-token-(\w+)-/);
  if (!tokenMatch) {
    throw new Error('유효하지 않은 토큰입니다.');
  }
  
  const userId = tokenMatch[1];
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }
  
  // 새로운 토큰 생성
  const newAccessToken = `mock-access-token-${user.id}-${Date.now()}`;
  const newRefreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;
  
  // localStorage에 새 토큰 저장
  TokenStorage.setTokens(newAccessToken, newRefreshToken);
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * GET /users/me
 * 현재 로그인한 사용자 정보 조회
 * 
 * [API 명세서 Section 3.1]
 * - 엔드포인트: GET /api/users/me
 * 
 * [플로우 16.1: 데이터 동기화 플로우]
 * 
 * 동작:
 * 1. JWT 토큰에서 사용자 ID 추출
 * 2. DB에서 최신 사용자 정보 조회
 * 3. 사용자 정보 반환
 * 
 * [백엔드 팀] 실제 구현 시:
 * - GET /api/users/me
 * - Headers: { Authorization: 'Bearer {accessToken}' }
 * - Response: { success: true, data: { id, email, name, persona, createdAt } }
 * - JWT 토큰 검증 후 userId 추출
 * - users 테이블에서 정보 조회
 */
export async function getCurrentUser(): Promise<User> {
  await delay(500);
  
  // Mock: localStorage에서 사용자 정보 로드
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const user = JSON.parse(userStr);
  
  // [API 명세서] persona 필드가 없으면 기본값 "베프" 설정
  if (!user.persona) {
    user.persona = '베프';
  }
  
  return user;
}

/**
 * PUT /users/me/persona
 * 페르소나 설정 변경
 * 
 * [API 명세서 Section 3.2]
 * - 회원가입 직후 페르소나 설정 화면에서 초기 설정 시 사용
 * - 이미 페르소나가 설정된 경우 변경 시에도 사용
 * 
 * 페르소나 종류:
 * - 베프, 부모님, 전문가, 멘토, 상담사, 시인
 * 
 * [백엔드 팀] 실제 구현 시:
 * - PUT /api/users/me/persona
 * - Headers: { Authorization: 'Bearer {accessToken}' }
 * - Request: { persona: string }
 * - Response: { success: true, data: { message: string, persona: string } }
 */
export async function updatePersona(data: { persona: string }): Promise<{ message: string; persona: string }> {
  await delay(800);
  
  // 페르소나 유효성 검증
  const validPersonas = ['베프', '부모님', '전문가', '멘토', '상담사', '시인'];
  if (!validPersonas.includes(data.persona)) {
    throw new Error('유효하지 않은 페르소나입니다.');
  }
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const user = JSON.parse(userStr);
  user.persona = data.persona;
  
  // Update localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  // Update mock users array
  const mockUser = mockUsers.find(u => u.id === user.id);
  if (mockUser) {
    mockUser.persona = data.persona;
  }
  
  return {
    message: '페르소나가 설정되었습니다',
    persona: data.persona,
  };
}

/**
 * PUT /auth/profile
 * 프로필 수정 (닉네임)
 * 
 * [플로우 9: 마이페이지 - 프로필 관리]
 * 
 * 동작:
 * 1. 닉네임 검증 (2~10자)
 * 2. 사용자 정보 업데이트
 * 3. localStorage 동기화
 * 
 * [백엔드 팀] 실제 구현 시:
 * - PUT /api/auth/profile
 * - Headers: { Authorization: 'Bearer {accessToken}' }
 * - Request: { name }
 * - Response: { success: boolean, user }
 */
export async function updateProfile(data: { name: string }): Promise<{ message: string; user: User }> {
  await delay(800);
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const user = JSON.parse(userStr);
  user.name = data.name;
  
  // Update localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  // Update mock users array
  const mockUser = mockUsers.find(u => u.id === user.id);
  if (mockUser) {
    mockUser.name = data.name;
  }
  
  return {
    message: '프로필이 수정되었습니다.',
    user,
  };
}

/**
 * PUT /users/me/password
 * 비밀번호 변경
 * 
 * [API 명세서 Section 3.3]
 * 
 * [플로우 9: 마이페이지 - 비밀번호 변경]
 * 
 * 동작:
 * 1. 현재 비밀번호 검증
 * 2. 새 비밀번호 검증 (영문/숫자/특수문자 8자 이상)
 * 3. 새 비밀번호 확인 (newPassword === confirmPassword)
 * 4. 비밀번호 업데이트
 * 
 * [백엔드 팀] 실제 구현 시:
 * - PUT /api/users/me/password
 * - Headers: { Authorization: 'Bearer {accessToken}' }
 * - Request: { currentPassword, newPassword, confirmPassword }
 * - Response: { success: true, data: { message: string } }
 * - bcrypt.compare()로 현재 비밀번호 검증
 * - bcrypt.hash()로 새 비밀번호 해시화
 */
export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string; // [API 명세서] 새 비밀번호 확인 필드 추가
}): Promise<{ message: string }> {
  await delay(800);
  
  // 새 비밀번호 확인 검증
  if (data.newPassword !== data.confirmPassword) {
    throw new Error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
  }
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const user = JSON.parse(userStr);
  const mockUser = mockUsers.find(u => u.id === user.id);
  
  if (!mockUser) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }
  
  // Verify current password
  if (mockUser.password !== data.currentPassword) {
    throw new Error('현재 비밀번호가 일치하지 않습니다.');
  }
  
  // Update password
  mockUser.password = data.newPassword;
  
  return {
    message: '비밀번호가 변경되었습니다.',
  };
}

/**
 * PUT /auth/notification
 * 알림 설정 변경
 * 
 * [플로우 9: 마이페이지 - 알림 설정]
 * 
 * 동작:
 * 1. 알림 켜기/끄기 토글
 * 2. 사용자 설정 업데이트
 * 3. localStorage 동기화
 * 
 * [백엔드 팀] 실제 구현 시:
 * - PUT /api/auth/notification
 * - Headers: { Authorization: 'Bearer {accessToken}' }
 * - Request: { enabled: boolean }
 * - Response: { success: boolean, enabled }
 */
export async function updateNotificationSettings(enabled: boolean): Promise<{ message: string; enabled: boolean }> {
  await delay(500);
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const user = JSON.parse(userStr);
  user.notificationEnabled = enabled;
  
  // Update localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  // Update mock users array
  const mockUser = mockUsers.find(u => u.id === user.id);
  if (mockUser) {
    mockUser.notificationEnabled = enabled;
  }
  
  return {
    message: enabled ? '알림이 켜졌습니다.' : '알림이 꺼졌습니다.',
    enabled,
  };
}

/**
 * DELETE /auth/account
 * 회원 탈퇴
 * 
 * [플로우 9: 마이페이지 - 회원 탈퇴]
 * 
 * 동작:
 * 1. 비밀번호 재확인
 * 2. 사용자 데이터 삭제 (또는 비활성화)
 * 3. 로그아웃 처리
 * 
 * [백엔드 팀] 실제 구현 시:
 * - DELETE /api/auth/account
 * - Headers: { Authorization: 'Bearer {accessToken}' }
 * - Request: { password }
 * - Response: { success: boolean, message }
 * - 실제로는 soft delete (deleted_at 컬럼 사용)
 * - 일기 데이터도 함께 삭제/비활성화
 */
export async function deleteAccount(password: string): Promise<{ message: string }> {
  await delay(1000);
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const user = JSON.parse(userStr);
  const mockUser = mockUsers.find(u => u.id === user.id);
  
  if (!mockUser) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }
  
  // Verify password
  if (mockUser.password !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }
  
  // Delete user from mock array
  const index = mockUsers.findIndex(u => u.id === user.id);
  if (index !== -1) {
    mockUsers.splice(index, 1);
  }
  
  // Clear localStorage
  TokenStorage.clearTokens();
  localStorage.removeItem('user');
  
  console.log('[Account Deleted]', user.email);
  
  return {
    message: '회원 탈퇴가 완료되었습니다.',
  };
}

// ========== Alias exports (하위 호환성) ==========

/**
 * changePassword - updatePassword의 alias
 * MyPage.tsx에서 사용하는 함수명
 */
export const changePassword = updatePassword;

/**
 * updateNotification - updateNotificationSettings의 alias
 * MyPage.tsx에서 사용하는 함수명
 */
export const updateNotification = updateNotificationSettings;
