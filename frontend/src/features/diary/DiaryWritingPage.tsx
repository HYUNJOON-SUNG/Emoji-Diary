import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Calendar, Plus, Tag, Image as ImageIcon, X } from 'lucide-react';
import { createDiary, updateDiary, CreateDiaryRequest, UpdateDiaryRequest, DiaryDetail } from '../../services/diaryApi';
import { uploadImage, deleteImage } from '../../services/uploadApi';
import { BASE_URL } from '../../services/api';
import { theme } from '../../styles/theme';
import { apiClient } from '../../services/api';

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
 * [API 명세서 Section 4.1, 4.2] KoBERT 감정 분석 결과:
 * - emotion: "행복" | "중립" | "당황" | "슬픔" | "분노" | "불안" | "혐오"
 * - KoBERT가 일기 본문(content)만 분석하여 자동으로 저장
 * - 결과는 Diaries.emotion 컬럼에 저장됨 (ERD: Diaries.emotion, ENUM)
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
/**
 * 날씨 선택 옵션 (플로우 3.2)
 * 
 * [백엔드 팀] Diary.java Enum Weather 일치 필요:
 * - 맑음, 흐림, 비, 눈, 천둥, 안개
 * - value 값은 백엔드로 전송되는 Enum String 값과 일치해야 함
 */
