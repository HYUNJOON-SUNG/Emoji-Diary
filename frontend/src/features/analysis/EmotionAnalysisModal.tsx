/**
 * ========================================
 * 감정 분석 결과 모달 컴포넌트 (플로우 3.4)
 * ========================================
 * 
 * [화면 구성]
 * - 일기 저장 완료 후 표시되는 모달
 * - 파란색 가죽 다이어리 테두리 스타일
 * - 종이 질감 배경
 * - 감정별 색상 테마 (긍정: 파란색, 부정: 빨간색)
 * - 스프링 애니메이션 효과
 * 
 * [플로우 3.3: 일기 작성 저장 및 처리]
 * 
 * "작성 완료" 버튼 클릭 시:
 * 1. 시스템: 제목, 본문 필수 항목 검증
 *    - 검증 실패 → 저장 불가 (버튼 비활성화)
 * 
 * 2. 검증 통과 시:
 *    - 로딩 상태 표시 ("저장 중...")
 * 
 * 3. **KoBERT 모델을 통한 감정 분석 (일기 본문 분석)**
 *    [AI 팀 작업 필요]
 *    - 일기 본문을 KoBERT 모델로 분석
 *    - **KoBERT 분석 결과가 사용자에게 표시되는 감정이 됨**
 *    - 7가지 감정 중 하나로 분류: 행복😊, 중립😐, 당황😳, 슬픔😢, 분노😠, 불안😰, 혐오🤢
 *    - AI 이미지 생성, AI 코멘트 생성, 장소 추천 등에 활용됨
 * 
 * 4. AI 이미지 생성 시작 ("그림 생성 중..." 표시)
 *    [AI 팀 작업 필요 - 나노바나나 API]
 *    - 일기 작성 내용(제목, 본문, 기분, 날씨, 활동 등)과 KoBERT 감정 분석 결과를 활용
 *    - 나노바나나 API를 통해 일기 내용과 감정 뉘앙스를 반영한 그림일기 형태의 이미지 생성
 *    - 생성 완료 → 이미지 URL 획득
 * 
 * 5. 일기 저장 API 호출
 *    [백엔드 팀 작업 필요]
 *    - 엔드포인트: POST /api/diaries
 *    - 일기 데이터 전송 (제목, 본문, 기분, 날씨, 활동, 이미지 URL, KoBERT 감정 분석 결과)
 *    - 저장 성공 → AI 코멘트 생성
 * 
 * 6. AI 코멘트 생성
 *    [AI 팀 작업 필요 - 제미나이 API]
 *    - 제미나이 API를 통한 AI 코멘트 생성
 *    - 입력:
 *      * 일기 내용(제목, 본문, 기분, 날씨, 활동)
 *      * KoBERT 감정 분석 결과 (emotion, emotionCategory)
 *      * 페르소나 스타일 (localStorage.getItem('aiPersona'))
 *    - 출력: 페르소나 말투로 작성된 공감 메시지 (2-3문장)
 * 
 * 7. 음식 추천 생성
 *    [AI 팀 작업 필요 - 제미나이 API]
 *    - 제미나이 API를 통한 음식 추천 생성
 *    - 입력: 일기 내용(제목, 본문, 기분, 날씨, 활동) + KoBERT 감정 분석 결과
 *    - 출력: { name: string, reason: string }
 *    - DB에 저장
 * 
 * [플로우 3.4: 감정 분석 결과 표시 (일기 작성 후)]
 * 
 * **화면**: 감정 분석 모달
 * 
 * **모달 표시 내용**:
 * 
 * 1. **KoBERT가 분석한 감정 이모지** (큰 크기)
 *    - 일기 본문을 KoBERT로 분석한 결과 이모지
 *    - 7가지 감정: 행복😊, 중립😐, 당황😳, 슬픔😢, 분노😠, 불안😰, 혐오🤢
 *    - 스프링 애니메이션으로 확대 표시
 * 
 * 2. **KoBERT가 분석한 감정 카테고리 배지** (예: "행복", "슬픔")
 *    - KoBERT 분석 결과 기준
 *    - 감정별 색상으로 구분된 배경 (긍정: 파란색, 부정: 빨간색)
 * 
 * 3. **AI 코멘트** (제미나이 API로 생성, 선택한 페르소나 말투로 작성)
 *    - KoBERT 감정 분석 결과를 반영하여 생성
 *    - 페르소나 스타일 적용 (friend, parent, expert, mentor, therapist, poet)
 *    - 공감과 위로의 메시지
 * 
 * **사용자 선택지**:
 * 
 * 1. **"장소 추천" 버튼** (감정 분석 성공 시만 표시)
 *    - 클릭 → 장소 추천 화면으로 이동
 *    - 모달 닫기
 *    - KoBERT 분석된 emotionCategory를 기반으로 장소 추천
 * 
 * 2. **"닫기" 버튼**
 *    - 클릭 → **방금 작성한 일기의 상세보기 페이지로 이동**
 *    - 해당 날짜 일기 내용 확인 가능
 *    - AI 코멘트, AI 이미지 포함된 전체 일기 표시
 * 
 * **분석 실패 시**:
 * - 에러 아이콘 및 메시지 표시
 *   * "일기 저장은 완료되었으나, 감정 분석에 실패했습니다."
 * - "확인" 버튼 → 방금 작성한 일기의 상세보기 페이지로 이동
 * - 일기 내용은 저장되었으나 AI 코멘트는 생성되지 않음
 * 
 * [AI 팀 작업 필요]
 * 
 * 1. **KoBERT 감정 분석**
 *    - 모델: KoBERT (한국어 감정 분석)
 *    - 입력: 일기 본문 (note)
 *    - 출력: { emotion: string, confidence: number }
 *      - emotion: "행복" | "중립" | "당황" | "슬픔" | "분노" | "불안" | "혐오"
 *      - 이모지 매핑: 행복😊, 중립😐, 당황😳, 슬픔😢, 분노😠, 불안😰, 혐오🤢
 *    - 용도: 사용자에게 표시되는 감정, AI 이미지 생성, AI 코멘트 생성, 장소 추천, 통계 분석
 * 
 * 2. **제미나이 API AI 코멘트 생성**
 *    - API: Google Gemini API
 *    - 입력:
 *      * 일기 내용(제목, 본문, 기분, 날씨, 활동)
 *      * KoBERT 분석 결과 (emotion, emotionCategory)
 *      * 페르소나 ID (localStorage.getItem('aiPersona'))
 *    - 출력: 페르소나 스타일에 맞는 공감 메시지 (2-3문장)
 * 
 * 3. **제미나이 API 음식 추천 생성**
 *    - API: Google Gemini API
 *    - 입력: 일기 내용(제목, 본문, 기분, 날씨, 활동) + KoBERT 감정 분석 결과
 *    - 출력: { name: string, reason: string }
 * 
 * 4. **나노바나나 API AI 이미지 생성**
 *    - API: Naver Nanovana API
 *    - 입력:
 *      * 일기 내용 (title, note, mood, weather, activities)
 *      * KoBERT 감정 분석 결과 (emotion, emotionCategory)
 *    - 출력: 그림일기 형태의 이미지 URL
 */

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * EmotionAnalysisModal 컴포넌트 Props
 */
