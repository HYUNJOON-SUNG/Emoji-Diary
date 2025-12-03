import { useState, useEffect, useRef } from 'react';
import { Smile, Cloud, Sun, CloudRain, CloudSnow, Wind, MapPin, Camera, X, Save, Sparkles, Loader2, Calendar, Plus, Tag, Image as ImageIcon } from 'lucide-react';
import { createDiary, updateDiary, CreateDiaryRequest, UpdateDiaryRequest } from '../../services/diaryApi';
import { theme } from '../../styles/theme';

/**
 * 감정 데이터 (플로우 3.2)
 * - 12가지 감정 선택 옵션
 * - 긍정 7가지, 부정 5가지
 */
const EMOTIONS = [
  // 긍정 감정
  { id: 'joy', name: '기쁨', emoji: '😊', category: 'positive' },
  { id: 'love', name: '사랑', emoji: '❤️', category: 'positive' },
  { id: 'peace', name: '평온', emoji: '😌', category: 'positive' },
  { id: 'gratitude', name: '감사', emoji: '🙏', category: 'positive' },
  { id: 'excitement', name: '설렘', emoji: '🤩', category: 'positive' },
  { id: 'energetic', name: '신남', emoji: '🎉', category: 'positive' },
  { id: 'inspired', name: '영감', emoji: '✨', category: 'positive' },
  // 부정 감정
  { id: 'sad', name: '슬픔', emoji: '😢', category: 'negative' },
  { id: 'annoyed', name: '짜증', emoji: '😤', category: 'negative' },
  { id: 'anxious', name: '불안', emoji: '😰', category: 'negative' },
  { id: 'angry', name: '화남', emoji: '😡', category: 'negative' },
  { id: 'tired', name: '피곤', emoji: '😴', category: 'negative' },
];

/**
 * 날씨 선택 옵션 (플로우 3.2)
 */
const WEATHER_OPTIONS = [
  { value: 'sunny', label: '맑음', emoji: '☀️' },
  { value: 'cloudy', label: '흐림', emoji: '☁️' },
  { value: 'rainy', label: '비', emoji: '🌧️' },
  { value: 'snowy', label: '눈', emoji: '❄️' },
  { value: 'windy', label: '바람', emoji: '💨' },
  { value: 'foggy', label: '안개', emoji: '🌫️' },
];

/**
 * 일기 작성 페이지 Props
 */
interface DiaryWritingPageProps {
  /** 선택된 날짜 */
  selectedDate: Date | null;
  /** 작성 완료 후 콜백 (감정 분석 모달 표시) */
  onFinish: (emotionData: {
    emotion: string;
    emotionName: string;
    emotionCategory: string;
    date: Date;
  }) => void;
  /** 취소 버튼 클릭 시 콜백 (캘린더로 돌아가기 또는 상세보기로) */
  onCancel: () => void;
  /** AI 이미지 생성 함수 (나노바나나 API) - 새 작성 시만 사용 */
  onGenerateImage?: (content: string, emotion: string, weather?: string) => Promise<string>;
  /** 장소 추천 콜백 */
  onMapRecommendation?: (emotion: string, emotionCategory: string) => void;
  /** 작성 완료 후 날짜 전달 */
  onWritingComplete?: (date: Date) => void;
  /** 저장 성공 후 콜백 (플로우 4.3: 수정 완료 시 상세보기로 이동) */
  onSaveSuccess?: (dateKey: string) => void;
  /** 수정 모드 여부 (플로우 4) */
  isEditMode?: boolean;
  /** 수정할 기존 일기 데이터 (플로우 4.1) */
  existingDiary?: {
    title: string;
    content: string;
    emotion: string;
    mood?: string;
    weather?: string;
    activities?: string[];
    images?: string[];
    aiImage?: string;
  };
}

