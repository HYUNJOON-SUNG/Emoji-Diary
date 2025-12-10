/**
 * ====================================================================================================
 * 관리자 로그인 페이지 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자 인증을 위한 로그인 페이지
 * - 유스케이스: 1.1 관리자 로그인
 * - 플로우: 관리자 인증 플로우
 * 
 * @features
 * 1. 관리자 ID(이메일) 입력 필드
 *    - 실시간 검증 없음
 *    - 클라이언트 검증 없음 (서버에서만 검증)
 * 2. 비밀번호 입력 필드
 *    - 표시/숨김 토글 기능 (Eye/EyeOff 아이콘)
 *    - 실시간 검증 없음
 * 3. 로그인 버튼
 *    - 클라이언트 검증 없이 즉시 관리자 로그인 API 호출
 *    - 로딩 상태 표시 ("로그인 중...")
 * 4. 통합 에러 메시지 표시
 *    - 필드별 에러 메시지 없음
 *    - 서버에서 반환한 하나의 통합 메시지만 표시
 * 5. 로그인 시도 이력 자동 기록
 *    - 성공/실패 모두 기록
 *    - 에러 로그에 저장
 * 
 * @flow (1.1 관리자 로그인)
 * 1. 관리자 ID (이메일) 입력 - 실시간 검증 없음
 * 2. 비밀번호 입력 - 실시간 검증 없음
 * 3. "로그인" 버튼 클릭 - 클라이언트 검증 없이 즉시 API 호출
 * 4. 로딩 상태 표시 ("로그인 중...")
 * 5-1. 로그인 성공 시:
 *      - 관리자 Access Token 및 Refresh Token 생성 및 localStorage 저장 (명세서 1.1)
 *        - admin_access_token: 관리자 Access Token
 *        - admin_refresh_token: 관리자 Refresh Token
 *      - 관리자 정보 저장
 *      - 서비스 통계 화면으로 이동 (명세서 1.1)
 * 5-2. 로그인 실패 시:
 *      - 서버 검증 (이메일 형식, 빈 필드, 비밀번호 불일치, 관리자 권한 등)
 *      - 하단에 통합 에러 메시지 표시
 *      - 예: "ID 또는 비밀번호가 일치하지 않거나 관리자 권한이 없습니다."
 * 6. 모든 로그인 시도는 에러 로그에 기록 (보안 목적)
 * 
 * @backend_requirements
 * - POST /api/admin/login
 *   Request: { email: string, password: string }
 *   Response (성공): { 
 *     success: true, 
 *     token: string, 
 *     user: { id, email, name, role } 
 *   }
 *   Response (실패): { 
 *     success: false, 
 *     message: "ID 또는 비밀번호가 일치하지 않거나 관리자 권한이 없습니다." 
 *   }
 * 
 * - 서버 검증 사항:
 *   1. 이메일 형식 검증
 *   2. 빈 필드 검증
 *   3. 비밀번호 일치 여부 확인 (bcrypt 해시 비교)
 *   4. 관리자 권한 확인 (role === 'admin' 또는 'super_admin')
 *   5. 계정 잠금 상태 확인
 *   6. 로그인 시도 횟수 제한 (예: 5회 실패 시 10분간 잠금)
 * 
 * - JWT 토큰 생성 및 발급
 * - 로그인 시도 이력 Database 저장 (성공/실패, IP, UserAgent, 시간 등)
 * 
 * @security
 * - 일반 사용자 계정으로는 접근 불가 (관리자 권한 필수)
 * - 로그인 시도 모니터링 및 기록
 * - JWT 토큰을 localStorage에 저장 (실제 환경에서는 httpOnly Cookie 권장)
 * 
 * ====================================================================================================
 */

import { useState } from 'react';
import { Lock, Mail, Shield, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => { success: boolean; message?: string };
}

