import { useState, useEffect, useCallback } from 'react';
import { 
  getDashboardStats, 
  getDiaryTrend, 
  getUserActivityStats, 
  getRiskLevelDistribution
} from '../../../services/adminApi';

interface DashboardStats {
  totalUsers: number;
  totalUsersChange?: number; // API 응답의 totalUsers.change
  activeUsers: {
    dau: number;
    wau: number;
    mau: number;
  };
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  totalDiaries: number;
  totalDiariesChange?: number; // API 응답의 totalDiaries.change
  avgDailyDiaries: number;
  riskLevelUsers: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  weeklyData: Array<{ day: string; diaries: number }>;
  userActivityData: Array<{
    date: string;
    dau: number;
    wau: number;
    mau: number;
    newUsers: number;
    retentionRate: number;
  }>;
  riskDistributionData: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
}

export function useDashboardData(
  period: 'week' | 'month' | 'year',
  selectedMetrics: string[],
  activeUserType?: 'dau' | 'wau' | 'mau',
  newUserPeriod?: 'daily' | 'weekly' | 'monthly'
) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (
    period: 'week' | 'month' | 'year',
    selectedMetrics: string[],
    activeUserType?: 'dau' | 'wau' | 'mau',
    newUserPeriod?: 'daily' | 'weekly' | 'monthly'
  ) => {
    try {
      const periodParam = period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'yearly';
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // [API 명세서 Section 10.2.1]
      // GET /api/admin/dashboard/stats
      // - period: 기간 (weekly, monthly, yearly) - 전체 사용자 수, 일평균 일지 작성 수에 적용
      // - activeUserType: 활성 사용자 타입 (dau, wau, mau) - 활성 사용자 수에 적용
      // - newUserPeriod: 신규 가입자 기간 (daily, weekly, monthly) - 신규 가입자 수에 적용
      const [statsRes, trendRes, activityRes, riskRes] = await Promise.all([
        getDashboardStats({ 
          period: periodParam,
          activeUserType: activeUserType || 'dau', // 대시보드에서 필터로 변경 가능
          newUserPeriod: newUserPeriod || 'daily' // 대시보드에서 필터로 변경 가능
        }),
        getDiaryTrend({ period: periodParam, year: currentYear, month: currentMonth }),
        getUserActivityStats({ period: periodParam, year: currentYear, month: currentMonth, metrics: selectedMetrics.join(',') }),
        getRiskLevelDistribution({ period: periodParam, year: currentYear, month: currentMonth })
      ]);

      if (!statsRes?.data || !trendRes?.data || !activityRes?.data || !riskRes?.data) {
        throw new Error('API 응답 데이터가 올바르지 않습니다.');
      }

      const stats = statsRes.data;
      const trend = Array.isArray(trendRes.data.trend) ? trendRes.data.trend : [];
      const activity = Array.isArray(activityRes.data.trend) ? activityRes.data.trend : [];
      
      // 위험 레벨 분포 데이터 파싱
      // 백엔드 응답 구조: { success: true, data: { period, year, month, distribution: {...}, total } }
      // riskRes.data는 { success: true, data: RiskLevelDistributionResponse } 구조
      const riskData = riskRes.data?.data || riskRes.data;
      const risk = riskData?.distribution || {};
      
      // 디버깅: 위험 레벨 분포 데이터 확인
      console.log('위험 레벨 분포 API 전체 응답:', riskRes.data);
      console.log('위험 레벨 분포 data:', riskData);
      console.log('위험 레벨 분포 distribution:', risk);
      console.log('위험 레벨 분포 total:', riskData?.total);
      console.log('위험 레벨 분포 high:', risk?.high);
      console.log('위험 레벨 분포 medium:', risk?.medium);
      console.log('위험 레벨 분포 low:', risk?.low);
      console.log('위험 레벨 분포 none:', risk?.none);

      // API 응답의 date 필드를 day로 변환
      // weekly, monthly: date는 "YYYY-MM-DD" 형식 (일별)
      // yearly: date는 "YYYY-MM" 형식 (월별)
      const weeklyData = trend.map((item: any) => {
        const dateStr = item?.date || '';
        let day = dateStr;
        
        if (period === 'week' || period === 'month') {
          // "YYYY-MM-DD" 형식에서 일자만 추출
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(dateStr);
            const dayOfWeek = date.getDay();
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            day = `${date.getMonth() + 1}/${date.getDate()}(${days[dayOfWeek]})`;
          }
        } else if (period === 'year') {
          // "YYYY-MM" 형식에서 월만 추출
          if (dateStr.match(/^\d{4}-\d{2}$/)) {
            const month = parseInt(dateStr.split('-')[1], 10);
            day = `${month}월`;
          }
        }
        
        return { day: day || dateStr, diaries: item?.count || 0 };
      });

      const userActivityData = activity.map((item: any) => ({
        date: item?.date || '',
        dau: item?.dau ?? 0,
        wau: item?.wau ?? 0,
        mau: item?.mau ?? 0,
        newUsers: item?.newUsers ?? 0,
        retentionRate: item?.retentionRate ?? 0
      }));

      // 위험 레벨 분포 데이터 매핑
      // 백엔드 응답: distribution.high.count, distribution.high.percentage 등
      // null 체크 및 기본값 처리
      const riskDistributionData = [
        { 
          level: 'High', 
          count: (risk?.high?.count !== undefined && risk?.high?.count !== null) ? Number(risk.high.count) : 0, 
          percentage: (risk?.high?.percentage !== undefined && risk?.high?.percentage !== null) ? Number(risk.high.percentage) : 0 
        },
        { 
          level: 'Medium', 
          count: (risk?.medium?.count !== undefined && risk?.medium?.count !== null) ? Number(risk.medium.count) : 0, 
          percentage: (risk?.medium?.percentage !== undefined && risk?.medium?.percentage !== null) ? Number(risk.medium.percentage) : 0 
        },
        { 
          level: 'Low', 
          count: (risk?.low?.count !== undefined && risk?.low?.count !== null) ? Number(risk.low.count) : 0, 
          percentage: (risk?.low?.percentage !== undefined && risk?.low?.percentage !== null) ? Number(risk.low.percentage) : 0 
        },
        { 
          level: 'None', 
          count: (risk?.none?.count !== undefined && risk?.none?.count !== null) ? Number(risk.none.count) : 0, 
          percentage: (risk?.none?.percentage !== undefined && risk?.none?.percentage !== null) ? Number(risk.none.percentage) : 0 
        }
      ];

      return {
        totalUsers: stats?.totalUsers?.count ?? 0,
        totalUsersChange: stats?.totalUsers?.change, // API 응답의 change 필드
        activeUsers: {
          dau: stats?.activeUsers?.dau ?? 0,
          wau: stats?.activeUsers?.wau ?? 0,
          mau: stats?.activeUsers?.mau ?? 0
        },
        newUsers: {
          today: stats?.newUsers?.daily ?? 0,
          thisWeek: stats?.newUsers?.weekly ?? 0,
          thisMonth: stats?.newUsers?.monthly ?? 0
        },
        totalDiaries: stats?.totalDiaries?.count ?? 0,
        totalDiariesChange: stats?.totalDiaries?.change, // API 응답의 change 필드
        avgDailyDiaries: stats?.averageDailyDiaries?.count ?? 0,
        riskLevelUsers: stats?.riskLevelUsers || { high: 0, medium: 0, low: 0, none: 0 },
        weeklyData,
        userActivityData,
        riskDistributionData
      };
    } catch (error: any) {
      console.error('fetchDashboardData error:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardData(period, selectedMetrics, activeUserType, newUserPeriod);
        setStats(data);
      } catch (error: any) {
        setError(error?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
        setStats({
          totalUsers: 0,
          totalUsersChange: 0,
          activeUsers: { dau: 0, wau: 0, mau: 0 },
          newUsers: { today: 0, thisWeek: 0, thisMonth: 0 },
          totalDiaries: 0,
          totalDiariesChange: 0,
          avgDailyDiaries: 0,
          riskLevelUsers: { high: 0, medium: 0, low: 0, none: 0 },
          weeklyData: [],
          userActivityData: [],
          riskDistributionData: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [period, selectedMetrics, activeUserType, newUserPeriod, fetchDashboardData]);

  return { stats, isLoading, error };
}

