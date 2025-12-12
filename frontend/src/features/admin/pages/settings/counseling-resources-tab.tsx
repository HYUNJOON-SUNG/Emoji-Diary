import * as React from "react"
import { useForm } from "react-hook-form"
import { AdminCard, AdminCardContent } from "../../components/ui/admin-card"
import { AdminButton } from "../../components/ui/admin-button"
import { AdminInput } from "../../components/ui/admin-input"
import { settingsApi, CounselingResource } from "../../api/settings"
import { Plus, Trash2, Edit2, Phone, Globe, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"

export function CounselingResourcesTab() {
    const [resources, setResources] = React.useState<CounselingResource[]>([])
    const [loading, setLoading] = React.useState(true)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [editingResource, setEditingResource] = React.useState<CounselingResource | null>(null)

    const fetchResources = React.useCallback(async () => {
        try {
            const data = await settingsApi.getResources()
            setResources(data)
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchResources()
    }, [fetchResources])

    const handleDelete = async (id: number) => {
        if (confirm("정말 삭제하시겠습니까?")) {
            await settingsApi.deleteResource(id)
            fetchResources()
        }
    }

    const openNewDialog = () => {
        setEditingResource(null)
        setDialogOpen(true)
    }

    const openEditDialog = (resource: CounselingResource) => {
        setEditingResource(resource)
        setDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">등록된 상담 기관</h3>
                <AdminButton onClick={openNewDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    기관 추가
                </AdminButton>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-slate-500">로딩 중...</div>
                ) : resources.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-500 border border-dashed rounded-xl">
                        등록된 상담 기관이 없습니다.
                    </div>
                ) : (
                    <AnimatePresence>
                        {resources.map((resource) => (
                            <motion.div
                                key={resource.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                layout
                            >
                                <AdminCard className="h-full hover:shadow-md transition-shadow group relative">
                                    <AdminCardContent className="p-5 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                                                        {resource.category}
                                                    </span>
                                                    {resource.isUrgent && (
                                                        <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold animate-pulse">
                                                            긴급상담
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-lg">{resource.name}</h4>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditDialog(resource)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(resource.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 line-clamp-2 h-10">
                                            {resource.description}
                                        </p>

                                        <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
                                            <div className="flex items-center text-slate-600">
                                                <Phone size={14} className="mr-2 text-slate-400" />
                                                {resource.phone}
                                            </div>
                                            {resource.operatingHours && (
                                                <div className="flex items-center text-slate-600">
                                                    <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 mr-2">운영</span>
                                                    {resource.operatingHours}
                                                </div>
                                            )}
                                            {resource.website && (
                                                <a
                                                    href={resource.website}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center text-indigo-600 hover:underline truncate"
                                                >
                                                    <Globe size={14} className="mr-2 text-indigo-400 flex-shrink-0" />
                                                    <span className="truncate">{resource.website}</span>
                                                    <ExternalLink size={10} className="ml-1" />
                                                </a>
                                            )}
                                        </div>
                                    </AdminCardContent>
                                </AdminCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <ResourceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                resource={editingResource}
                onSuccess={() => {
                    setDialogOpen(false)
                    fetchResources()
                }}
            />
        </div>
    )
}

function ResourceDialog({
    open,
    onOpenChange,
    resource,
    onSuccess
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    resource: CounselingResource | null
    onSuccess: () => void
}) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<CounselingResource, "id">>()
    const [saving, setSaving] = React.useState(false)

    React.useEffect(() => {
        if (open) {
            if (resource) {
                reset(resource)
            } else {
                reset({ name: "", category: "", phone: "", description: "", website: "" })
            }
        }
    }, [open, resource, reset])

    const onSubmit = async (data: Omit<CounselingResource, "id">) => {
        setSaving(true)
        try {
            if (resource) {
                await settingsApi.updateResource(resource.id, data)
            } else {
                await settingsApi.createResource(data)
            }
            onSuccess()
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-lg font-bold">
                            {resource ? "기관 정보 수정" : "새 상담 기관 추가"}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-slate-400 hover:text-slate-600 p-1">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">기관명</label>
                            <AdminInput {...register("name", { required: "기관명을 입력해주세요" })} placeholder="예: 한국생명의전화" />
                            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">카테고리</label>
                                <select
                                    {...register("category", { required: true })}
                                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <option value="">선택</option>
                                    <option value="상담센터">상담센터</option>
                                    <option value="정신건강">정신건강</option>
                                    <option value="병원">병원</option>
                                    <option value="기타">기타</option>
                                </select>
                                {errors.category && <span className="text-xs text-red-500">선택 필수</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">전화번호</label>
                                <AdminInput {...register("phone", { required: "전화번호 필수" })} placeholder="02-1234-5678" />
                                {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">운영 시간</label>
                            <AdminInput {...register("operatingHours")} placeholder="예: 24시간, 평일 09:00~18:00" />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isUrgent"
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                {...register("isUrgent")}
                            />
                            <label htmlFor="isUrgent" className="text-sm font-medium text-slate-700">긴급 상담 가능 (메인 노출)</label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">설명</label>
                            <textarea
                                {...register("description", { required: "설명을 입력해주세요" })}
                                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                                placeholder="기관에 대한 간단한 설명을 입력하세요"
                            />
                            {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">웹사이트 주소</label>
                            <AdminInput {...register("website")} placeholder="https://" />
                        </div>

                        <div className="pt-4 flex gap-2 justify-end">
                            <Dialog.Close asChild>
                                <AdminButton type="button" variant="ghost">취소</AdminButton>
                            </Dialog.Close>
                            <AdminButton type="submit" isLoading={saving}>저장</AdminButton>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
