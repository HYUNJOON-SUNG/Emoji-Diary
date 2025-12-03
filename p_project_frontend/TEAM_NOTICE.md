# 팀원 안내 사항

## 📌 카카오맵 API 연동 완료

### ✅ 완료된 작업
1. **카카오맵 API 스크립트 추가**
   - `index.html`에 카카오맵 JavaScript SDK 추가 완료
   - JavaScript 키: `1a1db627800887a2a4531fa6e4bd07bc`
   - Places API 및 Clusterer 라이브러리 포함

2. **KakaoMapRecommendation 컴포넌트 업데이트**
   - 실제 카카오맵 Places API 연동 완료
   - 사용자 위치 기반 주변 장소 검색
   - 지도 표시 및 마커 기능 추가
   - 감정별 장소 추천 키워드 매핑

3. **.gitignore 파일 생성**
   - 민감한 정보 및 불필요한 파일 제외 설정 완료

### 🔑 중요 사항

#### 1. 카카오맵 API 키 보안
- **현재 상태**: API 키가 `index.html`에 하드코딩되어 있음
- **권장 사항**: 
  - 프로덕션 환경에서는 환경 변수로 관리하는 것을 권장
  - 카카오 개발자 콘솔에서 도메인 제한 설정 필수
  - API 키가 노출되지 않도록 주의

#### 2. 위치 권한
- 앱이 사용자 위치 정보를 요청합니다
- 위치 권한이 거부되면 서울시청을 기본 위치로 사용합니다
- 브라우저에서 위치 권한을 허용해야 정확한 주변 장소 추천이 가능합니다

#### 3. 카카오맵 API 사용량
- Places API는 일일 사용량 제한이 있습니다
- 과도한 API 호출을 방지하기 위해 검색 키워드는 최대 3개로 제한되어 있습니다
- 각 키워드당 최대 5개 장소만 검색합니다

### 🚀 사용 방법

#### 개발 환경
1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 위치 권한 허용
3. 일기 작성 후 "장소 추천" 버튼 클릭
4. 감정에 맞는 주변 장소가 지도와 함께 표시됩니다

#### 배포 시 주의사항
1. 카카오 개발자 콘솔에서 배포 도메인 등록 필수
2. API 키 도메인 제한 설정 확인
3. HTTPS 사용 권장 (위치 정보 접근 시)

### 📝 코드 수정 사항

#### `index.html`
- 카카오맵 API 스크립트 태그 추가
- `lang="ko"`로 변경

#### `KakaoMapRecommendation.tsx`
- Mock 데이터 제거
- 실제 카카오맵 Places API 연동
- 지도 표시 기능 추가
- 마커 및 인포윈도우 기능 추가
- 사용자 위치 기반 검색 기능 추가

### 🔧 추가 작업 필요 사항

#### 선택사항 (향후 개선)
1. **환경 변수 관리**
   - `.env` 파일로 API 키 관리
   - `VITE_KAKAO_MAP_API_KEY` 환경 변수 사용
   - 현재는 하드코딩되어 있으나, 필요시 변경 가능

2. **에러 처리 개선**
   - 네트워크 오류 시 재시도 로직
   - API 호출 실패 시 사용자 친화적 메시지

3. **성능 최적화**
   - 검색 결과 캐싱
   - 지도 렌더링 최적화

### ⚠️ 주의사항 (Critical)

#### ⛔️ GitHub 업로드 금지 파일 (.gitignore 설정 필수)

다음 파일들은 보안 및 용량 문제를 일으키므로 **절대 Git에 올리지 않습니다.**

1. **보안 정보 (절대 업로드 금지!)**
   - `.env`, `.env.local`, `.env.*` 파일 (환경 변수)
   - `application.yml`, `application.properties` (백엔드 설정 파일)
   - `*.secret`, `*.key`, `*.pem`, `*.cert` (인증서 및 키 파일)
   - `config.json`, `secrets.json` (설정 파일)

2. **대용량 AI 모델 파일 (절대 업로드 금지!)**
   - PyTorch: `*.pt`, `*.pth`, `*.pth.tar`, `*.ckpt`
   - TensorFlow/Keras: `*.h5`, `*.hdf5`, `*.pb`, `*.tflite`
   - ONNX: `*.onnx`
   - 기타: `*.bin`, `*.model`, `*.weights`, `*.pkl`
   - 모델 디렉토리: `models/`, `checkpoints/`, `weights/`, `saved_models/`
   - **참고**: Google Drive나 로컬 스토리지에 따로 백업 필요

3. **의존성 폴더 (절대 업로드 금지!)**
   - `node_modules/` (Node.js)
   - `venv/`, `env/`, `__pycache__/` (Python)
   - `.idea/` (IntelliJ IDEA)
   - `target/` (Java/Maven)

4. **기타**
   - 빌드 결과물: `/build`, `/dist`, `/out`
   - 로그 파일: `*.log`, `logs/`
   - 대용량 데이터 파일: `*.csv`, `*.db`, `data/`, `datasets/`

#### ✅ .gitignore 확인 방법

```bash
# 현재 추적 중인 파일 확인
git status

# .gitignore가 제대로 작동하는지 확인
git check-ignore -v <파일명>

# 이미 추적 중인 파일을 제거하려면
git rm --cached <파일명>
```

#### 🔑 API 키 관리

- **현재 상태**: 카카오맵 API 키가 `index.html`에 하드코딩되어 있음
- **프로덕션 배포 시 필수**:
  1. 카카오 개발자 콘솔에서 배포 도메인 등록
  2. API 키 도메인 제한 설정
  3. 필요시 환경 변수로 전환 고려

### 📞 문의사항
- 카카오맵 API 관련 문제: 카카오 개발자 문서 참조
- 코드 관련 문의: 팀 리더에게 문의

