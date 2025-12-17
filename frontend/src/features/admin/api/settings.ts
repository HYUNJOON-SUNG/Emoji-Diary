import { adminApiClient } from "@/shared/api/client"

const RISKS_URL = "/settings/risk-detection"
const RESOURCES_URL = "/settings/counseling-resources"

/**
 * 위험 감지 기준 (연속/기간내 점수)
 */
export interface RiskCriteria {
    consecutiveScore: number
    scoreInPeriod: number
}

/**
 * 전체 위험 감지 설정 (모니터링 기간 포함)
 */
export interface RiskDetectionSettings {
    monitoringPeriod: number
    high: RiskCriteria
    medium: RiskCriteria
    low: RiskCriteria
}

/**
 * 상담 기관 리소스 정보
 */
export interface CounselingResource {
    id: number
    name: string
    category: string
    phone: string
    description: string
    website?: string
    operatingHours?: string
    isUrgent: boolean
}

export interface CounselingResourceListResponse {
    resources: CounselingResource[]
}

export const settingsApi = {
    /**
     * 위험 감지 기준 조회
     */
    getRiskSettings: async (): Promise<RiskDetectionSettings> => {
        const response = await adminApiClient.get(RISKS_URL)
        return response.data.data
    },

    /**
     * 위험 감지 기준 수정
     */
    updateRiskSettings: async (settings: RiskDetectionSettings): Promise<RiskDetectionSettings> => {
        const response = await adminApiClient.put(RISKS_URL, settings)
        return response.data.data
    },

    /**
     * 상담 기관 조회
     */
    getResources: async (): Promise<CounselingResource[]> => {
        const response = await adminApiClient.get(RESOURCES_URL)
        return response.data.data.resources
    },

    /**
     * 상담 기관 생성
     */
    createResource: async (resource: Omit<CounselingResource, "id">): Promise<CounselingResource> => {
        const response = await adminApiClient.post(RESOURCES_URL, resource)
        return response.data.data
    },

    /**
     * 상담 기관 수정
     */
    updateResource: async (id: number, resource: Partial<CounselingResource>): Promise<CounselingResource> => {
        const response = await adminApiClient.put(`${RESOURCES_URL}/${id}`, resource)
        return response.data.data
    },

    /**
     * 상담 기관 삭제
     */
    deleteResource: async (id: number): Promise<void> => {
        await adminApiClient.delete(`${RESOURCES_URL}/${id}`)
    }
}
