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
  avgDiariesPeriod: 'week' | 'month' | 'year',
  riskLevelPeriod: 'week' | 'month' | 'year',
  diaryTrendPeriod: 'week' | 'month' | 'year',
  userActivityPeriod: 'week' | 'month' | 'year',
  riskDistributionPeriod: 'week' | 'month' | 'year',
  selectedMetrics: string[],
  activeUserType?: 'dau' | 'wau' | 'mau',
  newUserPeriod?: 'daily' | 'weekly' | 'monthly'
) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 중 상태 (기존 데이터 유지)
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (
    avgDiariesPeriod: 'week' | 'month' | 'year',
    riskLevelPeriod: 'week' | 'month' | 'year',
    diaryTrendPeriod: 'week' | 'month' | 'year',
    userActivityPeriod: 'week' | 'month' | 'year',
    riskDistributionPeriod: 'week' | 'month' | 'year',
    selectedMetrics: string[],
    activeUserType?: 'dau' | 'wau' | 'mau',
    newUserPeriod?: 'daily' | 'weekly' | 'monthly'
  ) => {
    try {
      const avgDiariesPeriodParam = avgDiariesPeriod === 'week' ? 'weekly' : avgDiariesPeriod === 'month' ? 'monthly' : 'yearly';
      const riskLevelPeriodParam = riskLevelPeriod === 'week' ? 'weekly' : riskLevelPeriod === 'month' ? 'monthly' : 'yearly';
      const diaryTrendPeriodParam = diaryTrendPeriod === 'week' ? 'weekly' : diaryTrendPeriod === 'month' ? 'monthly' : 'yearly';
      const userActivityPeriodParam = userActivityPeriod === 'week' ? 'weekly' : userActivityPeriod === 'month' ? 'monthly' : 'yearly';
      const riskDistributionPeriodParam = riskDistributionPeriod === 'week' ? 'weekly' : riskDistributionPeriod === 'month' ? 'monthly' : 'yearly';
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // [API 명세서 Section 10.2.1-10.2.4]
      // 각 영역별 독립적인 period 파라미터 전달
      const [statsRes, trendRes, activityRes, riskRes] = await Promise.all([
        getDashboardStats({
          averageDiariesPeriod: avgDiariesPeriodParam,
          riskLevelPeriod: riskLevelPeriodParam,
          activeUserType: activeUserType || 'dau',
          newUserPeriod: newUserPeriod || 'daily'
        }),
        getDiaryTrend({ period: diaryTrendPeriodParam, year: currentYear, month: currentMonth }),
        getUserActivityStats({ period: userActivityPeriodParam, year: currentYear, month: currentMonth, metrics: selectedMetrics.join(',') }),
        getRiskLevelDistribution({ period: riskDistributionPeriodParam, year: currentYear, month: currentMonth })
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
      const riskData = (riskRes.data as any)?.data || riskRes.data;
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

        if (diaryTrendPeriod === 'week' || diaryTrendPeriod === 'month') {
          // "YYYY-MM-DD" 형식에서 일자만 추출
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(dateStr);
            const dayOfWeek = date.getDay();
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            day = `${date.getMonth() + 1}/${date.getDate()}(${days[dayOfWeek]})`;
          }
        } else if (diaryTrendPeriod === 'year') {
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
      // 기존 데이터가 있으면 isRefreshing, 없으면 isLoading
      if (stats) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      try {
        const data = await fetchDashboardData(
          avgDiariesPeriod,
          riskLevelPeriod,
          diaryTrendPeriod,
          userActivityPeriod,
          riskDistributionPeriod,
          selectedMetrics,
          activeUserType,
          newUserPeriod
        );
        setStats(data);
      } catch (error: any) {
        setError(error?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
        // 기존 데이터가 있으면 유지, 없으면 기본값 설정
        if (!stats) {
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
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avgDiariesPeriod, riskLevelPeriod, diaryTrendPeriod, userActivityPeriod, riskDistributionPeriod, selectedMetrics, activeUserType, newUserPeriod, fetchDashboardData]);

  return { stats, isLoading, isRefreshing, error };
}

