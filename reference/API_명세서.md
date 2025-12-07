# 감정 일기 앱 - API 명세서

## 엔드포인트 목록

### 사용자 API

| Method | 엔드포인트                             | 설명                      | 인증 필요 |
| ------ | -------------------------------------- | ------------------------- | --------- |
| POST   | `/api/auth/login`                      | 로그인                    | ❌        |
| POST   | `/api/auth/check-email`                | 이메일 중복 확인          | ❌        |
| POST   | `/api/auth/send-verification-code`     | 이메일 인증 코드 발송     | ❌        |
| POST   | `/api/auth/verify-code`                | 이메일 인증 코드 확인     | ❌        |
| POST   | `/api/auth/register`                   | 회원가입                  | ❌        |
| POST   | `/api/auth/password-reset/send-code`   | 비밀번호 재설정 코드 발송 | ❌        |
| POST   | `/api/auth/password-reset/verify-code` | 비밀번호 재설정 코드 확인 | ❌        |
| POST   | `/api/auth/password-reset/reset`       | 비밀번호 재설정           | ❌        |
| POST   | `/api/auth/refresh`                    | 토큰 재발급               | ❌        |
| GET    | `/api/users/me`                        | 사용자 정보 조회          | ✅        |
| PUT    | `/api/users/me/persona`                | 페르소나 설정 변경        | ✅        |
| PUT    | `/api/users/me/password`               | 비밀번호 변경             | ✅        |
| DELETE | `/api/users/me`                        | 계정 탈퇴                 | ✅        |
| POST   | `/api/diaries`                         | 일기 작성                 | ✅        |
| PUT    | `/api/diaries/{diaryId}`               | 일기 수정                 | ✅        |
| GET    | `/api/diaries/{diaryId}`               | 일기 조회 (단일)          | ✅        |
| GET    | `/api/diaries/date/{date}`             | 일기 조회 (날짜 기준)     | ✅        |
| GET    | `/api/diaries/calendar`                | 캘린더 월별 조회          | ✅        |
| DELETE | `/api/diaries/{diaryId}`               | 일기 삭제                 | ✅        |
| GET    | `/api/diaries/search`                  | 일기 검색                 | ✅        |
| GET    | `/api/statistics/emotions`             | 감정 통계 조회            | ✅        |
| GET    | `/api/statistics/emotion-trend`        | 감정 변화 추이            | ✅        |
| GET    | `/api/risk-detection/analyze`          | 위험 신호 분석            | ✅        |
| GET    | `/api/risk-detection/session-status`   | 위험 신호 세션 확인       | ✅        |
| POST   | `/api/risk-detection/mark-shown`       | 위험 알림 표시 완료 기록  | ✅        |
| GET    | `/api/notices`                         | 공지사항 목록 조회        | ✅        |
| GET    | `/api/notices/{noticeId}`              | 공지사항 상세 조회        | ✅        |
| GET    | `/api/counseling-resources`            | 상담 기관 목록 조회       | ✅        |
| POST   | `/api/upload/image`                    | 이미지 업로드             | ✅        |
| DELETE | `/api/upload/image`                    | 이미지 삭제               | ✅        |

| DELETE | `/api/upload/image` | 이미지 삭제 | ✅ |

### Internal API (Backend <-> AI Server)

| Method | 엔드포인트      | 설명                   | 인증 필요    |
| ------ | --------------- | ---------------------- | ------------ |
| POST   | `/api/ai/diary` | 일기 분석 및 생성 통합 | ❌(Internal) |

### 관리자 API

| Method | 엔드포인트                                              | 설명                       | 인증 필요 |
| ------ | ------------------------------------------------------- | -------------------------- | --------- |
| POST   | `/api/admin/auth/login`                                 | 관리자 로그인              | ❌        |
| GET    | `/api/admin/dashboard/stats`                            | 서비스 통계 카드           | ✅        |
| GET    | `/api/admin/dashboard/diary-trend`                      | 일지 작성 추이 차트        | ✅        |
| GET    | `/api/admin/dashboard/user-activity-stats`              | 사용자 활동 통계 차트      | ✅        |
| GET    | `/api/admin/dashboard/risk-level-distribution`          | 위험 레벨 분포 통계        | ✅        |
| GET    | `/api/admin/notices`                                    | 공지사항 목록 조회         | ✅        |
| GET    | `/api/admin/notices/{noticeId}`                         | 공지사항 상세 조회         | ✅        |
| POST   | `/api/admin/notices`                                    | 공지사항 작성              | ✅        |
| PUT    | `/api/admin/notices/{noticeId}`                         | 공지사항 수정              | ✅        |
| DELETE | `/api/admin/notices/{noticeId}`                         | 공지사항 삭제              | ✅        |
| PUT    | `/api/admin/notices/{noticeId}/pin`                     | 공지사항 고정/해제         | ✅        |
| GET    | `/api/admin/settings/risk-detection`                    | 위험 신호 감지 기준 조회   | ✅        |
| PUT    | `/api/admin/settings/risk-detection`                    | 위험 신호 감지 기준 변경   | ✅        |
| GET    | `/api/admin/settings/counseling-resources`              | 상담 기관 리소스 목록 조회 | ✅        |
| POST   | `/api/admin/settings/counseling-resources`              | 상담 기관 리소스 추가      | ✅        |
| PUT    | `/api/admin/settings/counseling-resources/{resourceId}` | 상담 기관 리소스 수정      | ✅        |
| DELETE | `/api/admin/settings/counseling-resources/{resourceId}` | 상담 기관 리소스 삭제      | ✅        |
| GET    | `/api/admin/error-logs`                                 | 에러 로그 목록 조회        | ✅        |
| GET    | `/api/admin/error-logs/{logId}`                         | 에러 로그 상세 조회        | ✅        |
| POST   | `/api/admin/auth/logout`                                | 관리자 로그아웃            | ✅        |

**총 엔드포인트 수**: 50개 (사용자: 30개, 관리자: 20개)

**참고**: 관리자 명세서 변경에 따라 개인 사용자 정보를 포함하는 API는 제거되었습니다. 대신 서비스 전체 통계만 제공합니다.

---

## 목차

