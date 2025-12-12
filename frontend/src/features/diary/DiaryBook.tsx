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

import { useState, useEffect, useRef } from 'react';
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
// HMR Update
import { getCurrentUser, User as UserType } from '../../services/authApi';
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
  // ========== 상태 관리 ==========
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 현재 표시 중인 월 (모바일 단일 뷰에서는 이 값만 사용)
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 이전에 조회하던 월 (일기 상세 조회 후 뒤로 가기 시 복원용)
  const [previousMonth, setPreviousMonth] = useState<Date | null>(null);
  
  // 데이터 새로고침 키
  const [refreshKey, setRefreshKey] = useState(0);
  
  // 현재 뷰 모드
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  
  // 이전 뷰 모드 (뒤로가기용)
  const [previousViewMode, setPreviousViewMode] = useState<ViewMode | null>(null);
  
  const [statsSelectedDate, setStatsSelectedDate] = useState<Date | null>(null);
  
  // 통계 페이지 뷰 모드 저장 (뒤로가기 시 복원용)
  const [statsViewMode, setStatsViewMode] = useState<'calendar' | 'timeline' | 'chart'>('calendar');
  
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
  
  // 로그인 시점 추적 (예외 처리용)
  // 1) 최초 로그인 시 한 번만 모달 표시
  // 2) 같은 세션에서 다시 진입해도 모달 표시 안 함
  // 3) 로그아웃 후 재로그인 시 모달 다시 표시
  const lastUserIdRef = useRef<string | null>(null); // 이전 사용자 ID 저장
  const hasShownModalInSessionRef = useRef<boolean>(false); // 현재 세션에서 모달을 표시했는지 여부

  // 북마크 네비게이션 경고 모달 상태 (제거됨 - DiaryWritingPage의 취소 모달 사용)
  const [pendingNavigation, setPendingNavigation] = useState<ViewMode | null>(null);
  
  // DiaryWritingPage ref (북마크 내비게이션 이동 시 이미지 삭제 처리 및 모달 표시용)
  const writingPageRef = useRef<{ 
    handleNavigationCancel: () => Promise<void>;
    showCancelModal: () => void;
    hasChanges: boolean;
  } | null>(null);

  // 감정 분석 모달 상태
  const [showEmotionAnalysis, setShowEmotionAnalysis] = useState(false);
  const [analysisEmotion, setAnalysisEmotion] = useState('');
  const [analysisEmotionName, setAnalysisEmotionName] = useState('');
  const [analysisEmotionCategory, setAnalysisEmotionCategory] = useState('');
  const [analysisComment, setAnalysisComment] = useState('');
  const [analysisRecommendedFood, setAnalysisRecommendedFood] = useState<{ name: string; reason: string } | null>(null);
  const [analysisImageUrl, setAnalysisImageUrl] = useState<string | null>(null);
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
    
    // 이전 월 저장 (뒤로 가기 시 복원용)
    setPreviousMonth(new Date(currentMonth));
    
    // 선택된 날짜의 월로 현재 월 업데이트하지 않음 (이전 달 유지)
    // 다른 달 보다가 일기 상세 조회 후 뒤로 가기 시 이전 달로 돌아가도록
    
    // 통계 페이지에서 온 경우 선택된 날짜 저장
    if (viewMode === 'stats') {
      setStatsSelectedDate(date);
    }
    
    setShowMapRecommendation(false);
    setViewMode('reading');
  };

  // 일기 작성 시작 핸들러
  const handleStartWriting = (date: Date) => {
    setPreviousViewMode('reading'); // 작성 취소 시 상세 화면으로 복귀
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
    recommendedFood?: { name: string; reason: string };
    imageUrl?: string;
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
    setAnalysisRecommendedFood(emotionData.recommendedFood || null);
    setAnalysisImageUrl(emotionData.imageUrl || null);
    setAnalysisDate(emotionData.date);
    
    // 일기 ID 저장 (장소 추천 기능에서 사용)
    setMapDiaryId(emotionData.diaryId);
    
    // 일기 작성 화면을 닫고 감정 분석 모달 표시
    setViewMode('home');
    setShowEmotionAnalysis(true);
    handleDataChange();
  };

  // 뒤로가기 핸들러 (캘린더로 복귀 또는 이전 뷰로 복귀)
  const handleBackToCalendar = () => {
    setIsFlipping(true);
    setTimeout(() => {
      // 이전 뷰 모드가 'list'이면 목록으로 복귀, 'stats'이면 통계로 복귀, 'reading'이면 상세로 복귀
      const targetView = previousViewMode || 'home';
      setViewMode(targetView);
      
      // 상세 화면('reading')으로 돌아갈 때는 선택된 날짜 유지
      if (targetView !== 'reading') {
        setSelectedDate(null);
      }
      
      setPreviousViewMode(null);
      setShowMapRecommendation(false);
      setIsEditMode(false);
      setExistingDiaryData(null);
      
      // 이전에 조회하던 달로 복원 (다른 달 보다가 일기 상세 조회 후 뒤로 가기 시)
      if (previousMonth) {
        setCurrentMonth(previousMonth);
        setPreviousMonth(null);
      } else if (targetView === 'home') {
        // 홈으로 돌아갈 때만 현재 날짜 기준 월로 복원
        const now = new Date();
        const currentMonthObj = new Date(now.getFullYear(), now.getMonth(), 1);
        setCurrentMonth(currentMonthObj);
      }
      
      // 통계 페이지로 돌아갈 때는 선택된 날짜 유지 (요약 정보 표시용)
      // statsSelectedDate는 EmotionStatsPage에서 관리하므로 여기서는 null로 설정하지 않음
      
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
    setPreviousViewMode('reading'); // 수정 취소 시 상세 화면으로 복귀
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
      // 변경 사항이 없으면 바로 이동
      if (writingPageRef.current && !writingPageRef.current.hasChanges) {
        performNavigation(targetView);
        return;
      }
      setPendingNavigation(targetView);
      // setShowNavigationWarning(true); // 기존 코드 유지
      // 만약 setShowNavigationWarning이 없다면 Child Modal을 사용하는게 맞을 수 있음
      if (writingPageRef.current) {
        writingPageRef.current.showCancelModal();
      }
    } else {
      performNavigation(targetView);
    }
  };

  const performNavigation = (targetView: ViewMode) => {
    setIsFlipping(true);
    setTimeout(() => {
      // 일기 작성 관련 상태 초기화 (모든 뷰 모드 전환 시)
      setIsEditMode(false);
      setExistingDiaryData(null);
      setSelectedDate(null);
      setShowMapRecommendation(false);
      
      setViewMode(targetView);
      
      if (targetView === 'home') {
        const now = new Date();
        const currentMonthObj = new Date(now.getFullYear(), now.getMonth(), 1);
        setCurrentMonth(currentMonthObj);
      }
      setIsFlipping(false);
    }, 200);
  };

  // 하단 내비게이션 바를 통한 취소 확인 핸들러 (DiaryWritingPage의 취소 모달에서 호출)
  const handleNavigationCancelConfirm = async () => {
    console.log('작성/수정 중인 내용 삭제 및 페이지 이동 (하단 내비게이션 바)');
    
    // 일기 작성/수정 중인 경우 업로드한 이미지 삭제 API 호출 (요구사항 10)
    if (viewMode === 'writing' && writingPageRef.current) {
      try {
        await writingPageRef.current.handleNavigationCancel();
        console.log('[북마크 내비게이션] 이미지 삭제 완료');
      } catch (err) {
        console.error('[북마크 내비게이션] 이미지 삭제 중 오류:', err);
        // 이미지 삭제 실패해도 페이지 이동은 계속 진행
      }
    }
    
    if (pendingNavigation) {
      performNavigation(pendingNavigation);
      setPendingNavigation(null);
    }
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
        
        // 로그인 시점 추적: 사용자 ID가 변경되면 새로운 로그인으로 간주
        if (userData.id !== lastUserIdRef.current) {
          console.log('[위험 신호 분석] 새로운 사용자 로그인 감지 - userId:', userData.id, '이전 userId:', lastUserIdRef.current);
          lastUserIdRef.current = userData.id;
        }
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
        // [디버깅용] 위험 신호 분석 시작 로그
        console.log('[위험 신호 분석] 시작 - currentUser:', currentUser?.email, 'viewMode:', viewMode);
        
        // 세션 상태 확인 (이미 표시했는지 확인)
        const { getRiskSessionStatus } = await import('../../services/riskDetection');
        console.log('[위험 신호 분석] session-status API 호출 시작');
        const sessionStatus = await getRiskSessionStatus();
        console.log('[위험 신호 분석] session-status 응답:', sessionStatus);
        
        // ========== 예외 처리 1: 현재 브라우저 세션에서 이미 모달을 표시했는지 확인 (Backend 상태 무시) ==========
        // sessionStorage를 사용하여 페이지 새로고침 시에는 유지하고, 로그아웃/재로그인 시에는 초기화됨
        // (초기화는 useUserApp의 handleLoginSuccess, handleLogout에서 수행)
        const hasShownInSession = sessionStorage.getItem('riskAlertShown') === 'true';
        
        if (hasShownInSession) {
          console.log('[위험 신호 분석] 현재 세션(sessionStorage)에서 이미 모달을 표시했으므로 모달 표시하지 않음');
          // 위험 신호 분석은 수행하되 모달은 표시하지 않음 (최신 위험 레벨은 state에 저장)
          const analysis = await analyzeRiskSignals();
          console.log('[위험 신호 분석] analyze 응답:', analysis);
          setRiskAnalysis(analysis);
          return;
        }
        
        // 위험 신호 분석 (항상 호출하여 최신 위험 레벨 확인)
        console.log('[위험 신호 분석] analyze API 호출 시작');
        const analysis = await analyzeRiskSignals();
        console.log('[위험 신호 분석] analyze 응답:', analysis);
        setRiskAnalysis(analysis);
        
        // 위험 레벨이 medium 이상인 경우 모달 표시 (플로우 9.2)
        // [수정사항] 백엔드의 alreadyShown 여부(sessionStatus.alreadyShown)는 무시하고,
        // 현재 브라우저 세션에서 보여줬는지(hasShownInSession)만 확인하여 표시
        const isRiskLevelMediumOrHigh = analysis.riskLevel === 'medium' || analysis.riskLevel === 'high';
        
        const shouldShowModal = isRiskLevelMediumOrHigh && !hasShownInSession;
        
        if (shouldShowModal) {
          console.log('[위험 신호 분석] 위험 레벨:', analysis.riskLevel, '→ 모달 표시');
          setShowRiskAlert(true);
          
          // 프론트엔드 세션 상태 업데이트: 현재 세션에서 모달을 표시했다고 기록
          hasShownModalInSessionRef.current = true;
          sessionStorage.setItem('riskAlertShown', 'true');
          console.log('[위험 신호 분석] 프론트엔드 세션 상태 업데이트 - sessionStorage: riskAlertShown=true');
          
          // 백엔드 세션 상태 업데이트: 기록용으로 호출 (표시 여부 판단에는 사용하지 않음)
          const { markRiskAlertShown } = await import('../../services/riskDetection');
          console.log('[위험 신호 분석] mark-shown API 호출 시작');
          await markRiskAlertShown();
          console.log('[위험 신호 분석] mark-shown 완료');
        } else {
          console.log('[위험 신호 분석] 모달 표시 조건 불만족 - riskLevel:', analysis.riskLevel, 'hasShownInSession:', hasShownInSession);
        }
      } catch (error) {
        console.error('[위험 신호 분석] 실패:', error);
        // [디버깅용] 에러 상세 정보
        if (error instanceof Error) {
          console.error('[위험 신호 분석] 에러 메시지:', error.message);
          console.error('[위험 신호 분석] 에러 스택:', error.stack);
        }
      }
    };
    
    // 로그인 성공 후 다이어리 메인 화면 진입 시 한 번만 실행
    // viewMode가 'home'이고 currentUser가 있을 때만 실행
    if (currentUser && viewMode === 'home') {
      analyzeRisk();
    }
  }, [currentUser, viewMode]); // refreshKey 제거 (세션 중 재분석 방지)


  const handleGoToSupport = () => {
    setPreviousViewMode(viewMode); // 이전 뷰 모드 저장 (MyPage 또는 Home)
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
      // 일기 작성/수정 중일 때는 DiaryWritingPage의 취소 모달 표시 (뒤로 가기 버튼과 동일한 모달)
      if (writingPageRef.current) {
        // 변경 사항이 없으면 바로 이동
        if (!writingPageRef.current.hasChanges) {
          performNavigation(targetView);
          return;
        }

        setPendingNavigation(targetView);
        writingPageRef.current.showCancelModal();
      } else {
        // ref가 아직 설정되지 않은 경우 즉시 이동 (fallback)
        performNavigation(targetView);
      }
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

  // Header 컴포넌트 (상단 상태바) - 제거됨
  const header = null;

  // Footer 컴포넌트 (하단 탭바)
  // 일기 작성/수정 중에도 하단 내비게이션 바 표시 (요구사항 10, 11)
  const footer = (
    <BottomTabBar 
      activeTab={getCurrentTab()}
      onTabChange={handleTabChange}
    />
  );

  return (
    <div className="relative w-full h-full">
      <MobileLayout header={header} footer={footer}>
        <div className="relative w-full h-full">
          {/* Navigation Warning Modal - 제거됨 (DiaryWritingPage의 취소 모달 사용) */}

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
            {viewMode === 'writing' && !showEmotionAnalysis && (
              <motion.div 
                className="absolute inset-0 bg-white z-50"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={{ 
                  bottom: '64px' // 하단 내비게이션 바 높이만큼 여백 (h-16 = 64px)
                }}
              >
                <DiaryWritingPage 
                  ref={writingPageRef}
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
                  onNavigationCancel={pendingNavigation ? handleNavigationCancelConfirm : undefined}
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* List View */}
          {viewMode === 'list' && (
            <div className="w-full p-4">
              <DiaryListPage 
                onDiaryClick={(date) => {
                  // 일기 목록에서 일기 클릭 시 상세조회로 이동
                  setPreviousViewMode('list'); // 목록에서 왔음을 기록
                  setSelectedDate(date);
                  setViewMode('reading');
                }}

              />
            </div>
          )}

          {/* Stats View */}
          {viewMode === 'stats' && (
            <div className="w-full">
              <EmotionStatsPage 
                onDateClick={handleDateSelect}

                selectedDateFromParent={statsSelectedDate}
                onSelectedDateChange={(date) => setStatsSelectedDate(date)}
                savedViewMode={statsViewMode}
                onViewModeChange={setStatsViewMode}
              />
            </div>
          )}
          
          {/* My Page View */}
          {viewMode === 'mypage' && (
            <div className="w-full p-4">
              <MyPage 
                onModalStateChange={setIsPersonaModalOpen}
                onAccountDeleted={onAccountDeleted}

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
              <SupportResourcesPage 
                onBack={() => {
                  const target = previousViewMode || 'home';
                  setIsFlipping(true);
                  setTimeout(() => {
                    setViewMode(target);
                    // MyPage로 돌아가는 경우 previousViewMode 유지하지 않아도 됨 (MyPage는 탭이므로)
                    setPreviousViewMode(null); 
                    setIsFlipping(false);
                  }, 200);
                }}
              />
            </div>
          )}
        </div>
        </div>
      </MobileLayout>

      {/* Modals - MobileLayout 밖에 배치하여 모든 화면 위에 표시 */}
      <AnimatePresence>
        {showRiskAlert && riskAnalysis && (
          <RiskAlertModal 
            isOpen={showRiskAlert}
            riskLevel={riskAnalysis.riskLevel as 'low' | 'medium' | 'high'}
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
            aiComment={analysisComment}
            recommendedFood={analysisRecommendedFood}
            imageUrl={analysisImageUrl}
            onMapRecommendation={handleEmotionAnalysisMapRecommendation}
          />
        )}
        {showMapRecommendation && (
          <KakaoMapRecommendation
            isOpen={showMapRecommendation}
            onClose={() => setShowMapRecommendation(false)}
            diaryId={mapDiaryId}
            emotion={mapEmotion || (selectedDate ? 'neutral' : '')}
            emotionCategory={mapEmotionCategory || 'neutral'}
            isInline={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}