# ⛔️ GitHub Push 전 필수 체크리스트

## 🚨 절대 업로드하면 안 되는 파일들

### 1. 보안 정보 (Critical!)
다음 파일들은 **절대 Git에 올리지 않습니다**:
- ✅ `.env`, `.env.local`, `.env.*` (환경 변수)
- ✅ `application.yml`, `application.properties` (백엔드 설정)
- ✅ `*.secret`, `*.key`, `*.pem`, `*.cert` (인증서 및 키)
- ✅ `config.json`, `secrets.json` (설정 파일)

**확인 방법:**
```bash
git status
# .env 파일이 추적 목록에 나타나면 안 됨!
```

### 2. 대용량 AI 모델 파일 (Critical!)
다음 파일들은 **용량 문제로 절대 업로드하지 않습니다**:
- ✅ `*.pt`, `*.pth`, `*.pth.tar`, `*.ckpt` (PyTorch)
- ✅ `*.h5`, `*.hdf5`, `*.pb`, `*.tflite` (TensorFlow/Keras)
- ✅ `*.onnx` (ONNX)
- ✅ `*.bin`, `*.model`, `*.weights`, `*.pkl` (기타 모델)
- ✅ `models/`, `checkpoints/`, `weights/`, `saved_models/` (모델 디렉토리)

**백업 방법:**
- Google Drive 또는 로컬 스토리지에 별도 백업
- 팀 공유 드라이브 활용

### 3. 의존성 폴더 (Critical!)
다음 폴더들은 **절대 업로드하지 않습니다**:
- ✅ `node_modules/` (Node.js)
- ✅ `venv/`, `env/`, `__pycache__/` (Python)
- ✅ `.idea/` (IntelliJ IDEA)
- ✅ `target/` (Java/Maven)

**확인 방법:**
```bash
git status
# node_modules/가 추적 목록에 나타나면 안 됨!
```

## ✅ Push 전 확인 사항

### 1. .gitignore 확인
```bash
# 현재 추적 중인 파일 확인
git status

# .gitignore가 제대로 작동하는지 확인
git check-ignore -v .env
git check-ignore -v node_modules/
git check-ignore -v *.pt
```

### 2. 이미 추적 중인 파일 제거
만약 실수로 업로드한 파일이 있다면:
```bash
# 파일 제거 (로컬 파일은 유지)
git rm --cached .env
git rm --cached -r node_modules/
git rm --cached *.pt

# .gitignore에 추가 후 커밋
git add .gitignore
git commit -m "chore: Add .gitignore and remove sensitive files"
```

### 3. 커밋 전 최종 확인
```bash
# 변경사항 확인
git status

# 커밋할 파일 목록 확인
git diff --cached --name-only

# 위의 금지 파일 목록과 비교하여 확인!
```

## 📋 .gitignore 파일 위치

1. **프로젝트 루트**: `Emoji-Diary/.gitignore`
   - 전체 프로젝트 공통 제외 항목

2. **Frontend**: `Emoji-Diary/frontend/.gitignore`
   - Frontend 전용 제외 항목

## ⚠️ 주의사항

1. **API 키 관리**
   - 현재 카카오맵 API 키가 `index.html`에 하드코딩되어 있음
   - 프로덕션 배포 시 카카오 개발자 콘솔에서 도메인 제한 필수
   - 필요시 환경 변수로 전환 고려

2. **대용량 파일**
   - AI 모델 파일은 수백 MB ~ 수 GB까지 가능
   - GitHub는 100MB 이상 파일 업로드 시 경고
   - 반드시 `.gitignore`에 포함되어 있는지 확인

3. **보안 정보**
   - `.env` 파일에 DB 비밀번호, JWT Secret 등이 포함될 수 있음
   - 절대 공개 저장소에 업로드하지 않음
   - 팀원 간 공유는 안전한 방법으로 (예: 1Password, Bitwarden)

## 🔍 문제 발생 시 대응

### 이미 업로드한 경우
1. 즉시 해당 파일 삭제
2. `.gitignore`에 추가
3. Git 히스토리에서 완전 제거 (필요시)
4. API 키나 비밀번호가 노출된 경우 즉시 재발급

### Git 히스토리에서 완전 제거
```bash
# 주의: 이 작업은 히스토리를 변경하므로 팀과 협의 후 진행
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

## 📞 문의
- `.gitignore` 관련 문제: 팀 리더에게 문의
- 보안 관련 문제: 즉시 보고

