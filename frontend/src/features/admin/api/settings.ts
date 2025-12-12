import { adminApiClient } from "@/services/api"

const RISKS_URL = "/settings/risk-detection"
const RESOURCES_URL = "/settings/counseling-resources"

export interface RiskCriteria {
    consecutiveScore: number
    scoreInPeriod: number
}

export interface RiskDetectionSettings {
    monitoringPeriod: number
    high: RiskCriteria
    medium: RiskCriteria
    low: RiskCriteria
}

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
    // Risk Settings
    getRiskSettings: async (): Promise<RiskDetectionSettings> => {
        const response = await adminApiClient.get(RISKS_URL)
        return response.data.data
    },

    updateRiskSettings: async (settings: RiskDetectionSettings): Promise<RiskDetectionSettings> => {
        const response = await adminApiClient.put(RISKS_URL, settings)
        return response.data.data
    },

    // Counseling Resources
    getResources: async (): Promise<CounselingResource[]> => {
        const response = await adminApiClient.get(RESOURCES_URL)
        return response.data.data.resources
    },

    createResource: async (resource: Omit<CounselingResource, "id">): Promise<CounselingResource> => {
        const response = await adminApiClient.post(RESOURCES_URL, resource)
        return response.data.data
    },

    updateResource: async (id: number, resource: Partial<CounselingResource>): Promise<CounselingResource> => {
        const response = await adminApiClient.put(`${RESOURCES_URL}/${id}`, resource)
        return response.data.data
    },

    deleteResource: async (id: number): Promise<void> => {
        await adminApiClient.delete(`${RESOURCES_URL}/${id}`)
    }
}
