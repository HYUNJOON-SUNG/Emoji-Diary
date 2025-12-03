# 감정 일기 앱 - ERD 설계서

## 테이블 목록

| 번호 | 테이블명 | 설명 | 주요 용도 |
|------|---------|------|----------|
| 1 | Users | 사용자 | 사용자 계정 정보, 페르소나 설정 |
| 2 | Admins | 관리자 | 관리자 계정 정보 |
| 3 | Diaries | 일기 | 일기 본문, 감정 분석 결과, AI 생성 콘텐츠 |
| 4 | Diary_Activities | 일기 활동 | 일기에 연결된 활동 태그 |
| 5 | Diary_Images | 일기 이미지 | 사용자가 업로드한 이미지 |
| 6 | Notices | 공지사항 | 공지사항 내용, 조회수, 고정 여부 |
| 7 | Counseling_Resources | 상담 기관 | 상담 기관 정보, 긴급 상담 전화번호 |
| 8 | Risk_Detection_Settings | 위험 신호 감지 기준 | 위험 신호 판정 기준 설정 |
| 9 | Risk_Detection_Sessions | 위험 신호 세션 | 위험 신호 분석 결과, 알림 표시 여부 |
| 10 | Email_Verification_Codes | 이메일 인증 코드 | 회원가입/비밀번호 재설정 인증 코드 |
| 11 | Password_Reset_Codes | 비밀번호 재설정 코드 | 비밀번호 재설정 인증 코드 및 토큰 |
| 12 | Refresh_Tokens | 사용자 리프레시 토큰 | 사용자 인증 토큰 관리 |
| 13 | Admin_Refresh_Tokens | 관리자 리프레시 토큰 | 관리자 인증 토큰 관리 |
| 14 | Error_Logs | 에러 로그 | 시스템 에러 로그 기록 |

**총 테이블 수**: 14개

---

