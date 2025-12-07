# PR: Auth 순환 참조 해결, 회원 탈퇴/재가입 정책 개선 및 공지사항 API 구현

## PR 타입(하나 이상의 PR 타입을 선택해주세요)

- [x] 기능 추가
- [x] 버그 수정
- [x] 리팩토링
- [ ] 문서 수정

## 반영 브랜치

feat/user-deletion-policy -> develop

## 작업사항 📝

서버 기동 시 발생하던 치명적인 순환 참조 문제를 해결하고, 사용자용 공지사항 기능을 추가했습니다. 또한 사용자 탈퇴/재가입 시 데이터 무결성을 보장하기 위한 정책을 코드에 반영했습니다.

### 1. Auth 순환 참조 문제 해결 (Critical Bug Fix)

- **문제 상황**: `AuthService`가 `AuthenticationManager`를 의존하고, `AuthenticationManager` 내부 로직이 다시 `AuthService`를 참조하는 구조로 인해 서버 기동 시 `StackOverflowError`가 발생.
- **해결**:
  - `AuthService` 로그인 로직에서 `AuthenticationManager` 의존성을 제거했습니다.
  - 대신 `PasswordEncoder`를 직접 주입받아 비밀번호를 검증(`matches`)하는 방식으로 리팩토링하여 순환 참조 고리를 끊었습니다.
  - 이 과정에서 `findActiveUser`, `validatePassword` 등 메서드를 추출하여 클린 코드로 개선했습니다.

### 2. 공지사항(Notice) API 구현 (Feature)

- **사용자용 공지사항 API 추가**:
  - `GET /api/notices`: 공지사항 목록 조회 (고정된 공지사항 상단 노출, 최신순 정렬, 페이지네이션 지원)
  - `GET /api/notices/{id}`: 공지사항 상세 조회 (조회수 자동 증가 기능 포함)
- **DTO 개선**: 사용자 앱 내에서 관리자 작성 글임을 명확히 하거나 UI에 표시하기 위해 `author` 필드를 추가했습니다. (`NoticeResponse`, `NoticeDetailResponse`)

### 3. Entity 개선

- **Diary**:
  - `weather` 필드의 값을 천둥번개에서 천둥으로 변경

## 테스트 방법

1. **서버 기동 테스트**: `./gradlew bootRun` 시 `StackOverflowError` 없이 정상 실행되는지 확인.
2. **공지사항 API 테스트**:
   - `GET /api/notices/1` 호출 시 정상 응답 및 조회수 증가 확인.
3. **재가입 프로세스 테스트**:
   - 탈퇴 계정 이메일로 인증 코드 발송 요청 -> 정상 발송 확인.
   - 가입 완료 후 DB에서 이전 데이터 삭제 확인.

## 테스트 결과

- [x] 서버 정상 기동 확인 (순환 참조 해결)
- [x] Postman을 통한 공지사항 조회 성공
- [x] `UserDeletionPolicyTest` 통과
- [x] API 명세서 및 기능 명세서 최신화 완료
