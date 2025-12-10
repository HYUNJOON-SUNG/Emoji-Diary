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
    // 로그인, 회원가입, 비밀번호 재설정 관련 API는 토큰을 보내지 않음
    if (config.url?.includes('/auth/login') || 
        config.url?.includes('/auth/register') ||
        config.url?.includes('/auth/password-reset')) {
      return config;
    }

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

    // 401 또는 403 에러 (인증 실패 또는 권한 없음) 처리
    // 토큰 만료로 인한 403도 처리하기 위해 403도 포함
    // 로그인/회원가입 API는 인증이 필요 없으므로 interceptor를 건너뜀
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                           originalRequest?.url?.includes('/auth/register') ||
                           originalRequest?.url?.includes('/auth/password-reset');
    
    const isTokenError = error.response?.status === 401 || error.response?.status === 403;
    
    if (isTokenError && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenStorage.getRefreshToken();
        if (!refreshToken) {
          // Refresh token이 없으면 로그인 페이지로 리다이렉트
          console.warn('토큰이 만료되었고 refresh token이 없습니다. 로그인 페이지로 이동합니다.');
          TokenStorage.clearTokens();
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(new Error('로그인이 필요합니다.'));
        }

        // 토큰 재발급 시도
        // refresh API는 interceptor를 거치지 않도록 axios 인스턴스를 직접 생성
        console.log('토큰이 만료되어 자동으로 재발급을 시도합니다...');
        const refreshAxios = axios.create({
          baseURL: BASE_URL,
          timeout: 10000,
        });
        const refreshResponse = await refreshAxios.post('/auth/refresh', {
          refreshToken,
        });

        if (refreshResponse.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          TokenStorage.setTokens(accessToken, newRefreshToken);
          console.log('토큰 재발급 성공. 원래 요청을 재시도합니다.');

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('토큰 재발급에 실패했습니다.');
        }
      } catch (refreshError: any) {
        // 토큰 재발급 실패 시 로그인 페이지로 리다이렉트
        console.error('토큰 재발급 실패:', refreshError);
        TokenStorage.clearTokens();
        localStorage.removeItem('user');
        
        // 사용자에게 피드백 제공
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          // Refresh token도 만료된 경우
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        } else {
          // 네트워크 오류 등 기타 오류
          alert('인증 정보를 갱신하는 중 오류가 발생했습니다. 다시 로그인해주세요.');
        }
        
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
    // [명세서 1.1] 관리자 Access Token 가져오기
    const adminToken = localStorage.getItem('admin_access_token');
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
 * 401 에러 시 리프레시 토큰으로 재발급 시도, 실패 시 관리자 로그인 페이지로 리다이렉트
 */
adminApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 또는 403 에러 (인증 실패) 처리
    const isTokenError = error.response?.status === 401 || error.response?.status === 403;
    const isAuthEndpoint = originalRequest?.url?.includes('/admin/auth/login') || 
                          originalRequest?.url?.includes('/admin/auth/refresh');
    
    if (isTokenError && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (!refreshToken) {
          throw new Error('Refresh token이 없습니다.');
        }

        // 토큰 재발급 시도
        console.log('관리자 토큰이 만료되어 자동으로 재발급을 시도합니다...');
        const refreshAxios = axios.create({
          baseURL: BASE_URL,
          timeout: 10000,
        });
        const refreshResponse = await refreshAxios.post('/admin/auth/refresh', {
          refreshToken,
        });

        if (refreshResponse.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          // [명세서 1.1] 관리자 Access Token 및 Refresh Token 저장
          localStorage.setItem('admin_access_token', accessToken);
          localStorage.setItem('admin_refresh_token', newRefreshToken);
          console.log('관리자 토큰 재발급 성공. 원래 요청을 재시도합니다.');

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return adminApiClient(originalRequest);
        } else {
          throw new Error('토큰 재발급에 실패했습니다.');
        }
      } catch (refreshError: any) {
        // 토큰 재발급 실패 시 관리자 로그인 페이지로 리다이렉트
        console.error('관리자 토큰 재발급 실패:', refreshError);
        // [명세서 1.1] 관리자 Access Token 및 Refresh Token 삭제
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        
        // 사용자에게 피드백 제공
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          // Refresh token도 만료된 경우
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        } else {
          // 네트워크 오류 등 기타 오류
          alert('인증 정보를 갱신하는 중 오류가 발생했습니다. 다시 로그인해주세요.');
        }
        
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    // 기타 에러 처리
    if (isTokenError && !originalRequest?._retry) {
      // [명세서 1.1] 관리자 Access Token 및 Refresh Token 제거
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

