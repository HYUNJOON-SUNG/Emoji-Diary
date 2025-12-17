/**
 * 사용자 정보 관리 Hook
 * - 사용자 데이터 로드 및 업데이트
 */
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/features/user/auth/api/authApi';
import { useAsync } from '@/shared/hooks/use-async';
import type { User } from '@/shared/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  
  const { data, isLoading, error, execute: loadUser } = useAsync(
    async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    },
    { immediate: false }
  );

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  return {
    user,
    isLoading,
    error,
    loadUser
  };
}

