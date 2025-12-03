
  # 사용자 화면 모바일 웹 - 25.12.02 최종본 (코드 작성하면서 진행할래)

  This is a code bundle for 사용자 화면 모바일 웹 - 25.12.02 최종본 (코드 작성하면서 진행할래). The original project is available at https://www.figma.com/design/2sHr7QgQ6syCbv5tKS8Jya/%EC%82%AC%EC%9A%A9%EC%9E%90-%ED%99%94%EB%A9%B4-%EB%AA%A8%EB%B0%94%EC%9D%BC-%EC%9B%B9---25.12.02-%EC%B5%9C%EC%A2%85%EB%B3%B8--%EC%BD%94%EB%93%9C-%EC%9E%91%EC%84%B1%ED%95%98%EB%A9%B4%EC%84%9C-%EC%A7%84%ED%96%89%ED%95%A0%EB%9E%98-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## 주요 수정 사항

  ### API 명세서 반영 (2025-01-XX)
  - **User 인터페이스**: `persona` 필드 추가 (베프, 부모님, 전문가, 멘토, 상담사, 시인)
  - **페르소나 설정 API**: `PUT /api/users/me/persona` 함수 구현
  - **토큰 재발급 API**: `POST /api/auth/refresh` 함수 구현
  - **이미지 업로드/삭제 API**: `POST/DELETE /api/upload/image` 함수 구현
  - **통계 API**: `GET /api/statistics/emotions`, `GET /api/statistics/emotion-trend` 함수 구현
  - **위험 신호 세션 관리 API**: `GET /api/risk-detection/session-status`, `POST /api/risk-detection/mark-shown` 함수 구현
  - **회원가입**: `persona` 필드 추가 (선택, 기본값: "베프")
  - **비밀번호 변경**: `confirmPassword` 필드 추가
  - **일기 API 필드명 수정**: `note` → `content`, `userImageUrls` → `images`
  - **일기 API**: `emotion` 필드 제거 (KoBERT가 자동 분석)

  ### 사용자 기반 상세기능명세서 반영

  ### 1. 일기 작성 플로우 수정 (플로우 3.2, 3.3)
  - **변경 전**: 사용자가 12가지 감정 중 하나를 선택
  - **변경 후**: KoBERT 모델이 일기 본문을 자동 분석하여 7가지 감정 중 하나로 분류
    - 7가지 감정: 행복😊, 중립😐, 당황😳, 슬픔😢, 분노😠, 불안😰, 혐오🤢
    - KoBERT 분석 결과가 사용자에게 표시되는 감정이 됨
  - **파일**: `src/features/diary/DiaryWritingPage.tsx`
    - 감정 선택 모달 제거
    - KoBERT 감정 분석 API 호출 추가
    - 감정 분석 중 로딩 상태 표시

  ### 2. 일기 저장 플로우 수정 (플로우 3.3)
  - **처리 순서**:
    1. KoBERT 감정 분석 (일기 본문 분석) → 7가지 감정 중 하나로 분류
    2. AI 이미지 생성 (NanoVana API) - 새 작성만
    3. 일기 저장 (KoBERT 감정 분석 결과 포함)
    4. AI 코멘트 생성 (Gemini API)
    5. 음식 추천 생성 (Gemini API) - **신규 추가**
  - **파일**: 
    - `src/features/diary/DiaryWritingPage.tsx` - 저장 로직 수정
    - `src/services/diaryApi.ts` - 인터페이스에 `recommendedFood` 필드 추가

 ### 3. 일기 수정 플로우 수정 (플로우 4.3)
  - **처리 순서**:
    1. KoBERT 감정 재분석 (수정된 본문 분석)
    2. AI 이미지 재생성 안 함 (기존 이미지 유지)
    3. 일기 수정 저장
    4. AI 코멘트 재생성 (Gemini API)
    5. 음식 추천 재생성 (Gemini API) - **신규 추가**
  - **파일**: `src/features/diary/DiaryWritingPage.tsx`

  ### 4. 감정 분석 결과 모달 수정 (플로우 3.4)
  - **변경 전**: 사용자가 선택한 감정 이모지 및 레이블 표시
  - **변경 후**: KoBERT가 분석한 감정 이모지 및 레이블 표시
    - 7가지 감정: 행복😊, 중립😐, 당황😳, 슬픔😢, 분노😠, 불안😰, 혐오🤢
  - **파일**: `src/features/analysis/EmotionAnalysisModal.tsx`
    - 감정 이모지별 한글 이름 매핑 수정
    - 감정 이모지별 색상 테마 수정

  ### 5. 음식 추천 기능 추가
  - **일기 작성/수정 시**: Gemini API로 음식 추천 생성
    - 입력: 일기 내용(제목, 본문, 기분, 날씨, 활동) + KoBERT 감정 분석 결과
    - 출력: { name: string, reason: string }
    - DB에 저장
  - **일기 상세보기**: 음식 추천 카드 표시
  - **파일**:
    - `src/services/diaryApi.ts` - `DiaryDetail`, `CreateDiaryRequest`, `UpdateDiaryRequest` 인터페이스에 `recommendedFood` 필드 추가
    - `src/features/diary/DaySummaryPage.tsx` - 음식 추천 카드 UI 추가

  ### 6. 사용자 이미지 업로드 기능
  - **기능**: 일기 작성/수정 시 사용자가 직접 이미지를 업로드할 수 있음
  - **파일**: 
    - `src/features/diary/DiaryWritingPage.tsx` - 이미지 업로드 핸들러 구현
    - `src/services/uploadApi.ts` - 이미지 업로드/삭제 API 함수
    - `images` 필드로 서버에 전송 (API 명세서: `userImageUrls` → `images`)

  ## 주요 플로우

  ### 일기 작성 플로우 (플로우 3.2, 3.3, 3.4)
  1. 캘린더에서 날짜 선택 → 일기 작성 페이지 진입
  2. 제목, 본문 입력 (필수)
  3. 기분, 날씨, 활동, 사용자 이미지 업로드 (선택)
  4. "완료" 버튼 클릭
  5. KoBERT 감정 분석 실행 (일기 본문 분석)
  6. AI 이미지 생성 (NanoVana API)
  7. 일기 저장
  8. AI 코멘트 생성 (Gemini API)
  9. 음식 추천 생성 (Gemini API)
  10. 감정 분석 결과 모달 표시 (KoBERT 분석 결과)

  ### 일기 수정 플로우 (플로우 4.1, 4.3)
  1. 일기 상세보기에서 "수정하기" 버튼 클릭
  2. 일기 작성 페이지로 이동 (기존 데이터 자동 로드)
  3. 내용 수정
  4. "완료" 버튼 클릭
  5. KoBERT 감정 재분석 실행
  6. 일기 수정 저장
  7. AI 코멘트 재생성
  8. 음식 추천 재생성
  9. 상세보기로 이동

  ## 백엔드 연동 필요 사항

  ### 인증 API
  - **로그인**: `POST /api/auth/login`
  - **회원가입**: `POST /api/auth/register` (persona 필드 포함)
  - **토큰 재발급**: `POST /api/auth/refresh`
  - **사용자 정보 조회**: `GET /api/users/me`
  - **페르소나 설정**: `PUT /api/users/me/persona`
  - **비밀번호 변경**: `PUT /api/users/me/password` (confirmPassword 포함)

  ### 일기 API
  - **일기 작성**: `POST /api/diaries` (content, images 필드 사용)
  - **일기 수정**: `PUT /api/diaries/{diaryId}` (emotion 필드 제거, KoBERT 자동 분석)
  - **일기 조회**: `GET /api/diaries/date/{date}`
  - **캘린더 조회**: `GET /api/diaries/calendar`
  - **일기 검색**: `GET /api/diaries/search` (emotions 필터: KoBERT 감정 종류)

  ### 통계 API
  - **감정 통계**: `GET /api/statistics/emotions` (period, year, month, week)
  - **감정 변화 추이**: `GET /api/statistics/emotion-trend` (period, year, month)

  ### 위험 신호 감지 API
  - **위험 신호 분석**: `GET /api/risk-detection/analyze`
  - **세션 확인**: `GET /api/risk-detection/session-status`
  - **표시 완료 기록**: `POST /api/risk-detection/mark-shown`

  ### 파일 업로드 API
  - **이미지 업로드**: `POST /api/upload/image` (multipart/form-data)
  - **이미지 삭제**: `DELETE /api/upload/image`

  ### KoBERT 감정 분석 (백엔드 내부 처리)
  - 일기 본문(`content`)만 분석하여 7가지 감정 중 하나로 분류
  - 감정 종류: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
  - 분석 결과는 `emotion` 컬럼에 자동 저장

  ### 음식 추천 생성 (백엔드 내부 처리)
  - **엔드포인트**: 백엔드 내부에서 Gemini API 호출
  - **입력**: 일기 내용 + KoBERT 감정 분석 결과
  - **출력**: `{ name: string, reason: string }`

  ## ERD 설계서 참고 사항

  ### 데이터베이스 구조
  - **Diaries 테이블**: 일기 기본 정보 저장
    - `content`: 일기 본문 (TEXT, KoBERT 분석 대상)
    - `emotion`: KoBERT 분석 결과 (ENUM: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)
    - `image_url`: AI 생성 그림일기 이미지 (VARCHAR(500))
    - `ai_comment`: AI 코멘트 (TEXT)
    - `recommended_food`: 음식 추천 정보 (JSON)
    - `kobert_analysis`: KoBERT 분석 상세 결과 (JSON, 백엔드 내부 처리용)
  
  - **Diary_Images 테이블**: 사용자 업로드 이미지 별도 관리
    - API 응답에서는 `images` 배열로 반환
    - 일기 작성/수정 시 배열로 전송, 백엔드에서 별도 테이블에 저장
  
  - **Diary_Activities 테이블**: 활동 목록 별도 관리
    - API 응답에서는 `activities` 배열로 반환
    - 일기 작성/수정 시 배열로 전송, 백엔드에서 별도 테이블에 저장
  
  - **Users 테이블**: 사용자 정보
    - `persona`: 페르소나 (ENUM, 기본값: "베프")
    - `email_verified`: 이메일 인증 완료 여부 (BOOLEAN, 백엔드 내부 처리)

  ### 데이터 저장 방식
  - **일기 작성**: activities와 images 배열을 각각 Diary_Activities, Diary_Images 테이블에 저장
  - **일기 수정**: 기존 activities와 images 레코드 삭제 후 새로 저장 (CASCADE 관계)
  - **KoBERT 분석**: `kobert_analysis` JSON 필드에 저장 (예: {"emotion": "슬픔", "confidence": 0.85})
  - **음식 추천**: `recommended_food` JSON 필드에 저장 (예: {"name": "따뜻한 국밥", "reason": "..."})

  ## AI 팀 연동 필요 사항

  ### KoBERT 모델
  - 일기 본문을 분석하여 7가지 감정 중 하나로 분류
  - 출력 형식: { emotion: string, confidence: number }

  ### Gemini API
  - **AI 코멘트 생성**: 일기 내용 + KoBERT 감정 분석 결과 + 페르소나 스타일
  - **음식 추천 생성**: 일기 내용 + KoBERT 감정 분석 결과

  ### NanoVana API
  - **AI 이미지 생성**: 일기 내용 + KoBERT 감정 분석 결과

  ## 주요 파일 구조

  ```
  frontend/src/
  ├── features/
  │   ├── diary/
  │   │   ├── DiaryWritingPage.tsx      # 일기 작성/수정 페이지
  │   │   ├── DaySummaryPage.tsx         # 일기 상세보기 페이지
  │   │   └── CalendarPage.tsx          # 캘린더 페이지
  │   └── analysis/
  │       └── EmotionAnalysisModal.tsx   # 감정 분석 결과 모달
  ├── services/
  │   ├── authApi.ts                     # 인증 API (로그인, 회원가입, 페르소나, 토큰 재발급)
  │   ├── diaryApi.ts                    # 일기 API 클라이언트
  │   ├── uploadApi.ts                   # 이미지 업로드/삭제 API
  │   ├── statisticsApi.ts               # 통계 API (감정 통계, 변화 추이)
  │   ├── riskDetection.ts               # 위험 신호 감지 API
  │   ├── announcementApi.ts             # 공지사항 API
  │   └── supportResources.ts            # 상담 기관 리소스
  └── reference/
      ├── 사용자 기반 상세기능명세서.md  # 명세서
      ├── API 명세서.md                   # API 명세서
      └── ERD 설계서.md                   # ERD 설계서
  ```
  