/**
 * ========================================
 * 다이어리 메인 컴포넌트 (DiaryBook)
 * ========================================
 * 
 * 주요 기능:
 * - 단일 페이지 다이어리 레이아웃 (모바일 웹 최적화)
 * - 7가지 뷰 모드 전환 (캘린더, 작성, 읽기, 통계, 목록, 마이페이지, 지원센터)
 * - 월별 캘린더 (단일 월 표시)
 * - AI 그림일기 이미지 생성
 * - 감정 기반 장소 추천 (카카오맵)
 * - 위험 신호 감지 및 알림
 * 
 * 변경 사항 (모바일 웹 기준):
 * - 양페이지(좌우) 레이아웃 → 단일 페이지 레이아웃 변경
 * - 캘린더: 한 달씩 표시, 날짜 클릭 시 상세 화면으로 이동
 * - 상세 화면: '뒤로가기' 버튼으로 캘린더 복귀
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarPage } from './CalendarPage';
import { DaySummaryPage } from './DaySummaryPage';
import { DiaryWritingPage } from './DiaryWritingPage';
import { MyPage } from '../user/MyPage';
import { EmotionStatsPage } from '../analysis/EmotionStatsPage';
import { DiaryListPage } from './DiaryListPage';
import { SupportResourcesPage } from '../user/SupportResourcesPage';
import { RiskAlertModal } from '../analysis/RiskAlertModal';
import { EmotionAnalysisModal } from '../analysis/EmotionAnalysisModal';
import { BottomTabBar, TabType } from './BottomTabBar';
import { analyzeRiskSignals, RiskAnalysis } from '../../services/riskDetection';
import { KakaoMapRecommendation } from './KakaoMapRecommendation';
import { getCurrentUser, User as UserType } from '../../services/authApi';
import { Plus, Wifi, Battery } from 'lucide-react';
import { MobileLayout } from '../../components/MobileLayout';

/**
 * 뷰 모드 타입 정의
 */
type ViewMode = 'home' | 'writing' | 'reading' | 'mypage' | 'stats' | 'list' | 'support';

/**
 * DiaryBook 컴포넌트 Props
 */
interface DiaryBookProps {
  onUserUpdate?: (user: { name: string; email: string }) => void;
  onLogout?: () => void;
  onAccountDeleted?: () => void;
}