interface EmotionAnalysisModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  
  /** 모달 닫기 콜백 */
  onClose: () => void;
  
  /** 
   * KoBERT가 분석한 감정 이모지 (플로우 3.4)
   * - 일기 본문을 KoBERT로 분석한 결과 이모지
   * - 7가지 감정: 행복😊, 중립😐, 당황😳, 슬픔😢, 분노😠, 불안😰, 혐오🤢
   * - 모달에서 큰 크기로 표시됨
   */
  emotion: string | null;
  
  /** 
   * KoBERT가 분석한 감정 카테고리 (플로우 3.4)
   * - KoBERT 분석 결과: positive, neutral, negative
   * - 감정 카테고리 배지로 표시됨
   * - 색상 테마 결정에 사용
   */
  emotionCategory: string | null;
  
  /** 
   * AI 코멘트 (제미나이 API 결과, 페르소나 반영)
   * - KoBERT 분석 결과 + 사용자 선택 감정 + 페르소나 스타일 반영
   * - 공감과 위로의 메시지 (2-3문장)
   */
  aiComment: string | null;
  
  /** 
   * 에러 메시지 (AI 분석 실패 시)
   * - 일기 저장은 성공했으나 AI 분석만 실패한 경우
   */
  error?: string | null;
  
  /** 
   * 장소 추천 버튼 클릭 콜백 (플로우 3.4, 8.1)
   * - 클릭 시 장소 추천 화면으로 이동
   * - KoBERT emotionCategory를 기반으로 장소 추천
   */
  onMapRecommendation?: () => void;
  
  /** 
   * 일기 상세보기로 이동 콜백 (플로우 3.4)
   * - 닫기/확인 버튼 클릭 시 호출
   * - 방금 작성한 일기의 상세보기 페이지로 이동
   */
  onCloseToCalendar?: () => void;
}

/**
 * KoBERT 감정 이모지별 한글 이름
 * 
 * [AI 팀] KoBERT 분석 결과와 매핑
 * - KoBERT가 분석한 7가지 감정: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
 * - 이모지와 한글 이름 매핑
 */
