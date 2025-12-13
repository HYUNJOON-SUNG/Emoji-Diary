import * as React from "react"
import { AdminPageHeader } from "../../components/ui/admin-page-header"
import { RiskSettingsTab } from "./risk-settings-tab"
import { CounselingResourcesTab } from "./counseling-resources-tab"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type Tab = "risk" | "resources"

export default function SettingsPage() {
    const [activeTab, setActiveTab] = React.useState<Tab>("risk")

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <AdminPageHeader
                    title="시스템 설정"
                    description="서비스 운영에 필요한 주요 설정과 리소스를 관리합니다."
                />
            </motion.div>

            <div className="flex flex-col space-y-4">
                {/* Tab Navigation */}
                <motion.div
                    className="flex p-1 space-x-1 bg-slate-100/80 rounded-xl w-fit backdrop-blur-sm border border-slate-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
                    {[
                        { id: "risk", label: "위험 감지 기준" },
                        { id: "resources", label: "상담 기관 관리" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={cn(
                                "relative px-4 py-2 text-sm font-medium rounded-lg transition-all z-0",
                                activeTab === tab.id
                                    ? "text-indigo-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900 hover:text-slate-900 hover:bg-slate-200/50"
                            )}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-100 z-[-1]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* Tab Content */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "risk" && <RiskSettingsTab />}
                            {activeTab === "resources" && <CounselingResourcesTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