export function LoginPage({ onLogin }: LoginPageProps) {
  // ========================================
  // State 관리
  // ========================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // 통합 에러 메시지 (필드별 에러 없음)
  const [isLoading, setIsLoading] = useState(false); // 로그인 중 상태
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 표시/숨김 토글

  // ========================================
  // 로그인 처리 함수
  // ========================================
  /**
   * 플로우: 1.1 관리자 로그인
   * 
   * 1. 사용자가 이메일과 비밀번호 입력
   * 2. "로그인" 버튼 클릭
   * 3. 클라이언트 검증 없이 즉시 API 호출
   * 4. 로딩 상태 표시 ("로그인 중...")
   * 5-1. 성공 시: JWT 토큰 저장 및 대시보드 이동
   * 5-2. 실패 시: 통합 에러 메시지 표시
   * 6. 모든 로그인 시도는 에러 로그에 기록
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // 기존 에러 메시지 초기화
    setIsLoading(true); // 로딩 상태 시작

    // [API 명세서 Section 10.1.1]
    // POST /api/admin/auth/login
    // 백엔드가 로그인 시도 이력을 자동으로 기록합니다 (IP 주소, User Agent 등)
    try {
      const result = await onLogin(email, password);
      
      if (!result.success) {
        // 통합 에러 메시지 표시 (필드별 에러 없음)
        setError(result.message || 'ID 또는 비밀번호가 일치하지 않거나 관리자 권한이 없습니다.');
      }
      // 성공 시 onLogin에서 처리 (AdminApp.tsx의 handleLogin)
    } catch (error: any) {
      console.error('로그인 처리 중 오류:', error);
      setError('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center p-6">
      {/* 배경 패턴 (스큐어모피즘 디자인) */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.05) 10px,
            rgba(255,255,255,0.05) 20px
          )`
        }}></div>
      </div>

      {/* 로그인 카드 */}
      <div className="relative w-full max-w-md">
        {/* 클립보드 클립 효과 (스큐어모피즘) */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-12 bg-slate-600 rounded-full shadow-xl border-2 border-slate-500 z-10"></div>
        
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-slate-200">
          {/* ========================================
              헤더 섹션
              ======================================== */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-8 py-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <Shield className="w-8 h-8 text-slate-700" />
              </div>
            </div>
            <h1 className="text-white text-2xl tracking-tight">관리자 로그인</h1>
            <p className="text-slate-200 text-sm mt-2">Admin Authentication</p>
          </div>

          {/* ========================================
              폼 컨테이너 (종이 질감 배경)
              ======================================== */}
          <div className="relative px-8 py-8"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 23px, rgba(226, 232, 240, 0.2) 24px),
                linear-gradient(90deg, transparent 23px, rgba(226, 232, 240, 0.1) 24px)
              `,
              backgroundSize: '24px 24px'
            }}
          >
            <div className="relative bg-white/90 rounded-lg p-6 border border-slate-200 shadow-sm">
              {/* ========================================
                  로그인 폼
                  ======================================== */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 
                  관리자 ID (이메일) 입력 필드
                  - type="text"로 설정하여 브라우저 기본 검증 제거
                  - required 속성 없음 (서버에서만 검증)
                  - 실시간 검증 없음
                */}
                <div>
                  <label htmlFor="email" className="block text-slate-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    관리자 ID (이메일)
                  </label>
                  <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-md focus:outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200 transition-all"
                    placeholder="admin@example.com"
                  />
                </div>

                {/* 
                  비밀번호 입력 필드
                  - 표시/숨김 토글 버튼 제공
                  - Eye/EyeOff 아이콘으로 상태 표시
                  - required 속성 없음 (서버에서만 검증)
                */}
                <div>
                  <label htmlFor="password" className="block text-slate-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    비밀번호
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-md focus:outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200 transition-all"
                      placeholder="••••••••"
                    />
                    {/* 비밀번호 표시/숨김 토글 버튼 */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-700 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 
                  통합 에러 메시지
                  - 필드별 에러 메시지 없음
                  - 하나의 통합 메시지만 표시
                  - 서버에서 반환한 메시지 그대로 표시
                */}
                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-300 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* 
                  로그인 버튼
                  - 로딩 상태: "로그인 중..." 표시
                  - 로딩 중에는 disabled 처리 (중복 제출 방지)
                */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-600 text-white py-3 rounded-md hover:from-slate-800 hover:to-slate-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>

              {/* 보안 안내 메시지 */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-slate-500 text-xs text-center">
                  관리자 로그인 시도는 보안을 위해 모니터링되고 기록됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 안내 메시지 */}
        <div className="mt-6 text-center">
          <p className="text-slate-300 text-sm">
            일반 사용자 로그인과 별도로 관리됩니다
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * ====================================================================================================
 * Cursor AI 적용 가이드
 * ====================================================================================================
 * 
 * 1. API 연동:
 * 
 * import axios from 'axios';
 * 
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   setError('');
 *   setIsLoading(true);
 * 
 *   try {
 *     const response = await axios.post('/api/admin/login', {
 *       email,
 *       password
 *     });
 * 
 *     if (response.data.success) {
 *       // JWT 토큰 저장
 *       localStorage.setItem('admin_access_token', response.data.accessToken);
 *       localStorage.setItem('admin_refresh_token', response.data.refreshToken);
 *       
 *       // 사용자 정보 저장
 *       localStorage.setItem('admin_user', JSON.stringify(response.data.user));
 *       
 *       // 대시보드로 이동 (onLogin 콜백에서 처리)
 *       onLogin(email, password);
 *     }
 *   } catch (error: any) {
 *     if (error.response) {
 *       setError(error.response.data.message);
 *     } else {
 *       setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
 *     }
 *   } finally {
 *     setIsLoading(false);
 *   }
 * };
 * 
 * 
 * 2. 환경변수 설정:
 * 
 * .env.local 파일에 추가:
 * NEXT_PUBLIC_API_URL=http://localhost:3000/api
 * 
 * 
 * 3. Axios 인터셉터 설정 (JWT 토큰 자동 첨부):
 * 
 * axios.interceptors.request.use(
 *   (config) => {
 *     const token = localStorage.getItem('admin_access_token');
 *     if (token) {
 *       config.headers.Authorization = `Bearer ${token}`;
 *     }
 *     return config;
 *   },
 *   (error) => Promise.reject(error)
 * );
 * 
 * ====================================================================================================
 */