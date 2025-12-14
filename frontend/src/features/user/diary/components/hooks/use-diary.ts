/**
 * 다이어리 관련 Hook
 * 
 * @description
 * 다이어리 데이터 로딩 및 관리
 */
import { useState, useCallback } from 'react';
import { getDiaryList, getDiaryDetail } from '@/features/user/diary/api/diaryApi';

export function useDiary() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshDiaries = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const selectDate = useCallback((date: Date | null) => {
    setSelectedDate(date);
  }, []);

  const changeMonth = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  return {
    selectedDate,
    currentMonth,
    refreshKey,
    refreshDiaries,
    selectDate,
    changeMonth
  };
}