1. [기본 정보](#1-기본-정보)
2. [인증](#2-인증)
3. [사용자 API](#3-사용자-api)
4. [일기 API](#4-일기-api)
5. [통계 및 검색 API](#5-통계-및-검색-api)
6. [위험 신호 감지 API](#6-위험-신호-감지-api)
7. [공지사항 API](#7-공지사항-api)
8. [상담 기관 리소스 API](#8-상담-기관-리소스-api)
9. [파일 업로드 API](#9-파일-업로드-api)
10. [관리자 API](#10-관리자-api)
11. [공통 응답 형식](#12-공통-응답-형식)
12. [에러 코드](#13-에러-코드)

---

## 1. 기본 정보

### Base URL

```
개발: http://localhost:8080/api
운영: https://api.emoji-diary.com/api
```

### 인증 방식

- JWT (JSON Web Token)
- Header에 `Authorization: Bearer {accessToken}` 형식으로 전송
- Access Token 만료 시 Refresh Token으로 재발급

### Content-Type

- `application/json` (기본)
- `multipart/form-data` (파일 업로드 시)

---

## 2. 인증

### 2.1 로그인

**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "persona": "베프"
    }
  }
}
```

**Response 400/401:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "아이디 또는 비밀번호가 일치하지 않습니다."
  }
}
```

---

### 2.2 회원가입

#### 2.2.1 이메일 중복 확인

**POST** `/auth/check-email`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "available": true,
    "message": "사용 가능한 이메일입니다"
  }
}
```

**Response 200 (중복):**

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "이미 가입된 이메일입니다"
  }
}
```

---

#### 2.2.2 이메일 인증 코드 발송

**POST** `/auth/send-verification-code`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "인증 코드가 발송되었습니다",
    "expiresIn": 300
  }
}
```

**참고**: 인증 코드 유효 시간은 5분(300초)

---

#### 2.2.3 이메일 인증 코드 확인

**POST** `/auth/verify-code`

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "verified": true,
    "message": "이메일 인증이 완료되었습니다"
  }
}
```

**Response 400:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "인증 코드가 일치하지 않습니다"
  }
}
```

**Response 400 (만료):**

```json
{
  "success": false,
  "error": {
    "code": "CODE_EXPIRED",
    "message": "인증 시간이 만료되었습니다. 재발송해주세요"
  }
}
```

---

#### 2.2.4 회원가입

**POST** `/auth/register`

**Request Body:**

```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "password": "Password123!",
  "emailVerified": true,
  "gender": "MALE"
}
```

**Request Body 필드 설명:**

- `name`: 사용자 이름 (필수)
- `email`: 이메일 주소 (필수)
- `password`: 비밀번호 (필수, 최소 8자, 영문/숫자/특수문자 포함)
- `emailVerified`: 이메일 인증 완료 여부 (필수, `true`여야 함)
- `gender`: 성별 (필수, `MALE` 또는 `FEMALE`, AI 이미지 생성 시 사용됨)

**페르소나 종류:**

- `베프`, `부모님`, `전문가`, `멘토`, `상담사`, `시인`

**Response 201:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "persona": "베프"
    }
  }
}
```

**참고**:

- 비밀번호: 최소 8자, 영문/숫자/특수문자 포함
- 이메일 인증 완료 필수 (`emailVerified: true`)
- 페르소나: 기본값 `"BEST_FRIEND"`로 자동 설정됨
- 회원가입 직후 페르소나 설정 화면에서 확인/변경 가능 (`PUT /users/me/persona`)
- 사용자가 페르소나 설정 화면을 닫아도 기본값이 설정되어 있어 시스템이 정상 동작함

---

### 2.3 비밀번호 찾기

#### 2.3.1 비밀번호 재설정 이메일 인증 코드 발송

**POST** `/auth/password-reset/send-code`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "인증 코드가 발송되었습니다",
    "expiresIn": 300
  }
}
```

---

#### 2.3.2 비밀번호 재설정 인증 코드 확인

**POST** `/auth/password-reset/verify-code`

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "verified": true,
    "resetToken": "reset_token_here"
  }
}
```

---

#### 2.3.3 비밀번호 재설정

**POST** `/auth/password-reset/reset`

**Request Body:**

```json
{
  "email": "user@example.com",
  "resetToken": "reset_token_here",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "비밀번호가 재설정되었습니다"
  }
}
```

---

### 2.4 토큰 재발급

**POST** `/auth/refresh`

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

---

## 3. 사용자 API

### 3.1 사용자 정보 조회

**GET** `/users/me`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "gender": "MALE",
    "persona": "베프",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 3.2 페르소나 설정 변경

**PUT** `/users/me/persona`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "persona": "베프"
}
```

**페르소나 종류:**

- `베프`, `부모님`, `전문가`, `멘토`, `상담사`, `시인`

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "페르소나가 설정되었습니다",
    "persona": "베프"
  }
}
```

**참고**:

- 회원가입 직후 페르소나 설정 화면에서 초기 설정 시 사용
- 이미 페르소나가 설정된 경우 변경 시에도 사용
- Response 메시지는 초기 설정/변경 여부와 관계없이 동일하게 반환됨

---

### 3.3 비밀번호 변경

**PUT** `/users/me/password`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "비밀번호가 변경되었습니다"
  }
}
```

**Response 400:**

```json
{
  "success": false,
  "error": {
    "code": "INCORRECT_PASSWORD",
    "message": "현재 비밀번호가 일치하지 않습니다"
  }
}
```

---

### 3.4 계정 탈퇴

**DELETE** `/users/me`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "계정이 삭제되었습니다"
  }
}
```

**참고: 회원 탈퇴 및 재가입 정책**

- **로그인 (POST /auth/login)**: 탈퇴한 사용자(Soft Deleted)가 로그인 시도 시, 로그인을 차단하고 에러를 반환합니다. (Code: `400 Bad Request`, Message: "User account is deleted")
- **회원가입 (POST /auth/register)**: 이미 가입된 이메일이라도 '탈퇴' 상태라면 재가입을 허용하며, 기존 데이터(일기, 토큰 등)는 **영구 삭제(Hard Delete)** 됩니다.
- **회원 탈퇴 (DELETE /users/me)**: 데이터를 즉시 삭제하지 않고, `deleted_at` 필드를 업데이트하여 **Soft Delete** 처리합니다.

---

## 4. 일기 API

### 4.1 일기 작성

**POST** `/diaries`

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "date": "2024-01-15",
  "title": "오늘의 일기",
  "content": "오늘 하루를 기록합니다...",
  "mood": "행복, 평온",
  "weather": "맑음",
  "activities": ["운동", "독서"],
  "images": [
    "https://example.com/user-image1.jpg",
    "https://example.com/user-image2.jpg"
  ]
}
```

**Request Body 필드 설명:**

- `date`: 일기 작성 날짜 (필수, YYYY-MM-DD 형식, 캘린더에서 선택한 날짜)
- `title`: 일기 제목 (필수)
- `content`: 일기 본문 (필수, KoBERT 감정 분석 대상)
- `mood`: 기분 (선택, 쉼표로 구분된 여러 값 가능)
- `weather`: 날씨 (선택)
- `activities`: 활동 목록 (선택, 문자열 배열)
- `images`: 사용자 업로드 이미지 URL 목록 (선택, 문자열 배열)
- `emotion`: 제거됨 (KoBERT가 자동으로 분석하여 저장)

**참고**:

- `emotion` 필드는 제거됨 (KoBERT가 자동으로 분석하여 저장)
- KoBERT는 일기 본문(`content`, `날씨`, `성별`, `persona`)만 분석하여 감정을 결정
- 사용자 업로드 이미지는 이미 `/upload/image` API를 통해 업로드된 URL을 전달합니다
- AI 생성 이미지는 백엔드에서 자동 생성되므로 Request Body에 포함하지 않습니다

**KoBERT 감정 종류 (응답에 포함):**

- 긍정: `행복`
- 중립: `중립`, `당황`
- 부정: `슬픔`, `분노`, `불안`, `혐오`

**날씨 종류:**

- `맑음`, `흐림`, `비`, `천둥`, `눈`, `안개`

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2024-01-15",
    "title": "오늘의 일기",
    "content": "오늘 하루를 기록합니다...",
    "emotion": "행복",
    "mood": "행복, 평온",
    "weather": "맑음",
    "activities": ["운동", "독서"],
    "images": [
      "https://example.com/user-image1.jpg",
      "https://example.com/user-image2.jpg"
    ],
    "imageUrl": "https://example.com/ai-generated-image.jpg",
    "aiComment": "오늘도 행복한 하루였네요!",
    "recommendedFood": {
      "name": "따뜻한 국밥",
      "reason": "몸을 따뜻하게 해주는 음식이 기분 전환에 도움이 될 수 있어요"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**처리 순서 및 AI 기능**:

1. **KoBERT 감정 분석**: 일기 본문(`content`)을 분석하여 7가지 감정 중 하나로 분류 → 주요 감정 추출
   - 감정 분석 결과 획득 (예: "슬픔")
   - KoBERT 분석 결과가 사용자에게 표시되는 감정이 됨
2. **AI 이미지 생성**: 일기 본문, 날씨, KoBERT 감정 분석 결과를 활용하여 NanoVana API로 그림일기 형태의 이미지 생성
   - 생성 완료 → 이미지 URL 획득
3. **일기 데이터 저장**: 제목, 본문, 기분, 날씨, 활동, 사용자 업로드 이미지 URL 목록, KoBERT 감정 분석 결과(`emotion` 컬럼), AI 생성 이미지 URL을 포함하여 일기 데이터 저장
   - 감정 분석 결과는 `emotion` 컬럼에 저장됨
   - AI 생성 이미지 URL은 별도 컬럼에 저장됨
4. **AI 코멘트 생성**: 일기 본문, 날씨, KoBERT 감정 분석 결과, 페르소나 스타일을 반영하여 Gemini API로 AI 코멘트 생성
5. **음식 추천 생성**: 일기 본문, 날씨, KoBERT 감정 분석 결과를 반영하여 Gemini API로 음식 추천 생성 (DB에 저장)

**참고**:

- KoBERT는 일기 본문만 분석하여 감정을 결정 (제목, 기분, 날씨, 활동 등은 참고하지 않음)
- KoBERT 분석 결과(`emotion`)는 자동으로 DB에 저장되며, 위험 신호 감지, 통계, 검색 등에 활용됨
- `kobert_analysis` JSON은 상세 분석 결과를 포함하며 AI 기능(이미지 생성, 코멘트 생성, 음식 추천)에 활용됨
- 모든 AI 처리는 백엔드에서 자동으로 수행됨
- 프론트엔드는 일기 저장 후 응답에서 `emotion`, `imageUrl`, `aiComment`를 받아 표시

---

### 4.2 일기 수정

**PUT** `/diaries/{diaryId}`

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용...",
  "mood": "행복",
  "weather": "맑음",
  "activities": ["운동"],
  "images": ["https://example.com/user-image1.jpg"]
}
```

