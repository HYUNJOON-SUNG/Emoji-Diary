import { Routes, Route, Navigate } from "react-router-dom"
import { AdminAuthProvider, useAdminAuth } from "./contexts/admin-auth-context"
import { AdminLayout } from "./components/layout/admin-layout"
import AdminLoginPage from "./pages/auth/login-page"
import DashboardPage from "./pages/dashboard/dashboard-page"
import NoticeListPage from "./pages/notices/notice-list-page"
import NoticeFormPage from "./pages/notices/notice-form-page"
import { NoticeDetailPage } from "./pages/notices/notice-detail-page"
import SettingsPage from "./pages/settings/settings-page"
import LogsPage from "./pages/logs/logs-page"

import "./index.css"

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <AdminLayout />
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="notices" element={<NoticeListPage />} />
          <Route path="notices/new" element={<NoticeFormPage />} />
          <Route path="notices/:id" element={<NoticeDetailPage />} />
          <Route path="notices/:id/edit" element={<NoticeFormPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="logs" element={<LogsPage />} />

          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  )
}
