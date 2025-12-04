/**
 * 인증 관련 Hook
 * 
 * @description
 * 로그인, 회원가입 등 인증 관련 상태 및 로직 관리
 */
import { useState, useCallback } from 'react';
import { login, TokenStorage } from '../../services/authApi';
import type { User } from '../../types';

interface UseAuthReturn {
  isLoading: boolean;
  error: string;
  handleLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await login({ email, password });
      
      // 토큰 저장
      TokenStorage.setTokens(response.accessToken, response.refreshToken);
      
      // 사용자 정보 저장
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return { isLoading, error, handleLogin, clearError };
}

