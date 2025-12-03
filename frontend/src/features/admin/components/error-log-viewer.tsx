import { useState, useEffect } from 'react';
import { AlertTriangle, Filter, Search, RefreshCw, Eye, X, Calendar, Clock, Code } from 'lucide-react';

type Severity = 'ERROR' | 'WARN' | 'INFO';

interface ErrorLog {
  id: string;
  timestamp: string;
  level: Severity;
  message: string;
  stackTrace?: string;
  endpoint?: string;
  userId?: string;
  errorCode?: string;
}

export function ErrorLogViewer() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  
  // Filters
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadErrorLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, severityFilter, dateFilter, searchQuery]);

  const loadErrorLogs = async () => {
    setIsLoading(true);
    
    // Mock API call: GET /admin/logs/errors (Level: ERROR)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const stored = localStorage.getItem('error_logs');
    if (stored) {
      setLogs(JSON.parse(stored));
    } else {
      // Generate mock error logs from Database(MariaDB) Log Table
      const mockLogs: ErrorLog[] = [
        {
          id: 'ERR001',
          timestamp: '2025-11-24 14:35:22',
          level: 'ERROR',
          message: 'Database connection timeout',
          stackTrace: 'at DatabaseConnection.connect (db.ts:45)\nat UserService.getUser (user.service.ts:23)\nat UserController.getProfile (user.controller.ts:18)',
          endpoint: '/api/users/profile',
          userId: 'USR123',
          errorCode: 'DB_TIMEOUT'
        },
        {
          id: 'ERR002',
          timestamp: '2025-11-24 13:20:15',
          level: 'ERROR',
          message: 'Failed to send notification email',
          stackTrace: 'at EmailService.sendEmail (email.service.ts:67)\nat NotificationService.send (notification.service.ts:34)',
          endpoint: '/api/notifications/send',
          errorCode: 'EMAIL_SEND_FAILED'
        },
        {
          id: 'ERR003',
          timestamp: '2025-11-24 12:45:08',
          level: 'WARN',
          message: 'High memory usage detected (85%)',
          endpoint: '/system/health',
          errorCode: 'HIGH_MEMORY'
        },
        {
          id: 'ERR004',
          timestamp: '2025-11-24 11:30:42',
          level: 'ERROR',
          message: 'JWT token verification failed',
          stackTrace: 'at JwtService.verify (jwt.service.ts:12)\nat AuthMiddleware.authenticate (auth.middleware.ts:25)',
          endpoint: '/api/auth/verify',
          userId: 'USR456',
          errorCode: 'JWT_INVALID'
        },
        {
          id: 'ERR005',
          timestamp: '2025-11-24 10:15:33',
          level: 'ERROR',
          message: 'API rate limit exceeded',
          endpoint: '/api/entries/create',
          userId: 'USR789',
          errorCode: 'RATE_LIMIT'
        },
        {
          id: 'ERR006',
          timestamp: '2025-11-24 09:22:17',
          level: 'WARN',
          message: 'Slow query detected (execution time: 3.2s)',
          endpoint: '/api/analytics/dashboard',
          errorCode: 'SLOW_QUERY'
        },
        {
          id: 'ERR007',
          timestamp: '2025-11-24 08:45:09',
          level: 'INFO',
          message: 'Scheduled backup completed successfully',
          errorCode: 'BACKUP_SUCCESS'
        },
        {
          id: 'ERR008',
          timestamp: '2025-11-23 23:55:44',
          level: 'ERROR',
          message: 'File upload failed - maximum size exceeded',
          endpoint: '/api/files/upload',
          userId: 'USR321',
          errorCode: 'FILE_TOO_LARGE'
        },
        {
          id: 'ERR009',
          timestamp: '2025-11-23 22:30:21',
          level: 'ERROR',
          message: 'External API service unavailable',
          stackTrace: 'at ExternalService.call (external.service.ts:89)\nat EmotionAnalyzer.analyze (emotion.service.ts:45)',
          endpoint: '/api/emotions/analyze',
          errorCode: 'EXTERNAL_SERVICE_DOWN'
        },
        {
          id: 'ERR010',
          timestamp: '2025-11-23 20:15:36',
          level: 'WARN',
          message: 'Cache miss rate exceeding threshold (45%)',
          errorCode: 'HIGH_CACHE_MISS'
        }
      ];
      
      setLogs(mockLogs);
      localStorage.setItem('error_logs', JSON.stringify(mockLogs));
    }
    
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Severity filter
    if (severityFilter !== 'ALL') {
      filtered = filtered.filter(log => log.level === severityFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(log => log.timestamp.startsWith(dateFilter));
    }

    // Search query (message, endpoint, errorCode)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.endpoint?.toLowerCase().includes(query) ||
        log.errorCode?.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);
  };

  const handleRefresh = () => {
    loadErrorLogs();
  };

  const getSeverityColor = (level: Severity) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'WARN':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'INFO':
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getSeverityIcon = (level: Severity) => {
    switch (level) {
      case 'ERROR':
        return '🔴';
      case 'WARN':
        return '🟡';
      case 'INFO':
        return '🔵';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">오류 로그를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800 text-3xl mb-2 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            오류 리포트 확인
          </h1>
          <p className="text-slate-600">
            시스템 로그 테이블에서 조회된 오류 및 경고 메시지를 확인합니다
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          새로고침
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md border-2 border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">전체 로그</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{logs.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Code className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border-2 border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm">오류 (ERROR)</p>
              <p className="text-2xl font-bold text-red-700 mt-1">
                {logs.filter(l => l.level === 'ERROR').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
              🔴
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border-2 border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm">경고 (WARN)</p>
              <p className="text-2xl font-bold text-yellow-700 mt-1">
                {logs.filter(l => l.level === 'WARN').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
              🟡
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm">정보 (INFO)</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {logs.filter(l => l.level === 'INFO').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              🔵
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="text-slate-800 font-medium text-lg">필터 옵션</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Severity Filter */}
          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              심각도 (Severity)
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">전체</option>
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              발생 날짜
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="메시지, 엔드포인트, 코드 검색"
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {(severityFilter !== 'ALL' || dateFilter || searchQuery) && (
          <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              {filteredLogs.length}개의 로그가 필터링되었습니다
            </p>
            <button
              onClick={() => {
                setSeverityFilter('ALL');
                setDateFilter('');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* Log List */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
        <div className="bg-slate-100 px-6 py-4 border-b-2 border-slate-300">
          <h2 className="text-slate-800 font-medium text-lg">오류 로그 목록</h2>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">표시할 로그가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-slate-700 font-medium w-24">심각도</th>
                  <th className="px-6 py-3 text-left text-slate-700 font-medium w-40">발생 시간</th>
                  <th className="px-6 py-3 text-left text-slate-700 font-medium">메시지</th>
                  <th className="px-6 py-3 text-left text-slate-700 font-medium w-48">엔드포인트</th>
                  <th className="px-6 py-3 text-center text-slate-700 font-medium w-24">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.level)}`}>
                        <span>{getSeverityIcon(log.level)}</span>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Clock className="w-4 h-4" />
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 text-sm line-clamp-2">{log.message}</p>
                      {log.errorCode && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded">
                          {log.errorCode}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {log.endpoint || '-'}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">상세</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}

// Log Detail Modal
interface LogDetailModalProps {
  log: ErrorLog;
  onClose: () => void;
}

function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  const getSeverityColor = (level: Severity) => {
    switch (level) {
      case 'ERROR':
        return 'from-red-600 to-red-500';
      case 'WARN':
        return 'from-yellow-600 to-yellow-500';
      case 'INFO':
        return 'from-blue-600 to-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getSeverityColor(log.level)} text-white px-6 py-4 flex items-center justify-between rounded-t-xl`}>
          <div>
            <h2 className="text-xl font-medium mb-1">오류 로그 상세정보</h2>
            <p className="text-white/80 text-sm">ID: {log.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm mb-1">심각도</p>
              <p className="text-slate-800 font-medium text-lg">{log.level}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm mb-1">발생 시간</p>
              <p className="text-slate-800 font-medium">{log.timestamp}</p>
            </div>
          </div>

          {/* Message */}
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <p className="text-red-900 font-medium mb-2">오류 메시지</p>
            <p className="text-red-800">{log.message}</p>
          </div>

          {/* Additional Info */}
          {log.errorCode && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm mb-1">오류 코드</p>
              <code className="text-slate-800 font-mono">{log.errorCode}</code>
            </div>
          )}

          {log.endpoint && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm mb-1">엔드포인트</p>
              <code className="text-slate-800 font-mono">{log.endpoint}</code>
            </div>
          )}

          {log.userId && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm mb-1">사용자 ID</p>
              <code className="text-slate-800 font-mono">{log.userId}</code>
            </div>
          )}

          {/* Stack Trace */}
          {log.stackTrace && (
            <div className="p-4 bg-slate-900 rounded-lg">
              <p className="text-slate-300 text-sm mb-3 font-medium">Stack Trace</p>
              <pre className="text-red-400 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                {log.stackTrace}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-xl border-t-2 border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
