# 🎨 이모지 다이어리 (Emoji Diary)

> AI가 당신의 하루를 분석하고, 감정에 맞는 그림일기와 위로를 선물합니다.


![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=springboot)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)

## 📖 소개

**이모지 다이어리**는 사용자의 감정을 스마트하게 분석하고 기록해주는 AI 기반 감정 일기 애플리케이션입니다.

오늘 하루의 일기를 작성하면:
- 🧠 **KoBERT 모델**이 감정을 분석하고
- 🎨 **Google Gemini AI**가 그에 맞는 그림일기를 그려주고
- 💬 선택한 페르소나가 공감 코멘트와 음식 추천까지 해줍니다

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🎭 **감정 분석** | KoBERT 기반 7가지 감정 분류 (행복, 중립, 당황, 슬픔, 분노, 불안, 혐오) |
| 🖼️ **AI 그림일기** | 일기 내용 + 날씨 + 성별 정보를 바탕으로 Gemini가 그림 생성 |
| 💬 **맞춤 코멘트** | 6가지 페르소나 (베프, 부모님, 전문가, 멘토, 상담사, 시인) |
| 🍽️ **음식 추천** | 기분 전환을 위한 맞춤 음식 추천 |
| 📊 **다양한 뷰** | 캘린더, 타임라인, 통계 차트로 감정 흐름 파악 |

---

## 🏗️ 기술 스택

### Frontend
- **React 18** + **Vite**
- **TailwindCSS** + **Radix UI**
- **Framer Motion** (애니메이션)
- **Recharts** (차트)
- **React Router DOM**

### Backend
- **Spring Boot 3.x**
- **Spring Security** + **JWT**
- **Spring Data JPA**
- **MariaDB**

### AI Server
- **FastAPI** + **Uvicorn**
- **KoBERT** (감정 분석)
- **Google Gemini API** (이미지 생성 & 코멘트)
- **PyTorch** + **Transformers**

---

## 🚀 시작하기

### 사전 요구사항

- **Node.js** 18+
- **Java** 17+
- **Python** 3.10+
- **MariaDB** 10.x+
- **Google Gemini API Key**

---

### 1️⃣ AI Server 설정

```bash
cd ai_server

# 가상환경 생성 (권장)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

#### Gemini API 키 설정
`ai_server/middleware/feedback.py`와 `nano_banana.py` 파일에서 API 키를 설정하세요:
```python
api_key = "YOUR_GEMINI_API_KEY"
```

#### 서버 실행
```bash
python app.py
```
> 기본 포트: `8000`

---

### 2️⃣ Backend 설정

```bash
cd backend
```

#### 환경 설정
1. `src/main/resources/application.properties.example`을 복사하여 `application.properties` 생성
2. 아래 값들을 본인 환경에 맞게 수정:

```properties
# DB 설정
spring.datasource.url=jdbc:mariadb://localhost:3306/emoji_diary
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

# JWT Secret (안전한 랜덤 문자열 사용)
jwt.secret=YOUR_JWT_SECRET_KEY

# Gmail SMTP (이메일 인증용)
spring.mail.username=YOUR_GMAIL
spring.mail.password=YOUR_GMAIL_APP_PASSWORD
```

> 💡 Gmail 앱 비밀번호는 [Google 계정 설정](https://myaccount.google.com/apppasswords)에서 발급받을 수 있습니다.

#### 서버 실행
```bash
# Windows
.\gradlew bootRun

# Mac/Linux
./gradlew bootRun
```
> 기본 포트: `8080`

---

### 3️⃣ Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```
> 기본 포트: `5173`

---

## 📁 프로젝트 구조

```
Emoji-Diary/
├── 📂 ai_server/           # AI 서버 (FastAPI)
│   ├── app.py              # 메인 서버
│   ├── middleware/         # 감정분석, 이미지생성 로직
│   └── template/           # 프롬프트 템플릿
│
├── 📂 backend/             # 백엔드 (Spring Boot)
│   └── src/main/java/com/p_project/
│       ├── controller/     # REST API 컨트롤러
│       ├── service/        # 비즈니스 로직
│       ├── repository/     # 데이터 접근 계층
│       └── entity/         # JPA 엔티티
│
├── 📂 frontend/            # 프론트엔드 (React + Vite)
│   └── src/
│       ├── features/       # 기능별 모듈
│       ├── shared/         # 공통 컴포넌트
│       └── app/            # 앱 진입점
│
└── 📄 README.md
```

---

## 🔐 환경 변수 요약

| 서비스 | 환경 변수 | 설명 |
|--------|-----------|------|
| AI Server | `Gemini_API_KEY` | Google Gemini API 키 |
| Backend | `DB_*` | MariaDB 연결 정보 |
| Backend | `jwt.secret` | JWT 서명 키 |
| Backend | `MAIL_*` | Gmail SMTP 설정 |


