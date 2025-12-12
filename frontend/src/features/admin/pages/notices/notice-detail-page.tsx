import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { noticesApi, Notice } from "../../api/notices"
import { AdminPageHeader } from "../../components/ui/admin-page-header"
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "../../components/ui/admin-card"
import { AdminButton } from "../../components/ui/admin-button"
import { ArrowLeft, Calendar, Eye, Pin, User, Edit, Trash2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
export function NoticeDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [notice, setNotice] = React.useState<Notice | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        if (!id) return
        noticesApi.getNotice(id)
            .then(data => {
                setNotice(data)
                setLoading(false)
            })
            .catch(error => {
                console.error("Failed to load notice", error)
                alert("공지사항을 불러오는데 실패했습니다.")
                navigate("/admin/notices")
            })
    }, [id, navigate])

    const handleDelete = async () => {
        if (!id || !confirm("정말 삭제하시겠습니까?")) return
        try {
            await noticesApi.deleteNotice(id)
            navigate("/admin/notices")
        } catch (error) {
            console.error("Delete failed", error)
            alert("삭제에 실패했습니다.")
        }
    }

    if (loading) return <div className="text-center p-20 text-slate-500">공지사항을 불러오는 중...</div>
    if (!notice) return <div className="text-center p-20 text-slate-500">공지사항을 찾을 수 없습니다.</div>

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <AdminButton variant="ghost" onClick={() => navigate("/admin/notices")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    목록으로
                </AdminButton>
            </div>

            <AdminCard className="overflow-hidden">
                <AdminCardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                {notice.isPinned && (
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                        <Pin size={12} fill="currentColor" />
                                        상단 고정
                                    </span>
                                )}
                                {!notice.isPublic && (
                                    <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                        <Eye size={12} />
                                        비공개
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">{notice.title}</h1>

                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <User size={14} />
                                    <span>{notice.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>{new Date(notice.createdAt).toLocaleDateString()} {new Date(notice.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye size={14} />
                                    <span>조회 {notice.views.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <AdminButton variant="outline" size="sm" onClick={() => navigate("edit")}>
                                <Edit className="mr-2 h-3 w-3" />
                                수정
                            </AdminButton>
                            <AdminButton variant="destructive" size="sm" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-3 w-3" />
                                삭제
                            </AdminButton>
                        </div>
                    </div>
                </AdminCardHeader>

                <AdminCardContent className="p-8 min-h-[300px] prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-indigo-600 prose-strong:text-slate-900 prose-ul:list-disc prose-ol:list-decimal">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{notice.content}</ReactMarkdown>
                </AdminCardContent>
            </AdminCard>
        </div>
    )
}
