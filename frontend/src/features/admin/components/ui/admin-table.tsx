import * as React from "react"
import { cn } from "@/shared/lib/utils"

/**
 * ====================================================================================================
 * AdminTable 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자 페이지 전용 데이터 테이블(Data Grid) 컴포넌트
 * - shadcn/ui Table 기반 커스터마이징
 * - 헤더 고정, 행 호버 효과, 체크박스 지원 등의 스타일 적용
 * 
 * @components
 * - AdminTable: 테이블 컨테이너 (스크롤 가능)
 * - AdminTableHeader, AdminTableBody, AdminTableFooter: 섹션 구분
 * - AdminTableRow, AdminTableHead, AdminTableCell: 행/열 정의
 * 
 * ====================================================================================================
 */

const AdminTable = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="w-full overflow-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <table
            ref={ref}
            className={cn("w-full caption-bottom text-sm", className)}
            {...props}
        />
    </div>
))
AdminTable.displayName = "AdminTable"

const AdminTableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
AdminTableHeader.displayName = "AdminTableHeader"

const AdminTableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
    />
))
AdminTableBody.displayName = "AdminTableBody"

const AdminTableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            "border-t bg-slate-100/50 font-medium [&>tr]:last:border-b-0",
            className
        )}
        {...props}
    />
))
AdminTableFooter.displayName = "AdminTableFooter"

const AdminTableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            "border-b border-slate-100 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100",
            className
        )}
        {...props}
    />
))
AdminTableRow.displayName = "AdminTableRow"

const AdminTableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
))
AdminTableHead.displayName = "AdminTableHead"

const AdminTableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
    />
))
AdminTableCell.displayName = "AdminTableCell"

const AdminTableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-slate-500", className)}
        {...props}
    />
))
AdminTableCaption.displayName = "AdminTableCaption"

export {
    AdminTable,
    AdminTableHeader,
    AdminTableBody,
    AdminTableFooter,
    AdminTableHead,
    AdminTableRow,
    AdminTableCell,
    AdminTableCaption,
}