export function DiaryBook({ onUserUpdate, onLogout, onAccountDeleted }: DiaryBookProps) {
  // 실시간 시간 상태
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 시간 업데이트 (1분마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1초마다 업데이트
    
    return () => clearInterval(timer);
  }, []);
  
  // 시간 포맷팅 (HH:MM)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };
  // ========== 상태 관리 ==========
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 현재 표시 중인 월 (모바일 단일 뷰에서는 이 값만 사용)
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 데이터 새로고침 키
  const [refreshKey, setRefreshKey] = useState(0);
  
  // 현재 뷰 모드
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  
  // 이전 뷰 모드 (뒤로가기용)
  const [previousViewMode, setPreviousViewMode] = useState<ViewMode | null>(null);
  
  // 페이지 전환 애니메이션 상태
  const [isFlipping, setIsFlipping] = useState(false);
  
  // 카카오맵 장소 추천 모달 상태
  const [showMapRecommendation, setShowMapRecommendation] = useState(false);
  const [mapEmotion, setMapEmotion] = useState('');
  const [mapEmotionCategory, setMapEmotionCategory] = useState('');
  const [mapDiaryId, setMapDiaryId] = useState<string | undefined>(undefined); // 일기 ID (장소 추천 API 호출에 사용)
  
  // 수정 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingDiaryData, setExistingDiaryData] = useState<any>(null);
  
  // 페르소나 설정 모달 상태
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  // 사용자 정보 상태
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // 북마크 네비게이션 경고 모달 상태
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<ViewMode | null>(null);

  // 감정 분석 모달 상태
  const [showEmotionAnalysis, setShowEmotionAnalysis] = useState(false);
  const [analysisEmotion, setAnalysisEmotion] = useState('');
  const [analysisEmotionName, setAnalysisEmotionName] = useState('');
  const [analysisEmotionCategory, setAnalysisEmotionCategory] = useState('');
  const [analysisComment, setAnalysisComment] = useState('');
  const [analysisDate, setAnalysisDate] = useState<Date | null>(null);

  // 위험 신호 감지 상태
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [showRiskAlert, setShowRiskAlert] = useState(false);

  // ========== 이벤트 핸들러 ==========
  
  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 월 변경 핸들러 (단일 페이지)
  const handleMonthChange = (newMonth: Date) => {
    // setIsFlipping(true); // 월 변경 시에는 페이지 플립 애니메이션 제외 (자연스러운 달력 이동)
    setCurrentMonth(newMonth);
    // setTimeout(() => setIsFlipping(false), 300);
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date: Date) => {
    setPreviousViewMode(viewMode);
    setSelectedDate(date);
    
    // 선택된 날짜의 월로 현재 월 업데이트
    const selectedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    setCurrentMonth(selectedMonth);
    
    setShowMapRecommendation(false);
    setViewMode('reading');
  };

  // 일기 작성 시작 핸들러
  const handleStartWriting = (date: Date) => {
    setSelectedDate(date);
    setIsEditMode(false);
    setExistingDiaryData(null);
    setIsFlipping(true);
    setTimeout(() => {
      setViewMode('writing');
      setIsFlipping(false);
    }, 200);
  };

  // AI 이미지 생성 핸들러
  // [중요] 이 함수는 더 이상 사용되지 않습니다.
  // AI 이미지 생성은 백엔드에서 자동으로 처리됩니다.
  // 일기 저장 API(POST /api/diaries) 호출 시 백엔드가 AI 서버와 통신하여 이미지를 생성하고
  // 응답에 imageUrl이 포함되어 반환됩니다.
  // 
  // [API 명세서 Section 4.1, 4.2]
  // - 일기 작성/수정 시 백엔드가 자동으로 AI 이미지 생성
  // - 응답에 imageUrl이 포함되어 반환됨
  const handleGenerateImage = async (content: string, emotion: string, weather?: string): Promise<string> => {
    // [Deprecated] 이 함수는 더 이상 사용되지 않습니다.
    // 백엔드가 일기 저장 시 자동으로 AI 이미지를 생성합니다.
    console.warn('[Deprecated] handleGenerateImage는 더 이상 사용되지 않습니다. 백엔드가 자동으로 처리합니다.');
    return '';
  };

  // 일기 작성 완료 핸들러
  const handleFinishWriting = (emotionData: {
    emotion: string;
    emotionName: string;
    emotionCategory: string;
    aiComment?: string;
    date: Date;
    diaryId?: string; // 일기 ID (장소 추천 기능에서 사용)
  }) => {
    const emotionCategoryMapping: { [key: string]: string } = {
      'positive': 'happy',
      'negative': 'sad'
    };
    
    const mappedEmotionCategory = emotionCategoryMapping[emotionData.emotionCategory] || 'neutral';
    
    // [API 명세서 Section 4.1]
    // AI 코멘트는 백엔드에서 자동 생성되어 일기 저장 응답에 포함됩니다.
    // 프론트엔드는 일기 상세 조회 시 aiComment를 받아 표시합니다.
    
    setAnalysisEmotion(emotionData.emotion);
    setAnalysisEmotionName(emotionData.emotionName);
    setAnalysisEmotionCategory(mappedEmotionCategory);
    setAnalysisComment(emotionData.aiComment || '오늘 하루도 수고 많았어요!');
    setAnalysisDate(emotionData.date);
    
    // 일기 ID 저장 (장소 추천 기능에서 사용)
    setMapDiaryId(emotionData.diaryId);
    
    setShowEmotionAnalysis(true);
    handleDataChange();
  };

  // 뒤로가기 핸들러 (캘린더로 복귀)
  const handleBackToCalendar = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setViewMode(previousViewMode || 'home');
      setSelectedDate(null);
      setPreviousViewMode(null);
      setShowMapRecommendation(false);
      setIsEditMode(false);
      setExistingDiaryData(null);
      
      // 현재 날짜 기준 월 복원
      const now = new Date();
      const currentMonthObj = new Date(now.getFullYear(), now.getMonth(), 1);
      setCurrentMonth(currentMonthObj);
      
      setIsFlipping(false);
    }, 200);
  };

  // 감정 분석 모달 닫기
  const handleCloseEmotionAnalysis = () => {
    setShowEmotionAnalysis(false);
    if (analysisDate) {
      setSelectedDate(analysisDate);
      const selectedMonth = new Date(analysisDate.getFullYear(), analysisDate.getMonth(), 1);
      setCurrentMonth(selectedMonth);
      setViewMode('reading');
    }
  };

  // 감정 분석 모달에서 장소 추천 (플로우 8.1 경로 A: 일기 저장 후 감정 분석 모달에서)
  const handleEmotionAnalysisMapRecommendation = () => {
    setShowEmotionAnalysis(false);
    setMapEmotion(analysisEmotion);
    setMapEmotionCategory(analysisEmotionCategory);
    // mapDiaryId는 이미 handleFinishWriting에서 설정됨
    
    if (analysisDate) {
      setSelectedDate(analysisDate);
      const selectedMonth = new Date(analysisDate.getFullYear(), analysisDate.getMonth(), 1);
      setCurrentMonth(selectedMonth);
    }
    
    setViewMode('reading');
    setShowMapRecommendation(true);
  };

  // 일기 수정 핸들러
  const handleEdit = async () => {
    if (!selectedDate) return;
    setIsFlipping(true);
    try {
      const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const { fetchDiaryDetails } = await import('../../services/diaryApi');
      const diaryData = await fetchDiaryDetails(dateKey);
      
      if (diaryData) {
        setExistingDiaryData({
          id: diaryData.id, // 일기 ID 추가 (수정 시 필요)
          title: diaryData.title,
          content: diaryData.content, // note → content 수정
          emotion: diaryData.emotion,
          mood: diaryData.mood,
          weather: diaryData.weather,
          activities: diaryData.activities,
          images: diaryData.images || [], // 이미지 목록 추가
          aiImage: diaryData.imageUrl,
        });
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Failed to load diary for editing:', error);
    }
    setTimeout(() => {
      setViewMode('writing');
      setIsFlipping(false);
    }, 200);
  };

  const handleMyPage = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setViewMode('mypage');
      setIsFlipping(false);
    }, 200);
  };

  const handleGoToMyPage = () => {
    navigateWithCheck('mypage');
  };

  const navigateWithCheck = (targetView: ViewMode) => {
    if (viewMode === 'writing') {
      setPendingNavigation(targetView);
      setShowNavigationWarning(true);
    } else {
      performNavigation(targetView);
    }
  };

  const performNavigation = (targetView: ViewMode) => {
    setIsFlipping(true);
    setTimeout(() => {
      setViewMode(targetView);
      if (targetView === 'home') {
        setSelectedDate(null);
        setShowMapRecommendation(false);
        setIsEditMode(false);
        setExistingDiaryData(null);
        
        const now = new Date();
        const currentMonthObj = new Date(now.getFullYear(), now.getMonth(), 1);
        setCurrentMonth(currentMonthObj);
      }
      setIsFlipping(false);
    }, 200);
  };

  const handleConfirmNavigation = () => {
    console.log('작성/수정 중인 내용 삭제 및 페이지 이동');
    setShowNavigationWarning(false);
    if (pendingNavigation) {
      performNavigation(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleContinueWritingFromNav = () => {
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  };

  const handleGoToStats = () => {
    navigateWithCheck('stats');
  };

  const handleGoToList = () => {
    navigateWithCheck('list');
  };

  const handleGoHome = () => {
    setShowMapRecommendation(false);
    if (viewMode === 'reading') {
      setIsFlipping(true);
      setTimeout(() => {
        setViewMode('home');
        setSelectedDate(null);
        setPreviousViewMode(null);
        
        // 현재 달 기준으로 복원
        const currentMonthObj = new Date(currentMonth); 
        // 만약 'reading' 모드에서 달력을 이동했다면 그 달을 유지할지, 
        // 아니면 오늘 날짜 기준으로 돌아갈지 결정. 
        // 여기서는 그냥 현재 상태 유지하거나, 홈이니까 오늘 기준으로 갈 수도 있음.
        // 기존 로직은 오늘 기준으로 초기화였음.
        const now = new Date();
        setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));

        setIsFlipping(false);
      }, 200);
    } else {
      navigateWithCheck('home');
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
      }
    };
    loadUser();
  }, []);

  // 위험 신호 감지 (플로우 9.1, 9.2)
  // 로그인 성공 후 다이어리 메인 화면 진입 시 한 번만 실행
  // 세션 중에는 다시 표시하지 않음
  useEffect(() => {
    const analyzeRisk = async () => {
      try {
        // 세션 상태 확인 (이미 표시했는지 확인)
        const { getRiskSessionStatus } = await import('../../services/riskDetection');
        const sessionStatus = await getRiskSessionStatus();
        
        // 이미 표시했다면 다시 표시하지 않음
        if (sessionStatus.alreadyShown) {
          return;
        }
        
        // 위험 신호 분석
        const analysis = await analyzeRiskSignals();
        setRiskAnalysis(analysis);
        
        // 위험 레벨이 medium 이상이고 알림 설정이 활성화된 경우에만 표시 (플로우 9.2)
        if ((analysis.riskLevel === 'medium' || analysis.riskLevel === 'high') && currentUser?.notificationEnabled) {
          setShowRiskAlert(true);
          
          // 표시 완료 기록
          const { markRiskAlertShown } = await import('../../services/riskDetection');
          await markRiskAlertShown();
        }
      } catch (error) {
        console.error('위험 신호 분석 실패:', error);
      }
    };
    
    // 로그인 성공 후 다이어리 메인 화면 진입 시 한 번만 실행
    // viewMode가 'home'이고 currentUser가 있을 때만 실행
    if (currentUser && viewMode === 'home') {
      analyzeRisk();
    }
  }, [currentUser, viewMode]); // refreshKey 제거 (세션 중 재분석 방지)

  const handleGoToSupport = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setViewMode('support');
      setIsFlipping(false);
    }, 200);
  };

  const handleViewResources = () => {
    setShowRiskAlert(false);
    handleGoToSupport();
  };

  // 하단 탭 바 핸들러
  const handleTabChange = (tab: TabType) => {
    const tabToViewMode: { [key in TabType]: ViewMode } = {
      'home': 'home',
      'list': 'list',
      'stats': 'stats',
      'mypage': 'mypage',
    };
    
    const targetView = tabToViewMode[tab];
    
    if (viewMode === 'writing') {
      setPendingNavigation(targetView);
      setShowNavigationWarning(true);
    } else {
      performNavigation(targetView);
    }
  };

  // 현재 뷰에서 탭 매핑
  const getCurrentTab = (): TabType => {
    if (viewMode === 'home' || viewMode === 'reading') return 'home';
    if (viewMode === 'list') return 'list';
    if (viewMode === 'stats') return 'stats';
    if (viewMode === 'mypage') return 'mypage';
    return 'home';
  };

  // Header 컴포넌트 (상단 상태바)
  const header = (
    <div className="w-full h-9 bg-white flex items-center justify-between px-4 text-xs text-gray-900 border-b border-gray-100">
      {/* 왼쪽: 시간 */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">{formatTime(currentTime)}</span>
      </div>
      
      {/* 오른쪽: 신호, 와이파이, 배터리 */}
      <div className="flex items-center gap-2">
        {/* 신호 강도 (4단계) */}
        <div className="flex items-end gap-0.5 h-3">
          <div className="w-1 bg-gray-900 rounded-t-sm" style={{ height: '3px' }}></div>
          <div className="w-1 bg-gray-900 rounded-t-sm" style={{ height: '5px' }}></div>
          <div className="w-1 bg-gray-900 rounded-t-sm" style={{ height: '7px' }}></div>
          <div className="w-1 bg-gray-400 rounded-t-sm" style={{ height: '9px' }}></div>
        </div>
        
        {/* 와이파이 */}
        <Wifi className="w-4 h-4 text-gray-900" strokeWidth={2} />
        
        {/* 배터리 */}
        <div className="flex items-center">
          <Battery className="w-5 h-5 text-gray-900" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-900 ml-0.5">85%</span>
        </div>
      </div>
    </div>
  );

  // Footer 컴포넌트 (하단 탭바)
  const footer = viewMode !== 'writing' && viewMode !== 'reading' ? (
    <BottomTabBar 
      activeTab={getCurrentTab()}
      onTabChange={handleTabChange}
    />
  ) : null;

  return (
    <MobileLayout header={header} footer={footer}>
      <div className="relative w-full h-full">
        {/* Navigation Warning Modal */}
        {showNavigationWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg text-stone-800">작성 중인 내용이 사라집니다</h3>
                <p className="text-sm text-stone-600">정말 이동하시겠습니까?</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleContinueWritingFromNav} 
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm min-h-[44px]"
                >
                  계속 작성
                </button>
                <button 
                  onClick={handleConfirmNavigation} 
                  className="flex-1 px-4 py-3 bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition-colors min-h-[44px]"
                >
                  이동하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="w-full max-w-2xl mx-auto px-4 py-4">
          {/* Home View - 캘린더 + 일기 요약 */}
          {viewMode === 'home' && (
            <div className="w-full px-4 py-2">
              <CalendarPage 
                onDateSelect={handleDateSelect} 
                selectedDate={selectedDate}
                currentMonth={currentMonth}
                onMonthChange={handleMonthChange}
                refreshKey={refreshKey}
                showBothButtons={true}
                isRightPage={false}
              />
            </div>
          )}

          {/* Writing View - 전체 화면 모달 */}
          <AnimatePresence>
            {viewMode === 'writing' && (
              <motion.div 
                className="absolute inset-0 bg-white z-50"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                <DiaryWritingPage 
                  selectedDate={selectedDate}
                  onFinish={handleFinishWriting}
                  onCancel={handleBackToCalendar}
                  onGenerateImage={handleGenerateImage}
                  onMapRecommendation={(emotion, emotionCategory) => {
                    setMapEmotion(emotion);
                    setMapEmotionCategory(emotionCategory);
                    setViewMode('reading');
                    setShowMapRecommendation(true);
                  }}
                  isEditMode={isEditMode}
                  existingDiary={existingDiaryData}
                  onSaveSuccess={(dateKey) => {
                    setIsEditMode(false);
                    setExistingDiaryData(null);
                    setViewMode('reading');
                    handleDataChange();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reading View */}
          <AnimatePresence>
            {viewMode === 'reading' && (
              <motion.div 
                className="absolute inset-0 bg-white z-40 overflow-hidden flex flex-col"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                {showMapRecommendation ? (
                  <KakaoMapRecommendation
                    isOpen={true}
                    onClose={() => setShowMapRecommendation(false)}
                    diaryId={mapDiaryId} // 일기 ID 전달 (장소 추천 API 호출에 사용)
                    emotion={mapEmotion || (selectedDate ? 'neutral' : '')}
                    emotionCategory={mapEmotionCategory || 'neutral'}
                    isInline={true}
                  />
                ) : (
                  <DaySummaryPage 
                    selectedDate={selectedDate}
                    onDataChange={handleDataChange}
                    onEdit={handleEdit}
                    onStartWriting={() => handleStartWriting(selectedDate!)}
                    onBackToCalendar={handleBackToCalendar}
                    onMapRecommendation={(emotion, emotionCategory, diaryId) => {
                      setMapEmotion(emotion);
                      setMapEmotionCategory(emotionCategory);
                      setMapDiaryId(diaryId); // 일기 ID 저장 (장소 추천 API 호출에 사용)
                      setShowMapRecommendation(true);
                    }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* List View */}
          {viewMode === 'list' && (
            <div className="w-full p-4">
              <DiaryListPage 
                onDiaryClick={handleDateSelect}
              />
            </div>
          )}

          {/* Stats View */}
          {viewMode === 'stats' && (
            <div className="w-full">
              <EmotionStatsPage 
                onDateClick={handleDateSelect}
              />
            </div>
          )}
          
          {/* My Page View */}
          {viewMode === 'mypage' && (
            <div className="w-full p-4">
              <MyPage 
                onModalStateChange={setIsPersonaModalOpen}
                onAccountDeleted={onAccountDeleted}
                onBack={() => setViewMode('home')}
                onGoToSupport={handleGoToSupport}
                onLogout={handleLogout}
                onUserUpdate={(user) => {
                  if (onUserUpdate) onUserUpdate(user);
                }}
              />
            </div>
          )}

          {/* Support View */}
          {viewMode === 'support' && (
            <div className="w-full p-4">
              <SupportResourcesPage />
            </div>
          )}
        </div>

        {/* Floating Action Button - 홈 화면에서만 표시 */}
        {viewMode === 'home' && (
          <button
            onClick={() => handleStartWriting(selectedDate || new Date())}
            className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center active:bg-blue-600 transition-all active:scale-95 z-30 touch-manipulation"
            title="일기 작성하기"
            aria-label="일기 작성하기"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
        )}

        {/* Modals */}
        <AnimatePresence>
          {showRiskAlert && riskAnalysis && (
            <RiskAlertModal 
              isOpen={showRiskAlert}
              riskLevel={riskAnalysis.riskLevel}
              reasons={riskAnalysis.reasons}
              urgentCounselingPhones={riskAnalysis.urgentCounselingPhones}
              onClose={() => setShowRiskAlert(false)}
              onViewResources={handleViewResources}
            />
          )}
          {showEmotionAnalysis && (
            <EmotionAnalysisModal 
              isOpen={showEmotionAnalysis}
              onClose={handleCloseEmotionAnalysis}
              emotion={analysisEmotion}
              emotionName={analysisEmotionName}
              emotionCategory={analysisEmotionCategory}
              comment={analysisComment}
              onMapRecommendation={handleEmotionAnalysisMapRecommendation}
            />
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
}