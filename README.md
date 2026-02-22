# 🎨 이모지 다이어리 (Emoji Diary)

> **AI 기반 감정 분석 및 맞춤형 그림일기 생성 서비스**
> 사용자의 하루를 분석하여 7가지 감정을 도출하고, AI가 그에 어울리는 그림과 위로를 선사하는 정서 케어 플랫폼입니다.

---

## 💎 Project Highlights

* **지능형 감정 분석 엔진**: KoBERT 모델을 통해 텍스트 속 감정을 7가지 카테고리로 정밀하게 분류합니다.
* **AI 시각화 시스템**: Google Gemini AI를 활용하여 일기 내용을 바탕으로 세상에 하나뿐인 그림일기를 생성합니다.
* **멀티 서버 아키텍처**: 비즈니스 로직(Spring Boot)과 AI 연산(FastAPI) 서버를 분리하여 시스템 안정성과 확장성을 확보했습니다.
* **관리자 통합 관제**: 에러 로그 모니터링, 사용자 심리 위험군 탐지 대시보드 등 고도화된 백오피스 시스템을 구축했습니다.
* **보안 및 인증**: JWT Access/Refresh 토큰 체계와 이메일 SMTP 인증을 통해 안전한 데이터 관리 환경을 조성했습니다.

---

## ✨ Key Features

### 🧠 AI 심리 분석 및 콘텐츠 생성
* **감정 분류**: 일기 작성 시 실시간으로 감정(행복, 중립, 당황, 슬픔, 분노, 불안, 혐오)을 분석합니다.
* **그림일기 생성**: 일기 내용과 날씨 정보를 조합한 프롬프트 엔지니어링으로 맞춤 이미지를 제공합니다.
* **멀티 페르소나**: 6가지 페르소나를 선택하여 각기 다른 말투의 공감 피드백과 음식 추천을 받습니다.

### 🛡️ 심리 위기 감지 및 운영 관제
* **위험 탐지**: 특정 기간 부정적 감정이 지속될 경우 시스템이 위험 상태로 인지하여 관리자에게 리포팅합니다.
* **로그 트래킹**: 서버 예외 상황을 실시간 수집하고 스택 트레이스를 시각화하여 운영 효율을 높였습니다.

### 📊 데이터 시각화
* **감정 통계**: Recharts를 활용하여 주간/월간 감정 변화 추이를 그래프로 시각화합니다.
* **아카이빙**: AI가 생성한 이미지를 캘린더 및 타임라인 뷰로 관리하여 한눈에 감정 기록을 확인합니다.

---

## 🛠 Tech Stack

### Backend & AI
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Java](https://img.shields.io/badge/Java%2017-007396?style=for-the-badge&logo=java&logoColor=white)
![Python](https://img.shields.io/badge/Python%203.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge)

---

## 👥 Team

| 성명 | 역할 |
| :--- | :--- |
| **최준혁** | Project Lead / Backend |
| **성현준** | Backend |
| **이동원** | Frontend |
| **박정우** | AI |

---

## 📁 System Architecture

```mermaid
graph TD
    subgraph Client
        A[Frontend: React]
    end

    subgraph Server_Logic
        B[Backend: Spring Boot]
        D[(MariaDB)]
    end

    subgraph AI_Engine
        C[AI Server: FastAPI]
        E[Google Gemini API]
        F[KoBERT Model]
    end

    A <-->|REST API / JWT| B
    B <-->|JPA| D
    B <-->|HTTP / WebFlux| C
    C <--> E
    C <--> F
