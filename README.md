# 이모지 다이어리 (Emoji Diary)

**이모지 다이어리**는 사용자의 감정을 스마트하게 분석하고 기록해주는 AI 기반 감정 일기 애플리케이션입니다.
오늘 하루의 일기를 작성하면 KoBERT 모델이 감정을 분석하고, Google Gemini AI가 그에 맞는 그림일기, 코멘트, 그리고 위로가 되는 음식까지 추천해줍니다.

## 주요 기능

- **감정 분석 (KoBERT)**: 일기 내용을 분석하여 7가지 감정(행복, 중립, 당황, 슬픔, 분노, 불안, 혐오) 중 하나를 도출합니다.
- **AI 그림일기 (Gemini)**: 작성한 일기 내용과 날씨, 성별 정보를 바탕으로 추억을 그림으로 그려줍니다.
- **스마트 코멘트 & 음식 추천**: 사용자가 설정한 페르소나(베프, 부모님, 전문가 등)에 맞춰 공감 코멘트를 남겨주고, 기분 전환을 위한 음식을 추천합니다.
- **다양한 뷰 모드**: 캘린더, 타임라인, 통계 차트 등 다양한 방식으로 나의 감정 흐름을 한눈에 파악할 수 있습니다.

---

## 실행 방법 (Getting Started)

이 프로젝트를 로컬 환경에서 실행하기 위해서는 **AI 서버**, **백엔드**, **프론트엔드**를 순서대로 설정하고 실행해야 합니다.

### 1. AI Server 설정 및 실행

AI 서버는 감정 분석 및 이미지 생성을 담당하는 Python 애플리케이션입니다.

1.  **Gemini API 키 설정**:

    - `ai_server/nano_banana.py` 파일과 `ai_server/feedback.py` 파일을 엽니다.
    - 코드 내 `${Gemini_API_KEY}` 부분을 본인의 실제 **Google Gemini API Key**로 대체합니다.

2.  **의존성 패키지 설치**:

    - 터미널에서 `ai_server` 폴더로 이동합니다.
    - 아래 명령어를 실행하여 필요한 라이브러리를 설치합니다.

    ```bash
    pip install -r requirements.txt
    ```

3.  **서버 실행**:
    - `ai_server` 폴더에서 아래 명령어로 서버를 실행합니다.
    ```bash
    python app.py
    ```

### 2. Backend 설정 및 실행

백엔드는 Spring Boot 기반의 API 서버입니다.

1.  **환경 설정 파일 구성**:

    - `backend/src/main/resources` 폴더로 이동합니다.
    - `application.properties.example` 파일을 복사하여 `application.properties` 파일을 생성합니다.
    - 생성된 `application.properties` 파일을 열어 다음 내용들을 직접 채워넣어야 합니다.
      - **데이터베이스 (MariaDB)**:
        - 로컬에 MariaDB를 설치하고 실행합니다.
        - `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password` 를 본인의 DB 설정에 맞게 수정합니다.
      - **JWT 토큰 시크릿 키**:
        - `jwt.secret` 값을 설정해야 합니다.
        - _참고: 구글에 "JWT secret key generation" 등을 검색하여 안전한 랜덤 문자열을 생성해 넣으세요._
      - **이메일 인증 (Google SMTP)**:
        - 테스트용 구글 계정의 이메일(`spring.mail.username`)과 앱 비밀번호(`spring.mail.password`)를 입력합니다.
        - _참고: 구글 계정 설정 > 보안 > 2단계 인증 > 앱 비밀번호 생성 메뉴에서 앱 비밀번호를 발급받을 수 있습니다._

2.  **서버 실행**:
    - 터미널에서 `backend` 폴더로 이동합니다.
    - 아래 명령어로 서버를 실행합니다.
    ```bash
    ./gradlew bootRun
    ```
    (Windows의 경우 `./gradlew` 대신 `.\gradlew`를 사용하세요)

### 3. Frontend 설정 및 실행

프론트엔드는 React (Vite) 기반의 웹 애플리케이션입니다.

1.  **의존성 패키지 설치**:

    - 터미널에서 `frontend` 폴더로 이동합니다.
    - 아래 명령어를 실행하여 필요한 패키지를 설치합니다.

    ```bash
    npm install
    ```

2.  **서버 실행**:
    - 아래 명령어로 개발 서버를 실행합니다.
    ```bash
    npm run dev
    ```

위 단계들을 모두 완료하면 로컬 환경에서 Emoji Diary 애플리케이션을 사용할 수 있습니다.
