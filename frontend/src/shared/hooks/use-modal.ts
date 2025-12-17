/**
 * 모달 상태 관리 Hook
 * 
 * @description
 * 모달 열기/닫기 상태를 관리하는 공통 hook
 * 여러 모달을 동시에 관리할 수 있음
 */
import { useState, useCallback } from 'react';

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

/**
 * 여러 모달을 동시에 관리하는 Hook
 */
export function useModals<T extends string>(initialStates?: Record<T, boolean>) {
  const [modals, setModals] = useState<Record<T, boolean>>(
    initialStates || ({} as Record<T, boolean>)
  );

  const open = useCallback((key: T) => {
    setModals(prev => ({ ...prev, [key]: true }));
  }, []);

  const close = useCallback((key: T) => {
    setModals(prev => ({ ...prev, [key]: false }));
  }, []);

  const toggle = useCallback((key: T) => {
    setModals(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isOpen = useCallback((key: T) => !!modals[key], [modals]);

  return { modals, open, close, toggle, isOpen };
}