**Request Body 필드 설명:**

- `title`: 일기 제목 (필수)
- `content`: 일기 본문 (필수, KoBERT 감정 분석 대상)
- `mood`: 기분 (선택, 쉼표로 구분된 여러 값 가능)
- `weather`: 날씨 (선택)
- `activities`: 활동 목록 (선택, 문자열 배열)
- `images`: 사용자 업로드 이미지 URL 목록 (선택, 문자열 배열, 수정된 내용 반영)
- `imageUrl`: 제거됨 (AI가 수정된 일기 내용을 바탕으로 자동 재생성)
- `emotion`: 제거됨 (KoBERT가 수정된 본문을 재분석하여 자동으로 업데이트)

**참고**:

- `emotion` 필드는 제거됨 (KoBERT가 수정된 본문을 재분석하여 자동으로 업데이트)
- KoBERT는 수정된 일기 본문(`content`)만 분석 (제목, 기분, 날씨, 활동 등은 참고하지 않음)
- AI 생성 이미지(`imageUrl`)는 수정된 내용을 반영하여 **자동 재생성**됨
- 사용자 업로드 이미지는 수정된 내용(삭제/추가된 이미지) 반영

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2024-01-15",
    "title": "수정된 제목",
    "content": "수정된 내용...",
    "emotion": "행복",
```

**처리 순서 및 AI 기능**:

1. **KoBERT 감정 분석**: 수정된 일기 본문(`content`)을 분석하여 7가지 감정 중 하나로 재분류 → 주요 감정 추출
   - 수정된 본문을 분석하여 7가지 감정 중 하나로 재분류
   - 주요 감정을 추출하여 `emotion` 컬럼에 업데이트
2. **AI 이미지 재생성**: 수정된 일기 본문, 날씨, KoBERT 감정 분석 결과를 활용하여 NanoVana API로 그림일기 형태의 이미지 **재생성**
   - 기존 이미지는 삭제되고 새로운 이미지로 대체됨
3. **일기 데이터 저장**: 수정된 일기 데이터 전송 및 AI 분석 결과 업데이트
   - 새로운 `emotion` 값, 재생성된 `imageUrl`, 업데이트된 `kobert_analysis` JSON 저장
4. **AI 코멘트 재생성**: 수정된 일기 본문, 날씨, KoBERT 감정 분석 결과, 페르소나 스타일을 반영하여 Gemini API로 새로운 AI 코멘트 생성
5. **음식 추천 재생성**: 수정된 일기 본문, 날씨, KoBERT 감정 분석 결과를 반영하여 Gemini API로 음식 추천 재생성 (DB에 업데이트)

**참고**:

- 일기 내용을 수정하면 **AI 그림일기도 새로 그려짐**
- KoBERT 결과는 AI 코멘트 재생성, 음식 추천, 이미지 생성 등 일기 수정 시 모든 AI 기능에 반영됨
- 수정 완료 후 감정 분석 모달은 표시하지 않으며, 바로 해당 날짜 일기 상세보기 페이지로 이동

---

### 4.3 일기 조회 (단일)

**GET** `/diaries/{diaryId}`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2024-01-15",
    "title": "오늘의 일기",
    "content": "오늘 하루를 기록합니다...",
    "emotion": "행복",
    "mood": "행복, 평온",
    "weather": "맑음",
    "activities": ["운동", "독서"],
    "images": [
      "https://example.com/user-image1.jpg",
      "https://example.com/user-image2.jpg"
    ],
    "imageUrl": "https://example.com/ai-generated-image.jpg",
    "aiComment": "오늘도 행복한 하루였네요!",
    "recommendedFood": {
      "name": "따뜻한 국밥",
      "reason": "몸을 따뜻하게 해주는 음식이 기분 전환에 도움이 될 수 있어요"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Response 필드 설명:**

- `images`: 사용자 업로드 이미지 URL 목록 (배열, 있는 경우)
- `imageUrl`: AI 생성 이미지 URL (그림일기)
- `recommendedFood`: 일기 저장 시 생성된 음식 추천 정보 (장소 추천 화면에서 사용)

---

### 4.4 일기 조회 (날짜 기준)

**GET** `/diaries/date/{date}`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**URL Parameters:**

- `date`: YYYY-MM-DD 형식 (예: 2024-01-15)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2024-01-15",
    "title": "오늘의 일기",
    "content": "오늘 하루를 기록합니다...",
    "emotion": "행복",
    "mood": "행복, 평온",
    "weather": "맑음",
    "activities": ["운동", "독서"],
    "images": ["https://example.com/user-image1.jpg"],
    "imageUrl": "https://example.com/ai-generated-image.jpg",
    "aiComment": "오늘도 행복한 하루였네요!",
    "recommendedFood": {
      "name": "따뜻한 국밥",
      "reason": "몸을 따뜻하게 해주는 음식이 기분 전환에 도움이 될 수 있어요"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Response 404 (일기 없음):**

```json
{
  "success": false,
  "error": {
    "code": "DIARY_NOT_FOUND",
    "message": "해당 날짜에 작성된 일기가 없습니다"
  }
}
```

---

### 4.5 캘린더 월별 조회

**GET** `/diaries/calendar`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `year`: 연도 (예: 2024)
- `month`: 월 (1-12)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 1,
    "diaries": [
      {
        "date": "2024-01-15",
        "emotion": "행복"
      },
      {
        "date": "2024-01-20",
        "emotion": "행복"
      }
    ]
  }
}
```

