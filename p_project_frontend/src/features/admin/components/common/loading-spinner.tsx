/**
 * ====================================================================================================
 * 로딩 스피너 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 공통 로딩 상태 표시 컴포넌트
 * - 유스케이스: 8.3 에러 처리 및 로딩 상태
 * 
 * @features
 * 1. 로딩 스피너:
 *    - 중앙 정렬
 *    - 애니메이션
 *    - 커스터마이징 가능 (크기, 색상, 메시지)
 * 2. 사용 예시:
 *    - 페이지 전체 로딩
 *    - 섹션별 로딩
 *    - 버튼 로딩
 * 
 * ====================================================================================================
 */

import { Loader2 } from 'lucide-react';

// ========================================
// Props 타입 정의
// ========================================
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';      // 스피너 크기
  message?: string;                      // 로딩 메시지
  fullScreen?: boolean;                  // 전체 화면 로딩 여부
  className?: string;                    // 추가 CSS 클래스
}

// ========================================
// 크기 매핑
// ========================================
const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

/**
 * 로딩 스피너 컴포넌트 (8.3)
 */
export function LoadingSpinner({ 
  size = 'md', 
  message, 
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const spinnerSize = SIZE_MAP[size];

  // 전체 화면 로딩
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className={`${SIZE_MAP.lg} text-blue-600 mx-auto mb-4 animate-spin`} />
          {message && (
            <p className="text-slate-600">{message}</p>
          )}
        </div>
      </div>
    );
  }

  // 일반 로딩 (중앙 정렬)
  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="text-center">
        <Loader2 className={`${spinnerSize} text-blue-600 mx-auto mb-4 animate-spin`} />
        {message && (
          <p className="text-slate-600">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * 인라인 로딩 스피너 (버튼 내부용)
 */
export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const spinnerSize = SIZE_MAP[size];
  return <Loader2 className={`${spinnerSize} animate-spin`} />;
}

/**
 * 섹션 로딩 (카드 내부용)
 */
export function SectionLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12 bg-slate-50 rounded-lg">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-blue-600 mx-auto mb-3 animate-spin" />
        {message && (
          <p className="text-slate-600 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}
