/**
 * ====================================================================================================
 * 일지 작성 추이 차트 컴포넌트 (Bar Chart)
 * ====================================================================================================
 * 
 * @description
 * 기간별 일지 작성 개수 추이를 막대 그래프로 시각화하는 컴포넌트
 * - 유스케이스: 2.4 일지 작성 추이 차트 조회
 * - 플로우: 대시보드 플로우
 * 
 * @features
 * 1. 일지 작성 개수 추이 막대 그래프 (Bar Chart)
 * 2. X축: 날짜 (일별/주별/월별)
 * 3. Y축: 작성된 일지 개수
 * 4. 기간 필터에 따라 표시 단위 자동 변경:
 *    - 주간: 최근 7일 또는 선택한 주의 일별 추이 (월~일)
 *    - 월간: 선택한 월의 주별 추이 (1~4주차)
 *    - 연간: 월별 추이 (1월~12월)
 * 5. 차트 상호작용:
 *    - 데이터 포인트 호버 → 해당 기간의 일지 개수 툴팁 표시
 * 6. 주요 통계 요약 (최고 기록/일일 평균/총 합계)
 * 
 * @data_source
 * - [백엔드 작업] Database에서 기간별로 GROUP BY하여 집계
 * 
 * @props
 * - data: 기간별 일지 작성 데이터 배열
 *   [{ day: "월", diaries: 245 }]
 * 
 * ====================================================================================================
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyData {
  day: string;          // 기간 레이블 (예: "월", "1일", "1월")
  diaries: number;      // 해당 기간의 총 일지 수
}

interface WeeklyDiaryChartProps {
  data: WeeklyData[];
}

export function WeeklyDiaryChart({ data }: WeeklyDiaryChartProps) {
  return (
    <div>
      {/* ========================================
          단순 막대 차트 영역
          ======================================== */}
      {/**
       * Recharts 라이브러리 사용
       * - BarChart: 막대 차트 컴포넌트
       * - Bar: 일지 개수 막대
       * - X축: 날짜 (일별/주별/월별)
       * - Y축: 일지 개수
       */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          {/* 그리드 라인 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          
          {/* ========================================
              X축 (기간)
              ======================================== */}
          {/**
           * 기간에 따라 표시되는 레이블:
           * - 주간: "월", "화", "수", "목", "금", "토", "일"
           * - 월간: "1일", "2일", ..., "31일"
           * - 연간: "1월", "2월", ..., "12월"
           */}
          <XAxis 
            dataKey="day" 
            stroke="#64748b"
            style={{ fontSize: '13px' }}
          />
          
          {/* ========================================
              Y축 (일지 개수)
              ======================================== */}
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            label={{ 
              value: '일지 수', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#64748b' }
            }}
          />
          
          {/* ========================================
              Tooltip (호버 시 상세 정보)
              ======================================== */}
          {/**
           * 마우스 호버 시 해당 기간의 일지 개수 표시
           * 예: "월요일: 245건"
           */}
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            formatter={(value: number) => [`${value}건`, '일지 수']}
            labelFormatter={(label) => `${label}`}
          />
          
          {/* ========================================
              막대 그래프
              ======================================== */}
          {/**
           * 단일 막대로 일지 개수 표시
           * - 그라데이션 색상 (slate 계열)
           * - 호버 시 색상 변경 효과
           */}
          <Bar 
            dataKey="diaries" 
            fill="url(#barGradient)"
            radius={[8, 8, 0, 0]}
          />
          
          {/* 막대 그라데이션 정의 */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#64748b" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      {/* ========================================
          주요 통계 요약 영역
          ======================================== */}
      {/**
       * 기간 내 주요 통계를 3개 카드로 표시
       * 1. 최고 일지 수: 가장 많이 작성된 날의 일지 수
       * 2. 일일 평균: 전체 일지 수 / 기간 수
       * 3. 총 합계: 전체 일지 수
       */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {/* 최고 일지 수 */}
        <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-md border-2 border-green-200 text-center">
          <p className="text-green-600 text-xs mb-1">최고 기록</p>
          <p className="text-green-900 text-xl font-bold">
            {Math.max(...data.map(d => d.diaries))}건
          </p>
        </div>
        
        {/* 일일 평균 */}
        <div className="p-3 bg-gradient-to-br from-blue-50 to-sky-50 rounded-md border-2 border-blue-200 text-center">
          <p className="text-blue-600 text-xs mb-1">일일 평균</p>
          <p className="text-blue-900 text-xl font-bold">
            {Math.round(data.reduce((sum, d) => sum + d.diaries, 0) / data.length)}건
          </p>
        </div>
        
        {/* 총 합계 */}
        <div className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-md border-2 border-purple-200 text-center">
          <p className="text-purple-600 text-xs mb-1">총 합계</p>
          <p className="text-purple-900 text-xl font-bold">
            {data.reduce((sum, d) => sum + d.diaries, 0).toLocaleString()}건
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * ====================================================================================================
 * 백엔드 데이터 집계 예시 (SQL)
 * ====================================================================================================
 * 
 * -- 주간 데이터 (최근 7일 또는 선택한 주의 월~일)
 * SELECT 
 *   CASE DAYOFWEEK(created_at)
 *     WHEN 1 THEN '일'
 *     WHEN 2 THEN '월'
 *     WHEN 3 THEN '화'
 *     WHEN 4 THEN '수'
 *     WHEN 5 THEN '목'
 *     WHEN 6 THEN '금'
 *     WHEN 7 THEN '토'
 *   END as day,
 *   COUNT(*) as diaries
 * FROM diaries
 * WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
 * GROUP BY DAYOFWEEK(created_at)
 * ORDER BY DAYOFWEEK(created_at);
 * 
 * 
 * -- 월간 데이터 (선택한 월의 주별 추이)
 * SELECT 
 *   CONCAT(WEEK(created_at, 1) - WEEK(DATE_SUB(created_at, INTERVAL DAY(created_at) - 1 DAY), 1) + 1, '주차') as day,
 *   COUNT(*) as diaries
 * FROM diaries
 * WHERE 
 *   YEAR(created_at) = 2025 
 *   AND MONTH(created_at) = 11
 * GROUP BY WEEK(created_at, 1) - WEEK(DATE_SUB(created_at, INTERVAL DAY(created_at) - 1 DAY), 1) + 1
 * ORDER BY WEEK(created_at, 1) - WEEK(DATE_SUB(created_at, INTERVAL DAY(created_at) - 1 DAY), 1) + 1;
 * 
 * 
 * -- 연간 데이터 (월별 추이)
 * SELECT 
 *   CONCAT(MONTH(created_at), '월') as day,
 *   COUNT(*) as diaries
 * FROM diaries
 * WHERE YEAR(created_at) = YEAR(NOW())
 * GROUP BY MONTH(created_at)
 * ORDER BY MONTH(created_at);
 * 
 * ====================================================================================================
 * 
 * 차트 상호작용 가이드
 * ====================================================================================================
 * 
 * 1. 호버 이벤트:
 *    - 사용자가 막대에 마우스를 올리면 Tooltip 표시
 *    - "월요일: 245건" 형식으로 표시
 * 
 * 2. 반응형 디자인:
 *    - ResponsiveContainer로 부모 크기에 자동 맞춤
 *    - 모바일에서도 가독성 유지
 * 
 * 3. 시각적 효과:
 *    - 막대 상단 모서리 둥글게 (radius)
 *    - 그라데이션 색상으로 입체감 표현
 * 
 * ====================================================================================================
 */