---

### 4.6 일기 삭제

**DELETE** `/diaries/{diaryId}`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "일기가 삭제되었습니다"
  }
}
```

---

## 5. 통계 및 검색 API

### 5.1 일기 검색

**GET** `/diaries/search`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `keyword`: 검색 키워드 (제목 또는 내용)
- `startDate`: 시작일 (YYYY-MM-DD)
- `endDate`: 종료일 (YYYY-MM-DD)
- `emotions`: 감정 필터 (여러 개 가능, 쉼표로 구분, 예: 행복,중립,슬픔)
  - KoBERT 감정 종류: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "diaries": [
      {
        "id": 1,
        "date": "2024-01-15",
        "title": "오늘의 일기",
        "content": "내용 미리보기...",
        "emotion": "행복",
        "weather": "맑음"
      }
    ]
  }
}
```

---

### 5.2 감정 통계 조회

#### 5.2.1 감정 통계 (기간별)

**GET** `/statistics/emotions`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `period`: 기간 (weekly, monthly, yearly)
- `year`: 연도 (월간/연간 조회 시)
- `month`: 월 (주간/월간 조회 시)
- `week`: 주 (주간 조회 시, 1-52)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "year": 2024,
    "month": 1,
    "emotions": {
      "행복": 10,
      "중립": 5,
      "슬픔": 3,
      "불안": 1
    },
    "total": 19
  }
}
```

**참고**:

- 통계는 KoBERT 분석 결과에서 추출한 감정(`emotion` 컬럼) 기준으로 집계됨
- 7가지 감정 (행복, 중립, 당황, 슬픔, 분노, 불안, 혐오) 기준

---

#### 5.2.2 감정 변화 추이

**GET** `/statistics/emotion-trend`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `period`: 기간 (weekly, monthly)
- `year`: 연도
- `month`: 월 (월간 조회 시)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "period": "weekly",
    "dates": ["2024-01-01", "2024-01-02", "2024-01-03"],
    "emotions": [
      {
        "date": "2024-01-01",
        "emotion": "행복"
      },
      {
        "date": "2024-01-02",
        "emotion": "중립"
      }
    ]
  }
}
```

---

## 6. 위험 신호 감지 API

### 6.1 위험 신호 분석

**GET** `/risk-detection/analyze`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "riskLevel": "low",
    "reasons": [
      "연속 부정 감정 점수 3점 감지",
      "최근 14일 중 부정 감정 점수 5점 발생"
    ],
    "analysis": {
      "monitoringPeriod": 14,
      "consecutiveScore": 3,
      "scoreInPeriod": 5,
      "lastNegativeDate": "2024-01-14"
    },
    "urgentCounselingPhones": []
  }
}
```

**riskLevel 종류:**

- `none`: 위험 신호 없음
- `low`: Low 레벨
- `medium`: Medium 레벨
- `high`: High 레벨

**참고**:

- 위험 신호 판정은 KoBERT 분석 결과에서 추출한 감정(`emotion` 컬럼)을 기준으로 함
- 부정 감정에 심각도별 가중치 적용:
  - 고위험 부정 감정 (2점): `슬픔`, `분노`
  - 중위험 부정 감정 (1점): `불안`, `혐오`
- 각 감정의 가중치를 합산하여 점수로 계산 (예: 슬픔 2일 = 4점, 불안 1일 = 1점)
- 중립(`중립`, `당황`)과 긍정(`행복`) 감정은 위험 신호 계산에 포함되지 않음
- High 레벨인 경우 `urgentCounselingPhones` 배열에 긴급 상담 전화번호가 포함됨
- 관리자가 설정한 위험 신호 감지 기준에 따라 판정됨

---

### 6.2 위험 신호 세션 확인

**GET** `/risk-detection/session-status`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "alreadyShown": false
  }
}
```

**참고**:

- 로그인 후 다이어리 메인 화면 진입 시 위험 알림 모달이 표시되었는지 여부
- `alreadyShown: true`이면 세션 중 다시 표시하지 않음

---

### 6.3 위험 알림 표시 완료 기록

**POST** `/risk-detection/mark-shown`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "위험 알림 표시 완료 기록됨"
  }
}
```

---

## 7. 공지사항 API

### 7.1 공지사항 목록 조회

**GET** `/notices`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "notices": [
      {
        "id": 1,
        "title": "시스템 점검 안내",
        "author": "관리자",
        "createdAt": "2024-01-10T00:00:00Z",
        "views": 150,
        "isPinned": true
      }
    ]
  }
}
```

**참고**:

- 고정된 공지사항이 먼저 표시됨
- 공개 상태인 공지사항만 조회됨

---

### 7.2 공지사항 상세 조회

**GET** `/notices/{noticeId}`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "시스템 점검 안내",
    "content": "<p>시스템 점검 안내 내용...</p>",
    "author": "관리자",
    "createdAt": "2024-01-10T00:00:00Z",
    "views": 151,
    "isPinned": true
  }
}
```

**참고**: 조회 시 조회수가 자동으로 증가함

---

## 8. 상담 기관 리소스 API

### 8.1 상담 기관 목록 조회

**GET** `/counseling-resources`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `category`: 카테고리 필터 (all, 긴급상담, 전문상담, 상담전화, 의료기관)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": 1,
        "name": "자살예방 상담전화",
        "category": "긴급상담",
        "phone": "1393",
        "website": "https://example.com",
        "description": "24시간 자살예방 상담 서비스",
        "operatingHours": "24시간",
        "isUrgent": true
      }
    ]
  }
}
```

---

## 9. 파일 업로드 API

### 9.1 이미지 업로드

**POST** `/upload/image`

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `image`: 이미지 파일 (JPG, PNG 등)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://example.com/uploaded/image.jpg"
  }
}
```

---

### 9.2 이미지 삭제

**DELETE** `/upload/image`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "imageUrl": "https://example.com/uploaded/image.jpg"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "이미지가 삭제되었습니다"
  }
}
```

---

## 10. 관리자 API

### 10.1 관리자 인증

#### 10.1.1 관리자 로그인

**POST** `/admin/auth/login`

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "accessToken": "admin_jwt_token_here",
    "admin": {
      "id": 1,
      "email": "admin@example.com",
      "name": "관리자"
    }
  }
}
```

---

#### 10.1.2 관리자 로그아웃

**POST** `/admin/auth/logout`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "로그아웃되었습니다"
  }
}
```

**참고**: 관리자 JWT 토큰 무효화 처리

---

### 10.2 서비스 통계

#### 10.2.1 서비스 통계 카드

**GET** `/admin/dashboard/stats`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Query Parameters:**

- `period`: 기간 (weekly, monthly, yearly) - 전체 사용자 수, 일평균 일지 작성 수에 적용
- `activeUserType`: 활성 사용자 타입 (dau, wau, mau) - 활성 사용자 수에 적용
- `newUserPeriod`: 신규 가입자 기간 (daily, weekly, monthly) - 신규 가입자 수에 적용

**Response 200:**

```json
{
  "success": true,
  "data": {
    "totalUsers": {
      "count": 150,
      "change": 5,
      "period": "monthly"
    },
    "activeUsers": {
      "dau": 120,
      "wau": 135,
      "mau": 145,
      "type": "dau"
    },
    "newUsers": {
      "daily": 3,
      "weekly": 15,
      "monthly": 50,
      "period": "daily"
    },
    "totalDiaries": {
      "count": 5000,
      "change": 200
    },
    "averageDailyDiaries": {
      "count": 25,
      "period": "monthly"
    },
    "riskLevelUsers": {
      "high": 5,
      "medium": 15,
      "low": 30,
      "none": 100
    }
  }
}
```

