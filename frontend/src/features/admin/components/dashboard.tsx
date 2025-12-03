/**
 * ====================================================================================================
 * 대시보드 메인 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자 대시보드의 메인 화면으로, 시스템 전체의 핵심 지표를 시각화하여 표시
 * - 대시보드 화면 진입
 * - 통계 카드 조회
 * - 일지 작성 추이 차트 조회
 * 
 * @features
 * 1. 대시보드 화면 진입:
 *    - 로그인 성공 후 자동 이동 또는 네비게이션 "대시보드" 탭 클릭
 *    - 로딩 스피너 표시
 *    - 전체 통계 데이터 자동 로드
 * 
 * 2. 통계 카드 4개:
 *    - 전체 사용자 수: 현재 등록된 총 사용자 수
 *    - 오늘 작성된 일지 수: 오늘 날짜 기준
 *    - 이번 주 작성된 일지 수: 이번 주(월~일) 작성
 *    - 이번 달 작성된 일지 수: 이번 달 작성
 *    - 이전 기간 대비 증감 표시 (화살표 아이콘 + 수치)
 *    - 기간 필터: 주간/월간/연간 선택 가능
 * 
 * 3. 일지 작성 추이 차트:
 *    - 기간별 일지 작성 추이 Bar Chart
 * 
 * @backend_requirements
 * - GET /api/admin/dashboard/stats?period={week|month|year}
 *   Response: {
 *     totalUsers: number,
 *     todayDiaries: number,
 *     weeklyDiaries: number,
 *     monthlyDiaries: number,
 *     weeklyData: Array<{day, diaries}>
 *   }
 * 
 * @data_sources
 * - Database: users 테이블 (전체 사용자 수)
 * - Database: diary_entries 테이블 (일지 작성 통계)
 * 
 * ====================================================================================================
 */

import { useState, useEffect } from 'react';
import { MetricCard } from './metric-card';
import { WeeklyDiaryChart } from './weekly-diary-chart';
import { Users, BookOpen, TrendingUp, Calendar } from 'lucide-react';

// ========================================
// Mock API 함수 (실제로는 백엔드 API 호출)
// ========================================
/**
 * [백엔드 작업] 대시보드 통계 데이터 조회 API
 * 
 * @param period - 조회 기간 (week: 최근 7일, month: 최근 30일, year: 최근 12개월)
 * @returns 대시보드 통계 데이터
 */
const fetchDashboardStats = async (period: 'week' | 'month' | 'year' = 'month') => {
  // 네트워크 딜레이 시뮬레이션 (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // ========================================
  // 기간별 통계 Mock 데이터
  // ========================================
  const statsData = {
    week: {
      totalUsers: 12345,
      todayDiaries: 234,
      weeklyDiaries: 1842,
      monthlyDiaries: 7523,
      // 월~일 일별 데이터
      weeklyData: [
        { day: '월', diaries: 245 },
        { day: '화', diaries: 268 },
        { day: '수', diaries: 289 },
        { day: '목', diaries: 256 },
        { day: '금', diaries: 312 },
        { day: '토', diaries: 278 },
        { day: '일', diaries: 194 }
      ]
    },
    month: {
      totalUsers: 12345,
      todayDiaries: 234,
      weeklyDiaries: 1842,
      monthlyDiaries: 7523,
      // 1~4주차 주별 데이터
      weeklyData: [
        { day: '1주차', diaries: 1845 },
        { day: '2주차', diaries: 1923 },
        { day: '3주차', diaries: 1912 },
        { day: '4주차', diaries: 1843 }
      ]
    },
    year: {
      totalUsers: 12345,
      todayDiaries: 234,
      weeklyDiaries: 1842,
      monthlyDiaries: 7523,
      // 1~12월 월별 데이터
      weeklyData: [
        { day: '1월', diaries: 6234 },
        { day: '2월', diaries: 6412 },
        { day: '3월', diaries: 6589 },
        { day: '4월', diaries: 6723 },
        { day: '5월', diaries: 6856 },
        { day: '6월', diaries: 6945 },
        { day: '7월', diaries: 7123 },
        { day: '8월', diaries: 7234 },
        { day: '9월', diaries: 7156 },
        { day: '10월', diaries: 7289 },
        { day: '11월', diaries: 7387 },
        { day: '12월', diaries: 7328 }
      ]
    }
  };
  
  return statsData[period];
};

export function Dashboard() {
  // ========================================
  // State 관리
  // ========================================
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // ========================================
  // 대시보드 데이터 로드
  // ========================================
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDashboardStats(period);
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [period]);

  // ========================================
  // 로딩 상태 UI
  // ========================================
  if (isLoading) {
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
  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // ========================================
  // 통계 카드 데이터
  // ========================================
  const metrics = [
    {
      title: '전체 사용자 수',
      value: stats.totalUsers.toLocaleString(),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
      color: 'blue' as const,
      description: '등록된 전체 사용자'
    },
    {
      title: '금일 작성된 일지',
      value: stats.todayDiaries.toLocaleString(),
      change: '+8.2%',
      trend: 'up' as const,
      icon: BookOpen,
      color: 'green' as const,
      description: '오늘 작성된 일지 수'
    },
    {
      title: '주간 일지 수',
      value: stats.weeklyDiaries.toLocaleString(),
      change: '+5.7%',
      trend: 'up' as const,
      icon: Calendar,
      color: 'purple' as const,
      description: '최근 7일간 작성'
    },
    {
      title: '월간 일지 수',
      value: stats.monthlyDiaries.toLocaleString(),
      change: '+15.3%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'orange' as const,
      description: '이번 달 전체'
    }
  ];

  return (
    <>
      {/* ========================================
          헤더 영역
          ======================================== */}
      <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-slate-300">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight break-words">대시보드 (핵심 지표)</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base break-words">전체 사용자, 일지 작성 현황을 한눈에 확인하세요</p>
            <p className="text-slate-500 text-xs sm:text-sm mt-2">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</p>
          </div>
          
          {/* ========================================
              기간 필터 (주간/월간/연간) - 오른쪽 고정
              ======================================== */}
          <div className="flex items-center gap-1 sm:gap-2 bg-white border-2 border-slate-300 rounded-lg p-1 flex-shrink-0">
            <button
              onClick={() => setPeriod('week')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all text-xs sm:text-sm ${
                period === 'week' 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              주간
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all text-xs sm:text-sm ${
                period === 'month' 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all text-xs sm:text-sm ${
                period === 'year' 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              연간
            </button>
          </div>
        </div>
      </div>

      {/* ========================================
          통계 카드 그리드
          ======================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* ========================================
          차트 섹션
          ======================================== */}
      <div className="mb-10">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 p-6 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-slate-700 mr-2" />
              <h2 className="text-slate-800">일지 작성 추이 ({period === 'week' ? '주간' : period === 'month' ? '월간' : '연간'})</h2>
            </div>
          </div>
          <div className="min-w-[600px]">
            <WeeklyDiaryChart data={stats.weeklyData} />
          </div>
        </div>
      </div>
    </>
  );
}
