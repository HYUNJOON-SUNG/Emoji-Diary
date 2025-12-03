/**
 * ====================================================================================================
 * 관리자 세션 관리 유틸리티
 * ====================================================================================================
 * 
 * @description
 * 관리자 인증 세션 관리 (9.1 관리자 세션 관리)
 * - JWT 토큰 저장 및 관리
 * - 관리자 정보 저장
 * - 토큰 만료 자동 감지 및 로그아웃
 * 
 * @features
 * 1. JWT 토큰 관리 (9.1):
 *    - localStorage에 admin_jwt_token 저장
 *    - 토큰 유효성 검증
 *    - 토큰 만료 시 자동 로그아웃
 * 2. 관리자 정보 관리 (9.1):
 *    - 이름, 이메일, 권한 등 저장
 *    - localStorage에 admin_info 저장
 * 3. 자동 로그아웃 (9.1):
 *    - 토큰 만료 감지
 *    - 401 에러 발생 시 자동 처리
 * 
 * @data_storage (9.2 데이터 저장소)
 * - admin_jwt_token (localStorage): 관리자 JWT 토큰
 * - admin_info (localStorage): 관리자 정보 (id, name, email, role, department, lastLogin)
 * 
 * @note
 * 실제 구현 시 데이터베이스(MariaDB 등)에 저장됩니다.
 * 프로토타입에서 사용된 localStorage는 실제 구현 시 서버 데이터베이스로 대체됩니다.
 * 
 * ====================================================================================================
 */

// ========================================
// 관리자 정보 인터페이스 (9.1)
// ========================================
export interface AdminInfo {
  id: string;                  // 관리자 ID
  name: string;                // 관리자 이름
  email: string;               // 관리자 이메일
  role: string;                // 관리자 권한 (예: 'super_admin', 'admin')
  department?: string;         // 부서 (선택)
  lastLogin?: string;          // 마지막 로그인 시간
}

// ========================================
// JWT 토큰 저장 및 관리 (9.1)
// ========================================

/**
 * JWT 토큰 저장
 * 
 * @param token - JWT 토큰
 */
export function saveToken(token: string): void {
  localStorage.setItem('admin_jwt_token', token);
}

/**
 * JWT 토큰 가져오기
 * 
 * @returns JWT 토큰 또는 null
 */
export function getToken(): string | null {
  return localStorage.getItem('admin_jwt_token');
}

/**
 * JWT 토큰 삭제
 */
export function removeToken(): void {
  localStorage.removeItem('admin_jwt_token');
}

/**
 * JWT 토큰 유효성 검증
 * 
 * @returns 토큰 유효 여부
 */
