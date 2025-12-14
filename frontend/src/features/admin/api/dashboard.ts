import { adminApiClient } from "@/shared/api/client"

const BASE_URL = "/dashboard"

export interface StatsData {
    totalUsers: {
        count: number
    }
    activeUsers: {
        dau: number
        wau: number
        mau: number
        type: string
    }
    newUsers: {
        daily: number
        weekly: number
        monthly: number
        period: string
    }
    totalDiaries: {
        count: number
    }
    averageDailyDiaries: {
        count: number
        period: string
    }
    riskLevelUsers: {
        high: number
        medium: number
        low: number
        none: number
        period: string
    }
}

export interface DiaryTrendData {
    date: string
    count: number
}

export interface UserActivityData {
    date: string
    newUsers?: number
    withdrawnUsers?: number
}

export interface RiskDistributionData {
    level: "High" | "Medium" | "Low" | "None"
    count: number
    ratio: number
}

const mapRiskDistributionToArray = (data: any): RiskDistributionData[] => {
    const dist = data.distribution
    if (!dist) return []
    return [
        { level: "High", count: dist.high.count, ratio: dist.high.percentage },
        { level: "Medium", count: dist.medium.count, ratio: dist.medium.percentage },
        { level: "Low", count: dist.low.count, ratio: dist.low.percentage },
        { level: "None", count: dist.none.count, ratio: dist.none.percentage },
    ]
}

export const dashboardApi = {
    getStats: async (
        averageDiariesPeriod: "weekly" | "monthly" | "yearly" = "monthly",
        riskLevelPeriod: "weekly" | "monthly" | "yearly" = "monthly",
        activeUserType: "dau" | "wau" | "mau" = "dau",
        newUserPeriod: "daily" | "weekly" | "monthly" = "daily"
    ): Promise<StatsData> => {
        const response = await adminApiClient.get(`${BASE_URL}/stats`, {
            params: {
                averageDiariesPeriod,
                riskLevelPeriod,
                activeUserType,
                newUserPeriod
            }
        })
        return response.data.data
    },

    getDiaryTrend: async (period: "weekly" | "monthly" | "yearly"): Promise<DiaryTrendData[]> => {
        const response = await adminApiClient.get(`${BASE_URL}/diary-trend`, {
            params: { period }
        })
        return response.data.data.trend
    },

    getUserActivity: async (period: "weekly" | "monthly" | "yearly"): Promise<UserActivityData[]> => {
        const response = await adminApiClient.get(`${BASE_URL}/user-activity-stats`, {
            params: {
                period,
                metrics: 'newUsers,withdrawnUsers'
            }
        })
        return response.data.data.trend
    },

    getRiskDistribution: async (period: "weekly" | "monthly" | "yearly"): Promise<RiskDistributionData[]> => {
        const response = await adminApiClient.get(`${BASE_URL}/risk-level-distribution`, {
            params: { period }
        })
        return mapRiskDistributionToArray(response.data.data)
    },
}
