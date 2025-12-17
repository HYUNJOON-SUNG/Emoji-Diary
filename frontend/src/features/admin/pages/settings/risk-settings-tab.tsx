import * as React from "react"
import { useForm } from "react-hook-form"
import { AdminCard, AdminCardContent, AdminCardDescription, AdminCardHeader, AdminCardTitle } from "../../components/ui/admin-card"
import { AdminButton } from "../../components/ui/admin-button"
import { AdminInput } from "../../components/ui/admin-input" // Fixed import
import { settingsApi, RiskDetectionSettings } from "../../api/settings"
import { Save, AlertTriangle } from "lucide-react"

export function RiskSettingsTab() {
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState(false)
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RiskDetectionSettings>()

    // Watch values for live validation logic (optional, for UX hints)
    const high = watch("high")
    const medium = watch("medium")
    const low = watch("low")

    React.useEffect(() => {
        settingsApi.getRiskSettings().then(data => {
            // Populate form
            setValue("monitoringPeriod", data.monitoringPeriod)
            setValue("high", data.high)
            setValue("medium", data.medium)
            setValue("low", data.low)
            setLoading(false)
        }).catch(err => {
            console.error("Failed to load settings", err)
            setLoading(false)
        })
    }, [setValue])

    const onSubmit = async (data: RiskDetectionSettings) => {
        // Validation: High > Medium > Low (Period Score)
        if (data.high.scoreInPeriod <= data.medium.scoreInPeriod ||
            data.medium.scoreInPeriod <= data.low.scoreInPeriod) {
            alert("기간 내 누적 점수 기준은 [고위험 > 중위험 > 저위험] 순서여야 합니다.")
            return
        }

        // Validation: High > Medium > Low (Consecutive Score)
        if (data.high.consecutiveScore <= data.medium.consecutiveScore ||
            data.medium.consecutiveScore <= data.low.consecutiveScore) {
            alert("연속 부정 감정 점수 기준은 [고위험 > 중위험 > 저위험] 순서여야 합니다.")
            return
        }

        setSaving(true)
        try {
            await settingsApi.updateRiskSettings(data)
            alert("설정이 저장되었습니다.")
        } catch (error) {
            console.error("저장 실패", error)
            alert("저장에 실패했습니다.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="text-center p-8 text-slate-500">설정을 불러오는 중입니다...</div>

    const renderRiskSection = (
        level: "high" | "medium" | "low",
        title: string,
        colorClass: string,
        description: string
    ) => (
        <div className="space-y-4 p-4 rounded-lg bg-slate-50/50 border border-slate-100">
            <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold ${colorClass}`}>{title}</h3>
            </div>
            <p className="text-xs text-slate-500 mb-2">{description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">연속 부정 감정 점수</label>
                    <div className="flex items-center gap-2">
                        <AdminInput
                            type="number"
                            {...register(`${level}.consecutiveScore`, { valueAsNumber: true, min: 1, max: 100 })}
                            className="bg-white"
                        />
                        <span className="text-xs text-slate-400">점</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">기간 내 누적 점수</label>
                    <div className="flex items-center gap-2">
                        <AdminInput
                            type="number"
                            {...register(`${level}.scoreInPeriod`, { valueAsNumber: true, min: 1, max: 200 })}
                            className="bg-white"
                        />
                        <span className="text-xs text-slate-400">점</span>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <AdminCard>
                <AdminCardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" />
                        <AdminCardTitle>위험 신호 감지 기준 설정</AdminCardTitle>
                    </div>
                    <AdminCardDescription>
                        AI 감정 분석 결과를 기반으로 사용자 위험 상태를 분류하는 기준을 설정합니다.
                    </AdminCardDescription>
                </AdminCardHeader>
                <AdminCardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Monitoring Period */}
                        <div className="space-y-2 pb-6 border-b border-slate-100">
                            <label className="text-sm font-medium text-slate-900 block">모니터링 기간 설정</label>
                            <p className="text-xs text-slate-500 mb-2">위험 신호를 감지할 기간(일)을 설정합니다 (1-365일).</p>
                            <div className="flex items-center gap-3">
                                <AdminInput
                                    type="number"
                                    className="w-32"
                                    {...register("monitoringPeriod", { valueAsNumber: true, min: 1, max: 365, required: true })}
                                />
                                <span className="text-sm text-slate-600">일</span>
                            </div>
                        </div>

                        {/* Risk Levels */}
                        <div className="space-y-4">
                            {renderRiskSection(
                                "high",
                                "고위험 (High Risk)",
                                "text-red-600",
                                "즉시 개입이 필요한 심각한 상태"
                            )}
                            {renderRiskSection(
                                "medium",
                                "중위험 (Medium Risk)",
                                "text-orange-500",
                                "주의가 필요하며 지속적인 모니터링 대상"
                            )}
                            {renderRiskSection(
                                "low",
                                "저위험 (Low Risk)",
                                "text-yellow-500",
                                "일시적인 부정 감정이나 경미한 상태"
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <AdminButton type="submit" isLoading={saving}>
                                <Save className="mr-2 h-4 w-4" />
                                설정 저장
                            </AdminButton>
                        </div>
                    </form>
                </AdminCardContent>
            </AdminCard>

            {/* Guide Card - Updated Content */}
            <AdminCard className="bg-slate-50/50 border-dashed h-full">
                <AdminCardHeader>
                    <AdminCardTitle className="text-base">설정 가이드</AdminCardTitle>
                </AdminCardHeader>
                <AdminCardContent className="space-y-6 text-sm text-slate-600">
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-2">1. 감정 분석 점수 체계</h4>
                        <p className="mb-2">KoBERT 모델이 분석한 감정 결과에 따라 위험 점수가 부여됩니다:</p>
                        <ul className="list-disc list-inside space-y-1 pl-1 text-xs bg-white p-3 rounded border border-slate-200">
                            <li>
                                <span className="font-bold text-red-500">고위험 (2점)</span>: <span className="text-slate-700">슬픔, 분노</span>
                            </li>
                            <li>
                                <span className="font-bold text-orange-500">중위험 (1점)</span>: <span className="text-slate-700">불안, 혐오</span>
                            </li>
                            <li>
                                <span className="font-bold text-slate-400">비위험 (0점)</span>: <span className="text-slate-500">행복, 중립, 당황</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-2">2. 판정 로직 상세</h4>
                        <div className="space-y-3">
                            <div>
                                <span className="font-medium text-slate-800 block mb-1">• 연속 부정 감정 점수</span>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    가장 최근 일기부터 과거로 거슬러 올라가며, <span className="underline decoration-slate-300 underline-offset-2">끊기지 않고 연속된</span> 부정 감정 일기들의 점수 합계입니다. 단 하루라도 부정 감정이 아니면 계산이 중단됩니다.
                                </p>
                            </div>
                            <div>
                                <span className="font-medium text-slate-800 block mb-1">• 기간 내 누적 점수</span>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    설정된 <span className="font-medium">모니터링 기간</span> 내에 발생한 모든 부정 감정 일기의 점수 합계입니다. 연속성과 관계없이 빈도수를 체크합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-2">3. 우선순위</h4>
                        <p className="text-xs text-slate-500 bg-blue-50 text-blue-700 p-3 rounded border border-blue-100">
                            판정은 <strong>High &gt; Medium &gt; Low</strong> 순서로 진행됩니다.
                            <br />
                            상위 레벨의 기준을 충족하면 하위 레벨 기준을 충족하더라도 상위 레벨로 판정됩니다.
                        </p>
                    </div>
                </AdminCardContent>
            </AdminCard>
        </div>
    )
}