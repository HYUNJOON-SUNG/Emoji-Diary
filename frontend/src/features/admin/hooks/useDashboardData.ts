import { useState, useEffect, useCallback } from 'react';
import { 
  getDashboardStats, 
  getDiaryTrend, 
  getUserActivityStats, 
  getRiskLevelDistribution
} from '../../../services/adminApi';

interface DashboardStats {
  totalUsers: number;
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
  selectedMetrics: string[]
) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (
    period: 'week' | 'month' | 'year',
    selectedMetrics: string[]
  ) => {
    try {
      const periodParam = period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'yearly';
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const [statsRes, trendRes, activityRes, riskRes] = await Promise.all([
        getDashboardStats({ period: periodParam }),
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
      const risk = riskRes.data.distribution;

      const weeklyData = trend.map((item: any, index: number) => {
        if (period === 'week') {
          const days = ['월', '화', '수', '목', '금', '토', '일'];
          return { day: days[index] || `Day ${index + 1}`, diaries: item?.count || 0 };
        } else if (period === 'month') {
          return { day: `${index + 1}주차`, diaries: item?.count || 0 };
        } else {
          const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
          return { day: months[index] || `Month ${index + 1}`, diaries: item?.count || 0 };
        }
      });

      const userActivityData = activity.map((item: any) => ({
        date: item?.date || '',
        dau: item?.dau ?? 0,
        wau: item?.wau ?? 0,
        mau: item?.mau ?? 0,
        newUsers: item?.newUsers ?? 0,
        retentionRate: item?.retentionRate ?? 0
      }));

      const riskDistributionData = [
        { level: 'High', count: risk?.high?.count ?? 0, percentage: risk?.high?.percentage ?? 0 },
        { level: 'Medium', count: risk?.medium?.count ?? 0, percentage: risk?.medium?.percentage ?? 0 },
        { level: 'Low', count: risk?.low?.count ?? 0, percentage: risk?.low?.percentage ?? 0 },
        { level: 'None', count: risk?.none?.count ?? 0, percentage: risk?.none?.percentage ?? 0 }
      ];

      return {
        totalUsers: stats?.totalUsers?.count ?? 0,
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
        const data = await fetchDashboardData(period, selectedMetrics);
        setStats(data);
      } catch (error: any) {
        setError(error?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
        setStats({
          totalUsers: 0,
          activeUsers: { dau: 0, wau: 0, mau: 0 },
          newUsers: { today: 0, thisWeek: 0, thisMonth: 0 },
          totalDiaries: 0,
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
  }, [period, selectedMetrics, fetchDashboardData]);

  return { stats, isLoading, error };
}

