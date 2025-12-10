/**
 * ====================================================================================================
 * 통계 카드 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 대시보드의 핵심 지표를 시각적으로 표시하는 카드 컴포넌트
 * - 유스케이스: 2.2 통계 카드 조회
 * - 플로우: 대시보드 플로우
 * 
 * @features
 * 1. 지표 제목 및 값 표시
 * 2. 이전 기간 대비 증감률 표시 (화살표 아이콘 + %)
 * 3. 색상 테마별 구분 (파란색/녹색/보라색/주황색)
 * 4. 아이콘으로 지표 유형 시각화
 * 5. 호버 시 그림자 효과 (인터랙션)
 * 
 * @props
 * - title: 지표 제목 (예: "전체 사용자 수")
 * - value: 지표 값 (예: "12,345")
 * - change: 이전 기간 대비 증감률 (예: "+12.5%")
 * - trend: 증감 방향 (up: 상승, down: 하락)
 * - icon: Lucide 아이콘 컴포넌트
 * - color: 카드 색상 테마
 * - description: 추가 설명 (선택사항)
 * 
 * @backend_requirements
 * - 이전 기간 대비 증감률 계산 로직
 * - 예: (현재값 - 이전값) / 이전값 * 100
 * 
 * ====================================================================================================
 */

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'indigo' | 'cyan' | 'orange' | 'red';
  description?: string;
  filter?: React.ReactNode;
}

export function MetricCard({ title, value, change, trend, icon: Icon, color, description, filter }: MetricCardProps) {
  // ========================================
  // 색상 테마 클래스 정의
  // ========================================
  /**
   * 각 지표별 색상 구분:
   * - blue: 전체 사용자 수
   * - green: 금일 작성된 일지
   * - purple: 주간 일지 수
   * - orange: 월간 일지 수
   */
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  const iconColorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className={`
      relative p-5 rounded-md border-2 ${colorClasses[color]}
      shadow-md hover:shadow-lg transition-shadow duration-200
    `}
      style={{
        // 그라데이션 배경 (스큐어모피즘 디자인)
        background: `linear-gradient(135deg, ${color === 'blue' ? 'rgba(239, 246, 255, 0.8)' :
          color === 'emerald' ? 'rgba(236, 253, 245, 0.8)' :
            color === 'indigo' ? 'rgba(238, 242, 255, 0.8)' :
              color === 'cyan' ? 'rgba(236, 254, 255, 0.8)' :
                color === 'orange' ? 'rgba(255, 247, 237, 0.8)' :
                  'rgba(254, 242, 242, 0.8)' // red
          } 0%, white 100%)`
      }}
    >
      {/* ========================================
          코너 접힌 효과 (종이 느낌)
          ======================================== */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-slate-200 opacity-50"></div>

      <div className="flex items-start justify-between">
        {/* ========================================
            지표 정보 영역
            ======================================== */}
        <div className="flex-1">
          {/* 지표 제목 */}
          <p className="text-slate-600 text-sm mb-2">{title}</p>

          {/* 지표 값 (메인 숫자) */}
          <p className="text-slate-900 text-3xl tracking-tight mb-1">{value}</p>

          {/* ========================================
              이전 기간 대비 증감률 표시
              ======================================== */}
          {/**
           * [백엔드 작업] 증감률 계산 로직
           * 
           * 예시:
           * - 현재 사용자 수: 12,345명
           * - 지난 달 사용자 수: 10,990명
           * - 증감률: (12345 - 10990) / 10990 * 100 = +12.3%
           * 
           * SQL 예시:
           * SELECT 
           *   (current_count - previous_count) / previous_count * 100 as change_rate,
           *   IF((current_count - previous_count) > 0, 'up', 'down') as trend
           * FROM statistics
           */}
          {/* 증감률이 있는 경우에만 표시 (change가 '-'가 아닌 경우) */}
          {change && change !== '-' && (
            <p className={`text-sm mb-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last month
            </p>
          )}

          {/* 추가 설명 (선택사항) */}
          {description && (
            <p className="text-xs text-slate-500 mt-2">{description}</p>
          )}
          {/* 필터 (선택사항) */}
          {filter && (
            <div className="mt-2">{filter}</div>
          )}
        </div>

        {/* ========================================
            아이콘 영역
            ======================================== */}
        {/**
         * 지표 유형을 시각적으로 표현하는 아이콘
         * - Users: 사용자 아이콘
         * - BookOpen: 일지 아이콘
         * - Calendar: 주간 아이콘
         * - TrendingUp: 상승 트렌드 아이콘
         */}
        <div className={`
          p-3 rounded-lg ${iconColorClasses[color]}
          shadow-sm
        `}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

/**
 * ====================================================================================================
 * 사용 예시
 * ====================================================================================================
 * 
 * import { Users } from 'lucide-react';
 * import { MetricCard } from './metric-card';
 * 
 * <MetricCard
 *   title="전체 사용자 수"
 *   value="12,345"
 *   change="+12.5%"
 *   trend="up"
 *   icon={Users}
 *   color="blue"
 *   description="등록된 전체 사용자"
 * />
 * 
 * ====================================================================================================
 */
