/**
 * 사용자 정보 관리 Hook
 * 
 * @description
 * 사용자 정보 로딩 및 업데이트 관리
 */
import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, updateUser } from '@/features/user/auth/api/authApi';
import { useAsync } from '../../hooks/use-async';
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

  const updateUserInfo = useCallback(async (updates: Partial<User>) => {
    try {
      const updated = await updateUser(updates);
      setUser(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    loadUser,
    updateUserInfo
  };
}