**참고**:

- 개인 식별 정보 없이 통계만 제공합니다.
- `change` 값은 이전 기간 대비 증감 수입니다.
- `riskLevelUsers`는 위험 레벨별 사용자 수만 제공하며, 개인 정보는 포함하지 않습니다.

---

#### 10.2.2 일지 작성 추이 차트

**GET** `/admin/dashboard/diary-trend`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Query Parameters:**

- `period`: 기간 (weekly, monthly, yearly)
- `year`: 연도
- `month`: 월 (주간/월간 조회 시)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "year": 2024,
    "month": 1,
    "trend": [
      {
        "date": "2024-01-01",
        "count": 25
      },
      {
        "date": "2024-01-02",
        "count": 30
      }
    ]
  }
}
```

**yearly 케이스 예시:**

```json
{
  "success": true,
  "data": {
    "period": "yearly",
    "year": 2024,
    "trend": [
      {
        "date": "2024-01",
        "count": 750
      },
      {
        "date": "2024-02",
        "count": 820
      }
    ]
  }
}
```

**참고**:

- 일지 작성 개수 추이만 제공하며, 개인 정보는 포함하지 않습니다.
- `year`, `month` 필드는 조회한 기간 정보를 나타냅니다.
- `period`에 따라 `date` 형식이 다릅니다:
  - `weekly`, `monthly`: `date`는 `"YYYY-MM-DD"` 형식 (일별)
  - `yearly`: `date`는 `"YYYY-MM"` 형식 (월별)

---

#### 10.2.3 사용자 활동 통계 차트

**GET** `/admin/dashboard/user-activity-stats`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Query Parameters:**

- `period`: 기간 (weekly, monthly, yearly) - 기본값: monthly
- `year`: 연도 - 생략 시 현재 연도 사용
- `month`: 월 (주간/월간 조회 시, 1~12 범위) - 생략 시 현재 월 사용, 범위를 벗어나면 400 Bad Request 반환
- `metrics`: 지표 선택 (여러 개 가능, 쉼표로 구분, 예: dau,wau,mau,newUsers,retentionRate) - 생략 시 모든 지표를 반환
  - `dau`: 일일 활성 사용자 수
  - `wau`: 주간 활성 사용자 수
  - `mau`: 월간 활성 사용자 수
  - `newUsers`: 신규 가입자 수
  - `retentionRate`: 사용자 유지율

**Response 200:**

```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "year": 2024,
    "month": 1,
    "metrics": ["dau", "newUsers", "retentionRate"],
    "trend": [
      {
        "date": "2024-01-01",
        "dau": 120,
        "wau": 135,
        "mau": 145,
        "newUsers": 3,
        "retentionRate": 85.5
      },
      {
        "date": "2024-01-02",
        "dau": 125,
        "wau": 138,
        "mau": 147,
        "newUsers": 5,
        "retentionRate": 86.2
      }
    ]
  }
}
```

**Response 400:**

```json
{
  "success": false,
  "error": {
    "message": "Invalid month: 13. Must be between 1 and 12."
  }
}
```

**참고**:

- 여러 지표를 동시에 조회할 수 있습니다.
- 개인 식별 정보 없이 통계만 제공합니다.
- `retentionRate`는 백분율로 표시됩니다 (예: 85.5 = 85.5%).
- `metrics` 파라미터를 생략하면 모든 지표(dau, wau, mau, newUsers, retentionRate)를 반환합니다.
- `month` 파라미터는 1~12 범위만 유효하며, 범위를 벗어나면 400 Bad Request를 반환합니다.
- **활성 사용자 수 계산 기준**: DAU/WAU/MAU는 일기 작성 활동을 기준으로 계산됩니다.
  - DAU: 특정 날짜에 일기를 작성한 고유 사용자 수
  - WAU: 최근 7일간 일기를 작성한 고유 사용자 수
  - MAU: 최근 30일간 일기를 작성한 고유 사용자 수
- **유지율 계산 방법**: 이전 기간에 일기를 작성한 사용자 중, 현재 기간에도 일기를 작성한 사용자의 비율 (백분율)

---

#### 10.2.4 위험 레벨 분포 통계

**GET** `/admin/dashboard/risk-level-distribution`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Query Parameters:**

- `period`: 기간 (weekly, monthly, yearly)
- `year`: 연도
- `month`: 월 (주간/월간 조회 시)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "year": 2024,
    "month": 1,
    "distribution": {
      "high": {
        "count": 5,
        "percentage": 3.3
      },
      "medium": {
        "count": 15,
        "percentage": 10.0
      },
      "low": {
        "count": 30,
        "percentage": 20.0
      },
      "none": {
        "count": 100,
        "percentage": 66.7
      }
    },
    "total": 150
  }
}
```

**참고**:

- 위험 레벨별 사용자 수와 비율만 제공하며, 개인 식별 정보는 포함하지 않습니다.
- `percentage`는 백분율로 표시됩니다 (예: 3.3 = 3.3%).

---

### 10.3 공지사항 관리

#### 10.3.1 공지사항 목록 조회

**GET** `/admin/notices`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Query Parameters:**

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "notices": [
      {
        "id": 1,
        "title": "시스템 점검 안내",
        "author": "관리자",
        "createdAt": "2024-01-10T00:00:00Z",
        "views": 150,
        "isPinned": true,
        "isPublic": true
      }
    ]
  }
}
```

---

#### 10.3.2 공지사항 상세 조회

**GET** `/admin/notices/{noticeId}`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "시스템 점검 안내",
    "content": "<p>시스템 점검 안내 내용...</p>",
    "author": "관리자",
    "createdAt": "2024-01-10T00:00:00Z",
    "updatedAt": "2024-01-10T00:00:00Z",
    "views": 150,
    "isPinned": true,
    "isPublic": true
  }
}
```

**참고**:

- 관리자가 조회하는 경우 조회수는 증가하지 않습니다.
- 삭제된 공지사항은 조회할 수 없습니다.

---

#### 10.3.3 공지사항 작성

**POST** `/admin/notices`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "새 공지사항",
  "content": "<p>공지사항 내용...</p>",
  "isPublic": true,
  "isPinned": false
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "새 공지사항",
    "content": "<p>공지사항 내용...</p>",
    "author": "관리자",
    "createdAt": "2024-01-15T00:00:00Z",
    "isPinned": false,
    "isPublic": true
  }
}
```

---

#### 10.3.4 공지사항 수정

**PUT** `/admin/notices/{noticeId}`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "수정된 공지사항",
  "content": "<p>수정된 내용...</p>",
  "isPublic": true,
  "isPinned": true
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "수정된 공지사항",
    "content": "<p>수정된 내용...</p>",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### 10.3.5 공지사항 삭제

**DELETE** `/admin/notices/{noticeId}`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "공지사항이 삭제되었습니다"
  }
}
```

---

#### 10.3.6 공지사항 고정/해제

**PUT** `/admin/notices/{noticeId}/pin`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Request Body:**

```json
{
  "isPinned": true
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "isPinned": true
  }
}
```

---

### 10.4 시스템 설정

#### 10.4.1 위험 신호 감지 기준 조회

