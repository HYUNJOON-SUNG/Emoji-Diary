/**
 * ========================================
 * 감정 일기 앱 - 메인 라우터 컴포넌트
 * ========================================
 * 
 * 라우팅 설정:
 * - /user: 사용자 화면 (기본)
 * - /admin: 관리자 화면
 * - /: 기본 URL은 /user로 리다이렉트
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserApp from './UserApp';
import AdminApp from './features/admin/AdminApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 URL은 /user로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/user" replace />} />
        
        {/* 사용자 화면 */}
        <Route path="/user/*" element={<UserApp />} />
        
        {/* 관리자 화면 */}
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}