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
import { Plus } from 'lucide-react';

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
  const handleGenerateImage = async (content: string, emotion: string, weather?: string): Promise<string> => {
    // Mock 구현
    const moodImages: { [key: string]: string } = {
      'happy': 'https://images.unsplash.com/photo-1605702012553-e954fbde66eb?w=1080',
      'calm': 'https://images.unsplash.com/photo-1622489937280-af9291e62ccc?w=1080',
      'love': 'https://images.unsplash.com/photo-1703611987698-595febef3f9a?w=1080',
      'excited': 'https://images.unsplash.com/photo-1506788493784-a85a26871e43?w=1080',
      'default': 'https://images.unsplash.com/photo-1524577393498-23c6b0c40468?w=1080',
    };

    const lowerContent = content.toLowerCase();
    let selectedImage = moodImages.default;
    
    if (lowerContent.includes('카페') || lowerContent.includes('커피') || lowerContent.includes('비')) {
      selectedImage = 'https://images.unsplash.com/photo-1524577393498-23c6b0c40468?w=1080';
    } else if (lowerContent.includes('산책') || lowerContent.includes('자연') || lowerContent.includes('공원')) {
      selectedImage = 'https://images.unsplash.com/photo-1506788493784-a85a26871e43?w=1080';
    } else if (lowerContent.includes('가족') || lowerContent.includes('친구') || lowerContent.includes('사랑')) {
      selectedImage = 'https://images.unsplash.com/photo-1703611987698-595febef3f9a?w=1080';
    } else if (lowerContent.includes('바다') || lowerContent.includes('해변') || lowerContent.includes('평온')) {
      selectedImage = 'https://images.unsplash.com/photo-1622489937280-af9291e62ccc?w=1080';
    } else if (lowerContent.includes('밤') || lowerContent.includes('도시') || lowerContent.includes('불빛')) {
      selectedImage = 'https://images.unsplash.com/photo-1605702012553-e954fbde66eb?w=1080';
    }
    
    return selectedImage;
  };

  // 일기 작성 완료 핸들러
  const handleFinishWriting = (emotionData: {
    emotion: string;
    emotionName: string;
    emotionCategory: string;
    date: Date;
  }) => {
    const emotionCategoryMapping: { [key: string]: string } = {
      'positive': 'happy',
      'negative': 'sad'
    };
    
    const mappedEmotionCategory = emotionCategoryMapping[emotionData.emotionCategory] || 'neutral';
    
    const mockComments = {
      positive: [
        "오늘 하루도 행복한 순간들로 가득했네요! 이런 긍정적인 에너지를 계속 이어가세요 ✨",
        "정말 좋은 하루를 보내셨군요! 이 감정을 오래 간직하시길 바라요 😊",
        "행복한 마음이 글에 가득 담겨있어요. 계속 이런 좋은 날들이 이어지길! 🌟"
      ],
      negative: [
        "힘든 하루였네요. 하지만 이렇게 일기를 쓰면서 정리하는 것만으로도 큰 의미가 있어요 💙",
        "지금 느끼는 감정을 있는 그대로 받아들이는 것도 괜찮아요. 내일은 더 나은 하루가 될 거예요 🌈",
        "힘들 때는 충분히 쉬어가는 것도 필요해요. 지금의 이 감정도 소중한 경험이에요 🫂"
      ]
    };
    
    const comments = emotionData.emotionCategory === 'positive' 
      ? mockComments.positive 
      : mockComments.negative;
    const randomComment = comments[Math.floor(Math.random() * comments.length)];
    
    setAnalysisEmotion(emotionData.emotion);
    setAnalysisEmotionName(emotionData.emotionName);
    setAnalysisEmotionCategory(mappedEmotionCategory);
    setAnalysisComment(randomComment);
    setAnalysisDate(emotionData.date);
    
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

  // 감정 분석 모달에서 장소 추천
  const handleEmotionAnalysisMapRecommendation = () => {
    setShowEmotionAnalysis(false);
    setMapEmotion(analysisEmotion);
    setMapEmotionCategory(analysisEmotionCategory);
    
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
          title: diaryData.title,
          content: diaryData.note,
          emotion: diaryData.emotion,
          mood: diaryData.mood,
          weather: diaryData.weather,
          activities: diaryData.activities,
          images: [],
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

  useEffect(() => {
    const analyzeRisk = async () => {
      const analysis = await analyzeRiskSignals();
      setRiskAnalysis(analysis);
      if (analysis.isAtRisk && analysis.riskLevel !== 'none' && currentUser?.notificationEnabled) {
        setShowRiskAlert(true);
      }
    };
    if (currentUser) {
      analyzeRisk();
    }
  }, [refreshKey, currentUser]);

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

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
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

      {/* Main Content - 하단 탭 바를 위한 패딩 추가 */}
      <div className="relative pb-20"> {/* 하단 탭 바 높이만큼 패딩 */}
        <div className="max-w-2xl mx-auto">
          {/* Home View - 캘린더 + 일기 요약 */}
          {viewMode === 'home' && (
            <div className="min-h-screen">
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
                className="fixed inset-0 bg-white z-50"
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
                className="fixed inset-0 bg-white z-40 overflow-y-auto"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                {showMapRecommendation ? (
                  <KakaoMapRecommendation
                    isOpen={true}
                    onClose={() => setShowMapRecommendation(false)}
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
                    onMapRecommendation={(emotion, emotionCategory) => {
                      setMapEmotion(emotion);
                      setMapEmotionCategory(emotionCategory);
                      setShowMapRecommendation(true);
                    }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* List View */}
          {viewMode === 'list' && (
            <div className="min-h-screen p-4">
              <DiaryListPage 
                onDiaryClick={handleDateSelect}
              />
            </div>
          )}

          {/* Stats View */}
          {viewMode === 'stats' && (
            <div className="min-h-screen">
              <EmotionStatsPage 
                onDateClick={handleDateSelect}
              />
            </div>
          )}
          
          {/* My Page View */}
          {viewMode === 'mypage' && (
            <div className="min-h-screen p-4">
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
            <div className="min-h-screen p-4">
              <SupportResourcesPage />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tab Bar - viewMode가 writing이 아닐 때만 표시 */}
      {viewMode !== 'writing' && viewMode !== 'reading' && (
        <BottomTabBar 
          activeTab={getCurrentTab()}
          onTabChange={handleTabChange}
        />
      )}

      {/* Floating Action Button - 홈 화면에서만 표시 */}
      {viewMode === 'home' && (
        <button
          onClick={() => handleStartWriting(selectedDate || new Date())}
          className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 z-30"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showRiskAlert && riskAnalysis && (
          <RiskAlertModal 
            riskLevel={riskAnalysis.riskLevel}
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
  );
}