const WEATHER_OPTIONS = [
  { value: '맑음', label: '맑음', emoji: '☀️' },
  { value: '흐림', label: '흐림', emoji: '☁️' },
  { value: '비', label: '비', emoji: '🌧️' },
  { value: '눈', label: '눈', emoji: '❄️' },
  { value: '천둥', label: '천둥', emoji: '⚡' },
  { value: '안개', label: '안개', emoji: '🌫️' },
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
    aiComment?: string;
    date: Date;
    diaryId?: string; // 일기 ID (장소 추천 기능에서 사용)
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
    id?: string | number; // 일기 ID (수정 시 필수, API 명세서: PUT /api/diaries/{diaryId})
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
  
  /** KoBERT 감정 분석 중 (백엔드 AI 처리 중) */
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
   * [API 명세서 Section 9.1] POST /api/upload/image
   * Request: FormData { image: File }
   * Response: { url: string }
   */
  /**
   * 이미지 업로드 핸들러 (플로우 3.2)
   * 
   * 동작:
   * 1. 파일 선택 다이얼로그에서 이미지 선택 (다중 선택 가능)
   * 2. FormData 생성 및 서버에 업로드 (각 파일별로 순차 처리)
   * 3. 업로드 성공 시 이미지 URL 획득
   * 4. 이미지 목록에 추가
   * 
   * [API 명세서 Section 9.1] POST /api/upload/image
   * Request: FormData { image: File }
   * Response: { url: string }
   */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // 최대 이미지 개수 제한 (예: 5장)
    if (images.length + files.length > 5) {
      setError('이미지는 최대 5장까지 업로드할 수 있습니다.');
      return;
    }

    // 각 파일을 순차적으로 업로드
    const newImages: { url: string; file: File }[] = [];
    
    // 로딩 상태 표시는 개별적으로 하기 어려우므로 전체 에러만 관리하거나
    // 각 이미지별 로딩 상태를 관리해야 함. 여기서는 간단히 처리.
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 이미지 파일 검증
        if (!file.type.startsWith('image/')) {
          setError('이미지 파일만 업로드 가능합니다.');
          continue;
        }

        // POST /api/upload/image
        const response = await uploadImage({ image: file });
        // 백엔드가 반환한 URL (상대 경로일 수 있음)
        const url = response.imageUrl;
        newImages.push({ url, file });
      }
      
      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
        setError('');
      }
    } catch (err: any) {
      console.error('이미지 업로드 실패:', err);
      setError(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      // input 초기화 (동일 파일 다시 선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      // DELETE /api/upload/image
      // 이미 서버에 업로드된 이미지인 경우에만 삭제 API 호출
      if (imageToRemove.url && !imageToRemove.url.startsWith('blob:')) {
        await deleteImage({ imageUrl: imageToRemove.url });
      }
      
      setImages(images.filter((_, i) => i !== index));
    } catch (err: any) {
      console.error('이미지 삭제 실패:', err);
      // 삭제 실패해도 목록에서 제거 (로컬 상태 정리)
      setImages(images.filter((_, i) => i !== index));
      setError(err.message || '이미지 삭제에 실패했습니다.');
    }
  };
  
  /**
   * 위험 신호 분석 및 세션 저장
   * 
   * [백엔드 API 사용]
   * - 백엔드에 이미 위험 신호 분석 API가 구현되어 있음
   * - POST /api/risk-detection/mark-shown: 세션 저장 (markShown 메서드가 내부적으로 analyze를 호출하여 최신 위험 레벨로 세션 저장)
   * 
   * [백엔드 구현 확인]
   * - RiskDetectionService.markShown(): 내부적으로 analyze()를 호출하여 최신 위험 레벨을 계산한 후 세션 저장
   *   - 같은 날짜의 세션이 있으면 업데이트, 없으면 새로 생성
   *   - 세션은 Risk_Detection_Sessions 테이블에 저장되며, 관리자 대시보드의 위험 레벨 분포 통계에 사용됨
   * 
   * [주의사항]
   * - markShown()이 내부적으로 analyze()를 호출하므로, analyze()를 별도로 호출할 필요 없음
   * - 일기 작성/수정 후 위험 신호를 계산하여 세션에 저장하면, 관리자 대시보드에서 위험 레벨 분포 통계를 조회할 수 있음
   */
  const calculateAndSaveRiskSignals = async () => {
    try {
      // 백엔드의 markShown API를 호출하여 위험 신호 분석 및 세션 저장 수행
      // markShown()이 내부적으로 analyze()를 호출하여 최신 위험 레벨을 계산한 후 세션 저장
      // 세션은 Risk_Detection_Sessions 테이블에 저장되며, 관리자 대시보드의 위험 레벨 분포 통계에 사용됨
      await apiClient.post('/risk-detection/mark-shown');
      console.log('위험 신호 분석 및 세션 저장 완료');
    } catch (error: any) {
      // 위험 신호 분석 실패는 일기 저장에 영향을 주지 않음
      console.error('위험 신호 분석 및 세션 저장 실패:', error);
      // 에러를 throw하지 않음 (일기 저장은 성공한 것으로 처리)
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
   * [API 명세서 Section 4.1, 4.2]
   * - POST /api/diaries - 새 작성
   * - PUT /api/diaries/{diaryId} - 수정
   * 
   * 처리 순서 (백엔드에서 자동 수행):
   * 1. KoBERT 감정 분석: 일기 본문(content)만 분석하여 7가지 감정 중 하나로 분류
   *    - 감정 종류: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
   *    - 결과는 Diaries.emotion 컬럼에 저장됨
   * 2. AI 이미지 생성 (NanoVana API): 일기 본문, 날씨, KoBERT 감정 분석 결과 활용
   *    - 새 작성 시: 이미지 생성
   *    - 수정 시: 수정된 내용 반영하여 이미지 재생성
   * 3. AI 코멘트 생성 (Gemini API): 일기 본문, 날씨, KoBERT 감정 분석 결과, 페르소나 스타일 반영
   * 4. 음식 추천 생성 (Gemini API): 일기 본문, 날씨, KoBERT 감정 분석 결과 반영
   * 
   * [ERD 설계서 참고 - Diaries 테이블]
   * - emotion: ENUM (KoBERT 분석 결과, 자동 저장)
   * - image_url: AI 생성 이미지 URL (NanoVana API)
   * - ai_comment: AI 코멘트 (Gemini API)
   * - recommended_food: JSON 형식 음식 추천 정보 (Gemini API)
   * - kobert_analysis: JSON 형식 KoBERT 상세 분석 결과
   */
  const handleSave = async () => {
    if (!isValid || !selectedDate) return;
    
    setIsSaving(true);
    setIsAnalyzingEmotion(true);
    setError('');
    
    try {
      // [API 명세서 Section 4.1, 4.2]
      // KoBERT 감정 분석, AI 이미지 생성, AI 코멘트 생성, 음식 추천은 모두 백엔드에서 자동으로 처리됩니다.
      // 프론트엔드는 일기 저장 API 호출 시 백엔드가 AI 서버와 통신하여 처리하고,
      // 응답에 emotion, imageUrl, aiComment, recommendedFood가 포함되어 반환됩니다.
      
      // 로딩 상태 표시 (백엔드에서 AI 처리 중)
      setIsAnalyzingEmotion(true);
      
      // 3. 사용자 업로드 이미지 URL 목록 준비
      // [API 명세서 Section 9.1]
      // 이미지 업로드는 handleImageUpload에서 이미 처리되었으므로,
      // images 배열의 url은 모두 서버 URL입니다.
      const imageUrls: string[] = images
        .map(image => image.url)
        .filter((url): url is string => !!url && !url.startsWith('blob:'));
      
      // 4. 일기 저장 API 호출 (플로우 3.3, 4.3)
      // [API 명세서 Section 4.1, 4.2]
      // 백엔드가 자동으로 KoBERT 감정 분석, AI 이미지 생성, AI 코멘트 생성, 음식 추천 생성 처리
      // 로컬 시간대로 날짜 변환 (UTC 시간대 문제 방지)
      const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      let savedDiary: DiaryDetail | null = null;
      
      if (isEditMode) {
        // 수정 모드 (플로우 4.3)
        if (!existingDiary?.id) {
          throw new Error('일기 ID가 없습니다. 수정할 수 없습니다.');
        }
        
        const updateRequest: UpdateDiaryRequest = {
          title: title.trim(),
          content: content.trim(), // API 명세서: content
          mood: mood.trim() || undefined,
          weather: weather || undefined,
          activities: activities.length > 0 ? activities : undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined, // API 명세서: images (사용자 업로드 이미지)
          // imageUrl 필드는 제거됨 (백엔드가 자동으로 재생성)
        };
        
        // PUT /api/diaries/{diaryId}
        // API 명세서: diaryId는 숫자 (BIGINT)
        // 백엔드가 KoBERT 감정 재분석, AI 이미지 재생성, AI 코멘트 재생성, 음식 추천 재생성 처리
        const diaryId = String(existingDiary.id); // 숫자 또는 문자열로 변환
        savedDiary = await updateDiary(diaryId, dateKey, updateRequest);
        console.log('일기 수정 완료:', savedDiary);
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
          // emotion, imageUrl 필드는 제거됨 (백엔드가 자동으로 생성)
        };
        
        // POST /api/diaries
        // 백엔드가 KoBERT 감정 분석, AI 이미지 생성, AI 코멘트 생성, 음식 추천 생성 처리
        savedDiary = await createDiary(createRequest);
        console.log('일기 저장 완료:', savedDiary);
      }
      
      // 5. 저장 완료 후 처리
      // 백엔드 응답에서 emotion, imageUrl, aiComment, recommendedFood를 받음
      if (onWritingComplete && selectedDate) {
        onWritingComplete(selectedDate);
      }
      
      // 6. 위험 신호 점수 계산 및 백엔드 전송 (비동기 처리, 에러 발생해도 일기 저장은 성공)
      // [프론트엔드 구현] 일기 작성/수정 후 위험 신호 점수 계산
      try {
        await calculateAndSaveRiskSignals();
      } catch (riskError) {
        console.error('위험 신호 점수 계산 실패:', riskError);
        // 위험 신호 점수 계산 실패해도 일기 저장은 성공한 것으로 처리
      }
      
      if (isEditMode && onSaveSuccess) {
        // 수정 모드: 바로 상세보기로 이동 (플로우 4.3)
        onSaveSuccess(dateKey);
      } else if (savedDiary) {
        // 새 작성 모드: 감정 분석 모달 표시 (플로우 3.4)
        // 백엔드 응답에서 KoBERT 분석 결과 사용
        const emotionData = KOBERT_EMOTIONS[savedDiary.emotion as keyof typeof KOBERT_EMOTIONS];
        onFinish({
          emotion: emotionData?.emoji || '😐', // 백엔드 응답의 KoBERT 분석 결과 이모지
          emotionName: emotionData?.name || savedDiary.emotion || '중립', // 백엔드 응답의 KoBERT 분석 결과 이름
          emotionCategory: savedDiary.emotionCategory || 'neutral', // 백엔드 응답의 감정 카테고리
          aiComment: savedDiary.aiComment || '', // AI 코멘트 전달
          date: selectedDate,
          diaryId: savedDiary.id, // 일기 ID 전달 (장소 추천 기능에서 사용)
        });
      }
      
    } catch (err: any) {
      console.error('일기 저장 실패:', err);
      
      // AI 서버 오류 감지 및 처리
      const errorMessage = err?.message || '';
      const isAIServerError = 
        errorMessage.includes('AI') || 
        errorMessage.includes('서버') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('ECONNREFUSED') ||
        err?.response?.status === 503 ||
        err?.response?.status === 502;
      
      if (isAIServerError) {
        setError('AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요. (AI 이미지 생성, 코멘트 생성, 음식 추천 기능이 일시적으로 사용 불가능할 수 있습니다.)');
      } else if (err?.response?.status === 401) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (err?.response?.status === 500) {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(err?.message || '일기 저장에 실패했습니다. 다시 시도해주세요.');
      }
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
    <div className="flex flex-col h-full w-full bg-white"> {/* 전체 화면 모달 */}
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
          disabled={!isValid || isSaving || isAnalyzingEmotion}
          className={`px-4 py-2 rounded-lg transition-all min-h-[44px] flex items-center gap-2 ${
            isValid && !isSaving && !isAnalyzingEmotion
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isAnalyzingEmotion || isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isAnalyzingEmotion ? 'AI 처리 중...' : '저장 중...'}
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
                multiple
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
                        src={(() => {
                          if (!image.url) return '';
                          if (image.url.startsWith('blob:') || image.url.startsWith('http')) return image.url;
                          // 로컬 헬퍼 대신 직접 BASE_URL 조합
                          // BASE_URL 예: http://localhost:8080/api
                          const baseUrlOrigin = BASE_URL.endsWith('/api') ? BASE_URL.slice(0, -4) : BASE_URL;
                          return `${baseUrlOrigin}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
                        })()}
                        alt={`업로드 이미지 ${index + 1}`}
                        className="w-full rounded-lg border border-blue-200"
                        style={{ 
                          maxHeight: '300px',
                          objectFit: 'contain',
                          objectPosition: 'center'
                        }}
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
          
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="mt-4 p-4 bg-rose-50 border-2 border-rose-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-rose-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm text-rose-800 font-medium mb-1">오류 발생</p>
                  <p className="text-xs text-rose-600 whitespace-pre-wrap">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-rose-400 hover:text-rose-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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