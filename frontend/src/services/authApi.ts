/**
 * ========================================
 * 인증 API 서비스
 * ========================================
 * 
 * [백엔드 연동 완료]
 * - 모든 API는 실제 백엔드 서버와 통신합니다.
 * - JWT 토큰은 apiClient의 interceptor에서 자동으로 추가됩니다.
 * - 토큰 재발급은 자동으로 처리됩니다.
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
import { personaToEnum, enumToPersona } from '../utils/personaConverter';
import { apiClient } from './api';

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
 * - Request: { name, email, password, emailVerified, gender }
 * 
 * [ERD 설계서 참고 - Users 테이블]
 * - gender: ENUM (MALE, FEMALE) - 필수, AI 이미지 생성 시 주인공 성별 결정
 * 
 * [플로우 1.3: 회원가입 플로우]
 * - email: 이메일 (인증 완료된 이메일)
 * - password: 비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)
 * - name: 이름 (2~10자)
 * - emailVerified: 이메일 인증 완료 여부 (필수, true여야 함)
 * - gender: 성별 (필수, MALE 또는 FEMALE, AI 이미지 생성 시 사용됨)
 * - verificationCode: 이메일 인증 코드 (6자리) - 프론트엔드에서만 사용 (백엔드 전송 전에 verifyCode로 검증)
 * - termsAccepted: 필수 약관 동의 여부 - 프론트엔드에서만 사용
 * - persona: 페르소나 (선택, 미제공 시 기본값 "베프")
 *   * 페르소나 종류: 베프, 부모님, 전문가, 멘토, 상담사, 시인
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  emailVerified: boolean; // [API 명세서] 필수 필드, true여야 함
  gender: 'MALE' | 'FEMALE'; // [API 명세서] 필수 필드, AI 이미지 생성 시 사용됨 (ERD: Users.gender, ENUM)
  verificationCode: string; // 프론트엔드에서만 사용 (백엔드 전송 전에 verifyCode로 검증)
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
 * 비밀번호 재설정 인증 코드 확인 요청
 * [API 명세서 Section 2.3.2]
 * POST /api/auth/password-reset/verify-code
 */
export interface VerifyPasswordResetCodeRequest {
  email: string;
  code: string;
}

/**
 * 비밀번호 재설정 요청
 * [API 명세서 Section 2.3.3]
 * POST /api/auth/password-reset/reset
 */
export interface ResetPasswordRequest {
  email: string;
  resetToken: string; // verify-code에서 받은 resetToken
  newPassword: string;
  confirmPassword: string; // [API 명세서] 새 비밀번호 확인 필드 추가
}

// ========== API 함수들 ==========

