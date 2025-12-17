/**
 * 인증 API 서비스
 * - 로그인, 회원가입, 프로필 관리 등 인증 관련 기능 제공
 * - JWT 토큰은 interceptor에서 자동 처리
 */

import type { User } from '@/shared/types';
import { personaToEnum, enumToPersona } from '@/shared/utils/personaConverter';
import { apiClient } from '@/shared/api/client';

// ========== JWT 토큰 관리 ==========

/**
 * JWT 토큰 저장소 (localStorage)
 * - Access/Refresh 토큰 저장 및 조회
 * - 로그인 여부 확인
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
 * 로그인
 * @param data 이메일, 비밀번호
 * @returns Access/Refresh 토큰 및 사용자 정보
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
 * 회원가입
 * - 이메일 인증, 약관 동의 확인 후 가입 요청
 * @param data 가입 정보
 * @returns 토큰 및 사용자 정보
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
 * 이메일 중복 확인
 * @param email 이메일 주소
 * @returns 사용 가능 여부
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
        message: '이미 가입된 이메일입니다.',
      };
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      return {
        available: false,
        message: '이미 가입된 이메일입니다.',
      };
    }
    throw error;
  }
}

/**
 * 비밀번호 재설정 인증 코드 발송
 * - 5분 유효
 * @param data 이메일
 * @returns 만료 시간(초)
 */
export async function sendPasswordResetCode(data: VerificationCodeRequest): Promise<{ message: string; expiresIn: number }> {
  try {
    const response = await apiClient.post('/auth/password-reset/send-code', {
      email: data.email,
    });

    // 200 OK지만 success가 false인 경우 (소프트 에러)
    if (response.data.success) {
      return {
        message: response.data.data.message,
        expiresIn: response.data.data.expiresIn,
      };
    } else {
      throw new Error('이메일이 올바르지 않습니다.');
    }
  } catch (error: any) {
    // 404, 400, 500 등 모든 HTTP 에러에 대해 동일한 메시지 반환
    throw new Error('이메일이 올바르지 않습니다.');
  }
}

/**
 * 비밀번호 재설정 인증 코드 확인
 * @param data 이메일, 코드
 * @returns resetToken
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
      throw new Error('인증 코드 확인에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('인증 코드가 일치하지 않습니다.');
    }
    throw error;
  }
}

/**
 * 회원가입용 인증 코드 발송
 * - 5분 유효
 * @param data 이메일
 * @returns 만료 시간
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
      // 논리적 에러 (200 OK지만 success: false)
      throw new Error('이메일이 올바르지 않습니다.');
    }
  } catch (error: any) {
    // 네트워크/HTTP 에러 또는 위에서 던진 에러
    throw new Error('이메일이 올바르지 않습니다.');
  }
}

/**
 * 회원가입 인증 코드 확인
 * @param email 이메일
 * @param code 코드
 * @returns 검증 결과
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
      throw new Error('인증 코드가 일치하지 않습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('인증 코드가 일치하지 않습니다.');
    }
    throw error;
  }
}

/**
 * 비밀번호 재설정
 * - resetToken을 사용하여 비밀번호 변경
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
 * 토큰 재발급
 * - Refresh Token으로 새 Access Token 발급
 * @param refreshToken 리프레시 토큰
 * @returns 새 토큰 및 사용자 정보
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
 * 내 정보 조회
 * @returns 사용자 정보
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
 * 페르소나 설정 변경
 * @param data 페르소나 (한글)
 * @returns 변경된 페르소나
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
 * 비밀번호 변경
 * - 현재 비밀번호 검증 후 새 비밀번호로 변경
 * @param data 현재, 새, 확인 비밀번호
 * @returns 완료 메시지
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
 * 알림 설정 변경
 * @param enabled 알림 활성화 여부
 * @returns 변경된 설정
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
 * 계정 탈퇴
 * @param password 비밀번호 확인
 * @returns 완료 메시지
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
