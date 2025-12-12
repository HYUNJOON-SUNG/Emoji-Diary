import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { AdminPageHeader } from "../../components/ui/admin-page-header"
import { AdminButton } from "../../components/ui/admin-button"
import { AdminInput } from "../../components/ui/admin-input"
import { AdminCard, AdminCardContent } from "../../components/ui/admin-card"
import { noticesApi, Notice } from "../../api/notices"
import { ArrowLeft, Save, Eye, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface NoticeFormData {
    title: string
    content: string
    isPublic: boolean
    isPinned: boolean
}

export default function NoticeFormPage() {
    const { id } = useParams()
    const isEditMode = !!id
    const navigate = useNavigate()
    const [loading, setLoading] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState<"edit" | "preview">("edit")

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NoticeFormData>({
        defaultValues: {
            title: "",
            content: "",
            isPublic: true,
            isPinned: false
        }
    })

    // Watch for preview
    const content = watch("content")

    React.useEffect(() => {
        if (isEditMode) {
            setLoading(true)
            noticesApi.getNotice(id).then(data => {
                setValue("title", data.title)
                setValue("content", data.content)
                setValue("isPublic", data.isPublic)
                setValue("isPinned", data.isPinned)
            }).finally(() => setLoading(false))
        }
    }, [id, isEditMode, setValue])

    const onSubmit = async (data: NoticeFormData) => {
        setLoading(true)
        try {
            if (isEditMode) {
                await noticesApi.updateNotice(id, data)
            } else {
                await noticesApi.createNotice(data)
            }
            navigate("/admin/notices")
        } catch (error) {
            console.error("Failed to save notice", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <AdminPageHeader
                title={isEditMode ? "공지사항 수정" : "새 공지사항 작성"}
                description={isEditMode ? "기존 공지사항을 수정합니다." : "새로운 공지사항을 등록합니다."}
                action={
                    <AdminButton variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        목록으로
                    </AdminButton>
                }
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">제목</label>
                            <AdminInput
                                placeholder="공지사항 제목을 입력하세요"
                                {...register("title", { required: "제목은 필수입니다", maxLength: 200 })}
                            />
                            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                        </div>

                        {/* Content Editor / Preview */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">내용</label>
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("edit")}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                            activeTab === "edit" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                        )}
                                    >
                                        <Edit3 size={14} /> 편집
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("preview")}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                            activeTab === "preview" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                        )}
                                    >
                                        <Eye size={14} /> 미리보기
                                    </button>
                                </div>
                            </div>

                            <AdminCard className="min-h-[400px] overflow-hidden">
                                {activeTab === "edit" ? (
                                    <textarea
                                        className="w-full h-[400px] p-4 text-sm resize-none focus:outline-none bg-transparent"
                                        placeholder="공지사항 내용을 HTML 형식 또는 텍스트로 입력하세요..."
                                        {...register("content", { required: "내용은 필수입니다" })}
                                    />
                                ) : (
                                    <div className="p-6 prose prose-slate max-w-none h-[400px] overflow-y-auto bg-slate-50/50">
                                        <div dangerouslySetInnerHTML={{ __html: content || "<p class='text-slate-400 italic'>내용이 없습니다.</p>" }} />
                                    </div>
                                )}
                            </AdminCard>
                            {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
                        </div>
                    </div>

                    {/* Sidebar Options */}
                    <div className="space-y-4">
                        <AdminCard>
                            <AdminCardContent className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 block">설정</label>

                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium text-slate-900">공개 여부</div>
                                            <div className="text-xs text-slate-500">사용자에게 표시됩니다</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                            {...register("isPublic")}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium text-slate-900">상단 고정</div>
                                            <div className="text-xs text-slate-500">목록 최상단에 고정합니다</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                            {...register("isPinned")}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <AdminButton
                                        type="submit"
                                        className="w-full"
                                        isLoading={loading}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {isEditMode ? "수정사항 저장" : "공지사항 등록"}
                                    </AdminButton>
                                </div>
                            </AdminCardContent>
                        </AdminCard>
                    </div>
                </div>
            </form>
        </div>
    )
}
