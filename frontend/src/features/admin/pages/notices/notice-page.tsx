import { Utils } from "lucide-react"
import { AdminPageHeader } from "../../components/ui/admin-page-header"
import { AdminButton } from "../../components/ui/admin-button"
import { Plus } from "lucide-react"

export default function NoticePage() {
    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="공지사항 관리"
                description="사용자에게 전달할 공지사항을 작성, 수정 및 삭제할 수 있습니다."
                action={
                    <AdminButton>
                        <Plus className="mr-2 h-4 w-4" />
                        새 공지사항
                    </AdminButton>
                }
            />
            <div className="text-slate-500 p-4 border border-dashed border-slate-300 rounded-lg text-center">
                공지사항 목록 영역 준비 중...
            </div>
        </div>
    )
}
