/**
 * ========================================
 * Axios API 인스턴스 설정
 * ========================================
 * 
 * [백엔드 팀] 실제 백엔드 연동 시 사용할 axios 인스턴스
 * 
 * 주요 기능:
 * - Base URL 설정
 * - JWT 토큰 자동 추가 (Request Interceptor)
 * - 401 에러 시 토큰 재발급 시도 (Response Interceptor)
 * - 에러 처리 통합
 * 
 * [사용 방법]
 * - 각 서비스 파일에서 이 인스턴스를 import하여 사용
 * - JWT 토큰은 interceptor에서 자동으로 추가됩니다
 * 
 * 예시:
 * ```typescript
 * import { apiClient } from './api';
 * 
 * // GET 요청
 * const response = await apiClient.get('/api/diaries');
 * 
 * // POST 요청
 * const response = await apiClient.post('/api/diaries', data);
 * ```
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TokenStorage } from './authApi';

/**
 * Base URL 설정
 * 
 * [백엔드 팀] 환경에 따라 변경 필요
 * - 개발: http://localhost:8080/api
 * - 운영: https://api.emoji-diary.com/api
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 사용자 API용 Axios 인스턴스
 * 
 * [백엔드 팀] 실제 백엔드 연동 시 사용
 * - 모든 요청에 JWT 토큰 자동 추가
 * - 401 에러 시 자동으로 토큰 재발급 시도
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * 모든 요청 전에 JWT 토큰을 헤더에 자동 추가
 * 
 * [백엔드 팀] 실제 구현 시:
 * - localStorage에서 accessToken 조회
 * - 토큰이 있으면 Authorization 헤더에 추가
 * - 토큰이 없으면 요청은 그대로 진행 (인증 불필요한 API의 경우)
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 응답 처리 및 에러 핸들링
 * 
 * [백엔드 팀] 실제 구현 시:
 * - 401 에러 시 refreshToken으로 토큰 재발급 시도
 * - 재발급 성공 시 원래 요청 재시도
 * - 재발급 실패 시 로그인 페이지로 리다이렉트
 * - 기타 에러는 적절한 에러 메시지 반환
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 성공 응답은 그대로 반환
    // API 명세서에 따라 response.data.success 확인 필요
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러 (인증 실패) 처리
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('Refresh token이 없습니다.');
        }

        // 토큰 재발급 시도
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        if (refreshResponse.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          TokenStorage.setTokens(accessToken, newRefreshToken);

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('토큰 재발급에 실패했습니다.');
        }
      } catch (refreshError) {
        // 토큰 재발급 실패 시 로그인 페이지로 리다이렉트
        TokenStorage.clearTokens();
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // CORS 오류 또는 네트워크 오류 처리
    if (!error.response) {
      // CORS 오류 감지
      if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK' || error.code === 'ERR_FAILED') {
        const corsError = new Error('CORS 오류: 백엔드 서버의 CORS 설정을 확인해주세요. 백엔드에서 http://localhost:3000을 허용하도록 설정해야 합니다.');
        (corsError as any).isCorsError = true;
        return Promise.reject(corsError);
      }
      // 일반 네트워크 오류
      const networkError = new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // 기타 에러 처리
    const errorData = error.response.data as { error?: { message?: string; code?: string } };
    const errorMessage = errorData?.error?.message || '요청 처리 중 오류가 발생했습니다.';
    throw new Error(errorMessage);
  }
);

/**
 * 관리자 API용 Axios 인스턴스
 * 
 * [백엔드 팀] 실제 백엔드 연동 시 사용
 * - 관리자 JWT 토큰 사용
 * - Base URL: /api/admin
 */
export const adminApiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/admin`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 관리자 API Request Interceptor
 * 관리자 JWT 토큰 자동 추가
 */
adminApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const adminToken = localStorage.getItem('admin_jwt_token');
    if (adminToken && config.headers) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 관리자 API Response Interceptor
 * 401 에러 시 관리자 로그인 페이지로 리다이렉트
 */
adminApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // 401 에러 시 관리자 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_jwt_token');
      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