/**
 * POST /api/auth/login
 * 로그인
 * 
 * [API 명세서 Section 2.1]
 * [플로우 1.2: 로그인 플로우]
 * 
 * 동작:
 * 1. 이메일/비밀번호 검증
 * 2. 백엔드 API로 로그인 요청
 * 3. JWT 토큰 수신 및 저장
 * 4. 사용자 정보 반환 (persona는 enum에서 한글로 변환)
 * 
 * 에러 케이스:
 * - 이메일 미입력 → "이메일을 입력해주세요"
 * - 비밀번호 미입력 → "비밀번호를 입력해주세요"
 * - 이메일 형식 오류 → "올바른 이메일 형식을 입력해주세요"
 * - 계정 없음 → "이메일 또는 비밀번호가 일치하지 않습니다"
 * - 비밀번호 불일치 → "이메일 또는 비밀번호가 일치하지 않습니다"
 * 
 * [백엔드 연동 완료]
 * - POST /api/auth/login
 * - Request: { email, password }
 * - Response: { success: true, data: { accessToken, refreshToken, user } }
 * - user.persona는 enum 형식으로 반환되며, 프론트엔드에서 한글로 변환
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post('/auth/login', {
      email: data.email,
      password: data.password,
    });
    
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      // 백엔드에서 enum으로 반환되므로 한글로 변환
      // ID 타입 처리: 백엔드에서 숫자로 올 수 있으므로 string으로 변환
      const userWithPersona = {
        ...user,
        id: user.id != null ? String(user.id) : '', // 숫자 → string 변환
        persona: enumToPersona(user.persona as any), // enum → 한글
      };
      TokenStorage.setTokens(accessToken, refreshToken);
      localStorage.setItem('user', JSON.stringify(userWithPersona));
      return { accessToken, refreshToken, user: userWithPersona };
    } else {
      throw new Error(response.data.error?.message || '로그인에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 400) {
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
    throw error;
  }
}

/**
 * POST /api/auth/register
 * 회원가입
 * 
 * [API 명세서 Section 2.2.4]
 * [플로우 1.3: 회원가입 플로우]
 * 
 * 동작:
 * 1. 이메일 중복 확인 (프론트엔드에서 사전 검증)
 * 2. 인증 코드 검증 (프론트엔드에서 사전 검증)
 * 3. 비밀번호 검증 (프론트엔드에서 사전 검증)
 * 4. 이름 검증 (프론트엔드에서 사전 검증)
 * 5. 필수 약관 동의 확인 (프론트엔드에서 사전 검증)
 * 6. 백엔드 API로 회원가입 요청 (persona는 enum으로 변환하여 전송)
 * 7. JWT 토큰 수신 및 저장
 * 8. 사용자 정보 반환 (persona는 enum에서 한글로 변환)
 * 
 * 에러 케이스:
 * - 이메일 중복 → "이미 가입된 이메일입니다"
 * - 인증 코드 불일치 → "인증 코드가 일치하지 않습니다"
 * - 비밀번호 형식 오류 → "비밀번호는 영문, 숫자, 특수문자 포함 8자 이상이어야 합니다"
 * - 이름 형식 오류 → "이름은 2~10자로 입력해주세요"
 * - 약관 미동의 → "필수 약관에 동의해주세요"
 * 
 * [백엔드 연동 완료]
 * - POST /api/auth/register
 * - Request: { name, email, password, emailVerified, gender, persona? }
 * - Response: { success: true, data: { accessToken, refreshToken, user } }
 * - persona는 enum 형식으로 전송 (한글 → enum 변환)
 * - user.persona는 enum 형식으로 반환되며, 프론트엔드에서 한글로 변환
 */
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  // [API 명세서] emailVerified는 true여야 함
  if (!data.emailVerified) {
    throw new Error('이메일 인증이 완료되지 않았습니다.');
  }
  
  // Terms check (프론트엔드에서만 검증)
  if (!data.termsAccepted) {
    throw new Error('필수 약관에 동의해주세요.');
  }
  
  // [API 명세서] persona는 회원가입 시 선택 필드, 미제공 시 기본값 "베프"
  const validPersonas = ['베프', '부모님', '전문가', '멘토', '상담사', '시인'];
  const persona = data.persona && validPersonas.includes(data.persona) 
    ? data.persona 
    : '베프'; // 기본값 "베프"
  
  // persona를 enum으로 변환하여 전송 (한글 → enum)
  const personaEnum = personaToEnum(persona as any);
  
  try {
    const requestBody = {
      name: data.name,
      email: data.email,
      password: data.password,
      emailVerified: data.emailVerified,
      gender: data.gender,
      persona: personaEnum, // 백엔드는 enum을 기대함
    };
    
    const response = await apiClient.post('/auth/register', requestBody);
    
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      // 백엔드에서 enum으로 반환되므로 한글로 변환
      // ID 타입 처리: 백엔드에서 숫자로 올 수 있으므로 string으로 변환
      const userWithPersona = {
        ...user,
        id: user.id != null ? String(user.id) : '', // 숫자 → string 변환
        persona: enumToPersona(user.persona as any), // enum → 한글
      };
      TokenStorage.setTokens(accessToken, refreshToken);
      localStorage.setItem('user', JSON.stringify(userWithPersona));
      return {
        accessToken,
        refreshToken,
        user: userWithPersona,
      };
    } else {
      throw new Error(response.data.error?.message || '회원가입에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error?.message || '회원가입에 실패했습니다.';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * POST /api/auth/check-email
 * 이메일 중복 확인
 * 
 * [API 명세서 Section 2.2.1]
 * [플로우 1.3: 회원가입 플로우]
 * 
 * 동작:
 * 1. 입력된 이메일이 이미 가입되었는지 확인
 * 2. 중복되지 않으면 사용 가능
 * 
 * [백엔드 연동 완료]
 * - POST /api/auth/check-email
 * - Request: { email }
 * - Response: { success: true, data: { available: boolean, message: string } }
 * - 중복 시: { success: false, error: { code: "EMAIL_ALREADY_EXISTS", message: "이미 가입된 이메일입니다" } }
 */
export async function checkEmailDuplicate(email: string): Promise<{ available: boolean; message: string }> {
  try {
    const response = await apiClient.post('/auth/check-email', { email });
    
    if (response.data.success) {
      return {
        available: response.data.data.available,
        message: response.data.data.message,
      };
    } else {
      // 중복된 경우
      return {
        available: false,
        message: response.data.error?.message || '이미 가입된 이메일입니다.',
      };
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      return {
        available: false,
        message: error.response.data?.error?.message || '이미 가입된 이메일입니다.',
      };
    }
    throw error;
  }
}

/**
 * POST /api/auth/password-reset/send-code
 * 비밀번호 재설정 인증 코드 발송 (5분 유효)
 * 
 * [API 명세서 Section 2.3.1]
 * - 가입된 이메일인지 확인 필요
 * - 가입되지 않은 이메일: 에러
 * - **5분 유효 시간** (명세서 요구사항)
 * 
 * [백엔드 연동 완료]
 * - POST /api/auth/password-reset/send-code
 * - Request: { email }
 * - Response: { success: true, data: { message: string, expiresIn: 300 } }
 * - 이메일 발송 서비스 연동 (AWS SES, SendGrid 등)
 * - 6자리 랜덤 숫자 코드 생성
 * - 코드와 만료 시간을 DB 또는 Redis에 저장
 * - 이메일 템플릿: "인증 코드: XXXXXX (5분 내 입력)"
 */
export async function sendPasswordResetCode(data: VerificationCodeRequest): Promise<{ message: string; expiresIn: number }> {
  try {
    const response = await apiClient.post('/auth/password-reset/send-code', {
      email: data.email,
    });
    
    if (response.data.success) {
      return {
        message: response.data.data.message,
        expiresIn: response.data.data.expiresIn,
      };
    } else {
      throw new Error(response.data.error?.message || '인증 코드 발송에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      throw new Error(error.response.data?.error?.message || '가입되지 않은 이메일입니다.');
    }
    throw error;
  }
}

/**
 * POST /api/auth/password-reset/verify-code
 * 비밀번호 재설정 인증 코드 확인
 * 
 * [API 명세서 Section 2.3.2]
 * - 인증 코드 검증 후 resetToken 반환
 * - resetToken은 비밀번호 재설정 시 사용
 * 
 * [백엔드 연동 완료]
 * - POST /api/auth/password-reset/verify-code
 * - Request: { email, code }
 * - Response: { success: true, data: { verified: true, resetToken: string } }
 */
export async function verifyPasswordResetCode(data: VerifyPasswordResetCodeRequest): Promise<{ verified: boolean; resetToken: string }> {
  try {
    const response = await apiClient.post('/auth/password-reset/verify-code', {
      email: data.email,
      code: data.code,
    });
    
    if (response.data.success) {
      return {
        verified: response.data.data.verified,
        resetToken: response.data.data.resetToken,
      };
    } else {
      throw new Error(response.data.error?.message || '인증 코드 확인에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error?.message || '인증 코드가 일치하지 않습니다.';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * POST /api/auth/send-verification-code
 * 회원가입 - 이메일 인증 코드 발송 (5분 유효)
 * 
 * [API 명세서 Section 2.2.2]
 * - 이메일 중복 확인 완료 후 호출
 * - 이미 가입된 이메일: 에러
 * - **5분 유효 시간** (명세서 요구사항)
 * 
 * [백엔드 연동 완료]
 * - POST /api/auth/send-verification-code
 * - Request: { email }
 * - Response: { success: true, data: { message: string, expiresIn: 300 } }
 * - 이메일 발송 서비스 연동
 * - 6자리 랜덤 숫자 코드 생성
 * - 코드와 만료 시간을 Redis에 저장 (TTL: 300초)
 * - 이메일 템플릿: "인증 코드: XXXXXX (5분 내 입력)"
 */
export async function sendVerificationCodeForSignup(data: SignupVerificationCodeRequest): Promise<{ message: string; expiresIn: number }> {
  try {
    const response = await apiClient.post('/auth/send-verification-code', {
      email: data.email,
    });
    
    if (response.data.success) {
      return {
        message: response.data.data.message,
        expiresIn: response.data.data.expiresIn,
      };
    } else {
      throw new Error(response.data.error?.message || '인증 코드 발송에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error?.message || '이미 가입된 이메일입니다.';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * POST /api/auth/verify-code
 * 회원가입 인증 코드 검증
 * 
 * [API 명세서 Section 2.2.3]
 * - 회원가입 전용 인증 코드 검증
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
 * [백엔드 연동 완료]
 * - POST /api/auth/verify-code
 * - Request: { email, code }
 * - Response: { success: true, data: { verified: true, message: string } }
 * - Redis에서 코드 조회 및 검증
 * - 검증 성공 시 코드 삭제 (재사용 방지)
 */
export async function verifyCode(email: string, code: string): Promise<{ verified: boolean; message: string }> {
  try {
    const response = await apiClient.post('/auth/verify-code', {
      email,
      code,
    });
    
    if (response.data.success) {
      return {
        verified: response.data.data.verified,
        message: response.data.data.message,
      };
    } else {
      throw new Error(response.data.error?.message || '인증 코드가 일치하지 않습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error?.message || '인증 코드가 일치하지 않습니다.';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * POST /api/auth/password-reset/reset
 * 비밀번호 재설정
 * 
 * [API 명세서 Section 2.3.3]
 * 
 * 동작:
 * 1. resetToken 검증
 * 2. 새 비밀번호와 확인 비밀번호 일치 확인
 * 3. 새 비밀번호 검증 (영문/숫자/특수문자 8자 이상)
 * 4. 비밀번호 업데이트
 * 
 * [백엔드 연동 완료]
 * - POST /api/auth/password-reset/reset
 * - Request: { email, resetToken, newPassword, confirmPassword }
 * - Response: { success: true, data: { message: string } }
 * - 비밀번호는 bcrypt로 해시화하여 저장
 * - resetToken은 1회용 (사용 후 삭제)
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
  // 새 비밀번호 확인 검증 (프론트엔드에서만 검증)
  if (data.newPassword !== data.confirmPassword) {
    throw new Error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
  }
  
  try {
    const response = await apiClient.post('/auth/password-reset/reset', {
      email: data.email,
      resetToken: data.resetToken,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    
    if (response.data.success) {
      return {
        message: response.data.data.message,
      };
    } else {
      throw new Error(response.data.error?.message || '비밀번호 재설정에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error?.message || '비밀번호 재설정에 실패했습니다.';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * POST /api/auth/refresh
 * 토큰 재발급
 * 
 * [API 명세서 Section 2.4]
 * - Access Token 만료 시 Refresh Token으로 재발급
 * - Refresh Token도 만료되면 로그인 화면으로 이동
 * 
 * [백엔드 연동 완료]
 * - POST /api/auth/refresh
 * - Request: { refreshToken: string }
 * - Response: { success: true, data: { accessToken: string, refreshToken: string, user? } }
 * - Refresh Token 검증 후 새로운 Access Token과 Refresh Token 발급
 * - 기존 Refresh Token은 무효화 처리 (Refresh Token Rotation)
 * - user가 포함된 경우 persona는 enum에서 한글로 변환
 */
export async function refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user?: User }> {
  try {
    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
    });
    
    if (response.data.success) {
      const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
      TokenStorage.setTokens(accessToken, newRefreshToken);
      
      // user가 포함된 경우 persona 변환
      if (user) {
        // ID 타입 처리: 백엔드에서 숫자로 올 수 있으므로 string으로 변환
        const userWithPersona = {
          ...user,
          id: user.id != null ? String(user.id) : '', // 숫자 → string 변환
          persona: enumToPersona(user.persona as any), // enum → 한글
        };
        localStorage.setItem('user', JSON.stringify(userWithPersona));
        return {
          accessToken,
          refreshToken: newRefreshToken,
          user: userWithPersona,
        };
      }
      
      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } else {
      throw new Error(response.data.error?.message || '토큰 재발급에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      TokenStorage.clearTokens();
      localStorage.removeItem('user');
      throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw error;
  }
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
 * [백엔드 연동 완료]
 * - GET /api/users/me
 * - Headers: { Authorization: 'Bearer {accessToken}' } (apiClient interceptor에서 자동 추가)
 * - Response: { success: true, data: { id, email, name, gender, persona, createdAt } }
 * - persona는 enum 형식으로 반환되며, 프론트엔드에서 한글로 변환
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiClient.get('/users/me');
    
    if (response.data.success) {
      const userResponse = response.data.data;
      // 백엔드에서 enum으로 반환되므로 한글로 변환
      // ID 타입 처리: 백엔드에서 숫자로 올 수 있으므로 string으로 변환
      const user = {
        ...userResponse,
        id: userResponse.id != null ? String(userResponse.id) : '', // 숫자 → string 변환
        persona: enumToPersona(userResponse.persona as any), // enum → 한글
      };
      // localStorage 동기화
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } else {
      throw new Error(response.data.error?.message || '사용자 정보를 가져오는데 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      TokenStorage.clearTokens();
      localStorage.removeItem('user');
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
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
 * [백엔드 연동 완료]
 * - PUT /api/users/me/persona
 * - Headers: { Authorization: 'Bearer {accessToken}' } (apiClient interceptor에서 자동 추가)
 * - Request: { persona: string } (enum 형식으로 전송, 한글 → enum 변환)
 * - Response: { success: true, data: { message: string, persona: string } } (enum 형식, 한글로 변환)
 */
export async function updatePersona(data: { persona: string }): Promise<{ message: string; persona: string }> {
  // 페르소나 유효성 검증
  const validPersonas = ['베프', '부모님', '전문가', '멘토', '상담사', '시인'];
  if (!validPersonas.includes(data.persona)) {
    throw new Error('유효하지 않은 페르소나입니다.');
  }
  
  // persona를 enum으로 변환하여 전송 (한글 → enum)
  const personaEnum = personaToEnum(data.persona as any);
  
  try {
    const response = await apiClient.put('/users/me/persona', { persona: personaEnum });
    
    if (response.data.success) {
      const userResponse = response.data.data;
      // 백엔드에서 enum으로 반환되므로 한글로 변환
      const personaKorean = enumToPersona(userResponse.persona as any);
      
      // localStorage 동기화
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.persona = personaKorean;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return {
        message: userResponse.message,
        persona: personaKorean,
      };
    } else {
      throw new Error(response.data.error?.message || '페르소나 설정에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

/**
 * PUT /users/me/profile
 * 프로필 수정 (닉네임)
 * 
 * [API 명세서 Section 3.1 - 사용자 정보 조회 참고]
 * [플로우 9: 마이페이지 - 프로필 관리]
 * 
 * 동작:
 * 1. 닉네임 검증 (2~10자)
 * 2. 사용자 정보 업데이트
 * 3. localStorage 동기화
 * 
 * [백엔드 연동 완료]
 * - PUT /api/users/me
 * - Headers: { Authorization: 'Bearer {accessToken}' } (apiClient interceptor에서 자동 추가)
 * - Request: { name }
 * - Response: { success: true, data: { message: string, user } }
 * - user.persona는 enum 형식으로 반환되며, 프론트엔드에서 한글로 변환
 */
export async function updateProfile(data: { name: string }): Promise<{ message: string; user: User }> {
  try {
    const response = await apiClient.put('/users/me', { name: data.name });
    
    if (response.data.success) {
      const userResponse = response.data.data;
      // 백엔드에서 enum으로 반환되므로 한글로 변환
      const user = {
        ...userResponse,
        persona: enumToPersona(userResponse.persona as any), // enum → 한글
      };
      // localStorage 동기화
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        message: '프로필이 수정되었습니다.',
        user,
      };
    } else {
      throw new Error(response.data.error?.message || '프로필 수정에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
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
 * [백엔드 연동 완료]
 * - PUT /api/users/me/password
 * - Headers: { Authorization: 'Bearer {accessToken}' } (apiClient interceptor에서 자동 추가)
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
  // 새 비밀번호 확인 검증 (프론트엔드에서만 검증)
  if (data.newPassword !== data.confirmPassword) {
    throw new Error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
  }
  
  try {
    const response = await apiClient.put('/users/me/password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    
    if (response.data.success) {
      return {
        message: response.data.data.message,
      };
    } else {
      throw new Error(response.data.error?.message || '비밀번호 변경에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error?.message || '비밀번호 변경에 실패했습니다.';
      throw new Error(errorMessage);
    }
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
}

/**
 * PUT /users/me/notification
 * 알림 설정 변경
 * 
 * [주의사항]
 * - 현재 API 명세서(API_명세서.md)에 이 엔드포인트가 명시되어 있지 않습니다.
 * - ERD 설계서에도 Users 테이블에 notification_enabled 컬럼이 없습니다.
 * - 사용자 명세서에도 "위험 알림 받기" 설정에 대한 명시적인 언급이 없습니다.
 * - 하지만 프론트엔드에서는 이 기능이 구현되어 있으며, 사용자 피드백에 따라 필요합니다.
 * 
 * [백엔드 구현 필요]
 * - PUT /api/users/me/notification 엔드포인트 구현 필요
 * - Users 테이블에 notification_enabled 컬럼 추가 필요 (또는 다른 방식으로 구현)
 * - Request: { enabled: boolean }
 * - Response: { success: true, data: { message: string, enabled: boolean } }
 * 
 * [임시 처리]
 * - 현재는 API 호출을 시도하지만, 백엔드에 구현되지 않은 경우 에러가 발생할 수 있습니다.
 * - 에러 발생 시 사용자에게 적절한 메시지를 표시합니다.
 * 
 * [플로우 9: 마이페이지 - 알림 설정]
 * - 위험 신호 알림을 받을지 말지를 설정하는 기능
 */
export async function updateNotificationSettings(enabled: boolean): Promise<{ message: string; enabled: boolean }> {
  try {
    const response = await apiClient.put('/users/me/notification', { enabled });
    
    if (response.data.success) {
      // localStorage 동기화
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.notificationEnabled = enabled;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return {
        message: response.data.data.message || (enabled ? '알림이 켜졌습니다.' : '알림이 꺼졌습니다.'),
        enabled,
      };
    } else {
      throw new Error(response.data.error?.message || '알림 설정 변경에 실패했습니다.');
    }
  } catch (error: any) {
    // 네트워크 오류 또는 CORS 오류 처리
    if (!error.response) {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
    if (error.response?.status === 401) {
      window.location.href = '/login';
      throw new Error('로그인이 필요합니다.');
    }
    // 기타 에러는 서버 메시지 사용
    const errorMessage = error.response?.data?.error?.message || error.message || '알림 설정 변경에 실패했습니다.';
    throw new Error(errorMessage);
  }
}

/**
 * DELETE /users/me
 * 계정 탈퇴
 * 
 * [API 명세서 Section 3.4]
 * [플로우 9: 마이페이지 - 회원 탈퇴]
 * 
 * 동작:
 * 1. 비밀번호 재확인 (필요 시)
 * 2. 사용자 데이터 삭제 (또는 비활성화)
 * 3. 로그아웃 처리
 * 
 * [백엔드 연동 완료]
 * - DELETE /api/users/me
 * - Headers: { Authorization: 'Bearer {accessToken}' } (apiClient interceptor에서 자동 추가)
 * - Request Body: { password: string } (비밀번호 재확인)
 * - Response: { success: true, data: { message: string } }
 * - 실제로는 soft delete (deleted_at 컬럼 사용)
 * - 일기 데이터도 함께 삭제/비활성화
 */
export async function deleteAccount(password: string): Promise<{ message: string }> {
  try {
    const response = await apiClient.delete('/users/me', {
      data: { password },
    });
    
    if (response.data.success) {
      // Clear localStorage
      TokenStorage.clearTokens();
      localStorage.removeItem('user');
      
      return {
        message: response.data.data.message,
      };
    } else {
      throw new Error(response.data.error?.message || '계정 탈퇴에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error?.message || '비밀번호가 일치하지 않습니다.';
      throw new Error(errorMessage);
    }
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    throw error;
  }
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
