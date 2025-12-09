/**
 * ========================================
 * 감정 차트 뷰 컴포넌트 (EmotionChartView)
 * ========================================
 * 
 * 주요 기능 (플로우 7.5):
 * - 감정 변화 추이 그래프 표시 (선 그래프 또는 막대 그래프)
 * - 기간 선택: 주간/월간 단위 전환
 * - 감정별 색상으로 구분
 * - 그래프 데이터 포인트 호버 시 툴팁 표시
 * - 감정 통계 요약 (가장 많이 느낀 감정 TOP 5)
 * 
 * 플로우 7.5 요구사항:
 * 
 * 좌측 페이지:
 * - 기간 선택: 주간/월간 단위 전환 버튼
 * - "주간" 선택: 최근 7일 감정 분포
 * - "월간" 선택: 최근 30일 감정 분포
 * - 감정 변화 추이 그래프 표시 (막대 그래프 또는 선 그래프)
 * - X축: 날짜 (일별 또는 주별)
 * - Y축: 감정 발생 빈도
 * - 각 감정별 색상으로 구분
 * - 그래프 데이터 포인트 호버 → 해당 날짜 감정 정보 툴팁 표시
 * 
 * 우측 페이지 (EmotionStatsPage에서 렌더링):
 * - 감정 통계 요약: 가장 많이 느낀 감정
 * - 감정별 발생 빈도 (개수)
 * - 감정 색상 범례
 * - 차트 읽는 방법 안내
 * 
 * [API 명세서 Section 5.2.2]
 * - 엔드포인트: GET /api/statistics/emotion-trend
 * - Query Parameters: period (weekly, monthly), year, month
 * - 응답: { period, dates, emotions } (날짜별 감정 데이터)
 * - 실제 API 호출로 구현됨 (diaryApi.ts의 fetchChartStats 함수 사용)
 * 
 * 디자인:
 * - 파란색 톤온톤 컬러
 * - Recharts 라이브러리 사용
 */

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchChartStats, ChartDataPoint } from '../../services/diaryApi';

/**
 * 차트 타입 정의
 * - line: 선 그래프
 * - bar: 막대 그래프
 */
type ChartType = 'line' | 'bar';

/**
 * 기간 타입 정의 (플로우 7.5)
 * - weekly: 주간 (최근 7일)
 * - monthly: 월간 (최근 30일)
 */
type PeriodType = 'weekly' | 'monthly';

/**
 * 감정 차트 색상 팔레트 (파란색 톤온톤)
 * 
 * 디자인 가이드:
 * - 파란색 계열로 통일
 * - 각 감정별로 구분 가능한 색상
 */
const emotionChartColors: { [key: string]: string } = {
  happy: '#38bdf8', // sky
  love: '#3b82f6', // blue
  excited: '#6366f1', // indigo
  calm: '#06b6d4', // cyan
  grateful: '#14b8a6', // teal
  hopeful: '#0ea5e9', // sky
  tired: '#64748b', // slate
  sad: '#3b82f6', // blue
  angry: '#6366f1', // indigo
  anxious: '#22d3ee', // cyan
  neutral: '#78716c', // stone
};

/**
 * 감정 라벨 매핑 (한글)
 * - 영문 키 → 한글 라벨 변환
 */
const emotionLabels: { [key: string]: string } = {
  happy: '행복',
  love: '사랑',
  excited: '설렘',
  calm: '평온',
  grateful: '감사',
  hopeful: '희망',
  tired: '피곤',
  sad: '슬픔',
  angry: '화남',
  anxious: '불안',
  neutral: '평온',
};

