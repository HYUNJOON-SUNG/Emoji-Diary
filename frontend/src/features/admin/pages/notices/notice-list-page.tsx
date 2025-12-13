import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AdminPageHeader } from "../../components/ui/admin-page-header"
import { AdminButton } from "../../components/ui/admin-button"
import { AdminInput } from "../../components/ui/admin-input"
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/admin-table"
import { noticesApi, NoticeListResponse } from "../../api/notices"
import { Plus, Search, Pin, PinOff, Eye, Trash2, Edit, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
// For dropdowns, we might need a simple custom one or Radix UI. 
// For now, let's stick to simple inline actions or basic buttons.

export default function NoticeListPage() {
    const navigate = useNavigate()
    const [data, setData] = React.useState<NoticeListResponse | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [filterPublic, setFilterPublic] = React.useState("all")
    const [currentPage, setCurrentPage] = React.useState(0)

    const fetchNotices = React.useCallback(async () => {
        setLoading(true)
        try {
            // Backend uses 1-based indexing for page param
            const res = await noticesApi.getNotices({
                page: currentPage + 1,
                size: 10, // Changed to 10 as per requirement
            })
            setData(res)
        } catch (error) {
            console.error("Failed to fetch notices", error)
        } finally {
            setLoading(false)
        }
    }, [currentPage])

    React.useEffect(() => {
        fetchNotices()
    }, [fetchNotices])

    // Client-side Filtering & Sorting Logic
    const filteredAndSortedNotices = React.useMemo(() => {
        if (!data) return []
        let result = [...data.notices]

        // 1. Text Search (Title or Author)
        if (search.trim()) {
            const query = search.toLowerCase()
            result = result.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.author.toLowerCase().includes(query)
            )
        }

        // 2. Public Status Filter
        if (filterPublic !== "all") {
            const isPublic = filterPublic === "public"
            result = result.filter(n => n.isPublic === isPublic)
        }

        // 3. Sorting: Pinned First, then CreatedAt Desc
        result.sort((a, b) => {
            if (a.isPinned === b.isPinned) {
                // Secondary Sort: CreatedAt Desc
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
            return a.isPinned ? -1 : 1
        })

        return result
    }, [data, search, filterPublic])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
    }

    const handleTogglePin = async (e: React.MouseEvent, id: number, currentPinned: boolean) => {
        e.stopPropagation() // Prevent row click navigation
        try {
            await noticesApi.updatePinStatus(id, !currentPinned)
            fetchNotices()
        } catch (error) {
            console.error("Failed to toggle pin", error)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation() // Prevent row click navigation
        if (confirm("정말 삭제하시겠습니까?")) {
            await noticesApi.deleteNotice(id)
            fetchNotices()
        }
    }

    // Calculate total pages
    const totalPages = data ? Math.ceil(data.total / data.limit) : 0

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <AdminPageHeader
                    title="공지사항 관리"
                    description="서비스 공지사항을 등록하고 관리합니다."
                    action={
                        <AdminButton onClick={() => navigate("new")}>
                            <Plus className="mr-2 h-4 w-4" />
                            새 공지사항
                        </AdminButton>
                    }
                />
            </motion.div>

            {/* Filters & Search */}
            <motion.div
                className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-4 rounded-xl border border-slate-200 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                <form onSubmit={handleSearch} className="relative w-full md:w-96">
                    <AdminInput
                        placeholder="제목 또는 작성자로 검색..."
                        icon={<Search size={18} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {["all", "public", "private"].map((f) => (
                        <button
                            key={f}
                            onClick={() => { setFilterPublic(f); }}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                                filterPublic === f
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                            )}
                        >
                            {f === "all" ? "전체" : f === "public" ? "공개" : "비공개"}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Table */}
            <motion.div
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableRow className="hover:bg-transparent">
                            <AdminTableHead className="w-[80px]">상태</AdminTableHead>
                            <AdminTableHead>제목</AdminTableHead>
                            <AdminTableHead className="w-[100px]">작성자</AdminTableHead>
                            <AdminTableHead className="w-[120px]">작성일</AdminTableHead>
                            <AdminTableHead className="w-[80px] text-right">조회수</AdminTableHead>
                            <AdminTableHead className="w-[120px] text-right">관리</AdminTableHead>
                        </AdminTableRow>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {loading ? (
                            <AdminTableRow>
                                <AdminTableCell colSpan={6} className="h-40 text-center text-slate-500">
                                    로딩 중...
                                </AdminTableCell>
                            </AdminTableRow>
                        ) : filteredAndSortedNotices.length === 0 ? (
                            <AdminTableRow>
                                <AdminTableCell colSpan={6} className="h-40 text-center text-slate-500">
                                    {data?.notices.length === 0 ? "등록된 공지사항이 없습니다." : "검색 결과가 없습니다."}
                                </AdminTableCell>
                            </AdminTableRow>
                        ) : (
                            <AnimatePresence>
                                {filteredAndSortedNotices.map((notice) => (
                                    <motion.tr
                                        key={notice.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => navigate(`${notice.id}`)}
                                        className="border-b last:border-0 border-slate-100 transition-colors hover:bg-slate-50/50 cursor-pointer group"
                                    >
                                        <AdminTableCell>
                                            <button
                                                onClick={(e) => handleTogglePin(e, notice.id, notice.isPinned)}
                                                className={cn(
                                                    "p-2 rounded-full transition-colors relative z-10",
                                                    notice.isPinned
                                                        ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                                                        : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                                                )}
                                                title={notice.isPinned ? "고정 해제" : "상단 고정"}
                                            >
                                                {notice.isPinned ? <Pin size={16} fill="currentColor" /> : <Pin size={16} />}
                                            </button>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                    {notice.title}
                                                </span>
                                                {!notice.isPublic && (
                                                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Eye size={10} className="text-slate-400" /> 비공개
                                                    </span>
                                                )}
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-slate-600">{notice.author}</AdminTableCell>
                                        <AdminTableCell className="text-slate-500 text-xs">
                                            {new Date(notice.createdAt).toLocaleDateString()}
                                        </AdminTableCell>
                                        <AdminTableCell className="text-right text-slate-600 font-mono">
                                            {notice.views.toLocaleString()}
                                        </AdminTableCell>
                                        <AdminTableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <AdminButton
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-indigo-600 relative z-10"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`${notice.id}`) }}
                                                >
                                                    <Edit size={16} />
                                                </AdminButton>
                                                <AdminButton
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-red-600 relative z-10"
                                                    onClick={(e) => handleDelete(e, notice.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </AdminButton>
                                            </div>
                                        </AdminTableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </AdminTableBody>
                </AdminTable>
            </motion.div>

            {/* Pagination */}
            {data && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <AdminButton
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                    >
                        <ChevronLeft size={16} />
                    </AdminButton>
                    <span className="text-sm text-slate-600">
                        {data.page} / {totalPages}
                    </span>
                    <AdminButton
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                    >
                        <ChevronRight size={16} />
                    </AdminButton>
                </div>
            )}
        </div>
    )
}
