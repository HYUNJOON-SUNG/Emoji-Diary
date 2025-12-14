/**
 * 비동기 작업 관리 Hook
 * 
 * @description
 * API 호출 등 비동기 작업의 로딩, 에러, 데이터 상태를 관리하는 hook
 */
import { useState, useCallback, useEffect } from 'react';

interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { immediate = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, isLoading, error, execute };
}

