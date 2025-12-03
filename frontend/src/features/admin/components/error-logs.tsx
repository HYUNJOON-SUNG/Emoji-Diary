/**
 * ====================================================================================================
 * 에러 로그 조회 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 시스템 에러 로그를 조회하고 관리하는 페이지
 * - 유스케이스: 6.1-6.3 에러 로그 조회 플로우
 * - 플로우: 에러 로그 조회 플로우
 * 
 * @features
 * 1. 에러 로그 목록 조회 (6.1):
 *    - 네비게이션 "에러 로그" 탭 클릭
 *    - 로딩 스피너 ("에러 로그를 불러오는 중...")
 *    - 통계 카드 4개:
 *      - 전체 로그 수 (흰색 배경)
 *      - ERROR 레벨 (빨간색 배경)
 *      - WARN 레벨 (노란색 배경)
 *      - INFO 레벨 (파란색 배경)
 *    - 로그 목록 테이블:
 *      - 로그 ID, 타임스탬프 (YYYY-MM-DD HH:mm:ss), 레벨 (배지), 메시지 (최대 100자), 엔드포인트
 *      - 액션: "상세보기" 버튼
 *    - 정렬: 타임스탬프 최신순
 * 
 * 2. 에러 로그 필터링 및 검색 (6.2):
 *    - 심각도 필터 (드롭다운): 전체(ALL) / ERROR만 / WARN만 / INFO만
 *    - 날짜 필터:
 *      - 시작일 선택 (날짜 선택기)
 *      - 종료일 선택 (날짜 선택기)
 *      - 빠른 선택 버튼: "오늘", "이번 주", "이번 달"
 *    - 검색 기능:
 *      - 검색창: 메시지, 엔드포인트, 에러 코드로 검색
 *      - "검색" 버튼 클릭 또는 Enter 키 입력
 *      - 검색 결과 즉시 테이블에 반영
 *    - "필터 초기화" 버튼 → 모든 필터 및 검색어 초기화
 *    - 필터 변경 시 자동으로 목록 갱신
 * 
 * 3. 에러 로그 상세 조회 (6.3):
 *    - "상세보기" 버튼 클릭 → 모달 표시
 *    - 기본 정보:
 *      - 로그 ID (고유 식별자)
 *      - 타임스탬프 (YYYY-MM-DD HH:mm:ss)
 *      - 레벨 (ERROR/WARN/INFO 배지)
 *    - 에러 정보:
 *      - 메시지 (전체 에러 메시지)
 *      - 오류 코드 (있는 경우, 코드 형식)
 *      - 엔드포인트 (있는 경우, API 엔드포인트 또는 페이지)
 *      - 사용자 ID (있는 경우, 에러 발생 당시 사용자 ID)
 *    - Stack Trace (있는 경우):
 *      - 어두운 배경 (bg-slate-900)
 *      - 빨간색 텍스트 (text-red-400)
 *      - 줄바꿈 및 들여쓰기 유지
 *    - 우측 상단 "X" 버튼 → 모달 닫기
 * 
 * @data_source
 * - [백엔드 작업] Database (MariaDB)에서 에러 로그 조회
 *   GET /api/admin/error-logs
 *   - Query parameters: level, startDate, endDate, search
 * 
 * ====================================================================================================
 */

import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, FileText, Clock, Activity, Search, Filter, X, Calendar, User, Code } from 'lucide-react';

// ========================================
// 에러 로그 데이터 타입 (6.1)
// ========================================
interface ErrorLog {
  id: string;                         // 로그 ID
  timestamp: string;                  // 발생 시간 (ISO 8601)
  level: 'ERROR' | 'WARN' | 'INFO';  // 로그 레벨
  message: string;                    // 에러 메시지
  endpoint: string;                   // API 엔드포인트 또는 페이지
  stackTrace?: string;                // 스택 트레이스 (상세보기)
  userId?: string;                    // 연관 사용자 ID (옵션)
  userAgent?: string;                 // 사용자 브라우저 정보 (옵션)
  errorCode?: string;                 // 오류 코드 (옵션)
}