export function hasValidToken(): boolean {
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  // TODO: JWT 토큰 파싱 및 만료 시간 검증
  // 현재는 토큰 존재 여부만 확인
  // 실제 구현 시:
  // 1. JWT 디코딩 (jwt-decode 라이브러리 사용)
  // 2. exp (만료 시간) 필드 확인
  // 3. 현재 시간과 비교
  
  try {
    // Mock validation - 실제로는 JWT 디코딩 필요
    return token.length > 0;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * JWT 토큰 만료 확인
 * 
 * @returns 토큰 만료 여부
 */
export function isTokenExpired(): boolean {
  const token = getToken();
  
  if (!token) {
    return true;
  }
  
  // TODO: JWT 토큰 만료 시간 확인
  // 실제 구현 시:
  // 1. jwt-decode 라이브러리로 토큰 디코딩
  // 2. exp 필드에서 만료 시간 추출
  // 3. 현재 시간과 비교
  
  // Mock implementation
  return false;
}

// ========================================
// 관리자 정보 저장 및 관리 (9.1)
// ========================================

/**
 * 관리자 정보 저장
 * 
 * @param adminInfo - 관리자 정보
 */
export function saveAdminInfo(adminInfo: AdminInfo): void {
  localStorage.setItem('admin_info', JSON.stringify(adminInfo));
}

/**
 * 관리자 정보 가져오기
 * 
 * @returns 관리자 정보 또는 null
 */
export function getAdminInfo(): AdminInfo | null {
  const adminInfoStr = localStorage.getItem('admin_info');
  
  if (!adminInfoStr) {
    return null;
  }
  
  try {
    return JSON.parse(adminInfoStr) as AdminInfo;
  } catch (error) {
    console.error('Failed to parse admin info:', error);
    return null;
  }
}

/**
 * 관리자 정보 삭제
 */
export function removeAdminInfo(): void {
  localStorage.removeItem('admin_info');
}

/**
 * 관리자 정보 업데이트
 * 
 * @param updates - 업데이트할 필드
 */
export function updateAdminInfo(updates: Partial<AdminInfo>): void {
  const currentInfo = getAdminInfo();
  
  if (!currentInfo) {
    console.warn('No admin info to update');
    return;
  }
  
  const updatedInfo: AdminInfo = {
    ...currentInfo,
    ...updates
  };
  
  saveAdminInfo(updatedInfo);
}

// ========================================
// 세션 관리 (9.1)
// ========================================

/**
 * 관리자 로그인 처리
 * 
 * @param token - JWT 토큰
 * @param adminInfo - 관리자 정보
 */
export function login(token: string, adminInfo: AdminInfo): void {
  // JWT 토큰 저장
  saveToken(token);
  
  // 관리자 정보 저장 (마지막 로그인 시간 추가)
  const infoWithLogin: AdminInfo = {
    ...adminInfo,
    lastLogin: new Date().toISOString()
  };
  saveAdminInfo(infoWithLogin);
  
  console.log('[Session] Admin logged in:', adminInfo.email);
}

/**
 * 관리자 로그아웃 처리 (9.1)
 * 
 * @description
 * - JWT 토큰 삭제
 * - 관리자 정보 삭제
 * - localStorage 완전 초기화
 */
export function logout(): void {
  // JWT 토큰 삭제
  removeToken();
  
  // 관리자 정보 삭제
  removeAdminInfo();
  
  console.log('[Session] Admin logged out');
}

/**
 * 인증 상태 확인
 * 
 * @returns 인증 여부
 */
export function isAuthenticated(): boolean {
  return hasValidToken() && getAdminInfo() !== null;
}

/**
 * 토큰 만료 시 자동 로그아웃 (9.1)
 * 
 * @description
 * - 토큰 만료 감지
 * - 자동 로그아웃 처리
 * - 페이지 리로드
 */
export function handleTokenExpiration(): void {
  console.warn('[Session] Token expired - logging out');
  
  // 로그아웃 처리
  logout();
  
  // 페이지 리로드 (로그인 페이지로 이동)
  window.location.reload();
}

// ========================================
// API 요청 헤더 생성 (백엔드 연동용)
// ========================================

/**
 * API 요청 헤더 생성
 * 
 * @returns 인증 헤더가 포함된 Headers 객체
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * 인증된 API 요청 (fetch wrapper)
 * 
 * @param url - API 엔드포인트
 * @param options - fetch 옵션
 * @returns fetch Response
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // 인증 헤더 추가
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // 401 Unauthorized - 토큰 만료
  if (response.status === 401) {
    handleTokenExpiration();
    throw new Error('Authentication expired');
  }
  
  return response;
}

// ========================================
// 세션 타이머 (선택 사항)
// ========================================

/**
 * 세션 만료 타이머 시작
 * 
 * @param expirationMinutes - 세션 만료 시간 (분)
 * @param onExpire - 만료 시 콜백
 */
export function startSessionTimer(
  expirationMinutes: number,
  onExpire: () => void
): NodeJS.Timeout {
  const expirationMs = expirationMinutes * 60 * 1000;
  
  return setTimeout(() => {
    console.warn('[Session] Session expired due to inactivity');
    onExpire();
    handleTokenExpiration();
  }, expirationMs);
}

/**
 * 세션 활동 갱신
 * 
 * @description
 * 사용자 활동이 있을 때 호출하여 세션 타이머 리셋
 */
export function refreshSession(): void {
  const adminInfo = getAdminInfo();
  
  if (adminInfo) {
    updateAdminInfo({
      lastLogin: new Date().toISOString()
    });
  }
}