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
 *    - localStorage에 admin_access_token 저장 (명세서 1.1)
 *    - localStorage에 admin_refresh_token 저장 (명세서 1.1)
 *    - 토큰 유효성 검증
 *    - 토큰 만료 시 자동 로그아웃
 * 2. 관리자 정보 관리 (9.1):
 *    - 이름, 이메일, 권한 등 저장
 *    - localStorage에 admin_info 저장
 * 3. 자동 로그아웃 (9.1):
 *    - 토큰 만료 감지
 *    - 401 에러 발생 시 자동 처리
 * 
 * @data_storage (9.2 데이터 저장소, 명세서 1.1)
 * - admin_access_token (localStorage): 관리자 Access Token (명세서 1.1)
 * - admin_refresh_token (localStorage): 관리자 Refresh Token (명세서 1.1)
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
 * JWT 토큰 저장 (명세서 1.1)
 * 
 * @param token - 관리자 Access Token
 * @description
 * 명세서 1.1에 따라 localStorage에 admin_access_token으로 저장합니다.
 */
export function saveToken(token: string): void {
  localStorage.setItem('admin_access_token', token);
}

/**
 * JWT 토큰 가져오기 (명세서 1.1)
 * 
 * @returns 관리자 Access Token 또는 null
 * @description
 * 명세서 1.1에 따라 localStorage에서 admin_access_token을 가져옵니다.
 */
export function getToken(): string | null {
  return localStorage.getItem('admin_access_token');
}

/**
 * JWT 토큰 삭제 (명세서 1.1)
 * @description
 * 명세서 1.1에 따라 localStorage에서 admin_access_token을 삭제합니다.
 */
export function removeToken(): void {
  localStorage.removeItem('admin_access_token');
}

/**
 * JWT 토큰 디코딩 (Base64 디코딩만 수행, 서명 검증은 백엔드에서 수행)
 * 
 * @param token - JWT 토큰
 * @returns 디코딩된 페이로드 또는 null
 */
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Base64 URL 디코딩
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 디코딩 오류:', error);
    return null;
  }
}

/**
 * JWT 토큰 유효성 검증
 * 
 * [API 명세서 참고]
 * - JWT 토큰의 서명 검증은 백엔드에서 수행됩니다.
 * - 프론트엔드에서는 토큰 존재 여부와 만료 시간만 확인합니다.
 * 
 * @returns 토큰 유효 여부
 */
export function hasValidToken(): boolean {
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  try {
    const payload = decodeJwtPayload(token);
    if (!payload) {
      return false;
    }
    
    // exp (만료 시간) 필드 확인
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // 초를 밀리초로 변환
      const currentTime = Date.now();
      
      // 만료 시간이 현재 시간보다 작으면 만료됨
      if (expirationTime < currentTime) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * JWT 토큰 만료 확인
 * 
 * [API 명세서 참고]
 * - JWT 토큰의 exp 필드를 확인하여 만료 여부를 판단합니다.
 * - 서명 검증은 백엔드에서 수행됩니다.
 * 
 * @returns 토큰 만료 여부
 */
export function isTokenExpired(): boolean {
  const token = getToken();
  
  if (!token) {
    return true;
  }
  
  try {
    const payload = decodeJwtPayload(token);
    if (!payload) {
      return true;
    }
    
    // exp (만료 시간) 필드 확인
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // 초를 밀리초로 변환
      const currentTime = Date.now();
      
      // 만료 시간이 현재 시간보다 작으면 만료됨
      return expirationTime < currentTime;
    }
    
    // exp 필드가 없으면 만료되지 않은 것으로 간주 (백엔드에서 검증)
    return false;
  } catch (error) {
    console.error('Token expiration check error:', error);
    return true;
  }
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