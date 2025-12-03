import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Calendar, Plus, Tag, Image as ImageIcon, X } from 'lucide-react';
import { createDiary, updateDiary, CreateDiaryRequest, UpdateDiaryRequest } from '../../services/diaryApi';
import { theme } from '../../styles/theme';

/**
 * KoBERT 감정 분석 결과 매핑 (플로우 3.3, 3.4)
 * 
 * [AI 팀] KoBERT 모델이 분석하는 7가지 감정:
 * - 행복(😊), 중립(😐), 당황(😳), 슬픔(😢), 분노(😠), 불안(😰), 혐오(🤢)
 * 
 * 카테고리 분류:
 * - 긍정: 행복
 * - 중립: 중립, 당황
 * - 부정: 슬픔, 분노, 불안, 혐오
 * 
 * [백엔드 팀] KoBERT API 응답 형식:
 * - emotion: "행복" | "중립" | "당황" | "슬픔" | "분노" | "불안" | "혐오"
 * - confidence: 0.0 ~ 1.0 (신뢰도)
 */
const KOBERT_EMOTIONS = {
  '행복': { emoji: '😊', name: '행복', category: 'positive' },
  '중립': { emoji: '😐', name: '중립', category: 'neutral' },
  '당황': { emoji: '😳', name: '당황', category: 'neutral' },
  '슬픔': { emoji: '😢', name: '슬픔', category: 'negative' },
  '분노': { emoji: '😠', name: '분노', category: 'negative' },
  '불안': { emoji: '😰', name: '불안', category: 'negative' },
  '혐오': { emoji: '🤢', name: '혐오', category: 'negative' },
};

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
  
  /**
   * KoBERT 감정 분석 결과 (플로우 3.3, 4.3)
   * - 일기 저장 시 KoBERT API로 자동 분석됨
   * - 수정 모드: 기존 일기의 감정 정보 (이모지 형식)
   * - 새 작성 모드: null (저장 시 분석됨)
   */
  const [kobertEmotion, setKobertEmotion] = useState<string | null>(() => {
    // 수정 모드: 기존 일기의 감정 이모지 사용
    if (existingDiary?.emotion) {
      return existingDiary.emotion;
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
  
  /** 저장 중 로딩 상태 */
  const [isSaving, setIsSaving] = useState(false);
  
  /** AI 이미지 생성 중 */
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  /** KoBERT 감정 분석 중 */
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);
  
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
   * - 감정: KoBERT 자동 분석되므로 검증 불필요
   */
  const isValid = 
    title.trim() !== '' && 
    content.trim() !== '';
  
  // ========== 이벤트 핸들러 ==========
  
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
   * 1. KoBERT 감정 분석 (일기 본문 분석) → 7가지 감정 중 하나로 분류
   *    - 분석 결과: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
   *    - KoBERT 분석 결과가 사용자에게 표시되는 감정이 됨
   * 2. AI 이미지 생성 (나노바나나 API)
   *    - 일기 작성 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과 활용
   * 3. 일기 저장 API 호출
   *    - 일기 데이터 전송 (제목, 본문, 기분, 날씨, 활동, 사용자 업로드 이미지 URL 목록, KoBERT 감정 분석 결과, AI 생성 이미지 URL)
   *    - 감정 분석 결과는 `emotion` 컬럼에 저장됨
   * 4. AI 코멘트 생성 (제미나이 API)
   *    - 일기 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과, 페르소나 스타일 반영
   * 5. 음식 추천 생성 (제미나이 API)
   *    - 일기 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과 반영하여 추천 음식 1개 생성
   *    - 추천된 음식을 DB에 저장
   * 6. 감정 분석 모달 표시 (플로우 3.4)
   * 
   * ===== 수정 모드 (플로우 4.3) =====
   * 1. KoBERT 감정 분석 (수정된 본문 분석)
   *    - 수정된 본문을 분석하여 7가지 감정 중 하나로 재분류
   *    - 주요 감정을 추출하여 `emotion` 컬럼에 업데이트
   *    - 참고: 일기 수정 시에는 이미지를 재생성하지 않으므로 KoBERT 결과는 코멘트 및 추천에만 사용
   * 2. AI 이미지 재생성 안 함 (기존 AI 이미지 유지)
   * 3. 일기 수정 저장
   *    - 수정된 일기 데이터 전송 (제목, 본문, 기분, 날씨, 활동, AI 생성 이미지 URL, 사용자 업로드 이미지 URL 목록)
   * 4. AI 코멘트 재생성 (제미나이 API)
   *    - 수정된 일기 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과, 페르소나 스타일 반영
   * 5. 음식 추천 재생성 (제미나이 API)
   *    - 수정된 일기 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과 반영하여 추천 음식 1개 재생성
   *    - 재생성된 음식을 DB에 업데이트
   * 6. 감정 분석 모달 표시 안 함 → 바로 상세보기로 이동
   * 
   * [백엔드 팀 API]
   * - POST /api/ai/kobert-analyze (KoBERT) - 새 작성 & 수정 모두 사용
   *   - Request: { content: string } (일기 본문)
   *   - Response: { emotion: string, confidence: number }
   *     - emotion: "행복" | "중립" | "당황" | "슬픔" | "분노" | "불안" | "혐오"
   * - POST /api/ai/generate-image (나노바나나) - 새 작성만 사용
   * - POST /api/diaries - 새 작성
   * - PUT /api/diaries/{id} - 수정
   * - POST /api/ai/generate-comment (제미나이) - 새 작성 & 수정 모두 사용
   * - POST /api/ai/generate-food-recommendation (제미나이) - 새 작성 & 수정 모두 사용
   *   - Request: { title, content, mood, weather, activities, emotion }
   *   - Response: { name: string, reason: string }
   */
  const handleSave = async () => {
    if (!isValid || !selectedDate) return;
    
    setIsSaving(true);
    setIsAnalyzingEmotion(true);
    setError('');
    
    try {
      // 1. KoBERT 감정 분석 (플로우 3.3, 4.3)
      // [백엔드 팀] KoBERT 모델 연동 필요
      // POST /api/ai/kobert-analyze
      // Request: { content: string } (일기 본문)
      // Response: { emotion: string, confidence: number }
      //   - emotion: "행복" | "중립" | "당황" | "슬픔" | "분노" | "불안" | "혐오"
      
      let kobertEmotionResult: string = '중립'; // 기본값
      let kobertConfidence: number = 0;
      
      try {
        // [TODO: 백엔드 팀] 실제 KoBERT API 호출로 대체
        // const response = await fetch('/api/ai/kobert-analyze', {
        //   method: 'POST',
        //   headers: { 
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        //   },
        //   body: JSON.stringify({ content: content.trim() })
        // });
        // const data = await response.json();
        // kobertEmotionResult = data.emotion; // "행복", "슬픔" 등
        // kobertConfidence = data.confidence;
        
        // Mock: 간단한 텍스트 분석 (실제로는 KoBERT API 사용)
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('행복') || lowerContent.includes('기쁘') || lowerContent.includes('좋아')) {
          kobertEmotionResult = '행복';
        } else if (lowerContent.includes('슬프') || lowerContent.includes('우울') || lowerContent.includes('힘들')) {
          kobertEmotionResult = '슬픔';
        } else if (lowerContent.includes('화') || lowerContent.includes('짜증') || lowerContent.includes('분노')) {
          kobertEmotionResult = '분노';
        } else if (lowerContent.includes('불안') || lowerContent.includes('걱정') || lowerContent.includes('두려')) {
          kobertEmotionResult = '불안';
        } else if (lowerContent.includes('혐오') || lowerContent.includes('싫어')) {
          kobertEmotionResult = '혐오';
        } else if (lowerContent.includes('당황') || lowerContent.includes('놀라')) {
          kobertEmotionResult = '당황';
        } else {
          kobertEmotionResult = '중립';
        }
        kobertConfidence = 0.85;
        
        // KoBERT 분석 결과를 이모지로 변환
        const emotionData = KOBERT_EMOTIONS[kobertEmotionResult as keyof typeof KOBERT_EMOTIONS];
        if (emotionData) {
          setKobertEmotion(emotionData.emoji);
        }
      } catch (err) {
        console.error('KoBERT 감정 분석 실패:', err);
        // 기본값 사용
        kobertEmotionResult = '중립';
        setKobertEmotion('😐');
      } finally {
        setIsAnalyzingEmotion(false);
      }
      
      // KoBERT 분석 결과를 이모지로 변환
      const emotionData = KOBERT_EMOTIONS[kobertEmotionResult as keyof typeof KOBERT_EMOTIONS];
      const emotionEmoji = emotionData?.emoji || '😐';
      const emotionCategory = emotionData?.category || 'neutral';
      
      // 2. AI 이미지 생성 (나노바나나 API) - 새 작성만 (플로우 3.3)
      let aiImageUrl = existingDiary?.aiImage || ''; // 수정 모드는 기존 AI 이미지 유지 (플로우 4.3)
      
      if (!isEditMode && onGenerateImage) {
        // 새 작성 모드만 AI 이미지 생성
        setIsGeneratingImage(true);
        try {
          // [AI 팀] 나노바나나 API 호출
          // 일기 작성 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과 활용
          aiImageUrl = await onGenerateImage(
            `${title}\n${content}`, 
            emotionEmoji, 
            weather
          );
        } catch (err) {
          console.error('AI 이미지 생성 실패:', err);
        } finally {
          setIsGeneratingImage(false);
        }
      }
      
      // 3. 사용자 업로드 이미지 URL 목록 준비
      // [백엔드 팀] 실제 이미지 업로드 API 연동 필요
      // 현재는 로컬 URL이지만, 실제로는 서버에 업로드 후 URL 받아야 함
      const imageUrls: string[] = [];
      for (const image of images) {
        if (image.url && !image.url.startsWith('blob:')) {
          // 이미 서버 URL인 경우
          imageUrls.push(image.url);
        } else {
          // [TODO: 백엔드 팀] 실제 이미지 업로드 API 호출
          // const formData = new FormData();
          // formData.append('image', image.file!);
          // const uploadResponse = await fetch('/api/upload/image', {
          //   method: 'POST',
          //   headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
          //   body: formData,
          // });
          // const result = await uploadResponse.json();
          // if (result.success) {
          //   imageUrls.push(result.data.imageUrl);
          // }
        }
      }
      
      // 4. 일기 저장 API 호출 (플로우 3.3, 4.3)
      // 로컬 시간대로 날짜 변환 (UTC 시간대 문제 방지)
      const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      if (isEditMode) {
        // 수정 모드 (플로우 4.3)
        const updateRequest: UpdateDiaryRequest = {
          title: title.trim(),
          content: content.trim(), // API 명세서: content
          mood: mood.trim() || undefined,
          weather: weather || undefined,
          activities: activities.length > 0 ? activities : undefined,
          imageUrl: aiImageUrl || undefined, // AI 생성 이미지 (기존 이미지 유지, 재생성 안 함)
          images: imageUrls.length > 0 ? imageUrls : undefined, // API 명세서: images (사용자 업로드 이미지)
        };
        
        // [백엔드 팀] 일기 수정 API 호출
        // PUT /api/diaries/{id}
        // - emotion 필드는 제거됨 (KoBERT가 수정된 본문을 재분석하여 자동으로 업데이트)
        // - AI 코멘트 재생성 및 음식 추천 재생성은 백엔드에서 처리
        await updateDiary('diary-' + dateKey, dateKey, updateRequest);
        console.log('일기 수정 완료:', updateRequest);
      } else {
        // 새 작성 모드 (플로우 3.3)
        const createRequest: CreateDiaryRequest = {
          date: dateKey,
          title: title.trim(),
          content: content.trim(), // API 명세서: content
          mood: mood.trim() || undefined,
          weather: weather || undefined,
          activities: activities.length > 0 ? activities : undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined, // API 명세서: images (사용자 업로드 이미지)
        };
        
        // [백엔드 팀] 일기 작성 API 호출
        // POST /api/diaries
        // - emotion 필드는 제거됨 (KoBERT가 자동으로 분석하여 저장)
        // - AI 이미지 생성, AI 코멘트 생성, 음식 추천 생성은 백엔드에서 처리
        await createDiary(createRequest);
        console.log('일기 저장 완료:', createRequest);
      }
      
      // 5. AI 코멘트 생성/재생성 및 음식 추천 생성/재생성은 백엔드에서 처리됨
      // [AI 팀] 백엔드에서 제미나이 API 호출하여 처리
      // - AI 코멘트: 일기 내용 + KoBERT 감정 분석 결과 + 페르소나 스타일
      // - 음식 추천: 일기 내용 + KoBERT 감정 분석 결과
      
      // 6. 저장 완료 후 처리
      if (onWritingComplete && selectedDate) {
        onWritingComplete(selectedDate);
      }
      
      if (isEditMode && onSaveSuccess) {
        // 수정 모드: 바로 상세보기로 이동 (플로우 4.3)
        onSaveSuccess(dateKey);
      } else {
        // 새 작성 모드: 감정 분석 모달 표시 (플로우 3.4)
        // KoBERT 분석 결과를 전달
          onFinish({
          emotion: emotionEmoji, // KoBERT 분석 결과 이모지
          emotionName: emotionData?.name || '중립', // KoBERT 분석 결과 이름
          emotionCategory: emotionCategory, // 긍정/중립/부정
            date: selectedDate,
          });
      }
      
    } catch (err) {
      console.error('일기 저장 실패:', err);
      setError('일기 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
      setIsAnalyzingEmotion(false);
    }
  };
  
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
          disabled={!isValid || isSaving || isGeneratingImage || isAnalyzingEmotion}
          className={`px-4 py-2 rounded-lg transition-all min-h-[44px] flex items-center gap-2 ${
            isValid && !isSaving && !isGeneratingImage && !isAnalyzingEmotion
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isAnalyzingEmotion ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              감정 분석 중...
            </>
          ) : isGeneratingImage ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              그림 생성 중...
            </>
          ) : isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              저장 중...
            </>
          ) : (
            '완료'
          )}
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
            
            {/* 
              감정 분석 안내 (플로우 3.2)
              
              명세서 요구사항:
              - 감정 선택 기능 없음
              - 일기 저장 시 KoBERT가 자동으로 감정 분석
              - 사용자에게는 안내 메시지만 표시
            */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    AI가 감정을 자동으로 분석해드려요
                  </p>
                  <p className="text-xs text-blue-600">
                    일기를 작성하고 저장하면, AI가 본문을 분석하여 감정을 자동으로 파악합니다.
                  </p>
                  </div>
                  </div>
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
              * 제목, 본문은 필수 항목입니다
            </div>
          )}
        </div>
      </div>
      
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