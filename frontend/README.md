
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
  
  ### 관리자 API 명세서 반영 (2025-01-XX)
  - **관리자 API 서비스 파일 생성**: `src/services/adminApi.ts`
    - 관리자 인증 API (10.1): `adminLogin`, `adminLogout`
    - 서비스 통계 API (10.2): `getDashboardStats`, `getDiaryTrend`, `getUserActivityStats`, `getRiskLevelDistribution`
    - 공지사항 관리 API (10.3): `getNoticeList`, `createNotice`, `updateNotice`, `deleteNotice`, `pinNotice`
    - 시스템 설정 API (10.4): `getRiskDetectionSettings`, `updateRiskDetectionSettings`, `getCounselingResources`, `createCounselingResource`, `updateCounselingResource`, `deleteCounselingResource`
    - 에러 로그 조회 API (10.5): `getErrorLogList`, `getErrorLogDetail`
  - **대시보드 API 분리**: `dashboard.tsx`에서 4개의 별도 API로 분리
    - `GET /api/admin/dashboard/stats` - 서비스 통계 카드
    - `GET /api/admin/dashboard/diary-trend` - 일지 작성 추이 차트
    - `GET /api/admin/dashboard/user-activity-stats` - 사용자 활동 통계 차트
    - `GET /api/admin/dashboard/risk-level-distribution` - 위험 레벨 분포 통계

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

  ## 코드 구조 개선 (2025-01-XX)

  ### 폴더 구조 정리
  - **공통 Hooks** (`src/hooks/`): 재사용 가능한 custom hooks
    - `use-mobile.ts`: 모바일 화면 감지
    - `use-modal.ts`: 모달 상태 관리
    - `use-async.ts`: 비동기 작업 관리
  - **공통 Types** (`src/types/`): 공통 타입 정의
    - `User`, `ApiResponse`, `Pagination`, `LoadingState` 등
  - **공통 Utils** (`src/utils/`): 유틸리티 함수
    - `cn()`: className 병합 함수
  - **Features별 Hooks**: 각 feature에 맞는 hooks 분리
    - `features/auth/hooks/`: `useAuth` - 인증 로직
    - `features/user/hooks/`: `useUser` - 사용자 정보 관리
    - `features/diary/hooks/`: `useDiary` - 다이어리 상태 관리
    - `features/admin/hooks/`: `useDashboardData`, `useAuth`, `useErrorLogs` - 관리자 기능

  ### TypeScript 설정
  - `tsconfig.json` 생성: React + TypeScript + Vite 설정
  - IDE에서 React 코드 에러 표시 문제 해결
  - `forceConsistentCasingInFileNames` 옵션 추가

  ### 관리자 기능 코드 개선 (2025-01-XX)
  - **타입 정의 통합**: 모든 중복 타입 정의를 `features/admin/types/index.ts`로 통합
    - `ErrorLog`, `Notice`, `RiskThreshold`, `CounselingResource` 등
    - API 명세서 및 ERD 설계서 기반으로 타입 정의
  - **Import 경로 정리**: 모든 컴포넌트에서 공통 types import 사용
    - `error-logs.tsx`, `error-log-viewer.tsx`, `notice-management.tsx`, `system-settings.tsx`
  - **타입 일관성 확보**: Mock 데이터도 API 명세서에 맞춰 타입 통일
    - `id`: string → number (ERD: BIGINT)
    - `category`: 영어 → 한글 (API 명세서 기준)
    - `availability` → `operatingHours` (ERD 필드명)
  - **AdminApp.tsx 에러 수정**: `setIsAuthenticated is not defined` 해결
    - `useAuth` hook에서 `setIsAuthenticated` 반환 추가
  - **코드 간결화**: Custom hooks로 반복되는 로직 분리
    - `dashboard.tsx`: `useDashboardData` hook 사용 (200+ 줄 감소)
    - 타입 정의 중앙화로 중복 제거

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

  ## 관리자 기능 (2025-01-XX)

  ### 관리자 기반 상세기능명세서 반영

  ### 1. 관리자 인증 플로우 (1.1)
  - **관리자 로그인**: 이메일/비밀번호 입력, 클라이언트 검증 없이 즉시 API 호출
  - **JWT 토큰 저장**: localStorage에 `admin_jwt_token` 저장
  - **로그인 시도 이력**: 성공/실패 모두 에러 로그에 기록
  - **파일**: `src/features/admin/components/login-page.tsx`

  ### 2. 서비스 통계 플로우 (2.1-2.5)
  - **전체 통계 카드 6개** (2.2):
    - 전체 사용자 수 (기간 필터: 주간/월간/연간)
    - 활성 사용자 수 (DAU/WAU/MAU 선택)
    - 신규 가입자 수 (일/주/월 선택)
    - 총 일지 작성 수 (전체 누적)
    - 일평균 일지 작성 수 (기간 필터: 주간/월간/연간)
    - 위험 레벨별 사용자 수 (High/Medium/Low/None)
  - **일지 작성 추이 차트** (2.3): 막대 그래프, 기간 필터 (주간/월간/연간)
  - **사용자 활동 통계 차트** (2.4): 라인 차트, 지표 선택 (DAU/WAU/MAU/신규 가입자/유지율)
  - **위험 레벨 분포 통계** (2.5): 파이/막대 차트, High/Medium/Low/None 레벨별 분포
  - **파일**: `src/features/admin/components/dashboard.tsx`

  ### 3. 공지사항 관리 플로우 (3.1-3.6)
  - **공지사항 목록 조회** (3.1): 테이블 형태, 고정 여부/제목/작성자/작성일/조회수/공개 상태/액션
  - **공지사항 작성** (3.2): HTML 에디터, 편집/미리보기 탭, 공개 상태/상단 고정 옵션
  - **공지사항 조회** (3.3): 모달 형태, HTML 렌더링
  - **공지사항 수정** (3.4): 작성과 동일한 구조, 기존 내용 자동 로드
  - **공지사항 삭제** (3.5): 확인 다이얼로그
  - **공지사항 고정** (3.6): 고정/고정 해제 토글
  - **파일**: `src/features/admin/components/notice-management.tsx`

  ### 4. 시스템 설정 플로우 (4.1-4.3)
  - **위험 신호 기준 변경** (4.2):
    - 모니터링 기간 (일)
    - High/Medium/Low 레벨 판정 기준 (연속 부정 감정 임계 점수, 모니터링 기간 내 부정 감정 임계 점수)
    - 설정 변경 이력 자동 기록
  - **상담 기관 리소스 관리** (4.3):
    - 상담 기관 추가/수정/삭제
    - 카테고리: 긴급 상담/전문 상담/상담 전화/의료 기관
    - 긴급 상담 기관 표시 옵션
  - **파일**: `src/features/admin/components/system-settings.tsx`

  ### 5. 에러 로그 조회 플로우 (5.1-5.3)
  - **에러 로그 목록 조회** (5.1): 통계 카드 4개 (전체/ERROR/WARN/INFO), 테이블 형태
  - **필터링 및 검색** (5.2): 심각도 필터, 날짜 필터, 검색 기능
  - **에러 로그 상세 조회** (5.3): 모달 형태, Stack Trace 표시
  - **파일**: `src/features/admin/components/error-logs.tsx`

  ### 6. 로그아웃 플로우 (6.1)
  - **관리자 로그아웃**: 확인 모달, JWT 토큰 삭제, 로그인 페이지로 이동
  - **파일**: `src/features/admin/components/navigation-tabs.tsx`

  ## 관리자 백엔드 연동 필요 사항

  ### 관리자 인증 API (10.1)
  - **관리자 로그인**: `POST /api/admin/auth/login` (email, password)
    - Response: `{ success: true, data: { accessToken, admin: { id, email, name } } }`
  - **관리자 로그아웃**: `POST /api/admin/auth/logout` (JWT 토큰 필요)
    - Response: `{ success: true, data: { message } }`

  ### 서비스 통계 API (10.2)
  - **서비스 통계 카드** (10.2.1): `GET /api/admin/dashboard/stats?period={weekly|monthly|yearly}&activeUserType={dau|wau|mau}&newUserPeriod={daily|weekly|monthly}`
    - Response: `{ success: true, data: { totalUsers, activeUsers, newUsers, totalDiaries, averageDailyDiaries, riskLevelUsers } }`
  - **일지 작성 추이 차트** (10.2.2): `GET /api/admin/dashboard/diary-trend?period={weekly|monthly|yearly}&year={year}&month={month}`
    - Response: `{ success: true, data: { period, trend: [{ date, count }] } }`
  - **사용자 활동 통계 차트** (10.2.3): `GET /api/admin/dashboard/user-activity-stats?period={weekly|monthly|yearly}&year={year}&month={month}&metrics={dau,wau,mau,newUsers,retentionRate}`
    - Response: `{ success: true, data: { period, year, month, metrics, trend: [{ date, dau, wau, mau, newUsers, retentionRate }] } }`
  - **위험 레벨 분포 통계** (10.2.4): `GET /api/admin/dashboard/risk-level-distribution?period={weekly|monthly|yearly}&year={year}&month={month}`
    - Response: `{ success: true, data: { period, year, month, distribution: { high, medium, low, none }, total } }`

  ### 공지사항 관리 API (10.3)
  - **공지사항 목록 조회** (10.3.1): `GET /api/admin/notices?page={page}&limit={limit}`
    - Response: `{ success: true, data: { total, page, limit, notices: [] } }`
  - **공지사항 작성** (10.3.2): `POST /api/admin/notices` (title, content, isPublic, isPinned)
    - Response: `{ success: true, data: { id, title, content, author, createdAt, isPinned, isPublic } }`
  - **공지사항 수정** (10.3.3): `PUT /api/admin/notices/{noticeId}` (title, content, isPublic, isPinned)
    - Response: `{ success: true, data: { id, title, content, updatedAt } }`
  - **공지사항 삭제** (10.3.4): `DELETE /api/admin/notices/{noticeId}`
    - Response: `{ success: true, data: { message } }`
  - **공지사항 고정/해제** (10.3.5): `PUT /api/admin/notices/{noticeId}/pin` (isPinned)
    - Response: `{ success: true, data: { id, isPinned } }`

  ### 시스템 설정 API (10.4)
  - **위험 신호 감지 기준 조회** (10.4.1): `GET /api/admin/settings/risk-detection`
    - Response: `{ success: true, data: { monitoringPeriod, high: { consecutiveScore, scoreInPeriod }, medium: {...}, low: {...} } }`
  - **위험 신호 감지 기준 변경** (10.4.2): `PUT /api/admin/settings/risk-detection` (monitoringPeriod, high, medium, low)
    - Response: `{ success: true, data: { message, updatedAt } }`
  - **상담 기관 리소스 목록 조회** (10.4.3): `GET /api/admin/settings/counseling-resources`
    - Response: `{ success: true, data: { resources: [] } }`
  - **상담 기관 리소스 추가** (10.4.4): `POST /api/admin/settings/counseling-resources` (name, category, phone, website, description, operatingHours, isUrgent)
    - Response: `{ success: true, data: { id, name, category, ... } }`
  - **상담 기관 리소스 수정** (10.4.5): `PUT /api/admin/settings/counseling-resources/{resourceId}` (name, category, phone, website, description, operatingHours, isUrgent)
    - Response: `{ success: true, data: { id, name, category, ... } }`
  - **상담 기관 리소스 삭제** (10.4.6): `DELETE /api/admin/settings/counseling-resources/{resourceId}`
    - Response: `{ success: true, data: { message } }`

  ### 에러 로그 조회 API (10.5)
  - **에러 로그 목록 조회** (10.5.1): `GET /api/admin/error-logs?level={ALL|ERROR|WARN|INFO}&startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}&search={query}&page={page}&limit={limit}`
    - Response: `{ success: true, data: { total, summary: { error, warn, info }, logs: [] } }`
  - **에러 로그 상세 조회** (10.5.2): `GET /api/admin/error-logs/{logId}`
    - Response: `{ success: true, data: { id, timestamp, level, message, errorCode, endpoint, userId, stackTrace } }`

  ## ERD 설계서 반영 사항 (2025-01-XX)

  ### 주요 테이블 매핑
  - **Users 테이블**: `authApi.ts`의 `User` 인터페이스
    - `persona`: ENUM (베프, 부모님, 전문가, 멘토, 상담사, 시인), 기본값: "베프"
    - `email_verified`: BOOLEAN (API 응답에 포함되지 않을 수 있음)
    - `deleted_at`: 소프트 삭제 (API 응답에 포함되지 않음)
  
  - **Diaries 테이블**: `diaryApi.ts`의 `DiaryDetail` 인터페이스
    - `emotion`: ENUM (행복, 중립, 당황, 슬픔, 분노, 불안, 혐오) - KoBERT 분석 결과
    - `kobert_analysis`: JSON (백엔드 내부 처리용, API 응답에 포함되지 않음)
    - `recommended_food`: JSON 형식 (음식 추천 정보)
    - `Diary_Images`: 사용자 업로드 이미지 (별도 테이블, API 응답에서는 `images` 배열)
    - `Diary_Activities`: 활동 목록 (별도 테이블, API 응답에서는 `activities` 배열)
  
  - **Notices 테이블**: `announcementApi.ts`, `adminApi.ts`의 `Announcement`, `Notice` 인터페이스
    - `is_public`: BOOLEAN → `isPublished` (공개 여부)
    - `views`: INT (조회수, 조회 시 자동 증가)
    - `admin_id`: FK → `author` (작성자 이름으로 반환)
  
  - **Counseling_Resources 테이블**: `supportResources.ts`, `adminApi.ts`의 `SupportResource`, `CounselingResource` 인터페이스
    - `category`: ENUM (긴급상담, 전문상담, 상담전화, 의료기관)
    - `is_urgent`: BOOLEAN → `isUrgent` (High 레벨 위험 신호 시 전화번호 표시)
  
  - **Error_Logs 테이블**: `adminApi.ts`의 `ErrorLog` 인터페이스
    - `level`: ENUM (ERROR, WARN, INFO)
    - `user_id`: FK, NULL 가능 → `userId`
    - `admin_id`: FK, NULL 가능 → `adminId`
  
  - **Risk_Detection_Sessions 테이블**: `riskDetection.ts`의 `RiskAnalysis` 인터페이스
    - `risk_level`: ENUM (none, low, medium, high) → `riskLevel`
    - `shown_at`: DATETIME (알림 표시 완료 일시, NULL이면 미표시)
  
  - **Risk_Detection_Settings 테이블**: `adminApi.ts`의 `RiskDetectionSettings` 인터페이스
    - 단일 레코드만 존재 (id=1)
    - 점수 기준: 고위험 부정 감정(슬픔, 분노) 2점, 중위험 부정 감정(불안, 혐오) 1점
  
  - **Diary_Images 테이블**: `uploadApi.ts`의 `UploadImageResponse` 인터페이스
    - 사용자 업로드 이미지 저장 (별도 테이블)
    - `Diaries.image_url`은 AI 생성 이미지와 구분

  ### 관계 매핑
  - **Users ↔ Diaries (1:N)**: `Diaries.user_id` → `Users.id`
  - **Diaries ↔ Diary_Images (1:N)**: `Diary_Images.diary_id` → `Diaries.id` (CASCADE)
  - **Diaries ↔ Diary_Activities (1:N)**: `Diary_Activities.diary_id` → `Diaries.id` (CASCADE)
  - **Admins ↔ Notices (1:N)**: `Notices.admin_id` → `Admins.id` (CASCADE)
  - **Users ↔ Risk_Detection_Sessions (1:N)**: `Risk_Detection_Sessions.user_id` → `Users.id` (CASCADE)
  - **Error_Logs ↔ Users/Admins (N:1)**: `Error_Logs.user_id` → `Users.id`, `Error_Logs.admin_id` → `Admins.id` (NULL 가능)

  ### 주요 인덱스 활용
  - `idx_diaries_emotion_date`: 통계 조회 최적화
  - `idx_diaries_user_emotion_date`: 위험 신호 감지 최적화
  - `idx_notices_is_pinned_created_at`: 공지사항 목록 조회 최적화

  ## 주요 파일 구조

  ```
  frontend/src/
  ├── features/
  │   ├── diary/
  │   │   ├── DiaryWritingPage.tsx      # 일기 작성/수정 페이지
  │   │   ├── DaySummaryPage.tsx         # 일기 상세보기 페이지
  │   │   └── CalendarPage.tsx          # 캘린더 페이지
  │   ├── analysis/
  │   │   └── EmotionAnalysisModal.tsx   # 감정 분석 결과 모달
  │   └── admin/
  │       ├── AdminApp.tsx                # 관리자 앱 메인
  │       └── components/
  │           ├── login-page.tsx          # 관리자 로그인 페이지
  │           ├── dashboard.tsx           # 서비스 통계 대시보드
  │           ├── notice-management.tsx    # 공지사항 관리
  │           ├── system-settings.tsx     # 시스템 설정
  │           ├── error-logs.tsx          # 에러 로그 조회
  │           ├── navigation-tabs.tsx     # 네비게이션 탭
  │           ├── layout.tsx              # 레이아웃
  │           ├── metric-card.tsx         # 통계 카드 컴포넌트
  │           └── weekly-diary-chart.tsx  # 일지 작성 추이 차트
  ├── services/
  │   ├── authApi.ts                     # 인증 API (로그인, 회원가입, 페르소나, 토큰 재발급)
  │   ├── diaryApi.ts                    # 일기 API 클라이언트
  │   ├── uploadApi.ts                   # 이미지 업로드/삭제 API
  │   ├── statisticsApi.ts               # 통계 API (감정 통계, 변화 추이)
  │   ├── riskDetection.ts               # 위험 신호 감지 API
  │   ├── announcementApi.ts             # 공지사항 API
  │   ├── supportResources.ts            # 상담 기관 리소스
  │   └── adminApi.ts                    # 관리자 API (인증, 대시보드, 공지사항, 시스템 설정, 에러 로그)
  └── reference/
      ├── 사용자 기반 상세기능명세서.md  # 사용자 명세서
      ├── 관리자 기반 상세기능명세서.md  # 관리자 명세서
      ├── API 명세서.md                   # API 명세서
      └── ERD 설계서.md                   # ERD 설계서
  ```
  