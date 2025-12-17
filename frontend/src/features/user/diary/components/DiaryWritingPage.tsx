import { useState, useRef, forwardRef, useCallback, useImperativeHandle } from 'react';
import { Sparkles, Loader2, Calendar, Plus, Tag, Image as ImageIcon, X, ArrowLeft, PenLine, Smile, FileText } from 'lucide-react';
import { createDiary, updateDiary, CreateDiaryRequest, UpdateDiaryRequest, DiaryDetail } from '@/features/user/diary/api/diaryApi';
import { uploadImage, deleteImage } from '@/shared/api/uploadApi';
import { apiClient, BASE_URL } from '@/shared/api/client';
import { enumToPersona } from '@/shared/utils/personaConverter';

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
    recommendedFood?: { name: string; reason: string };
    imageUrl?: string;
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
    persona?: string; // 백엔드 Enum (BEST_FRIEND, etc.)
  };
  /** 내비게이션 취소 핸들러 (선택) */
  onNavigationCancel?: () => Promise<void>;
}

// DiaryWritingPage를 forwardRef로 감싸서 부모 컴포넌트에서 메서드 호출 가능하게 함
export const DiaryWritingPage = forwardRef<{
  handleNavigationCancel: () => Promise<void>;
  showCancelModal: () => void; // 하단 내비게이션 바 클릭 시 모달 표시용
  hasChanges: boolean;
}, DiaryWritingPageProps>(({
  selectedDate,
  onFinish,
  onCancel,
  onWritingComplete,
  onSaveSuccess,
  isEditMode = false,
  existingDiary,
  onNavigationCancel
}, ref) => {
  // ========== 기본 입력 상태 ==========

  /** 제목 (필수) */
  const [title, setTitle] = useState(existingDiary?.title || '');

  /** 기분 (선택) */
  const [mood, setMood] = useState(existingDiary?.mood || '');

  /** 날씨 선택 (선택) - 기본값: 맑음 */
  const [weather, setWeather] = useState<string>(existingDiary?.weather || '맑음');

  /** 활동 목록 (선택) */
  const [activities, setActivities] = useState<string[]>(existingDiary?.activities || []);

  /** 활동 입력 필드 */
  const [activityInput, setActivityInput] = useState('');

  /** 이미지 목록 (선택) */
  const [images, setImages] = useState<{ url: string; file?: File }[]>(existingDiary?.images?.map(url => ({ url })) || []);

  /** 본문 (필수) */
  const [content, setContent] = useState(existingDiary?.content || '');

  /** 삭제할 이미지 URL 목록 (수정 모드에서 사용, 저장 시 일괄 삭제) */
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);

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

  /**
   * 북마크 내비게이션 이동 시 이미지 삭제 처리 (요구사항 10)
   * handleCancelConfirm과 동일한 로직 사용
   */
  const handleNavigationCancel = async () => {
    // 이미지 삭제 API 호출 (서버에 업로드된 이미지만 삭제)
    if (isEditMode && existingDiary) {
      // 플로우 4.4: 수정 모드 - 새로 추가한 이미지만 삭제
      const existingImageUrls = existingDiary.images || [];
      const newImages = images.filter(img => !existingImageUrls.includes(img.url));

      if (newImages.length > 0) {
        try {
          for (const image of newImages) {
            // http/https로 시작하거나 상대 경로 (blob:/data: 제외)는 서버 이미지로 간주하여 삭제 시도
            if (image.url && !image.url.startsWith('blob:') && !image.url.startsWith('data:')) {
              try {
                await deleteImage({ imageUrl: image.url });
                console.log('[북마크 내비게이션 이동] 이미지 삭제 성공:', image.url);
              } catch (err) {
                console.error('[북마크 내비게이션 이동] 이미지 삭제 실패:', image.url, err);
                // 삭제 실패해도 계속 진행
              }
            }
          }
        } catch (err) {
          console.error('[북마크 내비게이션 이동] 이미지 삭제 중 오류:', err);
        }
      }
    } else {
      // 플로우 3.5: 새 작성 모드 - 모든 이미지 삭제
      if (images.length > 0) {
        try {
          for (const image of images) {
            // http/https로 시작하거나 상대 경로 (blob:/data: 제외)는 서버 이미지로 간주하여 삭제 시도
            if (image.url && !image.url.startsWith('blob:') && !image.url.startsWith('data:')) {
              try {
                await deleteImage({ imageUrl: image.url });
                console.log('[북마크 내비게이션 이동] 이미지 삭제 성공:', image.url);
              } catch (err) {
                console.error('[북마크 내비게이션 이동] 이미지 삭제 실패:', image.url, err);
                // 삭제 실패해도 계속 진행
              }
            }
          }
        } catch (err) {
          console.error('[북마크 내비게이션 이동] 이미지 삭제 중 오류:', err);
        }
      }
    }
  };

  // ref를 통해 부모 컴포넌트에서 handleNavigationCancel 호출 가능하게 함
  // useCallback으로 감싸서 의존성 배열 최적화
  const handleNavigationCancelMemoized = useCallback(async () => {
    await handleNavigationCancel();
  }, [images, isEditMode, existingDiary]);

  // ========== 변경 감지 (Dirty Check) ==========

  const isDirty = (() => {
    // 1. 이미지 목록 비교
    const currentImageUrls = images.map(img => img.url);
    const initialImageUrls = existingDiary?.images || [];

    const isImagesChanged =
      currentImageUrls.length !== initialImageUrls.length ||
      !currentImageUrls.every((url, index) => url === initialImageUrls[index]);

    // 2. 활동 목록 비교
    const currentActivities = activities;
    const initialActivities = existingDiary?.activities || [];

    const isActivitiesChanged =
      currentActivities.length !== initialActivities.length ||
      !currentActivities.every((act, index) => act === initialActivities[index]);

    if (isEditMode && existingDiary) {
      // 수정 모드: 초기값과 다르면 변경됨
      return (
        title !== existingDiary.title ||
        content !== existingDiary.content ||
        mood !== (existingDiary.mood || '') ||
        weather !== (existingDiary.weather || '맑음') ||
        isActivitiesChanged ||
        isImagesChanged
      );
    } else {
      // 새 작성 모드: 하나라도 입력값이 있으면 변경됨 (날씨 기본값 '맑음' 제외)
      return (
        title.trim() !== '' ||
        content.trim() !== '' ||
        mood !== '' ||
        weather !== '맑음' ||
        activities.length > 0 ||
        images.length > 0
      );
    }
  })();

  useImperativeHandle(ref, () => ({
    handleNavigationCancel: handleNavigationCancelMemoized,
    showCancelModal: () => {
      // 하단 내비게이션 바 클릭 시 취소 모달 표시
      setShowCancelModal(true);
    },
    hasChanges: isDirty
  }), [handleNavigationCancelMemoized, isDirty]);

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
   * 변경 사항이 있는 경우에만 취소 확인 모달을 표시합니다.
   * 변경 사항이 없으면 즉시 뒤로가기를 수행합니다.
   */
  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelModal(true);
    } else {
      onCancel();
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
    // 수정 모드: 취소 시, '새로 추가된 이미지'는 삭제해야 함.
    // 기존 이미지는 건드리지 않음. (deletedImageUrls에 있는 것도 복구=무시)

    // 삭제 대상: images에 있는 것 중 '새로 추가된 것' (기존에 없던 것)
    // AND deletedImageUrls에 있는 것 중 '새로 추가된 것' (추가했다가 지운 것) -> 이것도 지워야 함 (서버에 업로드되어 있으므로)

    const initialRemoteUrls = existingDiary?.images || [];

    // 1. 현재 목록에 있는 새 이미지들
    const newImagesInList = images
      .map(img => img.url)
      .filter(url => url && !url.startsWith('blob:') && !initialRemoteUrls.includes(url));

    // 2. 추가했다가 삭제 목록으로 간 새 이미지들
    const newImagesInDeleted = deletedImageUrls
      .filter(url => !initialRemoteUrls.includes(url));

    const allNewImagesToDelete = [...newImagesInList, ...newImagesInDeleted];

    if (allNewImagesToDelete.length > 0) {
      console.log('[작성 취소] 새로 추가된 이미지 정리:', allNewImagesToDelete);
      for (const url of allNewImagesToDelete) {
        try {
          await deleteImage({ imageUrl: url });
        } catch (e) { console.error('이미지 정리 실패:', e); }
      }
    }

    setShowCancelModal(false);

    // 만약 북마크 내비게이션 취소인 경우 (onNavigationCancel이 존재)
    if (onNavigationCancel) {
      // 비동기 처리여도 모달 닫고 바로 실행
      onNavigationCancel();
    } else {
      onCancel(); // 캘린더 또는 상세보기로 이동
    }
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

      const errorMessage = err.message || '';
      // 서버 연결 실패 (Connection refused, Network Error 등) 감지
      if (
        errorMessage.includes('Network Error') ||
        errorMessage.includes('Connection refused') ||
        errorMessage.includes('timeout') ||
        !err.response // 응답이 아예 없는 경우
      ) {
        setError('이미지 업로드 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(errorMessage || '이미지 업로드에 실패했습니다.');
      }
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
  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];

    // 이미 서버에 있는 이미지(URL)라면 삭제 대기 목록에 추가 (API 호출 지연)
    if (imageToRemove.url && !imageToRemove.url.startsWith('blob:') && !imageToRemove.url.startsWith('data:')) {
      console.log('[이미지 삭제] 삭제 대기 목록에 추가:', imageToRemove.url);
      setDeletedImageUrls(prev => [...prev, imageToRemove.url]);
    }

    // 화면 목록에서 제거
    setImages(images.filter((_, i) => i !== index));
  };

  const calculateAndSaveRiskSignals = async () => {
    try {

      await apiClient.post('/risk-detection/mark-shown');
      console.log('위험 신호 분석 및 세션 저장 완료');
    } catch (error: any) {

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

      // 수정 모드일 경우 변경 사항 확인 (플로우 4.3 최적화)
      if (isEditMode) {
        // 1. 컨텐츠 변경 여부 (Dirty Check) - 이미 계산됨 (isDirty)

        // 2. 페르소나 변경 여부 확인
        let isPersonaChanged = false;
        if (existingDiary?.persona) {
          const savedPersonaKorean = enumToPersona(existingDiary.persona);
          const userStr = localStorage.getItem('user');
          let currentPersonaKorean = '베프'; // 기본값
          if (userStr) {
            const user = JSON.parse(userStr);
            currentPersonaKorean = user.persona || '베프';
          }

          if (savedPersonaKorean !== currentPersonaKorean) {
            isPersonaChanged = true;
          }
        }

        // 변경 사항이 없고 페르소나도 변경되지 않았으면 API 호출 없이 뒤로가기
        if (!isDirty && !isPersonaChanged) {
          console.log('변경 사항 없음, 업데이트 건너뜀');
          onCancel(); // 상세 보기로 복귀
          setIsSaving(false);
          setIsAnalyzingEmotion(false);
          return;
        }
      }

      if (isEditMode) {
        // 수정 모드 (플로우 4.3)
        if (!existingDiary?.id) {
          throw new Error('일기 ID가 없습니다. 수정할 수 없습니다.');
        }

        if (deletedImageUrls.length > 0) {
          console.log('삭제 대기 중인 이미지 일괄 삭제:', deletedImageUrls);
          await Promise.all(deletedImageUrls.map(url => deleteImage({ imageUrl: url }).catch(e => console.warn('이미지 삭제 실패(무시):', e))));
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
        // AI 재분석 여부 확인 (백엔드 로직과 동일하게 프론트에서도 판단)
        // - 본문(content) 변경 여부
        // - 날씨(weather) 변경 여부
        // - 페르소나 변경 여부
        let isPersonaChanged = false;
        if (existingDiary?.persona) {
          const savedPersonaKorean = enumToPersona(existingDiary.persona);
          const userStr = localStorage.getItem('user');
          let currentPersonaKorean = '베프'; // 기본값
          if (userStr) {
            const user = JSON.parse(userStr);
            currentPersonaKorean = user.persona || '베프';
          }
          if (savedPersonaKorean !== currentPersonaKorean) {
            isPersonaChanged = true;
          }
        }

        const isContentChanged = content !== existingDiary!.content;
        const isWeatherChanged = weather !== existingDiary!.weather;
        const isAiAnalysisTriggered = isContentChanged || isWeatherChanged || isPersonaChanged;

        const diaryId = String(existingDiary.id);
        savedDiary = await updateDiary(diaryId, dateKey, updateRequest);
        console.log('일기 수정 완료:', savedDiary);

        // 6. 위험 신호 점수 계산 및 백엔드 전송
        try {
          await calculateAndSaveRiskSignals();
        } catch (riskError) {
          console.error('위험 신호 점수 계산 실패:', riskError);
        }

        if (savedDiary) {
          if (isAiAnalysisTriggered) {
            // 1. AI 분석이 수행된 경우 (본문/날씨/페르소나 변경) -> 모달 표시
            const emotionData = KOBERT_EMOTIONS[savedDiary.emotion as keyof typeof KOBERT_EMOTIONS];
            onFinish({
              emotion: savedDiary.emotion || '중립', // [수정] 이모지가 아니라 감정 이름('행복' 등)을 전달해야 모달에서 매핑됨
              emotionName: emotionData?.name || savedDiary.emotion || '중립',
              emotionCategory: savedDiary.emotionCategory || 'neutral',
              aiComment: savedDiary.aiComment || '',
              recommendedFood: savedDiary.recommendedFood,
              imageUrl: savedDiary.imageUrl,
              date: selectedDate,
              diaryId: savedDiary.id,
            });
          } else {
            // 2. 메타데이터만 변경된 경우 -> 바로 상세 이동
            if (onSaveSuccess) onSaveSuccess(dateKey);
          }
        }

      } else {
        // 새 작성 모드 (플로우 3.3)
        const createRequest: CreateDiaryRequest = {
          date: dateKey,
          title: title.trim(),
          content: content.trim(),
          mood: mood.trim() || undefined,
          weather: weather || undefined,
          activities: activities.length > 0 ? activities : undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        };

        savedDiary = await createDiary(createRequest);
        console.log('일기 저장 완료:', savedDiary);

        // 6. 위험 신호 점수 계산 (새 작성)
        try {
          await calculateAndSaveRiskSignals();
        } catch (riskError) {
          console.error('위험 신호 점수 계산 실패:', riskError);
        }

        if (savedDiary) {
          // 새 작성은 무조건 분석 실행 -> 모달 표시
          const emotionData = KOBERT_EMOTIONS[savedDiary.emotion as keyof typeof KOBERT_EMOTIONS];
          onFinish({
            emotion: savedDiary.emotion || '중립', // [수정] 이모지가 아니라 감정 이름('행복' 등)을 전달해야 모달에서 매핑됨
            emotionName: emotionData?.name || savedDiary.emotion || '중립',
            emotionCategory: savedDiary.emotionCategory || 'neutral',
            aiComment: savedDiary.aiComment || '',
            recommendedFood: savedDiary.recommendedFood,
            imageUrl: savedDiary.imageUrl,
            date: selectedDate,
            diaryId: savedDiary.id,
          });
        }
      }

      // 5. 저장 완료 후 처리 (공통)
      if (onWritingComplete && selectedDate) {
        onWritingComplete(selectedDate);
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
    <div className="flex flex-col h-full w-full bg-[#FAFAF9] dark:bg-stone-950"> {/* 전체 화면 모달 */}
      {/* 상단 헤더 - 고정 */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-emerald-100/50 dark:border-emerald-900/30 px-4 py-3 flex items-center justify-between shadow-sm">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={handleCancelClick}
          disabled={isSaving}
          className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-300"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* 제목 타이틀 */}
        <h1 className="text-lg text-emerald-950 dark:text-emerald-50 font-bold">
          {isEditMode ? '일기 수정' : '일기 작성'}
        </h1>

        <button
          onClick={handleSave}
          disabled={!isValid || isSaving || isAnalyzingEmotion}
          className={`px-4 py-2 rounded-xl transition-all min-h-[40px] flex items-center gap-2 font-medium shadow-sm ${isValid && !isSaving && !isAnalyzingEmotion
            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-emerald-500/20 hover:shadow-lg active:scale-95'
            : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
            }`}
        >
          {isAnalyzingEmotion || isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isAnalyzingEmotion ? 'AI 분석 중...' : '저장 중...'}
            </>
          ) : (
            '완료'
          )}
        </button>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide bg-[#FAFAF9] dark:bg-stone-950">
        <div className="p-5 pb-32 space-y-6 max-w-2xl mx-auto">
          {/* 1. 날짜 및 날씨 - Glass Card */}
          <section className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-900/20 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-100 font-medium">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{formattedDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {WEATHER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setWeather(option.value)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all aspect-square ${weather === option.value
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 shadow-sm'
                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                    }`}
                >
                  <span className="text-2xl mb-1 filter drop-shadow-sm">{option.emoji}</span>
                  <span className={`text-[10px] ${weather === option.value
                    ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-stone-500 dark:text-stone-400'
                    }`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 2. 제목 입력 */}
          <section className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-900/20 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-900/70 dark:text-emerald-100/70 mb-3 flex items-center gap-2">
              <PenLine className="w-4 h-4" />
              제목
            </h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              maxLength={50}
              className="w-full px-4 py-3 text-lg font-bold bg-white dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-stone-400"
              autoFocus={!isEditMode}
            />
          </section>

          {/* 기분 입력 (선택) */}
          <section className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-900/20 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-900/70 dark:text-emerald-100/70 mb-3 flex items-center gap-2">
              <Smile className="w-4 h-4" />
              기분
            </h3>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="지금 기분이 어떠신가요? (선택)"
              maxLength={20}
              className="w-full px-4 py-3 text-base bg-white dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-stone-400"
            />
          </section>

          {/* 3. 본문 입력 */}
          <section className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-900/20 shadow-sm relative">
            <h3 className="text-sm font-semibold text-emerald-900/70 dark:text-emerald-100/70 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              일기 내용
            </h3>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 하루는 어떠셨나요? 자유롭게 기록해보세요."
                className="w-full px-5 py-5 min-h-[300px] text-base leading-relaxed bg-white dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all resize-none placeholder:text-stone-400"
                style={{ lineHeight: '1.8' }}
              />

            </div>
          </section>

          {/* 4. 사진 추가 (선택) */}
          <section className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-900/20 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-900/70 dark:text-emerald-100/70 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              사진 추가
            </h3>

            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide select-none">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 5}
                className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${images.length >= 5
                  ? 'border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed'
                  : 'border-emerald-300 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100/50 hover:border-emerald-400'
                  }`}
              >
                <div className="p-2 rounded-full bg-white shadow-sm">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">추가하기</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />

              {images.map((image, index) => (
                <div key={index} className="relative flex-shrink-0 w-24 h-24 group last:mr-2">
                  <img
                    src={(() => {
                      const url = image.url;
                      if (!url) return '';
                      if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http')) return url;
                      try {
                        const baseUrlObj = new URL(BASE_URL);
                        return `${baseUrlObj.origin}${url.startsWith('/') ? '' : '/'}${url}`;
                      } catch (e) {
                        return url;
                      }
                    })()}
                    alt="이미지"
                    className="w-full h-full object-cover rounded-2xl shadow-sm border border-black/5 bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-400 overflow-hidden"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-md text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 duration-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {images.length > 0 && (
              <p className="text-xs text-stone-500 mt-2 text-right">
                {images.length} / 5 장
              </p>
            )}
          </section>

          {/* 5. 활동 태그 (선택) */}
          <section className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-900/20 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-900/70 dark:text-emerald-100/70 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              활동 태그
            </h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {activities.map((activity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-sm font-medium shadow-sm animate-in zoom-in-50 duration-200"
                >
                  {activity}
                  <button
                    onClick={() => handleRemoveActivity(index)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // 폼 제출 방지
                    handleAddActivity();
                  }
                }}
                placeholder="오늘 어떤 활동을 하셨나요?"
                className="flex-1 px-4 py-2.5 bg-white dark:bg-stone-900/50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all"
              />
              <button
                onClick={handleAddActivity}
                disabled={!activityInput.trim()}
                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-medium text-sm hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                추가
              </button>
            </div>
          </section>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm flex items-center gap-2 animate-in slide-in-from-bottom-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 border border-white/20">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2 text-center">작성을 취소하시겠어요?</h3>
            <p className="text-stone-600 dark:text-stone-400 text-center mb-6 text-sm">
              작성 중인 내용은 저장되지 않으며,<br />
              삭제된 내용은 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                계속 작성
              </button>
              <button
                onClick={handleCancelConfirm}
                className="flex-1 py-3 bg-rose-100 text-rose-600 rounded-xl font-semibold hover:bg-rose-200 transition-colors"
              >
                작성 취소
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Full-screen Loading Overlay */}
      {(isAnalyzingEmotion || isSaving) && (
        <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto touch-none">
          <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-emerald-100 dark:border-emerald-900/30 max-w-xs mx-4 w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              <div className="relative bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-full">
                {isAnalyzingEmotion ? (
                  <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
                ) : (
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                )}
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
                {isAnalyzingEmotion ? 'AI 감정 분석 중' : '일기 저장 중'}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {isAnalyzingEmotion ? '오늘의 감정을 분석하고 있어요...' : '잠시만 기다려주세요...'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
});

DiaryWritingPage.displayName = 'DiaryWritingPage';