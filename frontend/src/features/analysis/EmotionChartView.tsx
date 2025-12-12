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
import { Loader2, TrendingUp, BarChart2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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
 * [ERD 설계서 참고 - KoBERT 감정 7가지]
 * - 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
 * 
 * 디자인 가이드:
 * - 파란색 계열로 통일
 * - 각 감정별로 구분 가능한 색상
 */
const emotionChartColors: { [key: string]: string } = {
  happy: '#38bdf8',    // 행복 - sky
  neutral: '#94a3b8',  // 중립 - slate
  surprised: '#60a5fa', // 당황 - blue
  sad: '#3b82f6',      // 슬픔 - blue
  angry: '#ef4444',     // 분노 - red
  anxious: '#f59e0b',  // 불안 - amber
  disgust: '#8b5cf6',  // 혐오 - violet
};

/**
 * 감정 점수 매핑 (주간 선 그래프용)
 */
const emotionScores: { [key: string]: number } = {
  happy: 2,      // 행복 +2
  neutral: 1,    // 중립 +1
  surprised: 0,  // 당황 +0
  anxious: -1,   // 불안 -1
  disgust: -1,   // 혐오 -1
  sad: -2,       // 슬픔 -2
  angry: -2,     // 분노 -2
};

/**
 * 감정 라벨 매핑 (한글)
 * - 영문 키 → 한글 라벨 변환
 * 
 * [ERD 설계서 참고 - KoBERT 감정 7가지]
 * - 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
 */
const emotionLabels: { [key: string]: string } = {
  happy: '행복',
  neutral: '중립',
  surprised: '당황',
  sad: '슬픔',
  angry: '분노',
  anxious: '불안',
  disgust: '혐오',
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
   * [사용자 명세서 플로우 7.5]
   * - 주간 선택: 최근 7일의 감정 분포 표시 (일별)
   * - 월간 선택: 선택한 월의 감정 분포 표시 (주별)
   * - X축: 날짜 (주간 선택 시 일별, 월간 선택 시 주별)
   * 
   * 기간 계산:
   * - weekly: 최근 7일 (오늘 포함, 일별)
   * - monthly: 현재 월의 감정 분포 (주별)
   */
  const loadChartData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // [API 명세서 Section 5.2.2] GET /api/statistics/emotion-trend
      // period: 'weekly' | 'monthly', year: number, month: number (weekly와 monthly 모두 필수)
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 1-12

      // fetchChartStats는 내부적으로 API를 호출하므로 year, month를 전달
      // 하지만 함수 시그니처가 startDate, endDate를 받으므로 유지
      const endDate = new Date();
      const startDate = new Date();

      if (periodType === 'weekly') {
        // 주간: 최근 7일 (오늘 포함, 일별)
        startDate.setDate(endDate.getDate() - 6); // 오늘 포함하여 7일
      } else {
        // 월간: 현재 월의 첫날부터 오늘까지 (주별)
        // API는 현재 월의 주별 데이터를 반환합니다
        startDate.setDate(1); // 현재 월의 첫날
        startDate.setMonth(now.getMonth());
        startDate.setFullYear(year);
      }

      const startStr = formatDateString(startDate);
      const endStr = formatDateString(endDate);

      console.log('감정 통계 차트 데이터 로드:', { periodType, year, month, startStr, endStr });
      const data = await fetchChartStats(startStr, endStr, periodType);

      // 필터링: 주간일 경우 정확히 최근 7일치 데이터만 남김 (API가 월 전체를 줄 수도 있으므로)
      if (periodType === 'weekly') {
        const filteredData = generateLast7DaysData(data);
        console.log('필터링된 주간 차트 데이터:', filteredData);
        setChartData(filteredData);
      } else {
        console.log('감정 통계 차트 데이터 응답:', data);
        setChartData(data);
      }
    } catch (err) {
      console.error('감정 통계 차트 데이터 로드 실패:', err);
      setError('통계 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 최근 7일간의 날짜 데이터를 생성하고, API 응답 데이터를 매핑
   * 데이터가 없는 날짜는 빈 데이터로 채움
   */
  const generateLast7DaysData = (apiData: ChartDataPoint[]): ChartDataPoint[] => {
    const result: ChartDataPoint[] = [];
    const today = new Date();

    // 7일 전부터 오늘까지 순회
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDateString(date);

      // API 데이터에서 해당 날짜 찾기
      const found = apiData.find(d => d.date === dateStr);

      if (found) {
        result.push({
          ...found,
          displayLabel: `${date.getMonth() + 1}/${date.getDate()}`
        });
      } else {
        // 데이터 없으면 0으로 초기화
        result.push({
          date: dateStr,
          displayLabel: `${date.getMonth() + 1}/${date.getDate()}`,
          happy: 0, neutral: 0, surprised: 0, sad: 0, angry: 0, anxious: 0, disgust: 0, total: 0
        });
      }
    }
    return result;
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
   * 주요 감정 찾기 (점수 계산용)
   */
  const getPrimaryEmotion = (dataPoint: ChartDataPoint): string | null => {
    if (dataPoint.total === 0) return null;

    let maxCount = 0;
    let primary = null;

    Object.keys(emotionScores).forEach(emotion => {
      const count = dataPoint[emotion as keyof ChartDataPoint] as number;
      if (count > maxCount) {
        maxCount = count;
        primary = emotion;
      }
    });

    return primary;
  };

  /**
   * 주간 꺾은선 그래프 렌더링
   */
  const renderWeeklyLineChart = () => {
    // 데이터를 누적 점수로 변환
    let cumulativeScore = 0;
    const scoredData = chartData.map(d => {
      const primaryEmotion = getPrimaryEmotion(d);
      const dailyScore = primaryEmotion ? emotionScores[primaryEmotion] : 0;

      // 누적 합산 (일기가 없는 날은 0점 더함 => 변화 없음)
      cumulativeScore += dailyScore;

      return {
        ...d,
        dailyScore,
        cumulativeScore,
        primaryEmotion // 툴팁용
      };
    });

    // Y축 도메인을 0을 기준으로 대칭되게 설정 (최대 절대값 사용)
    const maxAbsScore = Math.max(
      ...scoredData.map(d => Math.abs(d.cumulativeScore)),
      4 // 최소 범위 확보 (점수가 작을 때를 대비)
    );
    // 여유 공간 추가
    const domainMax = maxAbsScore + 1;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={scoredData} margin={{ top: 30, right: 20, bottom: 30, left: 35 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="displayLabel"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            stroke="#9ca3af"
            axisLine={false}
            tickLine={false}
            dy={10}
            padding={{ left: 20, right: 20 }}
          />
          {/* Y축: 숫자 숨김, 눈금 없음, 도메인 설정 */}
          <YAxis
            hide={true}
            padding={{ top: 0, bottom: 0 }}
            domain={[-domainMax, domainMax]}
          />

          {/* 기준선 (0점) */}
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />

          {/* Y축 레이블 (수동 배치, margin.left 영역 활용) */}
          {/* 긍정 (Top) */}
          <text x={30} y={40} textAnchor="end" fill="#10b981" fontSize={12} fontWeight="bold">긍정</text>

          {/* 0 (Center) - 차트 높이 300, top 30, bottom 30 => 높이 240, 중간 150 */}
          {/* 정확한 위치는 도메인 대칭이므로 중앙 */}
          <text x={30} y={150} textAnchor="end" fill="#9ca3af" fontSize={12} fontWeight="bold" dy={4}>0</text>

          {/* 부정 (Bottom) */}
          <text x={30} y={265} textAnchor="end" fill="#f43f5e" fontSize={12} fontWeight="bold">부정</text>

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const emotionKey = data.primaryEmotion;
                return (
                  <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 ring-1 ring-black/5">
                    <p className="text-stone-500 dark:text-stone-400 text-xs mb-1">{data.displayLabel}</p>
                    {emotionKey ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: emotionChartColors[emotionKey] }} />
                          <span className="font-medium text-stone-900 dark:text-stone-100">{emotionLabels[emotionKey]}</span>
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          일일: {data.dailyScore > 0 ? '+' : ''}{data.dailyScore}점
                        </div>
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          누적: {data.cumulativeScore}점
                        </div>
                      </div>
                    ) : (
                      <p className="text-stone-400 text-sm">기록 없음 (변화 없음)</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          <Line
            type="monotone"
            dataKey="cumulativeScore"
            stroke="#10b981"
            strokeWidth={3}
            dot={(props) => {
              const { cx, cy, payload } = props;
              const emotionKey = payload.primaryEmotion;
              if (!emotionKey) return <circle cx={cx} cy={cy} r={4} fill="#e5e7eb" stroke="none" />;
              return (
                <circle cx={cx} cy={cy} r={6} fill={emotionChartColors[emotionKey]} stroke="#fff" strokeWidth={2} />
              );
            }}
            activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  /**
   * 월간 꺾은선 그래프 렌더링 (최근 30일)
   */
  const renderMonthlyLineChart = () => {
    // 데이터를 누적 점수로 변환 (주간과 동일 로직)
    let cumulativeScore = 0;
    const scoredData = chartData.map(d => {
      const primaryEmotion = getPrimaryEmotion(d);
      const dailyScore = primaryEmotion ? emotionScores[primaryEmotion] : 0;
      cumulativeScore += dailyScore;
      return {
        ...d,
        dailyScore,
        cumulativeScore,
        primaryEmotion
      };
    });

    // Y축 도메인 대칭 설정
    const maxAbsScore = Math.max(
      ...scoredData.map(d => Math.abs(d.cumulativeScore)),
      4
    );
    const domainMax = maxAbsScore + 1;

    // X축 틱 생성: [30일 전, ..., 매주 월요일, ..., 오늘]
    // 데이터는 date: string ("YYYY-MM-DD") 형식을 가짐
    const dates = scoredData.map(d => d.date);
    if (dates.length === 0) return null;

    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    // 틱 날짜 선정
    const tickDates = new Set<string>();
    tickDates.add(startDate); // 시작일(30일 전)
    tickDates.add(endDate);   // 오늘

    // 매주 월요일 추가
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      if (date.getDay() === 1) { // 1 = Monday
        tickDates.add(dateStr);
      }
    });

    const ticks = Array.from(tickDates).sort();

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={scoredData} margin={{ top: 30, right: 20, bottom: 30, left: 35 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={(dateStr) => {
              // 날짜 포맷: MM/DD
              const d = new Date(dateStr);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            stroke="#9ca3af"
            axisLine={false}
            tickLine={false}
            dy={10}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis
            hide={true}
            padding={{ top: 0, bottom: 0 }}
            domain={[-domainMax, domainMax]}
          />
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />

          {/* Y축 레이블 */}
          <text x={30} y={40} textAnchor="end" fill="#10b981" fontSize={12} fontWeight="bold">긍정</text>
          <text x={30} y={150} textAnchor="end" fill="#9ca3af" fontSize={12} fontWeight="bold" dy={4}>0</text>
          <text x={30} y={265} textAnchor="end" fill="#f43f5e" fontSize={12} fontWeight="bold">부정</text>

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                // 주간 집계 로직
                // label(날짜) 기준 해당 주(월~일)의 데이터 집계
                const currentDate = new Date(label);

                // 해당 주의 월요일 구하기
                const day = currentDate.getDay();
                const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                const monday = new Date(currentDate.setDate(diff));
                monday.setHours(0, 0, 0, 0);

                // 해당 주의 일요일 구하기
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);

                // 범위 내 데이터 필터링
                const weeklyData = scoredData.filter(d => {
                  const dDate = new Date(d.date);
                  return dDate >= monday && dDate <= sunday;
                });

                // 감정 카운트 집계
                const counts: { [key: string]: number } = {};
                weeklyData.forEach(d => {
                  Object.keys(emotionChartColors).forEach(emotion => {
                    if ((d[emotion as keyof ChartDataPoint] as number) > 0) {
                      counts[emotion] = (counts[emotion] || 0) + (d[emotion as keyof ChartDataPoint] as number);
                    }
                  });
                });

                // 상위 3개 감정 추출
                const sortedEmotions = Object.entries(counts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3);

                return (
                  <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 ring-1 ring-black/5 min-w-[150px]">
                    <p className="text-stone-500 dark:text-stone-400 text-xs mb-2">
                      {monday.getMonth() + 1}/{monday.getDate()} - {sunday.getMonth() + 1}/{sunday.getDate()} 주차
                    </p>
                    {sortedEmotions.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {sortedEmotions.map(([emotion, count]) => (
                          <div key={emotion} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: emotionChartColors[emotion] }} />
                              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{emotionLabels[emotion]}</span>
                            </div>
                            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">{count}회</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-stone-400 text-xs">기록 없음</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          <Line
            type="monotone"
            dataKey="cumulativeScore"
            stroke="#10b981"
            strokeWidth={3}
            dot={(props) => {
              const { cx, cy, payload } = props;
              // X축 틱에 포함된 날짜만 점 표시
              if (ticks.includes(payload.date)) {
                const emotionKey = payload.primaryEmotion;
                return (
                  <circle cx={cx} cy={cy} r={5} fill={emotionKey ? emotionChartColors[emotionKey] : '#9ca3af'} stroke="#fff" strokeWidth={2} />
                );
              }
              return <circle cx={cx} cy={cy} r={0} />;
            }}
            activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  /**
  /**
   * 감정 분포 막대 그래프 렌더링 (주간/월간 공용)
   * - x축: 7가지 모든 감정
   * - y축: 횟수
   * - 데이터: 선택된 기간(주간/월간)의 감정 발생 횟수 합계
   */
  const renderEmotionBarChart = () => {
    // 7가지 감정 초기화
    const initialData = Object.keys(emotionLabels).map(key => ({
      emotion: key,
      name: emotionLabels[key],
      count: 0,
      fill: emotionChartColors[key]
    }));

    // 데이터 집계
    chartData.forEach(d => {
      Object.keys(emotionChartColors).forEach(emotion => {
        const count = d[emotion as keyof ChartDataPoint] as number;
        const target = initialData.find(item => item.emotion === emotion);
        if (target) {
          target.count += count;
        }
      });
    });

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={initialData} margin={{ top: 30, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            stroke="#9ca3af"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            stroke="#9ca3af"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 ring-1 ring-black/5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.fill }} />
                      <span className="font-medium text-stone-900 dark:text-stone-100">{data.name}</span>
                    </div>
                    <p className="text-stone-500 dark:text-stone-400 text-xs">{data.count}회</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };



  const emotionDistribution = getEmotionDistribution();



  return (
    <div className="space-y-6">
      {/* Controls - 기간 및 차트 타입 선택 */}
      <div className="flex flex-col items-center gap-4">

        {/* 통합 컨트롤 영역 */}
        <div className="flex flex-col gap-3 items-center">

          {/* 1. 기간 선택 (Toggle Style) */}
          <div
            className="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl flex w-[280px] min-w-[280px] shrink-0"
            style={{ width: '280px', minWidth: '280px' }}
          >
            <button
              onClick={() => setPeriodType('weekly')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${periodType === 'weekly'
                ? 'bg-white/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 shadow-sm ring-1 ring-black/5'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
            >
              주간
            </button>
            <button
              onClick={() => setPeriodType('monthly')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${periodType === 'monthly'
                ? 'bg-white/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 shadow-sm ring-1 ring-black/5'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
            >
              월간
            </button>
          </div>

          {/* 2. 차트 타입 선택 (Toggle Style) - 주간/월간 모두 표시 */}
          <div
            className="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl flex w-[280px] min-w-[280px] shrink-0"
            style={{ width: '280px', minWidth: '280px' }}
          >
            <button
              onClick={() => setChartType('line')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-3 whitespace-nowrap ${chartType === 'line'
                ? 'bg-white/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 shadow-sm ring-1 ring-black/5'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              선 그래프
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-3 whitespace-nowrap ${chartType === 'bar'
                ? 'bg-white/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 shadow-sm ring-1 ring-black/5'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
            >
              <BarChart2 className="w-4 h-4" />
              막대 그래프
            </button>
          </div>
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

      {/* Chart - 감정 변화 추이 그래프 */}
      {!isLoading && !error && (
        <div className="bg-white/80 rounded-lg p-4 border border-stone-300">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm text-stone-800">
              {periodType === 'weekly'
                ? (chartType === 'line' ? '최근 7일간 감정 변화' : '이번주 감정 분포')
                : (chartType === 'line' ? '최근 30일간 감정 변화' : '이번달 감정 분포')}
            </h3>
          </div>
          {/* 렌더링 로직 분기 */}
          {periodType === 'weekly'
            ? (chartType === 'line' ? renderWeeklyLineChart() : renderEmotionBarChart())
            : (chartType === 'line' ? renderMonthlyLineChart() : renderEmotionBarChart())
          }
        </div>
      )}

      {/* Emotion Summary - 이번주 감정 통계 */}
      {!isLoading && !error && emotionDistribution.length > 0 && (
        <div className="bg-white/80 rounded-lg p-4 border border-stone-300">
          <h4 className="text-sm text-stone-800 mb-3">
            {periodType === 'weekly' ? '이번주 감정 통계' : '이번달 주요 감정'}
          </h4>
          <div className="space-y-2">
            {emotionDistribution.map(([emotion, count]) => (
              <div key={emotion} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: emotionChartColors[emotion] }}
                />
                <span className="text-sm text-stone-700 flex-1">
                  {emotionLabels[emotion]}
                </span>
                <span className="text-sm text-stone-800">{count}회</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}