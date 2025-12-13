import * as React from "react"
import { AdminPageHeader } from "../../components/ui/admin-page-header"
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/admin-table"
import { AdminButton } from "../../components/ui/admin-button"
import { AdminInput } from "../../components/ui/admin-input"
import { AdminCard, AdminCardContent } from "../../components/ui/admin-card"
import { systemErrorsApi, ErrorLogListResponse, ErrorLogDetailResponse, ErrorLevel } from "../../api/system-errors"
import { Search, AlertTriangle, Info, AlertOctagon, ChevronLeft, ChevronRight, X, Terminal, Activity, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import * as Dialog from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"

const LEVEL_COLORS: Record<ErrorLevel, string> = {
    INFO: "text-blue-600 bg-blue-50",
    WARN: "text-amber-600 bg-amber-50",
    ERROR: "text-red-600 bg-red-50",
}

const LEVEL_ICONS: Record<ErrorLevel, any> = {
    INFO: Info,
    WARN: AlertTriangle,
    ERROR: AlertOctagon,
}

export default function LogsPage() {
    const [data, setData] = React.useState<ErrorLogListResponse | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState(0)
    const [levelFilter, setLevelFilter] = React.useState<string>("ALL")
    const [search, setSearch] = React.useState("")
    const [startDate, setStartDate] = React.useState("")
    const [endDate, setEndDate] = React.useState("")

    // For Detail Modal, we might need to fetch full detail or use item if it has enough info.
    // DTO 'ErrorLogItem' has timestamp, level, message, endpoint, userId.
    // DTO 'ErrorLogDetailResponse' adds errorCode, stackTrace.
    // So we fetch detail on click.
    const [selectedLogId, setSelectedLogId] = React.useState<number | null>(null)
    const [logDetail, setLogDetail] = React.useState<ErrorLogDetailResponse | null>(null)
    const [detailLoading, setDetailLoading] = React.useState(false)

    const fetchLogs = React.useCallback(async () => {
        setLoading(true)
        try {
            const res = await systemErrorsApi.getSystemErrors({
                page: page + 1,
                size: 10,
                level: levelFilter === "ALL" ? undefined : levelFilter,
                search: search || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            })
            setData(res)
        } finally {
            setLoading(false)
        }
    }, [page, levelFilter, search, startDate, endDate])

    React.useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    // Fetch detail when selectedLogId changes
    React.useEffect(() => {
        if (selectedLogId) {
            setDetailLoading(true)
            systemErrorsApi.getSystemError(selectedLogId)
                .then(setLogDetail)
                .catch(console.error)
                .finally(() => setDetailLoading(false))
        } else {
            setLogDetail(null)
        }
    }, [selectedLogId])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(0)
        fetchLogs()
    }

    const totalPages = data ? Math.ceil(data.total / 10) : 0

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <AdminPageHeader
                    title="에러 로그 모니터링"
                    description="시스템에서 발생한 예외 상황 로그를 조회합니다."
                />
            </motion.div>

            {/* Stats Cards (Spec 5.1) */}
            {data && (
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
                    <StatCard label="전체 로그" value={data.total} icon={FileText} color="text-slate-600 bg-slate-50" />
                    <StatCard label="ERROR" value={data.summary.error} icon={AlertOctagon} color="text-red-600 bg-red-50" />
                    <StatCard label="WARN" value={data.summary.warn} icon={AlertTriangle} color="text-amber-600 bg-amber-50" />
                    <StatCard label="INFO" value={data.summary.info} icon={Info} color="text-blue-600 bg-blue-50" />
                </motion.div>
            )}

            {/* Filters */}
            <motion.div
                className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-white/50 p-4 rounded-xl border border-slate-200 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    <form onSubmit={handleSearch} className="relative w-full md:w-80">
                        <AdminInput
                            placeholder="에러 메시지 검색..."
                            icon={<Search size={18} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                    <div className="flex gap-2 items-center">
                        <AdminInput
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                            className="w-40"
                        />
                        <span className="text-slate-400">~</span>
                        <AdminInput
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                            className="w-40"
                        />
                    </div>
                </div>

                <div className="flex gap-2 w-full xl:w-auto overflow-x-auto">
                    {["ALL", "INFO", "WARN", "ERROR"].map((level) => (
                        <button
                            key={level}
                            onClick={() => { setLevelFilter(level); setPage(0); }}
                            className={cn(
                                "px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap border",
                                levelFilter === level
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                            )}
                        >
                            {level === "ALL" ? "전체" : level}
                        </button>
                    ))}
                </div>
            </motion.div>

            <motion.div
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableRow>
                            <AdminTableHead className="w-[100px]">Level</AdminTableHead>
                            <AdminTableHead>Message</AdminTableHead>
                            <AdminTableHead className="w-[200px]">Endpoint</AdminTableHead>
                            <AdminTableHead className="w-[220px]">Time</AdminTableHead>
                        </AdminTableRow>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {loading ? (
                            <AdminTableRow>
                                <AdminTableCell colSpan={4} className="h-40 text-center text-slate-500">
                                    로그를 불러오는 중...
                                </AdminTableCell>
                            </AdminTableRow>
                        ) : !data || data.logs.length === 0 ? (
                            <AdminTableRow>
                                <AdminTableCell colSpan={4} className="h-40 text-center text-slate-500">
                                    데이터가 없습니다.
                                </AdminTableCell>
                            </AdminTableRow>
                        ) : (
                            <AnimatePresence>
                                {data.logs.map((log) => {
                                    const Icon = LEVEL_ICONS[log.level] || Info
                                    return (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b last:border-0 border-slate-100 hover:bg-slate-50 cursor-pointer group"
                                            onClick={() => setSelectedLogId(log.id)}
                                        >
                                            <AdminTableCell>
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                                                    LEVEL_COLORS[log.level] || LEVEL_COLORS.INFO
                                                )}>
                                                    <Icon size={12} />
                                                    {log.level}
                                                </span>
                                            </AdminTableCell>
                                            <AdminTableCell>
                                                <div className="font-mono text-sm text-slate-700 line-clamp-1 break-all">
                                                    {log.message}
                                                </div>
                                            </AdminTableCell>
                                            <AdminTableCell>
                                                <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 block truncate">
                                                    {log.endpoint}
                                                </code>
                                            </AdminTableCell>
                                            <AdminTableCell className="text-slate-500 text-xs tabular-nums whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </AdminTableCell>
                                        </motion.tr>
                                    )
                                })}
                            </AnimatePresence>
                        )}
                    </AdminTableBody>
                </AdminTable>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <AdminButton
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        <ChevronLeft size={16} />
                    </AdminButton>
                    <span className="text-sm text-slate-600">
                        {page + 1} / {totalPages}
                    </span>
                    <AdminButton
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                    >
                        <ChevronRight size={16} />
                    </AdminButton>
                </div>
            )}

            {/* Log Detail Modal */}
            <Dialog.Root open={!!selectedLogId} onOpenChange={(open) => !open && setSelectedLogId(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        {detailLoading || !logDetail ? (
                            <div className="p-10 flex justify-center items-center">
                                <span className="animate-spin mr-2"><Activity size={20} /></span> 불러오는 중...
                            </div>
                        ) : (
                            <>
                                <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50 rounded-t-xl">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                                                LEVEL_COLORS[logDetail.level] || LEVEL_COLORS.INFO
                                            )}>
                                                {logDetail.level}
                                            </span>
                                            <span className="text-slate-500 text-xs">{new Date(logDetail.timestamp).toLocaleString()}</span>
                                        </div>
                                        <Dialog.Title className={cn("text-lg font-bold mt-2",
                                            logDetail.level === "ERROR" ? "text-red-600" : "text-slate-800"
                                        )}>
                                            {logDetail.message}
                                        </Dialog.Title>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-mono mt-1">
                                            <span className="font-bold">{logDetail.errorCode || "Unknown Code"}</span>
                                            <span>{logDetail.endpoint}</span>
                                        </div>
                                    </div>
                                    <Dialog.Close asChild>
                                        <button className="text-slate-400 hover:text-slate-600 p-1">
                                            <X size={20} />
                                        </button>
                                    </Dialog.Close>
                                </div>

                                <div className="p-0 overflow-y-auto flex-1 bg-[#1e1e1e]">
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider font-bold">
                                            <Terminal size={14} /> Stack Trace
                                        </div>
                                        <pre className="font-mono text-xs text-green-400 whitespace-pre-wrap leading-relaxed">
                                            {logDetail.stackTrace || "No stack trace available."}
                                        </pre>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl flex justify-end">
                                    <Dialog.Close asChild>
                                        <AdminButton variant="outline">닫기</AdminButton>
                                    </Dialog.Close>
                                </div>
                            </>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) {
    return (
        <AdminCard>
            <AdminCardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                    <p className="text-2xl font-bold text-slate-800">{value.toLocaleString()}</p>
                </div>
                <div className={cn("p-2 rounded-lg", color)}>
                    <Icon size={20} />
                </div>
            </AdminCardContent>
        </AdminCard>
    )
}