export function DiaryWritingPage({ 
  selectedDate, 
  onFinish, 
  onCancel, 
  onGenerateImage, 
  onMapRecommendation, 
  onWritingComplete, 
  onSaveSuccess,
  isEditMode = false,
  existingDiary
}: DiaryWritingPageProps) {
  // ========== 기본 입력 상태 ==========
  
  /** 제목 (필수) */
  const [title, setTitle] = useState(existingDiary?.title || '');
  
  /** 선택된 감정 ID (필수) */
  // existingDiary.emotion은 이모지이므로 ID로 변환
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(() => {
    if (existingDiary?.emotion) {
      const emotionData = EMOTIONS.find(e => e.emoji === existingDiary.emotion);
      return emotionData?.id || null;
    }
    return null;
  });
  
  /** 기분 입력 (선택) */
  const [mood, setMood] = useState(existingDiary?.mood || '');
  
  /** 날씨 선택 (선택) */
  const [weather, setWeather] = useState<string>(existingDiary?.weather || '');
  
  /** 활동 목록 (선택) */
  const [activities, setActivities] = useState<string[]>(existingDiary?.activities || []);
  
  /** 활동 입력 필드 */
  const [activityInput, setActivityInput] = useState('');
  
  /** 이미지 목록 (선택) */
  const [images, setImages] = useState<{ url: string; file?: File }[]>(existingDiary?.images?.map(url => ({ url })) || []);
  
  /** 본문 (필수) */
  const [content, setContent] = useState(existingDiary?.content || '');
  
  // ========== UI 상태 ==========
  
  /** 감정 선택 모달 표시 여부 */
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  
  /** 저장 중 로딩 상태 */
  const [isSaving, setIsSaving] = useState(false);
  
  /** AI 이미지 생성 중 */
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  /** 에러 메시지 */
  const [error, setError] = useState('');
  
  /** 파일 input ref */
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  /** 취소 확인 모달 표시 여부 (플로우 3.5) */
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // ========== 유효성 검증 ==========
  
  /**
   * 필수 항목 검증 (플로우 3.3)
   * - 제목: 빈 값이 아닐 것
   * - 본문: 빈 값이 아닐 것
   * - 감정: 선택되어 있을 것
   */
  const isValid = 
    title.trim() !== '' && 
    content.trim() !== '' && 
    selectedEmotion !== null;
  
  // ========== 이벤트 핸들러 ==========
  
  /**
   * 감정 선택 핸들러 (플로우 3.2)
   * 
   * 동작:
   * 1. 감정 카드 클릭
   * 2. 감정 선택 상태 업데이트
   * 3. 모달 자동 닫기
   */
  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    setShowEmotionModal(false);
  };
  
  /**
   * 취소 버튼 클릭 핸들러 (플로우 3.5, 4.4)
   * 
   * ===== 새 작성 모드 (플로우 3.5) =====
   * 1. 작성된 내용이 있는지 확인
   * 2. 내용이 없으면 → 즉시 캘린더로 이동
   * 3. 내용이 있으면 → 취소 확인 모달 표시
   * 
   * ===== 수정 모드 (플로우 4.4) =====
   * 1. 수정된 내용이 있는지 확인 (원본과 비교)
   * 2. 수정 없으면 → 즉시 상세보기로 이동
   * 3. 수정 있으면 → 취소 확인 모달 표시
   * 
   * 취소 확인 모달:
   * - 새 작성: "작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?"
   * - 수정: "수정한 내용이 사라집니다. 정말 취소하시겠습니까?"
   */
  const handleCancelClick = () => {
    if (isEditMode && existingDiary) {
      // 플로우 4.4: 수정 모드 - 원본과 비교
      const hasChanges = 
        title.trim() !== existingDiary.title ||
        content.trim() !== existingDiary.content ||
        selectedEmotion !== existingDiary.emotion ||
        mood.trim() !== (existingDiary.mood || '') ||
        weather !== (existingDiary.weather || '') ||
        JSON.stringify(activities) !== JSON.stringify(existingDiary.activities || []) ||
        images.length !== (existingDiary.images?.length || 0);
      
      if (hasChanges) {
        setShowCancelModal(true);
      } else {
        onCancel(); // 수정 없으면 즉시 상세보기로
      }
    } else {
      // 플로우 3.5: 새 작성 모드 - 내용 확인
      const hasContent = 
        title.trim() !== '' || 
        content.trim() !== '' || 
        selectedEmotion !== null || 
        mood.trim() !== '' || 
        weather !== '' || 
        activities.length > 0 || 
        images.length > 0;
      
      if (hasContent) {
        setShowCancelModal(true);
      } else {
        onCancel();
      }
    }
  };
  
  /**
   * 취소 확인 핸들러 (플로우 3.5, 4.4)
   * 
   * ===== 새 작성 모드 (플로우 3.5) =====
   * 1. 업로드된 이미지 삭제 API 호출
   * 2. 작성 내용 삭제
   * 3. 캘린더로 이동
   * 
   * ===== 수정 모드 (플로우 4.4) =====
   * 1. 새로 추가한 이미지만 삭제 API 호출 (기존 이미지 제외)
   * 2. 수정 내용 삭제 (원본 유지)
   * 3. 상세보기로 이동
   * 
   * [백엔드 팀] DELETE /api/upload/image
   * Request: { url: string }
   * Response: { success: boolean }
   */
  const handleCancelConfirm = async () => {
    if (isEditMode && existingDiary) {
      // 플로우 4.4: 수정 모드 - 새로 추가한 이미지만 삭제
      const existingImageUrls = existingDiary.images || [];
      const newImages = images.filter(img => !existingImageUrls.includes(img.url));
      
      if (newImages.length > 0) {
        try {
          for (const image of newImages) {
            // await fetch('/api/upload/image', {
            //   method: 'DELETE',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ url: image.url }),
            // });
          }
        } catch (err) {
          console.error('이미지 삭제 실패:', err);
        }
      }
    } else {
      // 플로우 3.5: 새 작성 모드 - 모든 이미지 삭제
      if (images.length > 0) {
        try {
          for (const image of images) {
            // await fetch('/api/upload/image', {
            //   method: 'DELETE',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ url: image.url }),
            // });
          }
        } catch (err) {
          console.error('이미지 삭제 실패:', err);
        }
      }
    }
    
    setShowCancelModal(false);
    onCancel(); // 캘린더 또는 상세보기로 이동
  };
  
  /**
   * 활동 추가 핸들러 (플로우 3.2)
   * 
   * 동작:
   * 1. 활동 입력 필드에서 텍스트 가져오기
   * 2. 빈 값이 아니면 활동 목록에 추가
   * 3. 입력 필드 초기화
   * 
   * 트리거:
   * - "추가" 버튼 클릭
   * - Enter 키 입력
   */
  const handleAddActivity = () => {
    if (activityInput.trim()) {
      setActivities([...activities, activityInput.trim()]);
      setActivityInput('');
    }
  };
  
  /**
   * 활동 삭제 핸들러 (플로우 3.2)
   * 
   * @param index - 삭제할 활동의 인덱스
   */
  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };
  
  /**
   * 이미지 업로드 핸들러 (플로우 3.2)
   * 
   * 동작:
   * 1. 파일 선택 다이얼로그에서 이미지 선택
   * 2. FormData 생성 및 서버에 업로드
   * 3. 업로드 성공 시 이미지 URL 획득
   * 4. 이미지 목록에 추가
   * 5. 미리보기 표시
   * 
   * [백엔드 팀] POST /api/upload/image
   * Request: FormData { image: File }
   * Response: { url: string }
   */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    
    try {
      // [TODO: 백엔드 팀] 실제 이미지 업로드 API 연동
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await fetch('/api/upload/image', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const { url } = await response.json();
      
      // Mock: 로컬 URL 생성
      const url = URL.createObjectURL(file);
      
      setImages([...images, { url, file }]);
      setError('');
    } catch (err) {
      setError('이미지 업로드에 실패했습니다.');
    }
  };
  
  /**
   * 이미지 삭제 핸들러 (플로우 3.2)
   * 
   * 동작:
   * 1. 이미지 목록에서 제거
   * 2. 서버에서도 이미지 삭제 (이미 업로드된 경우)
   * 
   * [백엔드 팀] DELETE /api/upload/image
   * Request: { url: string }
   * Response: { success: boolean }
   * 
   * @param index - 삭제할 이미지의 인덱스
   */
  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      // [TODO: 백엔드 팀] 서버에서 이미지 삭제
      // await fetch('/api/upload/image', {
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: imageToRemove.url }),
      // });
      
      setImages(images.filter((_, i) => i !== index));
    } catch (err) {
      setError('이미지 삭제에 실패했습니다.');
    }
  };
  
  /**
   * 일기 저장 핸들러 (플로우 3.3, 4.3)
   * 
   * ===== 새 작성 모드 (플로우 3.3) =====
   * 1. KoBERT 감정 분석
   * 2. AI 이미지 생성 (나노바나나 API)
   * 3. 일기 저장
   * 4. AI 코멘트 생성 (제미나이 API)
   * 5. 감정 분석 모달 표시
   * 
   * ===== 수정 모드 (플로우 4.3) =====
   * 1. KoBERT 감정 분석 (수정된 본문)
   * 2. AI 이미지 재생성 안 함 (기존 AI 이미지 유지)
   * 3. 일기 수정 저장
   * 4. AI 코멘트 재생성 (제미나이 API)
   * 5. 감정 분석 모달 표시 안 함 → 바로 상세보기로 이동
   * 
   * [백엔드 팀 API]
   * - POST /api/ai/analyze-emotion (KoBERT) - 새 작성 & 수정 모두 사용
   * - POST /api/ai/generate-image (나노바나나) - 새 작성만 사용
   * - POST /api/diary/save - 새 작성
   * - PUT /api/diary/update - 수정
   * - POST /api/ai/generate-comment (제미나이) - 새 작성 & 수정 모두 사용
   */
  const handleSave = async () => {
    if (!isValid || !selectedDate) return;
    
    setIsSaving(true);
    setError('');
    
    try {
      // 1. KoBERT 감정 분석 (플로우 3.3, 4.3)
      // [TODO: 백엔드 팀] KoBERT 모델 연동
      const kobertResult = {
        emotion: selectedEmotion,
        confidence: 0.85,
        details: { positive: 0.7, negative: 0.3 },
      };
      
      // 2. AI 이미지 생성 (나노바나나 API) - 새 작성만 (플로우 3.3)
      let aiImageUrl = existingDiary?.aiImage || ''; // 수정 모드는 기존 AI 이미지 유지 (플로우 4.3)
      
      if (!isEditMode && onGenerateImage) {
        // 새 작성 모드만 AI 이미지 생성
        setIsGeneratingImage(true);
        try {
          const selectedEmotionData = EMOTIONS.find(e => e.id === selectedEmotion);
          aiImageUrl = await onGenerateImage(
            content, 
            selectedEmotionData?.emoji || '😊', 
            weather
          );
        } catch (err) {
          console.error('AI 이미지 생성 실패:', err);
        } finally {
          setIsGeneratingImage(false);
        }
      }
      
      // 3. 일기 저장 API 호출 (플로우 3.3, 4.3)
      // 로컬 시간대로 날짜 변환 (UTC 시간대 문제 방지)
      const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      // 감정 ID를 이모지로 변환
      const selectedEmotionData = EMOTIONS.find(e => e.id === selectedEmotion);
      const emotionEmoji = selectedEmotionData?.emoji || '😊';
      
      if (isEditMode) {
        // 수정 모드 (플로우 4.3)
        const updateRequest: UpdateDiaryRequest = {
          title: title.trim(),
          note: content.trim(),
          emotion: emotionEmoji,
          mood: mood.trim(),
          weather: weather || undefined,
          activities: activities.length > 0 ? activities : undefined,
          imageUrl: aiImageUrl || undefined,
        };
        
        // existingDiary가 있다면 id도 필요하지만, 지금은 date로 식별
        await updateDiary('diary-' + dateKey, dateKey, updateRequest);
        console.log('일기 수정 완료:', updateRequest);
      } else {
        // 새 작성 모드 (플로우 3.3)
        const createRequest: CreateDiaryRequest = {
          date: dateKey,
          title: title.trim(),
          note: content.trim(),
          emotion: emotionEmoji,
          mood: mood.trim(),
          weather: weather || undefined,
          activities: activities.length > 0 ? activities : undefined,
          imageUrl: aiImageUrl || undefined,
        };
        
        await createDiary(createRequest);
        console.log('일기 저장 완료:', createRequest);
      }
      
      // 4. AI 코멘트 생성/재생성 (제미나이 API) - 플로우 3.3, 4.3
      // [TODO: AI 팀] 제미나이 API 연동
      // - KoBERT 감정 분석 결과 활용
      // - 사용자가 선택한 감정 정보 활용
      // - localStorage.getItem('aiPersona')에서 페르소나 스타일 가져오기
      
      // 5. 저장 완료 후 처리
      if (onWritingComplete && selectedDate) {
        onWritingComplete(selectedDate);
      }
      
      if (isEditMode && onSaveSuccess) {
        // 수정 모드: 바로 상세보기로 이동 (플로우 4.3)
        onSaveSuccess(dateKey);
      } else {
        // 새 작성 모드: 감정 분석 모달 표시 (플로우 3.4)
        const selectedEmotionData = EMOTIONS.find(e => e.id === selectedEmotion);
        if (selectedEmotionData) {
          onFinish({
            emotion: selectedEmotionData.emoji,
            emotionName: selectedEmotionData.name,
            emotionCategory: selectedEmotionData.category,
            date: selectedDate,
          });
        }
      }
      
    } catch (err) {
      console.error('일기 저장 실패:', err);
      setError('일기 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // ========== 선택된 감정 데이터 조회 ==========
  const selectedEmotionData = EMOTIONS.find(e => e.id === selectedEmotion);
  
  // ========== 날짜 포맷팅 ==========
  const formattedDate = selectedDate 
    ? selectedDate.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      })
    : '';
  
  // ========== 렌더링 ==========
  
  return (
    <div className="flex flex-col h-full bg-white"> {/* 전체 화면 모달 */}
      {/* 상단 헤더 - 고정 */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleCancelClick}
          disabled={isSaving}
          className="text-slate-600 hover:text-slate-900 transition-colors px-2 py-1"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h1 className="text-lg text-slate-800">
          {isEditMode ? '일기 수정' : '일기 작성'}
        </h1>
        
        <button
          onClick={handleSave}
          disabled={!isValid || isSaving || isGeneratingImage}
          className={`px-4 py-2 rounded-lg transition-all min-h-[44px] ${
            isValid && !isSaving && !isGeneratingImage
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? '저장 중...' : '완료'}
        </button>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 space-y-6 pb-8">
          {/* 날짜 표시 */}
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-5 h-5" />
            <span className="text-base">{formattedDate}</span>
          </div>
          
          <div className="space-y-6">
            {/* 1. 제목 입력 (필수) */}
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                제목 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="오늘의 제목을 입력하세요"
                className={theme.input.base}
              />
            </div>
            
            {/* 2. 감정 선택 (필수) */}
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                오늘의 감정 <span className="text-rose-500">*</span>
              </label>
              <button
                onClick={() => setShowEmotionModal(true)}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedEmotionData
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-blue-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {selectedEmotionData ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedEmotionData.emoji}</span>
                    <span className="text-sm text-slate-700">{selectedEmotionData.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Smile className="w-5 h-5" />
                    <span className="text-sm">감정을 선택해주세요</span>
                  </div>
                )}
              </button>
            </div>
            
            {/* 3. 기분 입력 (선택) */}
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                기분
              </label>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="예: 행복, 평온"
                className={theme.input.base}
              />
            </div>
            
            {/* 4. 날씨 선택 (선택) */}
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                날씨
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className={theme.input.base}
              >
                <option value="">선택하세요</option>
                {WEATHER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 5. 활동 추가 (선택) */}
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                활동
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={activityInput}
                  onChange={(e) => setActivityInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddActivity();
                    }
                  }}
                  placeholder="활동을 입력하세요"
                  className={`flex-1 ${theme.input.base}`}
                />
                <button
                  onClick={handleAddActivity}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="활동 추가"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* 활동 태그 목록 */}
              {activities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm border border-blue-300"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>{activity}</span>
                      <button
                        onClick={() => handleRemoveActivity(index)}
                        className="hover:text-blue-900 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* 6. 이미지 추가 (선택) */}
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                이미지
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm">이미지 추가</span>
                </div>
              </button>
              
              {/* 이미지 미리보기 */}
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`업로드 이미지 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-blue-200"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* 7. 본문 작성 */}
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                오늘의 이야기 <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 하루 어떤 일이 있었나요? 자유롭게 작성해보세요..."
                rows={10}
                className={`flex-1 w-full p-4 text-sm bg-white/50 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors resize-none ${theme.textPrimary}`}
              />
            </div>
          </div>
          
          {/* 필수 항목 안내 */}
          {!isValid && (
            <div className="mt-3 text-xs text-slate-500 text-right">
              * 제목, 감정, 본문은 필수 항목입니다
            </div>
          )}
        </div>
      </div>
      
      {/* 
        감정 선택 모달 (플로우 3.2)
        
        12가지 감정 선택:
        - 긍정 7가지: 기쁨, 사랑, 평온, 감사, 설렘, 신남, 영감
        - 부정 5가지: 슬픔, 짜증, 불안, 화남, 피곤
      */}
      {showEmotionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-blue-200">
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 sm:px-6 py-4 border-b-2 border-blue-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg text-slate-800">오늘의 감정을 선택하세요</h3>
              <button
                onClick={() => setShowEmotionModal(false)}
                className="p-1 hover:bg-blue-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            {/* 감정 그리드 */}
            <div className="p-4 sm:p-6">
              {/* 긍정 감정 */}
              <div className="mb-6">
                <h4 className="text-sm text-slate-600 mb-3">긍정 감정</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {EMOTIONS.filter(e => e.category === 'positive').map((emotion) => (
                    <button
                      key={emotion.id}
                      onClick={() => handleEmotionSelect(emotion.id)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        selectedEmotion === emotion.id
                          ? 'border-blue-500 bg-blue-100 shadow-lg scale-105'
                          : 'border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:scale-102'
                      }`}
                    >
                      <div className="text-3xl sm:text-4xl mb-2">{emotion.emoji}</div>
                      <div className="text-xs sm:text-sm text-slate-700">{emotion.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 부정 감정 */}
              <div>
                <h4 className="text-sm text-slate-600 mb-3">부정 감정</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {EMOTIONS.filter(e => e.category === 'negative').map((emotion) => (
                    <button
                      key={emotion.id}
                      onClick={() => handleEmotionSelect(emotion.id)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        selectedEmotion === emotion.id
                          ? 'border-blue-500 bg-blue-100 shadow-lg scale-105'
                          : 'border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:scale-102'
                      }`}
                    >
                      <div className="text-3xl sm:text-4xl mb-2">{emotion.emoji}</div>
                      <div className="text-xs sm:text-sm text-slate-700">{emotion.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 
        취소 확인 모달 (플로우 3.5)
        
        - 취소 버튼 클릭 시 표시
        - "취소" 버튼 클릭 시 일기 작성 페이지 종료
        - "계속 작성" 버튼 클릭 시 모달 닫기
      */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden border-2 border-blue-200">
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 sm:px-6 py-4 border-b-2 border-blue-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg text-slate-800">작성 중인 일기를 취소하시겠습니까?</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 hover:bg-blue-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            {/* 모달 내용 */}
            <div className="p-4 sm:p-6">
              <p className="text-sm text-slate-700">
                {isEditMode ? "수정한 내용이 사라집니다. 정말 취소하시겠습니까?" : "작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?"}
              </p>
            </div>
            
            {/* 하단 버튼 영역 */}
            <div className="px-4 sm:px-6 py-4 border-t-2 border-blue-200 flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-6 py-2.5 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors"
              >
                계속 작성
              </button>
              
              <button
                onClick={handleCancelConfirm}
                className="flex-1 px-6 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 active:bg-rose-700 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}