## 목차
1. [엔티티 상세 설계](#엔티티-상세-설계)
2. [관계 설명](#관계-설명)
3. [인덱스 설계](#인덱스-설계)

---

## 엔티티 상세 설계

### 1. Users (사용자)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 사용자 고유 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 주소 |
| name | VARCHAR(100) | NOT NULL | 사용자 이름 |
| password_hash | VARCHAR(255) | NOT NULL | 비밀번호 해시값 |
| persona | ENUM | NOT NULL, DEFAULT '베프' | 페르소나 (베프, 부모님, 전문가, 멘토, 상담사, 시인) - 기본값: 베프 |
| email_verified | BOOLEAN | DEFAULT FALSE | 이메일 인증 완료 여부 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |
| deleted_at | DATETIME | NULL | 삭제일시 (소프트 삭제) |

**인덱스:**
- `idx_users_email` (email)
- `idx_users_deleted_at` (deleted_at)

**참고:**
- `persona`는 회원가입 시 기본값 '베프'로 자동 설정됨
- 사용자가 페르소나 설정 화면에서 변경 가능

---

### 2. Admins (관리자)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 관리자 고유 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 주소 |
| name | VARCHAR(100) | NOT NULL | 관리자 이름 |
| password_hash | VARCHAR(255) | NOT NULL | 비밀번호 해시값 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |

**인덱스:**
- `idx_admins_email` (email)

---

### 3. Diaries (일기)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 일기 고유 ID |
| user_id | BIGINT | FK, NOT NULL | 작성자 ID (Users.id) |
| date | DATE | NOT NULL | 일기 작성 날짜 |
| title | VARCHAR(255) | NOT NULL | 일기 제목 |
| content | TEXT | NOT NULL | 일기 본문 (KoBERT 분석 대상) |
| emotion | ENUM | NOT NULL | KoBERT 분석 결과에서 추출한 감정 (행복, 중립, 당황, 슬픔, 분노, 불안, 혐오) |
| mood | VARCHAR(255) | NULL | 기분 (자유 텍스트) |
| weather | ENUM | NULL | 날씨 (맑음, 흐림, 비, 천둥, 눈, 안개) |
| image_url | VARCHAR(500) | NULL | AI 생성 이미지 URL (NanoVana API로 생성된 그림일기) |
| ai_comment | TEXT | NULL | AI 코멘트 (Gemini API로 생성, 페르소나 스타일 반영) |
| recommended_food | JSON | NULL | 음식 추천 정보 (Gemini API로 생성) - JSON 형식: {"name": "음식명", "reason": "추천 근거"} |
| kobert_analysis | JSON | NULL | KoBERT 감정 분석 결과 (JSON 형식) |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |
| deleted_at | DATETIME | NULL | 삭제일시 (소프트 삭제) |

**인덱스:**
- `idx_diaries_user_id` (user_id)
- `idx_diaries_date` (date)
- `idx_diaries_user_date` (user_id, date) - UNIQUE 제약조건 (한 사용자는 하루에 하나의 일기만 작성 가능)
- `idx_diaries_emotion` (emotion)
- `idx_diaries_user_emotion` (user_id, emotion) - 위험 신호 감지 최적화
- `idx_diaries_user_emotion_date` (user_id, emotion, date) - 위험 신호 감지 최적화 (모니터링 기간 내 일기 조회)
- `idx_diaries_emotion_date` (emotion, date) - 통계 조회 최적화
- `idx_diaries_title_content` FULLTEXT (title, content) - 일기 검색 최적화
- `idx_diaries_deleted_at` (deleted_at)

**제약조건:**
- UNIQUE (user_id, date) WHERE deleted_at IS NULL - 같은 날짜에 하나의 일기만 작성 가능

**참고:**
- `emotion`은 KoBERT가 일기 본문(`content`)만 분석하여 자동으로 저장됨
- `image_url`, `ai_comment`, `recommended_food`는 백그라운드에서 생성되므로 초기에는 NULL일 수 있음
- 일기 수정 시 `image_url`은 재생성하지 않고 기존 값 유지

---

### 4. Diary_Activities (일기 활동)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 활동 고유 ID |
| diary_id | BIGINT | FK, NOT NULL | 일기 ID (Diaries.id) |
| activity | VARCHAR(100) | NOT NULL | 활동 내용 |
| created_at | DATETIME | NOT NULL | 생성일시 |

**인덱스:**
- `idx_diary_activities_diary_id` (diary_id)

**참고:**
- 일기 수정 시 활동 목록도 함께 업데이트됨

---

### 5. Diary_Images (일기 이미지 - 사용자 업로드)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 이미지 고유 ID |
| diary_id | BIGINT | FK, NOT NULL | 일기 ID (Diaries.id) |
| image_url | VARCHAR(500) | NOT NULL | 이미지 URL (사용자가 업로드한 이미지) |
| created_at | DATETIME | NOT NULL | 생성일시 |

**인덱스:**
- `idx_diary_images_diary_id` (diary_id)

**참고:**
- `Diaries.image_url`은 AI 생성 이미지, `Diary_Images`는 사용자가 직접 업로드한 이미지
- 일기 수정 시 이미지 목록도 함께 업데이트됨

---

### 6. Notices (공지사항)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 공지사항 고유 ID |
| admin_id | BIGINT | FK, NOT NULL | 작성자 ID (Admins.id) |
| title | VARCHAR(255) | NOT NULL | 공지사항 제목 |
| content | TEXT | NOT NULL | 공지사항 내용 (HTML) |
| is_pinned | BOOLEAN | DEFAULT FALSE | 상단 고정 여부 |
| views | INT | DEFAULT 0 | 조회수 |
| is_public | BOOLEAN | DEFAULT TRUE | 공개 여부 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |
| deleted_at | DATETIME | NULL | 삭제일시 (소프트 삭제) |

**인덱스:**
- `idx_notices_is_pinned` (is_pinned)
- `idx_notices_created_at` (created_at DESC)
- `idx_notices_is_public` (is_public)
- `idx_notices_deleted_at` (deleted_at)

**참고:**
- 사용자 조회 시 `is_public = TRUE`이고 `deleted_at IS NULL`인 공지사항만 표시
- 조회 시 `views` 자동 증가

---

### 7. Counseling_Resources (상담 기관)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 상담 기관 고유 ID |
| name | VARCHAR(255) | NOT NULL | 기관명 |
| category | ENUM | NOT NULL | 카테고리 (긴급상담, 전문상담, 상담전화, 의료기관) |
| phone | VARCHAR(50) | NULL | 전화번호 |
| website | VARCHAR(500) | NULL | 웹사이트 URL |
| description | TEXT | NULL | 설명 |
| operating_hours | VARCHAR(255) | NULL | 운영 시간 |
| is_urgent | BOOLEAN | DEFAULT FALSE | 긴급 상담 기관 여부 (High 레벨 위험 신호 시 전화번호 표시) |
| is_available | BOOLEAN | DEFAULT TRUE | 이용 가능 여부 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |
| deleted_at | DATETIME | NULL | 삭제일시 (소프트 삭제) |

**인덱스:**
- `idx_counseling_resources_category` (category)
- `idx_counseling_resources_is_urgent` (is_urgent)
- `idx_counseling_resources_deleted_at` (deleted_at)

**참고:**
- `is_urgent = TRUE`인 기관의 전화번호는 High 레벨 위험 신호 표시 시 자동으로 포함됨

---

### 8. Risk_Detection_Settings (위험 신호 감지 기준)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 설정 고유 ID (단일 레코드만 존재, id=1) |
| monitoring_period | INT | NOT NULL, DEFAULT 14 | 모니터링 기간 (일, 1-365) |
| high_consecutive_score | INT | NOT NULL, DEFAULT 8 | High 레벨 연속 부정 감정 임계 점수 (1-100) |
| high_score_in_period | INT | NOT NULL, DEFAULT 12 | High 레벨 모니터링 기간 내 부정 감정 임계 점수 (1-200) |
| medium_consecutive_score | INT | NOT NULL, DEFAULT 5 | Medium 레벨 연속 부정 감정 임계 점수 (1-100) |
| medium_score_in_period | INT | NOT NULL, DEFAULT 8 | Medium 레벨 모니터링 기간 내 부정 감정 임계 점수 (1-200) |
| low_consecutive_score | INT | NOT NULL, DEFAULT 2 | Low 레벨 연속 부정 감정 임계 점수 (1-100) |
| low_score_in_period | INT | NOT NULL, DEFAULT 4 | Low 레벨 모니터링 기간 내 부정 감정 임계 점수 (1-200) |
| updated_at | DATETIME | NOT NULL | 수정일시 |
| updated_by | BIGINT | FK, NULL | 수정한 관리자 ID (Admins.id) |

**참고:**
- 이 테이블은 단일 레코드만 존재 (id=1)
- 관리자가 설정을 변경할 때마다 UPDATE
- 변경 이력은 `updated_at`, `updated_by`로 추적
- 점수 기준:
  - 고위험 부정 감정 (2점): 슬픔, 분노
  - 중위험 부정 감정 (1점): 불안, 혐오
- 검증 규칙:
  - High의 consecutive_score > Medium의 consecutive_score > Low의 consecutive_score
  - High의 score_in_period > Medium의 score_in_period > Low의 score_in_period

---

### 9. Risk_Detection_Sessions (위험 신호 세션)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 세션 고유 ID |
| user_id | BIGINT | FK, NOT NULL | 사용자 ID (Users.id) |
| risk_level | ENUM | NOT NULL | 위험 레벨 (none, low, medium, high) |
| shown_at | DATETIME | NULL | 알림 표시 완료 일시 |
| created_at | DATETIME | NOT NULL | 생성일시 |

**인덱스:**
- `idx_risk_sessions_user_id` (user_id)
- `idx_risk_sessions_created_at` (created_at DESC)
- `idx_risk_sessions_user_created` (user_id, created_at DESC) - 최신 세션 조회 최적화

**참고:**
- 사용자 로그인 후 다이어리 메인 화면 진입 시 위험 신호 분석 후 세션 생성
- `shown_at`이 NULL이면 아직 알림을 보지 않은 상태
- 세션 중 한 번만 표시되도록 `shown_at`으로 확인

---

### 10. Email_Verification_Codes (이메일 인증 코드)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 인증 코드 고유 ID |
| email | VARCHAR(255) | NOT NULL | 이메일 주소 |
| code | VARCHAR(6) | NOT NULL | 인증 코드 (6자리) |
| expires_at | DATETIME | NOT NULL | 만료 일시 (발송 시점 + 5분) |
| verified_at | DATETIME | NULL | 인증 완료 일시 |
| created_at | DATETIME | NOT NULL | 생성일시 |

**인덱스:**
- `idx_email_codes_email` (email)
- `idx_email_codes_code` (code)
- `idx_email_codes_expires_at` (expires_at)

**참고:**
- 인증 완료 후 또는 만료된 코드는 정기적으로 삭제 (크론 작업)
- 회원가입 및 비밀번호 재설정 모두에서 사용

---

### 11. Password_Reset_Codes (비밀번호 재설정 코드)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 재설정 코드 고유 ID |
| email | VARCHAR(255) | NOT NULL | 이메일 주소 |
| code | VARCHAR(6) | NOT NULL | 재설정 코드 (6자리) |
| reset_token | VARCHAR(255) | NULL | 재설정 토큰 (인증 완료 후 발급) |
| expires_at | DATETIME | NOT NULL | 만료 일시 (발송 시점 + 5분) |
| used_at | DATETIME | NULL | 사용 완료 일시 |
| created_at | DATETIME | NOT NULL | 생성일시 |

**인덱스:**
- `idx_password_codes_email` (email)
- `idx_password_codes_code` (code)
- `idx_password_codes_reset_token` (reset_token)
- `idx_password_codes_expires_at` (expires_at)

**참고:**
- 사용 완료 후 또는 만료된 코드는 정기적으로 삭제 (크론 작업)

---

### 12. Refresh_Tokens (사용자 리프레시 토큰)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 리프레시 토큰 고유 ID |
| user_id | BIGINT | FK, NOT NULL | 사용자 ID (Users.id) |
| token | VARCHAR(500) | NOT NULL | 리프레시 토큰 값 (JWT 또는 해시값) |
| expires_at | DATETIME | NOT NULL | 만료 일시 |
| revoked_at | DATETIME | NULL | 무효화 일시 (NULL이면 유효한 토큰) |
| device_info | VARCHAR(255) | NULL | 기기 정보 (선택적, 보안 추적용) |
| created_at | DATETIME | NOT NULL | 생성일시 |

**인덱스:**
- `idx_refresh_tokens_user_id` (user_id)
- `idx_refresh_tokens_token` (token)
- `idx_refresh_tokens_expires_at` (expires_at)
- `idx_refresh_tokens_revoked_at` (revoked_at)

**참고:**
- 로그인 시 리프레시 토큰 생성 및 저장
- 토큰 재발급 시 기존 토큰 무효화(`revoked_at` 설정) 후 새 토큰 생성
- 로그아웃 시 해당 사용자의 모든 리프레시 토큰 무효화
- 만료되거나 무효화된 토큰은 정기적으로 삭제 (크론 작업)

---

### 13. Admin_Refresh_Tokens (관리자 리프레시 토큰)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 리프레시 토큰 고유 ID |
| admin_id | BIGINT | FK, NOT NULL | 관리자 ID (Admins.id) |
| token | VARCHAR(500) | NOT NULL | 리프레시 토큰 값 (JWT 또는 해시값) |
| expires_at | DATETIME | NOT NULL | 만료 일시 |
| revoked_at | DATETIME | NULL | 무효화 일시 (NULL이면 유효한 토큰) |
| device_info | VARCHAR(255) | NULL | 기기 정보 (선택적, 보안 추적용) |
| created_at | DATETIME | NOT NULL | 생성일시 |

**인덱스:**
- `idx_admin_refresh_tokens_admin_id` (admin_id)
- `idx_admin_refresh_tokens_token` (token)
- `idx_admin_refresh_tokens_expires_at` (expires_at)
- `idx_admin_refresh_tokens_revoked_at` (revoked_at)

**참고:**
- 관리자 로그인 시 리프레시 토큰 생성 및 저장
- 토큰 재발급 시 기존 토큰 무효화(`revoked_at` 설정) 후 새 토큰 생성
- 관리자 로그아웃 시 해당 관리자의 모든 리프레시 토큰 무효화
- 만료되거나 무효화된 토큰은 정기적으로 삭제 (크론 작업)

---

### 14. Error_Logs (에러 로그)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 로그 고유 ID |
| level | ENUM | NOT NULL | 로그 레벨 (ERROR, WARN, INFO) |
| message | TEXT | NOT NULL | 에러 메시지 |
| error_code | VARCHAR(50) | NULL | 에러 코드 |
| endpoint | VARCHAR(255) | NULL | API 엔드포인트 |
| user_id | BIGINT | FK, NULL | 사용자 ID (Users.id, NULL 가능) |
| admin_id | BIGINT | FK, NULL | 관리자 ID (Admins.id, NULL 가능) |
| stack_trace | TEXT | NULL | 스택 트레이스 |
| created_at | DATETIME | NOT NULL | 생성일시 |

**인덱스:**
- `idx_error_logs_level` (level)
- `idx_error_logs_created_at` (created_at DESC)
- `idx_error_logs_user_id` (user_id)
- `idx_error_logs_admin_id` (admin_id)
- `idx_error_logs_endpoint` (endpoint)

**참고:**
- 오래된 로그는 정기적으로 아카이빙 또는 삭제 (크론 작업)
- 관리자 로그인 시도 실패도 기록됨

---

## 관계 설명

### 1. Users ↔ Diaries (1:N)
- 한 사용자는 여러 일기를 작성할 수 있음
- 일기는 반드시 한 사용자에 속함
- `Diaries.user_id` → `Users.id` (FK)
- CASCADE: 사용자 삭제 시 일기도 함께 삭제 (소프트 삭제)

### 2. Users ↔ Risk_Detection_Sessions (1:N)
- 한 사용자는 여러 위험 신호 세션을 가질 수 있음 (로그인마다 생성)
- 세션은 반드시 한 사용자에 속함
- `Risk_Detection_Sessions.user_id` → `Users.id` (FK)
- CASCADE: 사용자 삭제 시 세션도 함께 삭제

### 3. Diaries ↔ Diary_Activities (1:N)
- 한 일기는 여러 활동을 가질 수 있음
- 활동은 반드시 한 일기에 속함
- `Diary_Activities.diary_id` → `Diaries.id` (FK)
- CASCADE: 일기 삭제 시 활동도 함께 삭제

### 4. Diaries ↔ Diary_Images (1:N)
- 한 일기는 여러 이미지를 가질 수 있음 (사용자가 업로드한 이미지)
- 이미지는 반드시 한 일기에 속함
- `Diary_Images.diary_id` → `Diaries.id` (FK)
- CASCADE: 일기 삭제 시 이미지도 함께 삭제
- 참고: `Diaries.image_url`은 AI 생성 이미지, `Diary_Images`는 사용자 업로드 이미지

### 5. Admins ↔ Notices (1:N)
- 한 관리자는 여러 공지사항을 작성할 수 있음
- 공지사항은 반드시 한 관리자에 속함
- `Notices.admin_id` → `Admins.id` (FK)
- CASCADE: 관리자 삭제 시 공지사항도 함께 삭제 (소프트 삭제)

### 6. Admins ↔ Risk_Detection_Settings (1:1)
- 위험 신호 감지 기준 설정을 변경한 관리자 추적
- `Risk_Detection_Settings.updated_by` → `Admins.id` (FK, NULL 가능)

### 7. Users ↔ Email_Verification_Codes (N:1, 이메일 기준)
- 한 사용자는 여러 인증 코드를 가질 수 있음 (재발송 시)
- 인증 코드는 이메일 주소로 연결 (FK 없음, email로 연결)

### 8. Users ↔ Password_Reset_Codes (N:1, 이메일 기준)
- 한 사용자는 여러 재설정 코드를 가질 수 있음
- 재설정 코드는 이메일 주소로 연결 (FK 없음, email로 연결)

### 9. Users ↔ Error_Logs (1:N)
- 한 사용자와 관련된 여러 에러 로그가 있을 수 있음
- 에러 로그는 사용자와 무관할 수도 있음 (NULL 가능)
- `Error_Logs.user_id` → `Users.id` (FK, NULL 가능)

### 10. Admins ↔ Error_Logs (1:N)
- 한 관리자와 관련된 여러 에러 로그가 있을 수 있음
- 에러 로그는 관리자와 무관할 수도 있음 (NULL 가능)
- `Error_Logs.admin_id` → `Admins.id` (FK, NULL 가능)

### 11. Users ↔ Refresh_Tokens (1:N)
- 한 사용자는 여러 리프레시 토큰을 가질 수 있음 (다중 기기 로그인)
- 리프레시 토큰은 반드시 한 사용자에 속함
- `Refresh_Tokens.user_id` → `Users.id` (FK)
- CASCADE: 사용자 삭제 시 리프레시 토큰도 함께 삭제

### 12. Admins ↔ Admin_Refresh_Tokens (1:N)
- 한 관리자는 여러 리프레시 토큰을 가질 수 있음 (다중 기기 로그인)
- 리프레시 토큰은 반드시 한 관리자에 속함
- `Admin_Refresh_Tokens.admin_id` → `Admins.id` (FK)
- CASCADE: 관리자 삭제 시 리프레시 토큰도 함께 삭제

---

## 인덱스 설계

### 주요 인덱스 전략

1. **외래키 인덱스**: 모든 FK 컬럼에 인덱스 생성
2. **조회 최적화**: 자주 조회되는 컬럼에 인덱스 생성
   - 날짜 기반 조회: `Diaries.date`, `Diaries.created_at`
   - 이메일 조회: `Users.email`, `Admins.email`
   - 정렬: `Notices.created_at DESC`, `Error_Logs.created_at DESC`
3. **복합 인덱스**: 자주 함께 조회되는 컬럼 조합
   - `Diaries(user_id, date)` - 사용자의 특정 날짜 일기 조회
   - `Diaries(user_id, emotion)` - 위험 신호 감지 최적화
   - `Risk_Detection_Sessions(user_id, created_at DESC)` - 최신 세션 조회
4. **소프트 삭제**: `deleted_at` 컬럼에 인덱스 생성하여 활성 레코드만 조회
5. **검색 최적화**: 검색에 사용되는 컬럼에 인덱스 생성

### 인덱스 목록

**Users:**
- PRIMARY KEY (id)
- UNIQUE (email)
- INDEX (deleted_at)

**Admins:**
- PRIMARY KEY (id)
- UNIQUE (email)

**Diaries:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (date)
- UNIQUE (user_id, date) WHERE deleted_at IS NULL
- INDEX (emotion)
- INDEX (user_id, emotion) - 위험 신호 감지 최적화
- INDEX (user_id, emotion, date) - 위험 신호 감지 최적화 (모니터링 기간 내 일기 조회)
- INDEX (emotion, date) - 통계 조회 최적화
- FULLTEXT (title, content) - 일기 검색 최적화
- INDEX (deleted_at)

**Diary_Activities:**
- PRIMARY KEY (id)
- INDEX (diary_id)

**Diary_Images:**
- PRIMARY KEY (id)
- INDEX (diary_id)

**Notices:**
- PRIMARY KEY (id)
- INDEX (is_pinned)
- INDEX (created_at DESC)
- INDEX (is_public)
- INDEX (deleted_at)

**Counseling_Resources:**
- PRIMARY KEY (id)
- INDEX (category)
- INDEX (is_urgent)
- INDEX (deleted_at)

**Risk_Detection_Settings:**
- PRIMARY KEY (id)

**Risk_Detection_Sessions:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (created_at DESC)
- INDEX (user_id, created_at DESC) - 최신 세션 조회 최적화

**Email_Verification_Codes:**
- PRIMARY KEY (id)
- INDEX (email)
- INDEX (code)
- INDEX (expires_at)

**Password_Reset_Codes:**
- PRIMARY KEY (id)
- INDEX (email)
- INDEX (code)
- INDEX (reset_token)
- INDEX (expires_at)

**Refresh_Tokens:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (token)
- INDEX (expires_at)
- INDEX (revoked_at)

**Admin_Refresh_Tokens:**
- PRIMARY KEY (id)
- INDEX (admin_id)
- INDEX (token)
- INDEX (expires_at)
- INDEX (revoked_at)

**Error_Logs:**
- PRIMARY KEY (id)
- INDEX (level)
- INDEX (created_at DESC)
- INDEX (user_id)
- INDEX (admin_id)
- INDEX (endpoint)

---

## 추가 고려사항

### 1. KoBERT 분석 결과 저장
- `Diaries.kobert_analysis`는 JSON 타입으로 저장
- 구조 예시:
  ```json
  {
    "emotion": "슬픔",
    "confidence": 0.85
  }
  ```
- **참고**: 
  - KoBERT는 일기 본문(`content`)만 분석하여 7가지 감정 중 하나를 반환
  - KoBERT 출력값: 감정 레이블(`emotion`)과 확률값(`confidence`)만 제공
  - `emotion`: 감정 레이블 (행복, 중립, 당황, 슬픔, 분노, 불안, 혐오 중 하나)
    - 긍정: 행복 (1가지)
    - 중립: 중립, 당황 (2가지)
    - 부정: 슬픔, 분노, 불안, 혐오 (4가지) - 위험 신호 계산에 사용
  - `confidence`: 해당 감정에 대한 확률값 (0.0 ~ 1.0)
- `emotion` 컬럼은 `kobert_analysis.emotion` 값에서 추출하여 저장 (검색/통계 최적화)
- `emotion` 컬럼과 `kobert_analysis.emotion`은 동기화되어야 함
- **위험 신호 감지**: 부정 감정만 기준으로 계산되며, 심각도별 가중치 적용
  - **고위험 부정 감정 (2점)**: 슬픔, 분노
  - **중위험 부정 감정 (1점)**: 불안, 혐오
  - 계산 방식: 각 감정의 가중치를 합산하여 점수로 판정
  - 예시: 슬픔 2일(4점) + 불안 1일(1점) = 총 5점

### 2. 음식 추천 정보 저장
- `Diaries.recommended_food`는 JSON 타입으로 저장
- 구조 예시:
  ```json
  {
    "name": "따뜻한 국밥",
    "reason": "몸을 따뜻하게 해주는 음식이 기분 전환에 도움이 될 수 있어요"
  }
  ```
- 일기 저장 시 Gemini API로 생성되어 DB에 저장됨
- 장소 추천 화면에서 일기 조회 API로 조회하여 사용

### 3. 소프트 삭제
- `Users`, `Diaries`, `Notices`, `Counseling_Resources`는 소프트 삭제 사용
- `deleted_at`이 NULL이면 활성 레코드
- 조회 시 `WHERE deleted_at IS NULL` 조건 필수

### 4. 데이터 타입 선택
- **BIGINT**: ID는 BIGINT 사용 (향후 확장성)
- **ENUM**: 제한된 값의 경우 ENUM 사용 (감정, 날씨, 카테고리 등)
- **JSON**: KoBERT 분석 결과, 음식 추천 정보는 JSON 타입 사용
- **TEXT**: 긴 텍스트는 TEXT 사용 (일기 본문, 공지사항 내용 등)

### 5. 날짜/시간
- 모든 날짜/시간은 DATETIME 타입 사용
- 타임존은 UTC 기준 저장, 클라이언트에서 변환

### 6. 비밀번호
- `password_hash`는 해시된 값만 저장 (bcrypt 등 사용)
- 원본 비밀번호는 절대 저장하지 않음

### 7. AI 처리 비동기화 고려사항
- `Diaries.image_url`, `Diaries.ai_comment`, `Diaries.recommended_food`는 초기에는 NULL일 수 있음
- 백그라운드 작업으로 생성되므로, 프론트엔드에서 주기적으로 확인하거나 WebSocket으로 업데이트 받을 수 있음
- 일기 조회 시 이 필드들이 NULL인지 확인하여 처리 상태를 알 수 있음

### 8. 성능 최적화
- 위험 신호 감지: `Diaries(user_id, emotion, date)` 복합 인덱스로 모니터링 기간 내 일기 조회 최적화
- 캘린더 조회: `Diaries(user_id, date)` 인덱스로 월별 조회 최적화
- 통계 조회: `Diaries(emotion, date)` 인덱스로 감정 통계 조회 최적화
- 일기 검색: `Diaries(title, content)` FULLTEXT 인덱스로 제목/내용 검색 최적화

### 9. 리프레시 토큰 관리
- **토큰 저장**: 로그인 시 리프레시 토큰을 DB에 저장하여 무효화 가능하도록 함
- **토큰 재발급**: `/auth/refresh` API 호출 시 기존 토큰을 무효화(`revoked_at` 설정)하고 새 토큰 발급
- **로그아웃 처리**: 로그아웃 시 해당 사용자/관리자의 모든 리프레시 토큰 무효화
- **다중 기기 지원**: 한 사용자가 여러 기기에서 로그인할 수 있도록 여러 토큰 저장 가능
- **보안**: 토큰 탈취 시 즉시 무효화 가능, `device_info`로 기기 추적 가능
- **정리 작업**: 만료되거나 무효화된 토큰은 정기적으로 삭제 (크론 작업)

---

**작성일**: 2024-01-15  
**버전**: 2.0.0  
**기반 문서**: API 명세서 v1.0.0, 사용자 기반 상세기능명세서, 관리자 기반 상세기능명세서
