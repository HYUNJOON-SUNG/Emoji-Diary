import { useState, useEffect, useCallback } from 'react';
import { getErrorLogList } from '../api/adminApi';
import type { ErrorLog, LogStats } from '../types';

/**
 * 에러 로그 관리 Hook
 * - 로그 목록 조회, 필터링, 검색 기능 제공
 */
export function useErrorLogs() {
  const [isLoading, setIsLoading] = useState(true);
  const [allLogs, setAllLogs] = useState<ErrorLog[]>([]);
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<LogStats>({
    total: 0,
    error: 0,
    warn: 0,
    info: 0
  });
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);

  const [levelFilter, setLevelFilter] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * 에러 로그 목록 조회
   */
  const loadErrorLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getErrorLogList();
      const logsData = response.data.logs || [];
      
      logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const statistics: LogStats = {
        total: response.data.total || 0,
        error: response.data.summary?.error || 0,
        warn: response.data.summary?.warn || 0,
        info: response.data.summary?.info || 0
      };

      setAllLogs(logsData);
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load error logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 필터 및 검색 적용
   * - 레벨, 날짜, 검색어 기반 클라이언트 사이드 필터링
   */
  const applyFilters = useCallback(() => {
    let filtered = [...allLogs];

    if (levelFilter !== 'ALL') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(query) ||
        log.endpoint?.toLowerCase().includes(query) ||
        log.errorCode?.toLowerCase().includes(query)
      );
    }

    setLogs(filtered);
  }, [allLogs, levelFilter, startDate, endDate, searchQuery]);

  useEffect(() => {
    loadErrorLogs();
  }, [loadErrorLogs]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    isLoading,
    logs,
    stats,
    selectedLog,
    setSelectedLog,
    levelFilter,
    setLevelFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    refetch: loadErrorLogs
  };
}