export function EmotionChartView() {
  // ========== 상태 관리 ==========
  
  /**
   * 차트 타입 (플로우 7.5)
   * - line: 선 그래프
   * - bar: 막대 그래프
   */
  const [chartType, setChartType] = useState<ChartType>('line');
  
  /**
   * 기간 타입 (플로우 7.5)
   * - weekly: 주간 (최근 7일)
   * - monthly: 월간 (최근 30일)
   */
  const [periodType, setPeriodType] = useState<PeriodType>('weekly');
  
  /**
   * 차트 데이터
   * - 날짜별 감정 빈도 데이터
   */
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  
  /**
   * 로딩 상태
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * 에러 메시지
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * 기간 변경 시 데이터 로드 (플로우 7.5)
   * 
   * [API 명세서 Section 5.2.2]
   * - 엔드포인트: GET /api/statistics/emotion-trend
   * - Query Parameters: period (weekly, monthly), year, month
   * - 응답: { period, dates, emotions } (날짜별 감정 데이터)
   * - 실제 API 호출로 구현됨 (diaryApi.ts의 fetchChartStats 함수 사용)
   * 
   * 동작:
   * - 주간/월간 전환 시 자동으로 데이터 재로드
   */
  useEffect(() => {
    loadChartData();
  }, [periodType]);

  /**
   * 차트 데이터 로드 (플로우 7.5)
   * 
   * [API 명세서 Section 5.2.2]
   * - 엔드포인트: GET /api/statistics/emotion-trend
   * - Query Parameters: period (weekly, monthly), year, month
   * - 응답: { period, dates, emotions } (날짜별 감정 데이터)
   * - 실제 API 호출로 구현됨 (diaryApi.ts의 fetchChartStats 함수 사용)
   * 
   * [ERD 설계서 참고 - Diaries 테이블]
   * - emotions 배열의 각 항목은 Diaries 테이블의 레코드
   * - date: Diaries.date (DATE, YYYY-MM-DD 형식)
   * - emotion: Diaries.emotion (ENUM: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
   * - KoBERT가 일기 본문(content)만 분석하여 자동으로 저장
   * - 인덱스: idx_diaries_emotion_date (통계 조회 최적화)
   * 
   * 기간 계산:
   * - weekly: 최근 7일 (오늘 포함)
   * - monthly: 최근 30일 (오늘 포함)
   */
  const loadChartData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // [API 명세서 Section 5.2.2] GET /api/statistics/emotion-trend
      // period: 'weekly' | 'monthly', year: number, month?: number (월간 조회 시 필수)
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 1-12
      
      // fetchChartStats는 내부적으로 API를 호출하므로 year, month를 전달
      // 하지만 함수 시그니처가 startDate, endDate를 받으므로 유지
      const endDate = new Date();
      const startDate = new Date();
      
      if (periodType === 'weekly') {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        // 월간: 현재 월의 첫날부터 오늘까지
        startDate.setDate(1);
      }
      
      const startStr = formatDateString(startDate);
      const endStr = formatDateString(endDate);
      
      const data = await fetchChartStats(startStr, endStr, periodType);
      setChartData(data);
    } catch (err) {
      setError('통계 데이터를 불러오는 데 실패했습니다.');
      console.error('Failed to load chart data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 날짜를 YYYY-MM-DD 형식으로 포맷
   */
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * 감정 분포 통계 계산 (플로우 7.5)
   * 
   * 계산 내용:
   * - 전체 기간 중 각 감정별 발생 빈도 합계
   * - 빈도가 높은 순으로 정렬
   * - 상위 5개 감정만 반환
   * 
   * 플로우 7.5 요구사항:
   * - 우측 페이지: 전체 기간 중 가장 많이 느낀 감정
   * - 감정별 발생 빈도 (개수)
   */
  const getEmotionDistribution = () => {
    const totals: { [key: string]: number } = {};
    
    // 전체 데이터 포인트를 순회하며 감정별 합계 계산
    chartData.forEach(dataPoint => {
      Object.keys(emotionChartColors).forEach(emotion => {
        if (!totals[emotion]) totals[emotion] = 0;
        totals[emotion] += dataPoint[emotion as keyof ChartDataPoint] as number;
      });
    });
    
    // 빈도가 높은 순으로 정렬하고 상위 5개만 반환
    return Object.entries(totals)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 emotions
  };

  /**
   * 커스텀 툴팁 컴포넌트 (플로우 7.5)
   * 
   * 표시 내용:
   * - 날짜 (라벨)
   * - 해당 날짜의 감정 정보 (감정명: 발생 빈도)
   * 
   * 플로우 7.5 요구사항:
   * - 그래프 데이터 포인트 호버 → 해당 날짜의 감정 정보 툴팁 표시
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg border border-stone-300">
          {/* 날짜 표시 */}
          <p className="text-sm text-stone-800 mb-2">{label}</p>
          
          {/* 감정별 빈도 표시 (값이 0보다 큰 것만) */}
          {payload
            .filter((entry: any) => entry.value > 0)
            .map((entry: any) => (
              <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
                {emotionLabels[entry.dataKey]}: {entry.value}회
              </p>
            ))}
        </div>
      );
    }
    return null;
  };

  /**
   * 차트 렌더링 (플로우 7.5)
   * 
   * 표시 내용:
   * - X축: 날짜 (일별 또는 주별)
   * - Y축: 감정 발생 빈도
   * - 각 감정별 색상으로 구분
   * - 선 그래프 또는 막대 그래프
   * 
   * 인터랙션:
   * - 데이터 포인트 호버 → CustomTooltip 표시
   * 
   * 플로우 7.5 요구사항:
   * - 감정 변화 추이 그래프 표시
   * - 막대 그래프 또는 선 그래프로 감정 변화 추이 표시
   * - X축: 날짜 (일별 또는 주별)
   * - Y축: 감정 발생 빈도
   * - 각 감정별 색상으로 구분
   */
  const renderChart = () => {
    // 데이터가 없는 경우
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-stone-500">
          {periodType === 'weekly' ? '최근 7일간' : '최근 30일간'} 작성된 일기가 없습니다.
        </div>
      );
    }

    // 실제 데이터가 있는 감정만 필터링
    const activeEmotions = Object.keys(emotionChartColors).filter(emotion => {
      return chartData.some(dataPoint => dataPoint[emotion as keyof ChartDataPoint] > 0);
    });

    // 차트 타입에 따라 컴포넌트 선택
    const ChartComponent = chartType === 'line' ? LineChart : BarChart;
    const DataComponent = chartType === 'line' ? Line : Bar;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={chartData}>
          {/* 그리드 선 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.3} />
          
          {/* X축: 날짜 (플로우 7.5) */}
          <XAxis 
            dataKey="displayLabel" 
            tick={{ fill: '#57534e', fontSize: 11 }}
            stroke="#a8a29e"
          />
          
          {/* Y축: 감정 발생 빈도 (플로우 7.5) */}
          <YAxis 
            tick={{ fill: '#57534e', fontSize: 11 }}
            stroke="#a8a29e"
            allowDecimals={false}
          />
          
          {/* 툴팁 (플로우 7.5) */}
          <Tooltip content={<CustomTooltip />} />
          
          {/* 범례 */}
          <Legend 
            wrapperStyle={{ fontSize: '11px' }}
            formatter={(value) => emotionLabels[value] || value}
          />
          
          {/* 감정별 데이터 라인/바 (플로우 7.5) */}
          {activeEmotions.map(emotion => (
            <DataComponent
              key={emotion}
              type="monotone"
              dataKey={emotion}
              stroke={emotionChartColors[emotion]}
              fill={emotionChartColors[emotion]}
              strokeWidth={chartType === 'line' ? 2 : 0}
              dot={chartType === 'line' ? { r: 3 } : false}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const emotionDistribution = getEmotionDistribution();

  return (
    <div className="space-y-6">
      {/* 
        Controls - 기간 및 차트 타입 선택 (플로우 7.5)
        
        레이아웃:
        - 좌측 열: 주간 버튼 + 선 그래프 버튼
        - 우측 열: 월간 버튼 + 막대 그래프 버튼
        
        플로우 7.5 요구사항:
        - 기간 선택: 주간/월간 단위 전환 버튼
        - "주간" 선택: 최근 7일 감정 분포
        - "월간" 선택: 최근 30일 감정 분포
      */}
      <div className="flex gap-4 justify-center">
        {/* Left Column - Weekly & Line Chart */}
        <div className="flex flex-col items-center gap-3">
          {/* 주간 버튼 (플로우 7.5) */}
          <button
            onClick={() => setPeriodType('weekly')}
            className={`px-6 py-2 rounded-lg transition-colors text-sm w-[120px] whitespace-nowrap ${
              periodType === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-white/50 text-slate-700 hover:bg-white/80'
            }`}
          >
            주간
          </button>
          
          {/* 선 그래프 버튼 (플로우 7.5) */}
          <button
            onClick={() => setChartType('line')}
            className={`px-6 py-2 rounded-lg transition-colors text-sm w-[120px] whitespace-nowrap ${
              chartType === 'line'
                ? 'bg-blue-600 text-white'
                : 'bg-white/50 text-stone-700 hover:bg-white/80'
            }`}
          >
            선 그래프
          </button>
        </div>

        {/* Right Column - Monthly & Bar Chart */}
        <div className="flex flex-col items-center gap-3">
          {/* 월간 버튼 (플로우 7.5) */}
          <button
            onClick={() => setPeriodType('monthly')}
            className={`px-6 py-2 rounded-lg transition-colors text-sm w-[120px] whitespace-nowrap ${
              periodType === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-white/50 text-slate-700 hover:bg-white/80'
            }`}
          >
            월간
          </button>
          
          {/* 막대 그래프 버튼 (플로우 7.5) */}
          <button
            onClick={() => setChartType('bar')}
            className={`px-6 py-2 rounded-lg transition-colors text-sm w-[120px] whitespace-nowrap ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-white/50 text-stone-700 hover:bg-white/80'
            }`}
          >
            막대 그래프
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg">
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* 
        Chart - 감정 변화 추이 그래프 (플로우 7.5)
        
        표시 내용:
        - TrendingUp 아이콘 + 제목
        - 선 그래프 또는 막대 그래프
        - X축: 날짜, Y축: 감정 발생 빈도
        - 각 감정별 색상으로 구분
        
        플로우 7.5 요구사항:
        - 감정 변화 추이 그래프 표시
      */}
      {!isLoading && !error && (
        <div className="bg-white/80 rounded-lg p-4 border border-stone-300">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm text-stone-800">
              {periodType === 'weekly' ? '최근 7일간' : '최근 30일간'} 감정 변화
            </h3>
          </div>
          {renderChart()}
        </div>
      )}

      {/* 
        Emotion Summary - 감정 통계 요약 (플로우 7.5)
        
        표시 내용:
        - 이번 기간 주요 감정 (TOP 5)
        - 각 감정별 색상 박스
        - 감정명 (한글)
        - 발생 빈도 (개수)
        
        플로우 7.5 요구사항 (EmotionStatsPage 우측 페이지):
        - 전체 기간 중 가장 많이 느낀 감정
        - 감정별 발생 빈도 (개수)
        
        NOTE: 이 요약은 좌측 페이지에 표시되지만,
        우측 페이지에도 유사한 통계가 표시됩니다.
      */}
      {!isLoading && !error && emotionDistribution.length > 0 && (
        <div className="bg-white/80 rounded-lg p-4 border border-stone-300">
          <h4 className="text-sm text-stone-800 mb-3">이번 기간 주요 감정</h4>
          <div className="space-y-2">
            {emotionDistribution.map(([emotion, count]) => (
              <div key={emotion} className="flex items-center gap-3">
                {/* 감정 색상 박스 */}
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: emotionChartColors[emotion] }}
                />
                {/* 감정명 */}
                <span className="text-sm text-stone-700 flex-1">
                  {emotionLabels[emotion]}
                </span>
                {/* 발생 빈도 */}
                <span className="text-sm text-stone-800">{count}회</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}