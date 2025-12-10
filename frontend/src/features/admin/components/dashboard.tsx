/**
 * ====================================================================================================
 * 대시보드 메인 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자 대시보드의 메인 화면으로, 시스템 전체의 핵심 지표를 시각화하여 표시
 * - 유스케이스: 명세서 2.1-2.5 서비스 통계 플로우
 * - 플로우: 서비스 통계 플로우
 * 
 * [명세서 참고]
 * - 2.1: 서비스 통계 화면 진입
 * - 2.2: 전체 통계 카드 조회 (6개)
 * - 2.3: 일지 작성 추이 차트 조회
 * - 2.4: 사용자 활동 통계 차트 조회
 * - 2.5: 위험 레벨 분포 통계 조회
 * 
 * @features
 * 1. 서비스 통계 화면 진입 (2.1):
 *    - 관리자 로그인 성공 후 자동 이동 또는 네비게이션에서 서비스 통계 기능 실행
 *    - 로딩 스피너 표시
 *    - 전체 통계 데이터 자동 로드
 * 
 * 2. 전체 통계 카드 조회 (2.2) - 6개:
 *    - 전체 사용자 수: 현재 등록된 총 사용자 수, 이전 기간 대비 증감, 기간 필터 (주간/월간/연간)
 *    - 활성 사용자 수: DAU/WAU/MAU, 기간 필터 (DAU/WAU/MAU 선택)
 *    - 신규 가입자 수: 오늘/이번 주/이번 달, 기간 필터 (일/주/월 선택)
 *    - 총 일지 작성 수: 전체 누적 일지 작성 개수, 이전 기간 대비 증감
 *    - 일평균 일지 작성 수: 선택한 기간의 일평균 일지 작성 개수, 기간 필터 (주간/월간/연간)
 *    - 위험 레벨별 사용자 수: High/Medium/Low/None 레벨별 사용자 수 (시각적으로 구분)
 * 
 * 3. 일지 작성 추이 차트 조회 (2.3):
 *    - 일지 작성 개수 추이 막대 그래프
 *    - X축: 날짜 (일별/주별/월별)
 *    - Y축: 작성된 일지 개수
 *    - 기간 필터: 주간/월간/연간 선택
 *    - 데이터 포인트 호버 시 해당 기간의 일지 개수 표시
 * 
 * 4. 사용자 활동 통계 차트 조회 (2.4):
 *    - 사용자 활동 추이 라인 차트
 *    - 여러 지표 동시 표시: 활성 사용자 수 추이 (DAU/WAU/MAU), 신규 가입자 수 추이, 사용자 유지율 추이
 *    - 지표 선택 기능 제공 (여러 지표 동시 선택 가능)
 *    - 기간 필터: 주간/월간/연간 선택
 *    - 데이터 포인트 호버 시 해당 기간의 상세 정보 표시
 * 
 * 5. 위험 레벨 분포 통계 조회 (2.5):
 *    - 위험 레벨별 사용자 수 분포 차트 (파이 차트 또는 막대 그래프)
 *    - 4가지 위험 레벨별 비율 표시: High/Medium/Low/None
 *    - 각 레벨별로 시각적으로 구분, 범례 표시 (위험 레벨, 사용자 수, 비율)
 *    - 기간 필터: 주간/월간/연간 선택
 *    - 차트 호버 시 해당 위험 레벨의 상세 정보 표시
 * 
 * @backend_requirements
 * - GET /api/admin/dashboard/stats?period={week|month|year}
 *   Response: {
 *     totalUsers: number,
 *     activeUsers: { dau: number, wau: number, mau: number },
 *     newUsers: { today: number, thisWeek: number, thisMonth: number },
 *     totalDiaries: number,
 *     avgDailyDiaries: number,
 *     riskLevelUsers: { high: number, medium: number, low: number, none: number },
 *     todayDiaries: number,
 *     weeklyDiaries: number,
 *     monthlyDiaries: number,
 *     weeklyData: Array<{day, diaries}>,
 *     userActivityData: Array<{date, dau, wau, mau, newUsers, retentionRate}>,
 *     riskDistributionData: Array<{level, count, percentage}>
 *   }
 * 
 * @data_sources
 * - Database: users 테이블 (전체 사용자 수, 활성 사용자 수, 신규 가입자 수)
 * - Database: diaries 테이블 (일지 작성 통계)
 * - Database: risk_detection 테이블 (위험 레벨별 사용자 수)
 * 
 * ====================================================================================================
 */