**GET** `/admin/settings/risk-detection`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "monitoringPeriod": 14,
    "high": {
      "consecutiveScore": 8,
      "scoreInPeriod": 12
    },
    "medium": {
      "consecutiveScore": 5,
      "scoreInPeriod": 8
    },
    "low": {
      "consecutiveScore": 2,
      "scoreInPeriod": 4
    }
  }
}
```

**Response 필드 설명:**

- `monitoringPeriod`: 모니터링 기간 (일)
- `high.consecutiveScore`: High 레벨 연속 부정 감정 임계 점수
- `high.scoreInPeriod`: High 레벨 모니터링 기간 내 부정 감정 임계 점수
- `medium.consecutiveScore`: Medium 레벨 연속 부정 감정 임계 점수
- `medium.scoreInPeriod`: Medium 레벨 모니터링 기간 내 부정 감정 임계 점수
- `low.consecutiveScore`: Low 레벨 연속 부정 감정 임계 점수
- `low.scoreInPeriod`: Low 레벨 모니터링 기간 내 부정 감정 임계 점수

**참고**:

- 점수 기준: 고위험 부정 감정(슬픔, 분노) 1일 = 2점, 중위험 부정 감정(불안, 혐오) 1일 = 1점
- `consecutiveScore`: 최근부터 거슬러 올라가며 연속으로 부정적 감정을 기록한 점수 합계
- `scoreInPeriod`: 모니터링 기간 내에서 부정 감정을 기록한 모든 날짜의 점수 합계 (연속 여부와 무관)

---

#### 10.4.2 위험 신호 감지 기준 변경

**PUT** `/admin/settings/risk-detection`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "monitoringPeriod": 14,
  "high": {
    "consecutiveScore": 8,
    "scoreInPeriod": 12
  },
  "medium": {
    "consecutiveScore": 5,
    "scoreInPeriod": 8
  },
  "low": {
    "consecutiveScore": 2,
    "scoreInPeriod": 4
  }
}
```

**Request Body 필드 설명:**

- `monitoringPeriod`: 모니터링 기간 (필수, 1-365일)
- `high.consecutiveScore`: High 레벨 연속 부정 감정 임계 점수 (필수, 1-100)
- `high.scoreInPeriod`: High 레벨 모니터링 기간 내 부정 감정 임계 점수 (필수, 1-200)
- `medium.consecutiveScore`: Medium 레벨 연속 부정 감정 임계 점수 (필수, 1-100)
- `medium.scoreInPeriod`: Medium 레벨 모니터링 기간 내 부정 감정 임계 점수 (필수, 1-200)
- `low.consecutiveScore`: Low 레벨 연속 부정 감정 임계 점수 (필수, 1-100)
- `low.scoreInPeriod`: Low 레벨 모니터링 기간 내 부정 감정 임계 점수 (필수, 1-200)

**검증 규칙:**

- High의 `consecutiveScore`는 Medium의 `consecutiveScore`보다 커야 함
- Medium의 `consecutiveScore`는 Low의 `consecutiveScore`보다 커야 함
- High의 `scoreInPeriod`는 Medium의 `scoreInPeriod`보다 커야 함
- Medium의 `scoreInPeriod`는 Low의 `scoreInPeriod`보다 커야 함

**참고**:

- 점수 기준: 고위험 부정 감정(슬픔, 분노) 1일 = 2점, 중위험 부정 감정(불안, 혐오) 1일 = 1점
- `consecutiveScore`: 최근부터 거슬러 올라가며 연속으로 부정적 감정을 기록한 점수 합계
- `scoreInPeriod`: 모니터링 기간 내에서 부정 감정을 기록한 모든 날짜의 점수 합계 (연속 여부와 무관)
- 둘 중 하나라도 충족하면 해당 레벨로 판정됨

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "위험 신호 감지 기준이 저장되었습니다",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### 10.4.3 상담 기관 리소스 목록 조회

**GET** `/admin/settings/counseling-resources`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": 1,
        "name": "자살예방 상담전화",
        "category": "긴급상담",
        "phone": "1393",
        "website": "https://example.com",
        "description": "24시간 자살예방 상담 서비스",
        "operatingHours": "24시간",
        "isUrgent": true
      }
    ]
  }
}
```

---

#### 10.4.4 상담 기관 리소스 추가

**POST** `/admin/settings/counseling-resources`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "새 상담 기관",
  "category": "전문상담",
  "phone": "02-1234-5678",
  "website": "https://example.com",
  "description": "상담 기관 설명",
  "operatingHours": "평일 09:00-18:00",
  "isUrgent": false
}
```

**카테고리 종류:**

- `긴급상담`, `전문상담`, `상담전화`, `의료기관`

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "새 상담 기관",
    "category": "전문상담",
    ...
  }
}
```

---

#### 10.4.5 상담 기관 리소스 수정

**PUT** `/admin/settings/counseling-resources/{resourceId}`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "수정된 상담 기관",
  "category": "의료기관",
  "phone": "02-9999-8888",
  "website": "https://updated.com",
  "description": "수정된 설명",
  "operatingHours": "24시간",
  "isUrgent": true
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "수정된 상담 기관",
    ...
  }
}
```

---

#### 10.4.6 상담 기관 리소스 삭제

**DELETE** `/admin/settings/counseling-resources/{resourceId}`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "상담 기관이 삭제되었습니다"
  }
}
```

---

### 10.5 에러 로그 조회

#### 10.5.1 에러 로그 목록 조회

**GET** `/admin/error-logs`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Query Parameters:**

- `level`: 심각도 필터 (ALL, ERROR, WARN, INFO)
- `startDate`: 시작일 (YYYY-MM-DD)
- `endDate`: 종료일 (YYYY-MM-DD)
- `search`: 검색어 (메시지, 엔드포인트, 에러 코드)
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "total": 100,
    "summary": {
      "error": 10,
      "warn": 20,
      "info": 70
    },
    "logs": [
      {
        "id": 1,
        "timestamp": "2024-01-15T10:00:00Z",
        "level": "ERROR",
        "message": "Database connection failed",
        "endpoint": "/api/diaries",
        "userId": 5
      }
    ]
  }
}
```

---

#### 10.5.2 에러 로그 상세 조회