// ========================================
// 로그 통계 데이터 타입
// ========================================
interface LogStats {
  total: number;       // 전체 로그 수
  error: number;       // ERROR 레벨 개수
  warn: number;        // WARN 레벨 개수
  info: number;        // INFO 레벨 개수
}

export function ErrorLogs() {
  // ========================================
  // State 관리
  // ========================================
  const [isLoading, setIsLoading] = useState(true);
  const [allLogs, setAllLogs] = useState<ErrorLog[]>([]);  // 전체 로그 (필터링 전)
  const [logs, setLogs] = useState<ErrorLog[]>([]);        // 표시할 로그 (필터링 후)
  const [stats, setStats] = useState<LogStats>({
    total: 0,
    error: 0,
    warn: 0,
    info: 0
  });
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);

  // ========================================
  // 필터 및 검색 State (6.2)
  // ========================================
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ========================================
  // 페이지 진입 시 자동 로드 (6.1)
  // ========================================
  useEffect(() => {
    loadErrorLogs();
  }, []);

  // ========================================
  // 필터 변경 시 자동 갱신 (6.2)
  // ========================================
  useEffect(() => {
    applyFilters();
  }, [levelFilter, startDate, endDate, searchQuery, allLogs]);

  /**
   * 에러 로그 목록 로드 (6.1)
   * - Database (MariaDB)에서 조회
   * - 타임스탬프 최신순 정렬
   */
  const loadErrorLogs = async () => {
    setIsLoading(true);

    try {
      // Mock API call to fetch error logs from Database (MariaDB)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Get from localStorage (simulating DB)
      const storedLogs = localStorage.getItem('error_logs');
      
      let logsData: ErrorLog[] = [];
      
      if (storedLogs) {
        logsData = JSON.parse(storedLogs);
      } else {
        // Default mock logs (6.1)
        logsData = generateMockLogs();
        localStorage.setItem('error_logs', JSON.stringify(logsData));
      }

      // Sort by timestamp (최신순)
      logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Calculate statistics
      const statistics: LogStats = {
        total: logsData.length,
        error: logsData.filter(log => log.level === 'ERROR').length,
        warn: logsData.filter(log => log.level === 'WARN').length,
        info: logsData.filter(log => log.level === 'INFO').length
      };

      setAllLogs(logsData);
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load error logs:', error);
      alert('에러 로그를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mock 에러 로그 생성 (개발/테스트용)
   */
  const generateMockLogs = (): ErrorLog[] => {
    return [
      {
        id: 'LOG001',
        timestamp: new Date('2025-11-30T14:35:22').toISOString(),
        level: 'ERROR',
        message: 'Database connection timeout: Failed to connect to MariaDB server',
        endpoint: '/api/users/profile',
        stackTrace: 'Error: Connection timeout\n  at Database.connect (db.ts:45)\n  at UserService.getProfile (user.service.ts:23)\n  at ProfileController.getProfile (profile.controller.ts:67)',
        userId: 'U123',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        errorCode: 'DB_CONNECTION_TIMEOUT'
      },
      {
        id: 'LOG002',
        timestamp: new Date('2025-11-30T13:22:10').toISOString(),
        level: 'WARN',
        message: 'Slow query detected: SELECT statement took 3.5 seconds',
        endpoint: '/api/analytics/dashboard',
        stackTrace: 'Warning: Query performance issue\n  at QueryBuilder.execute (query.ts:78)\n  at AnalyticsService.getDashboardData (analytics.service.ts:45)',
        userId: 'U045',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.0',
        errorCode: 'SLOW_QUERY'
      },
      {
        id: 'LOG003',
        timestamp: new Date('2025-11-30T12:15:45').toISOString(),
        level: 'INFO',
        message: 'User authentication successful',
        endpoint: '/api/auth/login',
        userId: 'U078'
      },
      {
        id: 'LOG004',
        timestamp: new Date('2025-11-30T11:48:33').toISOString(),
        level: 'ERROR',
        message: 'Failed to send email notification: SMTP server unreachable',
        endpoint: '/api/notifications/send',
        stackTrace: 'Error: SMTP connection failed\n  at EmailService.send (email.service.ts:56)\n  at NotificationController.sendAlert (notification.controller.ts:89)\n  at async Promise.all (index 0)',
        userId: 'U234',
        errorCode: 'SMTP_CONNECTION_FAILED'
      },
      {
        id: 'LOG005',
        timestamp: new Date('2025-11-30T10:30:12').toISOString(),
        level: 'WARN',
        message: 'API rate limit approaching for user: 95% of quota used',
        endpoint: '/api/diary/create',
        userId: 'U456',
        errorCode: 'RATE_LIMIT_WARNING'
      },
      {
        id: 'LOG006',
        timestamp: new Date('2025-11-30T09:18:55').toISOString(),
        level: 'ERROR',
        message: 'Validation error: Invalid emotion category provided in diary entry',
        endpoint: '/api/diary/create',
        stackTrace: 'ValidationError: Invalid emotion category\n  at DiaryValidator.validate (validator.ts:34)\n  at DiaryController.create (diary.controller.ts:56)',
        userId: 'U789',
        errorCode: 'VALIDATION_ERROR'
      },
      {
        id: 'LOG007',
        timestamp: new Date('2025-11-30T08:05:21').toISOString(),
        level: 'INFO',
        message: 'System health check completed successfully',
        endpoint: '/api/system/health'
      },
      {
        id: 'LOG008',
        timestamp: new Date('2025-11-29T23:45:10').toISOString(),
        level: 'WARN',
        message: 'Deprecated API endpoint accessed: /api/v1/users (use /api/v2/users instead)',
        endpoint: '/api/v1/users',
        userId: 'U123',
        errorCode: 'DEPRECATED_ENDPOINT'
      }
    ];
  };

  /**
   * 메시지 요약 (6.1)
   * - 최대 100자, 초과 시 "..." 표시
   */
  const truncateMessage = (message: string, maxLength: number = 100): string => {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength) + '...';
  };

  /**
   * 타임스탬프 포맷 (6.1, 6.3)
   * - YYYY-MM-DD HH:mm:ss
   */
  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  /**
   * 로그 레벨 배지 스타일 (6.1, 6.3)
   */
  const getLevelBadgeStyle = (level: 'ERROR' | 'WARN' | 'INFO'): string => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'WARN':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'INFO':
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  /**
   * 로그 레벨 아이콘 (6.1, 6.3)
   */
  const getLevelIcon = (level: 'ERROR' | 'WARN' | 'INFO') => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="w-4 h-4" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4" />;
      case 'INFO':
        return <Info className="w-4 h-4" />;
    }
  };

  /**
   * 상세보기 버튼 클릭 (6.3)
   */
  const handleViewDetails = (log: ErrorLog) => {
    setSelectedLog(log);
  };

  /**
   * 필터 적용 (6.2)
   */
  const applyFilters = () => {
    let filteredLogs = allLogs;

    // 레벨 필터 적용
    if (levelFilter !== 'ALL') {
      filteredLogs = filteredLogs.filter(log => log.level === levelFilter);
    }

    // 날짜 범위 필터 적용
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });
    }

    // 검색 쿼리 적용 (메시지, 엔드포인트, 로그 ID)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.endpoint.toLowerCase().includes(query) ||
        log.id.toLowerCase().includes(query) ||
        (log.errorCode && log.errorCode.toLowerCase().includes(query))
      );
    }

    setLogs(filteredLogs);
  };

  /**
   * 빠른 날짜 선택 (6.2)
   */
  const setQuickDate = (type: 'today' | 'thisWeek' | 'thisMonth') => {
    const today = new Date();
    const start = new Date();

    switch (type) {
      case 'today':
        // 오늘
        start.setHours(0, 0, 0, 0);
        today.setHours(23, 59, 59, 999);
        break;
      case 'thisWeek':
        // 이번 주 (일요일부터)
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        start.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        // 이번 달
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  /**
   * 필터 초기화 (6.2)
   */
  const resetFilters = () => {
    setLevelFilter('ALL');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  // ========================================
  // 로딩 상태 (6.1)
  // ========================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">에러 로그를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-slate-800 text-xl sm:text-2xl lg:text-3xl mb-2 flex items-center gap-2 sm:gap-3">
            <Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex-shrink-0" />
            <span className="break-words">에러 로그 조회</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base break-words">
            시스템에서 발생한 에러 로그를 확인하고 관리합니다
          </p>
        </div>
      </div>

      {/* 통계 카드 (6.1) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 전체 로그 수 */}
        <div className="bg-white rounded-xl shadow-md border-2 border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">전체 로그 수</p>
              <p className="text-slate-800 text-3xl">{stats.total}</p>
            </div>
            <FileText className="w-12 h-12 text-slate-400" />
          </div>
        </div>

        {/* ERROR 레벨 */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md border-2 border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm mb-1">ERROR 레벨</p>
              <p className="text-red-900 text-3xl">{stats.error}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* WARN 레벨 */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md border-2 border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 text-sm mb-1">WARN 레벨</p>
              <p className="text-yellow-900 text-3xl">{stats.warn}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        {/* INFO 레벨 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md border-2 border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm mb-1">INFO 레벨</p>
              <p className="text-blue-900 text-3xl">{stats.info}</p>
            </div>
            <Info className="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>

      {/* 필터 및 검색 영역 (6.2) */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="text-slate-800">필터 및 검색</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 심각도 필터 */}
          <div>
            <label className="block text-slate-700 text-sm mb-2">심각도 필터</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">전체</option>
              <option value="ERROR">ERROR만</option>
              <option value="WARN">WARN만</option>
              <option value="INFO">INFO만</option>
            </select>
          </div>

          {/* 시작일 */}
          <div>
            <label className="block text-slate-700 text-sm mb-2">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 종료일 */}
          <div>
            <label className="block text-slate-700 text-sm mb-2">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 검색창 */}
          <div>
            <label className="block text-slate-700 text-sm mb-2">검색</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="메시지, 엔드포인트, 로그 ID"
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    applyFilters();
                  }
                }}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* 빠른 선택 및 초기화 */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setQuickDate('today')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            오늘
          </button>
          <button
            onClick={() => setQuickDate('thisWeek')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            이번 주
          </button>
          <button
            onClick={() => setQuickDate('thisMonth')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            이번 달
          </button>
          <div className="flex-1"></div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            필터 초기화
          </button>
        </div>

        {/* 필터 결과 표시 */}
        <div className="mt-4 pt-4 border-t-2 border-slate-200">
          <p className="text-slate-600 text-sm">
            <span className="font-medium text-slate-800">{logs.length}개</span>의 로그가 표시되고 있습니다
            {logs.length < allLogs.length && (
              <span className="text-blue-600"> (전체 {allLogs.length}개 중)</span>
            )}
          </p>
        </div>
      </div>

      {/* 로그 목록 테이블 (6.1) */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b-2 border-slate-200">
          <h2 className="text-slate-800 text-xl flex items-center gap-2">
            <FileText className="w-6 h-6" />
            에러 로그 목록
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            최신순으로 정렬된 로그
          </p>
        </div>

        <div className="overflow-x-auto max-w-full">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">
                {searchQuery || levelFilter !== 'ALL' || startDate || endDate
                  ? '필터 조건에 맞는 에러 로그가 없습니다'
                  : '에러 로그가 없습니다'}
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    로그 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    타임스탬프
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    레벨
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    메시지
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    엔드포인트
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">
                      {log.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getLevelBadgeStyle(log.level)}`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 max-w-md">
                      {truncateMessage(log.message)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                      {log.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(log)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 상세보기 모달 (6.3) */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-1 sm:p-2 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-h-[98vh] sm:max-h-[95vh] my-1 sm:my-2 md:my-8 flex flex-col mx-1 sm:mx-2 md:mx-0 min-w-0 overflow-hidden" style={{ maxWidth: 'min(calc(100vw - 0.5rem), calc(100vw - 1rem), 95vw, 800px)', width: 'min(calc(100vw - 0.5rem), calc(100vw - 1rem), 95vw, 800px)' }}>
            {/* 모달 헤더 */}
            <div className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b-2 flex items-center justify-between rounded-t-xl flex-shrink-0 min-w-0 ${
              selectedLog.level === 'ERROR' ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border-red-700' :
              selectedLog.level === 'WARN' ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border-yellow-700' :
              'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-700'
            }`}>
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">{getLevelIcon(selectedLog.level)}</div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg md:text-xl break-words">에러 로그 상세 정보</h2>
                  <p className="text-xs sm:text-sm opacity-90 mt-1 break-all">{selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-y-auto flex-1 min-w-0">
              {/* 기본 정보 (6.3) */}
              <div>
                <h3 className="text-slate-800 font-medium mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  기본 정보
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-slate-600 font-medium min-w-[120px]">로그 ID:</span>
                    <span className="text-slate-800 font-mono">{selectedLog.id}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-slate-600 font-medium min-w-[120px]">타임스탬프:</span>
                    <span className="text-slate-800">{formatTimestamp(selectedLog.timestamp)}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-slate-600 font-medium min-w-[120px]">레벨:</span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getLevelBadgeStyle(selectedLog.level)}`}>
                      {getLevelIcon(selectedLog.level)}
                      {selectedLog.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* 에러 정보 (6.3) */}
              <div>
                <h3 className="text-slate-800 font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  에러 정보
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-slate-600 font-medium block mb-2">메시지:</span>
                    <p className="text-slate-800 whitespace-pre-wrap">{selectedLog.message}</p>
                  </div>
                  
                  {selectedLog.errorCode && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-600 font-medium min-w-[120px]">오류 코드:</span>
                      <code className="text-sm bg-slate-200 px-3 py-1 rounded font-mono text-slate-800">
                        {selectedLog.errorCode}
                      </code>
                    </div>
                  )}

                  {selectedLog.endpoint && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-600 font-medium min-w-[120px]">엔드포인트:</span>
                      <code className="text-sm bg-slate-200 px-3 py-1 rounded font-mono text-slate-800">
                        {selectedLog.endpoint}
                      </code>
                    </div>
                  )}

                  {selectedLog.userId && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-600 font-medium min-w-[120px]">사용자 ID:</span>
                      <span className="text-slate-800 font-mono flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {selectedLog.userId}
                      </span>
                    </div>
                  )}

                  {selectedLog.userAgent && (
                    <div>
                      <span className="text-slate-600 font-medium block mb-2">브라우저 정보:</span>
                      <code className="text-xs bg-slate-200 px-3 py-2 rounded block font-mono text-slate-700">
                        {selectedLog.userAgent}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Stack Trace (6.3) */}
              {selectedLog.stackTrace && (
                <div>
                  <h3 className="text-slate-800 font-medium mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Stack Trace
                  </h3>
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-red-400 text-sm font-mono whitespace-pre-wrap">
                      {selectedLog.stackTrace}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 bg-slate-50 border-t-2 border-slate-200 flex justify-end rounded-b-xl flex-shrink-0 min-w-0">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium text-sm sm:text-base min-w-0"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}