import { useState } from 'react';
import { MetricCard } from './metric-card';
import { WeeklyDiaryChart } from './weekly-diary-chart';
import { Users, BookOpen, TrendingUp, Calendar, UserPlus, Activity, AlertTriangle } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardData } from '../hooks/useDashboardData';

export function Dashboard() {
  // ========================================
  // State 관리 (2.1-2.5)
  // ========================================
  // [명세서 2.2] 각 카드의 기간 필터는 독립적으로 동작
  // 카드별 독립 필터
  const [totalUsersPeriod, setTotalUsersPeriod] = useState<'week' | 'month' | 'year'>('month'); // 카드1: 전체 사용자 수
  const [avgDiariesPeriod, setAvgDiariesPeriod] = useState<'week' | 'month' | 'year'>('month'); // 카드5: 일평균 일지 작성 수
  const [totalDiariesPeriod, setTotalDiariesPeriod] = useState<'week' | 'month' | 'year'>('month'); // 카드4: 총 일지 작성 수 (신규)
  const [riskLevelPeriod, setRiskLevelPeriod] = useState<'week' | 'month' | 'year'>('month'); // 카드6: 위험 레벨별 사용자 수 (신규)
  const [activeUserFilter, setActiveUserFilter] = useState<'dau' | 'wau' | 'mau'>('dau'); // 카드2: 활성 사용자 수
  const [newUserFilter, setNewUserFilter] = useState<'today' | 'thisWeek' | 'thisMonth'>('today'); // 카드3: 신규 가입자 수

  // 차트별 독립 필터
  const [diaryTrendPeriod, setDiaryTrendPeriod] = useState<'week' | 'month' | 'year'>('month'); // 일지 작성 추이 차트
  const [userActivityPeriod, setUserActivityPeriod] = useState<'week' | 'month' | 'year'>('month'); // 사용자 활동 통계 차트
  const [riskDistributionPeriod, setRiskDistributionPeriod] = useState<'week' | 'month' | 'year'>('month'); // 위험 레벨 분포 차트

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['dau', 'newUsers']);
  const [riskChartType, setRiskChartType] = useState<'pie' | 'bar'>('pie');

  // Custom hook으로 데이터 로딩 로직 분리
  // [API 명세서 Section 10.2.1]
  // 각 영역별 독립적인 period 전달
  const activeUserTypeParam = activeUserFilter === 'dau' ? 'dau' : activeUserFilter === 'wau' ? 'wau' : 'mau';
  const newUserPeriodParam = newUserFilter === 'today' ? 'daily' : newUserFilter === 'thisWeek' ? 'weekly' : 'monthly';
  const { stats, isLoading, isRefreshing: _isRefreshing, error } = useDashboardData(
    totalUsersPeriod,
    avgDiariesPeriod,
    totalDiariesPeriod,
    riskLevelPeriod,
    diaryTrendPeriod,
    userActivityPeriod,
    riskDistributionPeriod,
    selectedMetrics,
    activeUserTypeParam,
    newUserPeriodParam
  );

  // ========================================
  // 로딩 상태 UI (초기 로딩 시에만 표시)
  // ========================================
  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-600">대시보드 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // 데이터 로드 실패 UI
  // ========================================
  if (error && !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">데이터를 불러올 수 없습니다.</p>
        <p className="text-sm text-slate-600">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // ========================================
  // 통계 카드 데이터 (2.2 - 6개)
  // ========================================
  const metrics = [
    {
      title: '전체 사용자 수',
      value: (stats.totalUsers ?? 0).toLocaleString(),
      change: stats.totalUsersChange ? (stats.totalUsersChange > 0 ? `+${stats.totalUsersChange}` : `${stats.totalUsersChange}`) : '0',
      trend: (stats.totalUsersChange ?? 0) >= 0 ? 'up' as const : 'down' as const,
      icon: Users,
      color: 'blue' as const,
      description: '등록된 전체 사용자',
      filter: (
        <div className="flex gap-1 mt-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={(e) => { e.stopPropagation(); setTotalUsersPeriod(p); }}
              className={`px-2 py-1 text-xs rounded ${totalUsersPeriod === p ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
            >
              {p === 'week' ? '주' : p === 'month' ? '월' : '년'}
            </button>
          ))}
        </div>
      )
    },
    {
      title: '활성 사용자 수',
      value: activeUserFilter === 'dau'
        ? (stats.activeUsers?.dau ?? 0).toLocaleString()
        : activeUserFilter === 'wau'
          ? (stats.activeUsers?.wau ?? 0).toLocaleString()
          : (stats.activeUsers?.mau ?? 0).toLocaleString(),
      change: '-', // 활성 사용자 수는 change 필드가 API 응답에 없음
      trend: 'up' as const,
      icon: Activity,
      color: 'emerald' as const,
      description: activeUserFilter === 'dau' ? '일일 활성 사용자 (DAU)' : activeUserFilter === 'wau' ? '주간 활성 사용자 (WAU)' : '월간 활성 사용자 (MAU)',
      filter: (
        <div className="flex gap-1 mt-2">
          {(['dau', 'wau', 'mau'] as const).map((filter) => (
            <button
              key={filter}
              onClick={(e) => { e.stopPropagation(); setActiveUserFilter(filter); }}
              className="px-2 py-1 text-xs rounded"
              style={{
                backgroundColor: activeUserFilter === filter ? '#065f46' : '#d1fae5',
                color: activeUserFilter === filter ? 'white' : '#047857'
              }}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>
      )
    },
    {
      title: '신규 가입자 수',
      value: newUserFilter === 'today'
        ? (stats.newUsers?.today ?? 0).toLocaleString()
        : newUserFilter === 'thisWeek'
          ? (stats.newUsers?.thisWeek ?? 0).toLocaleString()
          : (stats.newUsers?.thisMonth ?? 0).toLocaleString(),
      change: '-', // 신규 가입자 수는 change 필드가 API 응답에 없음
      trend: 'up' as const,
      icon: UserPlus,
      color: 'indigo' as const,
      description: newUserFilter === 'today' ? '오늘 신규 가입자' : newUserFilter === 'thisWeek' ? '이번 주 신규 가입자' : '이번 달 신규 가입자',
      filter: (
        <div className="flex gap-1 mt-2">
          {(['today', 'thisWeek', 'thisMonth'] as const).map((filter) => (
            <button
              key={filter}
              onClick={(e) => { e.stopPropagation(); setNewUserFilter(filter); }}
              className="px-2 py-1 text-xs rounded"
              style={{
                backgroundColor: newUserFilter === filter ? '#3730a3' : '#e0e7ff',
                color: newUserFilter === filter ? 'white' : '#4338ca'
              }}
            >
              {filter === 'today' ? '일' : filter === 'thisWeek' ? '주' : '월'}
            </button>
          ))}
        </div>
      )
    },
    {
      title: '총 일지 작성 수',
      value: (stats.totalDiaries ?? 0).toLocaleString(),
      change: stats.totalDiariesChange ? (stats.totalDiariesChange > 0 ? `+${stats.totalDiariesChange}` : `${stats.totalDiariesChange}`) : '0',
      trend: (stats.totalDiariesChange ?? 0) >= 0 ? 'up' as const : 'down' as const,
      icon: BookOpen,
      color: 'orange' as const,
      description: '선택한 기간의 일지 작성 개수',
      filter: (
        <div className="flex gap-1 mt-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={(e) => { e.stopPropagation(); setTotalDiariesPeriod(p); }}
              className={`px-2 py-1 text-xs rounded ${totalDiariesPeriod === p ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700'}`}
            >
              {p === 'week' ? '주' : p === 'month' ? '월' : '년'}
            </button>
          ))}
        </div>
      )
    },
    {
      title: '일평균 일지 작성 수',
      value: (stats.avgDailyDiaries ?? 0).toLocaleString(),
      change: '-', // 일평균 일지 작성 수는 change 필드가 API 응답에 없음
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'cyan' as const,
      description: '선택한 기간의 일평균 일지 작성 개수',
      filter: (
        <div className="flex gap-1 mt-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={(e) => { e.stopPropagation(); setAvgDiariesPeriod(p); }}
              className={`px-2 py-1 text-xs rounded ${avgDiariesPeriod === p ? 'bg-cyan-600 text-white' : 'bg-cyan-100 text-cyan-700'}`}
            >
              {p === 'week' ? '주' : p === 'month' ? '월' : '년'}
            </button>
          ))}
        </div>
      )
    },
    {
      title: '위험 레벨별 사용자 수',
      value: `${(stats.riskLevelUsers?.high ?? 0) + (stats.riskLevelUsers?.medium ?? 0) + (stats.riskLevelUsers?.low ?? 0)}명`,
      change: '-', // 위험 레벨별 사용자 수는 change 필드가 API 응답에 없음
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'red' as const,
      description: `High: ${stats.riskLevelUsers?.high ?? 0}명, Medium: ${stats.riskLevelUsers?.medium ?? 0}명, Low: ${stats.riskLevelUsers?.low ?? 0}명, None: ${stats.riskLevelUsers?.none ?? 0}명`,
      filter: (
        <div className="flex gap-1 mt-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={(e) => { e.stopPropagation(); setRiskLevelPeriod(p); }}
              className={`px-2 py-1 text-xs rounded ${riskLevelPeriod === p ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}
            >
              {p === 'week' ? '주' : p === 'month' ? '월' : '년'}
            </button>
          ))}
        </div>
      )
    },
    // 기존 카드들 (제거됨 - API 명세서에 해당 필드 없음)
    // todayDiaries, weeklyDiaries, monthlyDiaries는 API 응답에 포함되지 않으므로 제거
  ];

  return (
    <>
      {/* ========================================
          헤더 영역
          ======================================== */}
      <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-slate-300">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight break-words">대시보드 (핵심 지표)</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base break-words">전체 사용자, 일지 작성 현황을 한눈에 확인하세요</p>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</p>
          <p className="text-slate-400 text-xs mt-1">각 카드와 차트의 기간 필터를 개별적으로 설정할 수 있습니다.</p>
        </div>
      </div>

      {/* ========================================
          통계 카드 그리드 (2.2 - 6개 + 기존 3개)
          ======================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* ========================================
          일지 작성 추이 차트 (2.3)
          ======================================== */}
      <div className="mb-10">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 p-6 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-slate-700 mr-2" />
              <h2 className="text-slate-800">일지 작성 추이 ({diaryTrendPeriod === 'week' ? '주간' : diaryTrendPeriod === 'month' ? '월간' : '연간'})</h2>
            </div>
            {/* 일지 작성 추이 기간 필터 */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setDiaryTrendPeriod(p)}
                  className={`px-3 py-1 rounded text-xs transition-all ${diaryTrendPeriod === p ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {p === 'week' ? '주간' : p === 'month' ? '월간' : '연간'}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-[600px]">
            <WeeklyDiaryChart data={stats.weeklyData} />
          </div>
        </div>
      </div>

      {/* ========================================
          사용자 활동 통계 차트 (2.4)
          ======================================== */}
      <div className="mb-10">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 p-6 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-slate-700 mr-2" />
              <h2 className="text-slate-800">사용자 활동 통계 ({userActivityPeriod === 'week' ? '주간' : userActivityPeriod === 'month' ? '월간' : '연간'})</h2>
            </div>
            <div className="flex items-center gap-4">
              {/* 기간 필터 */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-1">
                {(['week', 'month', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setUserActivityPeriod(p)}
                    className={`px-3 py-1 rounded text-xs transition-all ${userActivityPeriod === p ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {p === 'week' ? '주간' : p === 'month' ? '월간' : '연간'}
                  </button>
                ))}
              </div>
              {/* 지표 선택 (2.4) */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'dau', label: 'DAU' },
                  { key: 'wau', label: 'WAU' },
                  { key: 'mau', label: 'MAU' },
                  { key: 'newUsers', label: '신규 가입자' },
                  { key: 'retentionRate', label: '유지율' }
                ].map((metric) => (
                  <label key={metric.key} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMetrics([...selectedMetrics, metric.key]);
                        } else {
                          setSelectedMetrics(selectedMetrics.filter(m => m !== metric.key));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{metric.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="min-w-[600px]">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '13px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend />
                {selectedMetrics.includes('dau') && (
                  <Line type="monotone" dataKey="dau" stroke="#3b82f6" strokeWidth={2} name="DAU" />
                )}
                {selectedMetrics.includes('wau') && (
                  <Line type="monotone" dataKey="wau" stroke="#8b5cf6" strokeWidth={2} name="WAU" />
                )}
                {selectedMetrics.includes('mau') && (
                  <Line type="monotone" dataKey="mau" stroke="#10b981" strokeWidth={2} name="MAU" />
                )}
                {selectedMetrics.includes('newUsers') && (
                  <Line type="monotone" dataKey="newUsers" stroke="#f59e0b" strokeWidth={2} name="신규 가입자" />
                )}
                {selectedMetrics.includes('retentionRate') && (
                  <Line type="monotone" dataKey="retentionRate" stroke="#ef4444" strokeWidth={2} name="유지율 (%)" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================
          위험 레벨 분포 통계 (2.5)
          ======================================== */}
      <div className="mb-10">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-slate-700 mr-2" />
              <h2 className="text-slate-800">위험 레벨 분포 통계 ({riskDistributionPeriod === 'week' ? '주간' : riskDistributionPeriod === 'month' ? '월간' : '연간'})</h2>
            </div>
            <div className="flex items-center gap-4">
              {/* 기간 필터 */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-1">
                {(['week', 'month', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setRiskDistributionPeriod(p)}
                    className={`px-3 py-1 rounded text-xs transition-all ${riskDistributionPeriod === p ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {p === 'week' ? '주간' : p === 'month' ? '월간' : '연간'}
                  </button>
                ))}
              </div>
              {/* 차트 타입 선택 버튼 (2.5) */}
              <div className="flex items-center gap-1 sm:gap-2 bg-white border-2 border-slate-300 rounded-lg p-1 flex-shrink-0">
                <button
                  onClick={() => setRiskChartType('pie')}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all text-xs sm:text-sm ${riskChartType === 'pie'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  파이 차트
                </button>
                <button
                  onClick={() => setRiskChartType('bar')}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all text-xs sm:text-sm ${riskChartType === 'bar'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  막대 그래프
                </button>
              </div>
            </div>
          </div>

          {/* 파이 차트 또는 막대 그래프 (선택에 따라 표시) */}
          <div className="flex justify-center">
            {riskChartType === 'pie' ? (
              <div className="w-full max-w-[600px]">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={stats.riskDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.riskDistributionData.map((entry: any, index: number) => {
                        const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
                        return <Cell key={`cell-${index}`} fill={colors[index]} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value}명 (${props.payload.percentage.toFixed(2)}%)`,
                        '사용자 수'
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          return `${payload[0].payload.level} 레벨`;
                        }
                        return label;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => {
                        // entry.payload에서 실제 데이터 가져오기
                        const payload = entry.payload;
                        if (payload && payload.level) {
                          return `${payload.level}: ${payload.count}명 (${payload.percentage.toFixed(2)}%)`;
                        }
                        // fallback: stats에서 찾기
                        const data = stats.riskDistributionData.find((d: any) => d.level === value);
                        if (data) {
                          return `${data.level}: ${data.count}명 (${data.percentage.toFixed(2)}%)`;
                        }
                        return value;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full max-w-[800px]">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.riskDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="level" stroke="#64748b" style={{ fontSize: '13px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value}명 (${props.payload.percentage.toFixed(2)}%)`,
                        '사용자 수'
                      ]}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                      {stats.riskDistributionData.map((entry: any, index: number) => {
                        const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
                        return <Cell key={`cell-${index}`} fill={colors[index]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 범례 (2.5) */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.riskDistributionData.map((entry: any, index: number) => {
              const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
              const labels = ['High', 'Medium', 'Low', 'None'];
              return (
                <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: colors[index] }}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{labels[index]} 레벨</p>
                    <p className="text-xs text-slate-600">{entry.count}명 ({entry.percentage.toFixed(2)}%)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