**GET** `/admin/error-logs/{logId}`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "timestamp": "2024-01-15T10:00:00Z",
    "level": "ERROR",
    "message": "Database connection failed",
    "errorCode": "DB_CONNECTION_ERROR",
    "endpoint": "/api/diaries",
    "userId": 5,
    "stackTrace": "Error: Database connection failed\n  at ..."
  }
}
```

---

## 12. 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    ...
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

---

## 13. 에러 코드

### 인증 관련

- `INVALID_CREDENTIALS`: 아이디 또는 비밀번호가 일치하지 않음
- `UNAUTHORIZED`: 인증 토큰이 없거나 유효하지 않음
- `TOKEN_EXPIRED`: 토큰이 만료됨
- `FORBIDDEN`: 권한이 없음 (관리자 전용 API 접근 시 일반 사용자)

### 이메일 인증 관련

- `EMAIL_ALREADY_EXISTS`: 이미 가입된 이메일
- `INVALID_CODE`: 인증 코드가 일치하지 않음
- `CODE_EXPIRED`: 인증 코드가 만료됨
- `EMAIL_NOT_VERIFIED`: 이메일 인증이 완료되지 않음

### 사용자 관련

- `USER_NOT_FOUND`: 사용자를 찾을 수 없음
- `INCORRECT_PASSWORD`: 현재 비밀번호가 일치하지 않음
- `INVALID_PASSWORD_FORMAT`: 비밀번호 형식이 올바르지 않음

### 일기 관련

- `DIARY_NOT_FOUND`: 일기를 찾을 수 없음
- `DIARY_ALREADY_EXISTS`: 해당 날짜에 이미 일기가 있음
- `INVALID_DATE`: 날짜 형식이 올바르지 않음

### 공지사항 관련

- `NOTICE_NOT_FOUND`: 공지사항을 찾을 수 없음

### 상담 기관 관련

- `RESOURCE_NOT_FOUND`: 상담 기관을 찾을 수 없음

### 시스템 설정 관련

- `INVALID_SETTING_VALUE`: 설정 값이 올바르지 않음

### 파일 업로드 관련

- `INVALID_FILE_TYPE`: 지원하지 않는 파일 형식
- `FILE_TOO_LARGE`: 파일 크기가 너무 큼
- `UPLOAD_FAILED`: 파일 업로드 실패

### 기타

- `VALIDATION_ERROR`: 입력 검증 실패
- `INTERNAL_SERVER_ERROR`: 서버 내부 오류
- `SERVICE_UNAVAILABLE`: 서비스 일시 중단

---

## 14. 추가 참고사항

### AI 기능 통합

**KoBERT 감정 분석**:

- 일기 본문(`content`)만 분석하여 7가지 감정 중 하나로 분류
- 분석 결과: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오 (7가지)
  - 긍정: 행복 (1가지)
  - 중립: 중립, 당황 (2가지)
  - 부정: 슬픔, 분노, 불안, 혐오 (4가지)
- 주요 감정을 추출하여 `emotion` 컬럼에 자동 저장
- `kobert_analysis` JSON에 KoBERT 분석 결과 저장 (emotion, confidence)
- 위험 신호 감지, 통계, 검색 등 모든 기능에서 KoBERT 분석 결과(`emotion`) 활용
- AI 이미지 생성, AI 코멘트 생성, 음식 추천에도 `kobert_analysis` 활용

**일기 작성 시 처리 순서**:

1. KoBERT 감정 분석 실행 (본문 분석) → 주요 감정 추출
   - 감정 분석 결과 획득 (예: "슬픔")
   - KoBERT 분석 결과가 사용자에게 표시되는 감정이 됨
2. AI 이미지 생성 (NanoVana API) - 일기 작성 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과 활용
   - 생성 완료 → 이미지 URL 획득
3. 일기 데이터 저장 (제목, 본문, 기분, 날씨, 활동, 사용자 업로드 이미지 URL 목록, KoBERT 감정 분석 결과, AI 생성 이미지 URL)
   - 감정 분석 결과는 `emotion` 컬럼에 저장됨
   - AI 생성 이미지 URL은 별도 컬럼에 저장됨
4. AI 코멘트 생성 (Gemini API) - 일기 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과, 페르소나 스타일 활용
5. 음식 추천 생성 (Gemini API) - 일기 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과 활용 (DB에 저장)

**일기 수정 시 처리**:

1. KoBERT 감정 분석 실행 (수정된 본문 분석) → 새로운 감정 추출
   - 수정된 본문을 분석하여 7가지 감정 중 하나로 재분류
   - 주요 감정을 추출하여 `emotion` 컬럼에 업데이트
   - 참고: 일기 수정 시에는 이미지를 재생성하지 않으므로 KoBERT 결과는 코멘트 및 추천에만 사용
2. 일기 데이터 저장 (수정된 일기 데이터 전송: 제목, 본문, 기분, 날씨, 활동, AI 생성 이미지 URL, 사용자 업로드 이미지 URL 목록)
   - 새로운 `emotion` 값과 업데이트된 `kobert_analysis` JSON을 포함하여 수정된 일기 데이터 저장
   - 이미지는 재생성하지 않음
3. AI 코멘트 재생성 (Gemini API) - 수정된 일기 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과, 페르소나 스타일 활용
4. 음식 추천 재생성 (Gemini API) - 수정된 일기 내용(제목, 본문, 기분, 날씨, 활동)과 KoBERT 감정 분석 결과 활용 (DB에 업데이트)

**음식 추천 시 처리**:

- 저장 시점 KoBERT 감정 분석 결과(`kobert_analysis`) + 일기 내용 → Gemini API로 음식 추천

**참고**:

- 모든 AI 처리는 백엔드에서 자동으로 수행됨
- 프론트엔드는 일기 저장 후 응답에서 `emotion`, `imageUrl`, `aiComment`를 받아 표시
- 사용자가 감정을 직접 선택하지 않으며, KoBERT가 자동으로 분석

### 위험 신호 감지

- 위험 신호 판정은 관리자가 설정한 기준(관리자 API 10.4.2)에 따라 백엔드에서 계산
- 사용자 로그인 후 다이어리 메인 화면 진입 시 `/risk-detection/analyze` API 호출
- 세션 중 한 번만 표시되도록 `/risk-detection/session-status`로 확인

### 페이지네이션

- 기본값: `page=1`, `limit=10` (일기 검색), `limit=20` (관리자 목록)
- 응답에 `total`, `totalPages`, `page`, `limit` 포함

### 날짜 형식

- 모든 날짜는 ISO 8601 형식 (YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm:ssZ)

---

#### 10.5.2 에러 로그 상세 조회

**GET** `/admin/error-logs/{logId}`

**Headers:**

```
Authorization: Bearer {adminAccessToken}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "timestamp": "2024-01-15T10:00:00Z",
    "level": "ERROR",
    "message": "Database connection failed",
    "errorCode": "DB_CONNECTION_ERROR",
    "endpoint": "/api/diaries",
    "userId": 5,
    "stackTrace": "Error: Database connection failed\n  at ..."
  }
}
```

---

## 12. 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    ...
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

---

## 13. 에러 코드

### 인증 관련

- `INVALID_CREDENTIALS`: 아이디 또는 비밀번호가 일치하지 않음
- `UNAUTHORIZED`: 인증 토큰이 없거나 유효하지 않음
- `TOKEN_EXPIRED`: 토큰이 만료됨
- `FORBIDDEN`: 권한이 없음 (관리자 전용 API 접근 시 일반 사용자)

### 이메일 인증 관련

- `EMAIL_ALREADY_EXISTS`: 이미 가입된 이메일
- `INVALID_CODE`: 인증 코드가 일치하지 않음
- `CODE_EXPIRED`: 인증 코드가 만료됨
- `EMAIL_NOT_VERIFIED`: 이메일 인증이 완료되지 않음

### 사용자 관련

- `USER_NOT_FOUND`: 사용자를 찾을 수 없음
- `INCORRECT_PASSWORD`: 현재 비밀번호가 일치하지 않음
- `INVALID_PASSWORD_FORMAT`: 비밀번호 형식이 올바르지 않음

### 일기 관련

- `DIARY_NOT_FOUND`: 일기를 찾을 수 없음
- `DIARY_ALREADY_EXISTS`: 해당 날짜에 이미 일기가 있음
- `INVALID_DATE`: 날짜 형식이 올바르지 않음

### 공지사항 관련

- `NOTICE_NOT_FOUND`: 공지사항을 찾을 수 없음

### 상담 기관 관련

- `RESOURCE_NOT_FOUND`: 상담 기관을 찾을 수 없음

### 시스템 설정 관련

- `INVALID_SETTING_VALUE`: 설정 값이 올바르지 않음

### 파일 업로드 관련

- `INVALID_FILE_TYPE`: 지원하지 않는 파일 형식
- `FILE_TOO_LARGE`: 파일 크기가 너무 큼
- `UPLOAD_FAILED`: 파일 업로드 실패

### 기타

- `VALIDATION_ERROR`: 입력 검증 실패
- `INTERNAL_SERVER_ERROR`: 서버 내부 오류
- `SERVICE_UNAVAILABLE`: 서비스 일시 중단

---

## 14. 추가 참고사항

### AI 기능 통합

**KoBERT 감정 분석**:

- 일기 본문(`content`)만 분석하여 7가지 감정 중 하나로 분류
- 분석 결과: 행복, 중립, 당황, 슬픔, 분노, 불안, 혐오 (7가지)
  - 긍정: 행복 (1가지)
  - 중립: 중립, 당황 (2가지)
  - 부정: 슬픔, 분노, 불안, 혐오 (4가지)
- 주요 감정을 추출하여 `emotion` 컬럼에 자동 저장
- `kobert_analysis` JSON에 KoBERT 분석 결과 저장 (emotion, confidence)
- 위험 신호 감지, 통계, 검색 등 모든 기능에서 KoBERT 분석 결과(`emotion`) 활용
- AI 이미지 생성, AI 코멘트 생성, 음식 추천에도 `kobert_analysis` 활용

**일기 작성 시 처리 순서**:

1. KoBERT 감정 분석 실행 (본문 분석) → 주요 감정 추출
   - 감정 분석 결과 획득 (예: "슬픔")
   - KoBERT 분석 결과가 사용자에게 표시되는 감정이 됨
2. AI 이미지 생성 (NanoVana API) - 일기 작성 내용(본문, 날씨)과 사용자 성별(gender), KoBERT 감정 분석 결과 활용
   - 사용자의 성별(MALE/FEMALE)을 반영하여 그림일기 주인공 묘사
   - 생성 완료 → 이미지 URL 획득
3. 일기 데이터 저장 (제목, 본문, 기분, 날씨, 활동, 사용자 업로드 이미지 URL 목록, KoBERT 감정 분석 결과, AI 생성 이미지 URL)
   - 감정 분석 결과는 `emotion` 컬럼에 저장됨
   - AI 생성 이미지 URL은 별도 컬럼에 저장됨
4. AI 코멘트 생성 (Gemini API) - 일기 내용(본문, 날씨), 사용자 성별(gender)과 KoBERT 감정 분석 결과, 페르소나 스타일 활용
5. 음식 추천 생성 (Gemini API) - 일기 내용(본문, 날씨)과 KoBERT 감정 분석 결과 활용 (DB에 저장)

**일기 수정 시 처리**:

1. KoBERT 감정 분석 실행 (수정된 본문 분석) → 새로운 감정 추출
   - 수정된 본문을 분석하여 7가지 감정 중 하나로 재분류
   - 주요 감정을 추출하여 `emotion` 컬럼에 업데이트
   - 참고: 일기 수정 시 내용을 반영하여 이미지가 재생성되므로 KoBERT 결과는 코멘트, 추천, 이미지 생성에 모두 사용됨
2. 일기 데이터 저장 (수정된 일기 데이터 전송: 제목, 본문, 기분, 날씨, 활동, AI 생성 이미지 URL, 사용자 업로드 이미지 URL 목록)
   - 새로운 `emotion` 값과 업데이트된 `kobert_analysis` JSON을 포함하여 수정된 일기 데이터 저장
   - 수정된 내용을 반영하여 AI 이미지를 재생성하고 저장함
3. AI 코멘트 재생성 (Gemini API) - 수정된 일기 내용(본문, 날씨)과 KoBERT 감정 분석 결과, 페르소나 스타일 활용
4. 음식 추천 재생성 (Gemini API) - 수정된 일기 내용(본문, 날씨)과 KoBERT 감정 분석 결과 활용 (DB에 업데이트)

**음식 추천 시 처리**:

- 저장 시점 KoBERT 감정 분석 결과(`kobert_analysis`) + 일기 내용 → Gemini API로 음식 추천

**참고**:

- 모든 AI 처리는 백엔드에서 자동으로 수행됨
- 프론트엔드는 일기 저장 후 응답에서 `emotion`, `imageUrl`, `aiComment`를 받아 표시
- 사용자가 감정을 직접 선택하지 않으며, KoBERT가 자동으로 분석

### 위험 신호 감지

- 위험 신호 판정은 관리자가 설정한 기준(관리자 API 10.4.2)에 따라 백엔드에서 계산
- 사용자 로그인 후 다이어리 메인 화면 진입 시 `/risk-detection/analyze` API 호출
- 세션 중 한 번만 표시되도록 `/risk-detection/session-status`로 확인

### 페이지네이션

- 기본값: `page=1`, `limit=10` (일기 검색), `limit=20` (관리자 목록)
- 응답에 `total`, `totalPages`, `page`, `limit` 포함

### 날짜 형식

- 모든 날짜는 ISO 8601 형식 (YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm:ssZ)

---

## 15. 백엔드-AI 통신 규격 (Internal)

이 섹션은 **백엔드 서버(Spring Boot)**와 **AI 서버(FastAPI)** 간의 통신 규격을 정의합니다.
이 API는 클라이언트(앱/웹)에 직접 노출되지 않으며, 백엔드 로직에 의해 내부적으로 호출됩니다.

### 15.1 일기 분석 및 생성 통합

**POST** `/api/ai/diary` (AI Server Endpoint)

**Description:**
일기 내용을 기반으로 감정 분석(KoBERT), 이미지 생성(NanoVana), 코멘트 및 음식 추천(Gemini)을 통합 수행합니다.
문서의 "데이터 최소화" 정책에 따라 본문과 필수 메타데이터(날씨, 성별, 페르소나)만 전송합니다.

**Request Body:**

```json
{
  "content": "오늘 날씨가 너무 좋아서 한강에 다녀왔다. 기분이 정말 상쾌했다.",
  "weather": "맑음",
  "gender": "MALE",
  "persona": "BEST_FRIEND"
}
```

**Parameters:**

- `content`: 일기 본문 (필수, String)
  - 감정 분석, 이미지 생성, 코멘트/추천 생성의 핵심 데이터
- `weather`: 날씨 정보 (필수, Enum)
  - `맑음`, `흐림`, `비`, `눈`, `천둥`, `안개`
  - 이미지 배경 및 코멘트 문맥 생성에 활용
- `gender`: 사용자 성별 (필수, Enum)
  - `MALE`, `FEMALE`
  - **이미지 생성 시 주인공 캐릭터의 성별 결정에 활용**
- `persona`: 페르소나 (필수, Enum)
  - `BEST_FRIEND`, `PARENTS`, `EXPERT`, `MENTOR`, `COUNSELOR`, `POET`
  - 코멘트 생성 시 말투 및 어조 결정에 활용

**Response 200:**

```json
{
  "emotion": "행복",
  "aiComment": "와, 한강 나들이라니 정말 좋았겠다! 날씨만큼이나 네 기분도 맑아 보여서 다행이야. 😊",
  "recommendedFood": {
    "name": "매운 떡볶이",
    "reason": "스트레스 받을 때는 매운 게 최고니까!"
  },
  "image": "base64_encoded_image_string..."
}
```

**Response Fields:**

- `emotion`: KoBERT 감정 분석 결과 (String, 7가지 감정 중 하나)
- `aiComment`: 선택된 페르소나 스타일로 생성된 코멘트 (String)
- `recommendedFood`: 추천 음식 정보 (Object)
  - `name`: 음식 이름 (String)
  - `reason`: 추천 이유 (String)
- `image`: 생성된 그림일기 이미지 (String, Base64 Encoded)
  - 백엔드에서 수신 후 디코딩하여 파일 서버에 저장 (`/images/uuid.jpg`)
  - DB에는 파일 경로(URL)만 저장