const emotionLabels: { [key: string]: string } = {
  '😊': '행복',
  '😐': '중립',
  '😳': '당황',
  '😢': '슬픔',
  '😠': '분노',
  '😰': '불안',
  '🤢': '혐오',
};

/**
 * KoBERT 감정 이모지별 색상 테마
 * 
 * 디자인 컨셉:
 * - 긍정 감정: 파란색 계열 (blue, sky, cyan, teal, indigo)
 * - 부정 감정: 빨간색 계열 (red, rose, pink)
 * - 중립 감정: 회색 계열 (stone, gray)
 * - 파스텔 톤으로 부드러운 느낌
 */
const emotionColors: { [key: string]: { bg: string; border: string; text: string } } = {
  // 긍정 감정 - 파란색/시안 파스텔 톤
  '😊': { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-800' }, // 행복
  
  // 중립 감정 - 회색 계열
  '😐': { bg: 'bg-stone-100', border: 'border-stone-300', text: 'text-stone-800' }, // 중립
  '😳': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800' }, // 당황
  
  // 부정 감정 - 빨간색/로즈 파스텔 톤
  '😢': { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' }, // 슬픔
  '😠': { bg: 'bg-rose-200', border: 'border-rose-400', text: 'text-rose-900' }, // 분노
  '😰': { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' }, // 불안
  '🤢': { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800' }, // 혐오
};

export function EmotionAnalysisModal({
  isOpen,
  onClose,
  emotion,
  userEmotionLabel,
  emotionCategory,
  aiComment,
  error,
  onMapRecommendation,
  onCloseToCalendar,
}: EmotionAnalysisModalProps) {
  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 플로우 3.4: KoBERT가 분석한 감정 이모지 기반으로 레이블 표시
  // - emotion 이모지를 기반으로 한글 이름 매핑
  // - 7가지 감정: 행복😊, 중립😐, 당황😳, 슬픔😢, 분노😠, 불안😰, 혐오🤢
  const displayLabel = emotion ? emotionLabels[emotion] : '중립';
  
  // 색상은 emotion 이모지 기반으로 선택
  // 안전한 기본값 설정: emotion이 없거나 정의되지 않은 값이면 중립 색상 사용
  const safeEmotion = emotion && emotionColors[emotion] 
    ? emotion 
    : '😐';
  const colors = emotionColors[safeEmotion];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 
            배경 딤 처리 (Backdrop)
            - 반투명 검은색 배경
            - 블러 효과
            - 클릭 시 모달 닫기
          */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* 
            모달 컨테이너
            - 화면 중앙 정렬
            - 클릭 이벤트 전파 방지 (모달 내부 클릭 시 닫히지 않음)
          */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 rounded-2xl p-1 shadow-2xl max-w-md w-full pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 
                가죽 다이어리 테두리 질감
                - 갈색 가죽 텍스처
                - 블렌딩 모드로 자연스럽게 합성
              */}
              <div
                className="absolute inset-0 rounded-2xl opacity-20 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1716295177956-420a647c83ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYnJvd24lMjB0ZXh0dXJlfGVufDF8fHx8MTc2MzYxMjQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080)',
                  backgroundSize: 'cover',
                }}
              />

              {/* 모달 내부 컨텐츠 영역 */}
              <div className="relative bg-blue-50 rounded-xl p-6 sm:p-8">
                {/* 종이 질감 배경 */}
                <div
                  className="absolute inset-0 opacity-30 rounded-xl pointer-events-none"
                  style={{
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1719563015025-83946fb49e49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjBwYXBlciUyMHRleHR1cmV8ZW58MXx8fHwxNzYzNTI2MzIzfDA&ixlib=rb-4.1.0&q=80&w=1080)',
                    backgroundSize: 'cover',
                  }}
                />

                {/* 닫기 버튼 (우측 상단) */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-stone-200 hover:bg-stone-300 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5 text-stone-700" />
                </button>

                <div className="relative space-y-6">
                  {/* 모달 제목 */}
                  <div className="text-center">
                    <h2 className="text-stone-800">감정 분석 결과</h2>
                  </div>

                  {/* 
                    에러 상태 표시
                    
                    표시 조건:
                    - AI 분석 실패 (KoBERT 또는 제미나이 API 에러)
                    - 일기 저장은 성공했지만 AI 분석만 실패
                    
                    [AI 팀] AI 서비스 안정성 중요
                  */}
                  {error && (
                    <div className="space-y-4 text-center">
                      <div className="text-5xl">⚠️</div>
                      <div className="space-y-2">
                        <p className="text-sm text-stone-700">일기 저장은 완료되었으나,</p>
                        <p className="text-sm text-stone-700">감정 분석에 실패했습니다.</p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={onClose}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
                        >
                          확인
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 
                    성공 상태 표시
                    
                    표시 조건:
                    - 에러 없음
                    - emotion(사용자 선택 감정) 존재
                    - emotionCategory(AI 분석 감정) 존재
                  */}
                  {!error && emotion && emotionCategory && (
                    <div className="space-y-6">
                      {/* 
                        감정 표시 영역 (플로우 3.4)
                        - KoBERT가 분석한 감정 이모지 (큰 크기)
                        - KoBERT가 분석한 감정 카테고리 배지 (예: "행복", "슬픔")
                          * 7가지 감정: 행복😊, 중립😐, 당황😳, 슬픔😢, 분노😠, 불안😰, 혐오🤢
                      */}
                      <div className="flex flex-col items-center space-y-4">
                        {/* 
                          감정 이모지 (스프링 애니메이션)
                          - 0.2초 지연 후 확대 애니메이션
                          - 플로우 3.4: KoBERT가 분석한 감정 이모지 표시
                        */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.2 }}
                          className="text-6xl sm:text-7xl"
                        >
                          {emotion}
                        </motion.div>

                        {/* 
                          감정 카테고리 배지 (페이드인 애니메이션)
                          - 0.3초 지연 후 표시
                          - 플로우 3.4: KoBERT가 분석한 감정 레이블 표시 (예: "행복", "슬픔")
                          - 감정별 색상 테마 적용 (긍정/중립/부정 구분)
                        */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className={`px-6 py-2 rounded-full border-2 ${colors.bg} ${colors.border}`}
                        >
                          <span className={`text-sm ${colors.text}`}>{displayLabel}</span>
                        </motion.div>
                      </div>

                      {/* 
                        AI 코멘트 영역 (플로우 3.3의 핵심)
                        
                        [AI 팀] 제미나이 API로 생성된 코멘트
                        - 입력: KoBERT 감정 분석 결과 + 사용자 선택 감정 + 페르소나
                        - 출력: 페르소나 스타일에 맞는 공감 메시지 (2-3문장)
                      */}
                      {aiComment && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2 justify-center">
                            <div className="text-blue-700">✨</div>
                            <p className="text-xs text-stone-600">AI의 공감 한마디</p>
                          </div>
                          <div className="bg-white/80 border border-stone-300 rounded-lg p-4">
                            <p className="text-sm text-stone-700 leading-relaxed text-center">
                              {aiComment}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* 
                        액션 버튼 영역 (플로우 3.4)
                        
                        사용자 선택지:
                        1. "장소 추천" 버튼 (감정 분석 성공 시만 표시)
                           - 클릭 → 장소 추천 화면으로 이동
                           - 모달 닫기
                        2. "닫기" 버튼
                           - 클릭 → 방금 작성한 일기의 상세보기 페이지로 이동
                      */}
                      <div className="pt-2 flex gap-3">
                        {/* 
                          장소 추천 버튼 (플로우 8.1 경로 A: 일기 저장 후 감정 분석 모달에서)
                          
                          표시 조건:
                          - 감정 분석 성공 (onMapRecommendation 콜백 존재)
                          - 일기 저장 완료 후 감정 분석 모달에서만 표시
                          
                          동작 (플로우 8.1):
                          - 클릭 시 onMapRecommendation() 콜백 호출
                          - DiaryBook의 handleMapRecommendation 실행
                          - setShowMapRecommendation(true) 설정
                          - viewMode = 'reading' 유지
                          - 좌측: 카카오 지도 / 우측: 장소 리스트 표시
                          
                          전달 데이터:
                          - emotion: 사용자 선택 감정 이모지
                          - emotionCategory: AI 분석 감정 카테고리
                          
                          플로우 8.1 요구사항 (경로 A):
                          - 감정 분석 모달에서 "장소 추천" 버튼 클릭
                          - → 장소 추천 화면으로 이동
                        */}
                        {onMapRecommendation && (
                          <button
                            onClick={() => {
                              onMapRecommendation(); // 장소 추천 화면으로 이동
                              onClose(); // 모달 닫기
                            }}
                            className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-md flex items-center justify-center gap-2"
                          >
                            <span>📍</span>
                            <span className="text-sm">장소 추천</span>
                          </button>
                        )}
                        {/* 
                          닫기 버튼 (플로우 3.4)
                          - 클릭 → 방금 작성한 일기의 상세보기 페이지로 이동
                          - DiaryWritingPage의 handleEmotionModalClose에서 처리
                        */}
                        <button
                          onClick={() => {
                            onClose(); // 모달 닫기
                            if (onCloseToCalendar) {
                              // 플로우 3.4: 방금 작성한 일기의 상세보기로 이동
                              onCloseToCalendar();
                            }
                          }}
                          className={`${onMapRecommendation ? 'flex-1' : 'w-full'} px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md`}
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}