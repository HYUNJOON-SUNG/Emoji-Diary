/**
 * 메인 라우터 컴포넌트
 * - 사용자 화면 (/user) 및 관리자 화면 (/admin) 라우팅 설정
 * - 기본 경로 리다이렉트 처리
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserApp from './UserApp';
import AdminApp from '@/features/admin/AdminApp';

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
        
        {/* 그 외 모든 경로는 /user로 리다이렉트 (404 처리) */}
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    </BrowserRouter>
  );
}