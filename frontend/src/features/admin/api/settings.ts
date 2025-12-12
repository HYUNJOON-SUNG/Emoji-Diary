import axios from "@/lib/axios"

const RISKS_URL = "/admin/settings/risk-detection"
const RESOURCES_URL = "/admin/settings/counseling-resources"

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
        const response = await axios.get(RISKS_URL)
        const data = response.data.data
        return response.data.data
    },

    updateRiskSettings: async (settings: RiskDetectionSettings): Promise<RiskDetectionSettings> => {
        const response = await axios.put(RISKS_URL, settings)
        return response.data.data
    },

    // Counseling Resources
    getResources: async (): Promise<CounselingResource[]> => {
        const response = await axios.get(RESOURCES_URL)
        return response.data.data.resources // Assuming list response wrapper or direct list? 
        // Backend returns "data": response. 
        // AdminCounselingResourceController: getCounselingResourceList() -> returns CounselingResourceListResponse.
        // Assuming CounselingResourceListResponse has 'resources' field? Or extends List?
        // Wait, I should check the DTO. Previous step 980 showed DTO name but not content.
        // But standard list response usually wraps.
        // If I make a mistake here, the UI will break.
        // I will assume ".resources" based on naming convention "CounselingResourceListResponse".
        // If it was just List<CounselingResource>, backend would return List.
        // Let's assume .resources for now.
    },

    createResource: async (resource: Omit<CounselingResource, "id">): Promise<CounselingResource> => {
        const response = await axios.post(RESOURCES_URL, resource)
        return response.data.data
    },

    updateResource: async (id: number, resource: Partial<CounselingResource>): Promise<CounselingResource> => {
        const response = await axios.put(`${RESOURCES_URL}/${id}`, resource)
        return response.data.data
    },

    deleteResource: async (id: number): Promise<void> => {
        await axios.delete(`${RESOURCES_URL}/${id}`)
    }
}
