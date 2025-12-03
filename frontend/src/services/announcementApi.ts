/**
 * ========================================
 * 공지사항 API (플로우 10.4)
 * ========================================
 * 
 * [플로우 10.4: 공지사항 조회]
 * 
 * **경로**: 마이페이지 좌측 페이지에서 "공지사항" 버튼 클릭
 * **화면**: 공지사항 목록 모달
 * 
 * **모달 표시 내용**:
 * 1. **공지사항 목록**:
 *    - 관리자가 작성한 공지사항 목록 표시
 *    - 고정된 공지사항이 상단에 표시 (📌 아이콘)
 *    - 이후 작성일 최신순 정렬
 * 
 * 2. **각 공지사항 항목 표시**:
 *    - 제목
 *    - 작성일
 *    - 고정 여부 (고정된 경우 "📌 고정" 배지)
 *    - 공지사항 항목 클릭 → 공지사항 상세 모달 표시
 * 
 * 3. **공지사항 상세 모달**:
 *    - 공지사항 제목
 *    - 작성일
 *    - 고정 여부 (고정된 경우 표시)
 *    - 공지사항 내용 (HTML 렌더링)
 *    - "닫기" 버튼 클릭 → 상세 모달 닫기
 * 
 * **데이터 로드**:
 * - 모달 열릴 때 공지사항 목록 자동 로드
 * - 로딩 상태 표시 ("공지사항을 불러오는 중...")
 * - 공개 상태인 공지사항만 표시 (비공개 공지사항은 제외)
 * 
 * **공지사항이 없는 경우**:
 * - "등록된 공지사항이 없습니다." 메시지 표시
 * 
 * **모달 닫기**:
 * - 우측 상단 "X" 버튼 클릭 → 모달 닫기
 * - 상세 모달에서 "닫기" 버튼 클릭 → 상세 모달만 닫기, 목록 모달은 유지
 */

/**
 * 공지사항 타입 (플로우 10.4)
 * 
 * [ERD 설계서 참고 - Notices 테이블]
 * - id: BIGINT (PK) → string (공지사항 고유 ID)
 * - admin_id: BIGINT (FK) → author (작성자, API 응답에서는 작성자 이름으로 반환)
 * - title: VARCHAR(255) → string (공지사항 제목)
 * - content: TEXT → string (공지사항 내용, HTML 가능)
 * - is_pinned: BOOLEAN → isPinned (상단 고정 여부)
 * - views: INT → views (조회수, 기본값: 0)
 * - is_public: BOOLEAN → isPublished (공개 여부, 기본값: TRUE)
 * - created_at: DATETIME → createdAt (ISO 8601 형식)
 * - updated_at: DATETIME → updatedAt (ISO 8601 형식)
 * - deleted_at: DATETIME → (소프트 삭제, API 응답에 포함되지 않음)
 * 
 * [관계]
 * - Notices.admin_id → Admins.id (FK, CASCADE)
 * - 사용자 조회 시: is_public = TRUE AND deleted_at IS NULL인 공지사항만 표시
 * - 조회 시 views 자동 증가
 */
export interface Announcement {
  id: string; // 공지사항 고유 ID (ERD: Notices.id, BIGINT)
  title: string; // 제목 (ERD: Notices.title, VARCHAR(255))
  content: string; // 내용 (HTML 가능, ERD: Notices.content, TEXT)
  isPinned: boolean; // 고정 여부 (ERD: Notices.is_pinned, BOOLEAN, 기본값: FALSE)
  isPublished: boolean; // 공개 여부 (ERD: Notices.is_public, BOOLEAN, 기본값: TRUE)
  author?: string; // 작성자 (ERD: Notices.admin_id → Admins.name, API 응답에서 작성자 이름으로 반환)
  views?: number; // 조회수 (ERD: Notices.views, INT, 기본값: 0)
  createdAt: string; // 작성일 (ERD: Notices.created_at, DATETIME, ISO 8601 형식)
  updatedAt: string; // 수정일 (ERD: Notices.updated_at, DATETIME, ISO 8601 형식)
}

/**
 * Mock 공지사항 데이터 (플로우 10.4)
 * 
 * [백엔드 팀] 실제 구현 시:
 * - DB에서 공지사항 데이터 조회
 * - 테이블: announcements
 * - 컬럼:
 *   - id: INT (Primary Key, Auto Increment)
 *   - title: VARCHAR(255)
 *   - content: TEXT (HTML 허용)
 *   - is_pinned: BOOLEAN (고정 여부)
 *   - is_published: BOOLEAN (공개 여부)
 *   - created_at: TIMESTAMP
 *   - updated_at: TIMESTAMP
 */
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '감정 일기 서비스 오픈 안내',
    content: `
      <p><strong>감정 일기 서비스를 찾아주셔서 감사합니다!</strong></p>
      <p>이 서비스는 여러분의 감정을 기록하고 돌아볼 수 있는 디지털 다이어리입니다.</p>
      <br />
      <p><strong>주요 기능:</strong></p>
      <ul>
        <li>✍️ 감정 기반 일기 작성</li>
        <li>🤖 AI 코멘트 및 페르소나 설정</li>
        <li>📊 감정 통계 및 월별 히트맵</li>
        <li>🗺️ 감정 기반 장소 추천</li>
        <li>💙 정신건강 지원 리소스</li>
      </ul>
      <br />
      <p>문의사항이 있으시면 언제든지 고객센터로 연락주세요.</p>
    `,
    isPinned: true,
    isPublished: true,
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
  },
  {
    id: '2',
    title: '개인정보 처리방침 업데이트',
    content: `
      <p>개인정보 처리방침이 2024년 11월 15일부로 업데이트되었습니다.</p>
      <br />
      <p><strong>주요 변경사항:</strong></p>
      <ul>
        <li>데이터 보관 기간 명확화</li>
        <li>제3자 정보 제공 항목 업데이트</li>
        <li>사용자 권리 강화</li>
      </ul>
      <br />
      <p>자세한 내용은 설정 > 개인정보 처리방침에서 확인하실 수 있습니다.</p>
    `,
    isPinned: false,
    isPublished: true,
    createdAt: '2024-11-15T14:30:00Z',
    updatedAt: '2024-11-15T14:30:00Z',
  },
  {
    id: '3',
    title: '정기 점검 안내 (완료)',
    content: `
      <p>서비스 안정화를 위한 정기 점검이 완료되었습니다.</p>
      <br />
      <p><strong>점검 일시:</strong> 2024년 11월 20일 02:00 ~ 04:00 (2시간)</p>
      <br />
      <p><strong>점검 내용:</strong></p>
      <ul>
        <li>서버 성능 최적화</li>
        <li>보안 업데이트</li>
        <li>버그 수정</li>
      </ul>
      <br />
      <p>점검 중 일시적으로 서비스 이용이 제한되었습니다.</p>
      <p>불편을 드려 죄송합니다.</p>
    `,
    isPinned: false,
    isPublished: true,
    createdAt: '2024-11-20T05:00:00Z',
    updatedAt: '2024-11-20T05:00:00Z',
  },
  {
    id: '4',
    title: 'AI 페르소나 기능 추가',
    content: `
      <p>AI 코멘트의 말투를 선택할 수 있는 페르소나 기능이 추가되었습니다!</p>
      <br />
      <p><strong>이용 방법:</strong></p>
      <ol>
        <li>마이페이지로 이동</li>
        <li>"AI 코멘트 말투 변경" 버튼 클릭</li>
        <li>원하는 페르소나 선택</li>
      </ol>
      <br />
      <p><strong>페르소나 종류:</strong></p>
      <ul>
        <li>👥 친구 말투 - 따뜻하고 편안한</li>
        <li>🌟 멘토 말투 - 격려하고 조언하는</li>
        <li>💼 전문가 말투 - 분석적이고 객관적인</li>
        <li>😊 가벼운 말투 - 친근하고 밝은</li>
      </ul>
      <br />
      <p>다양한 스타일의 AI 코멘트를 경험해보세요!</p>
    `,
    isPinned: false,
    isPublished: true,
    createdAt: '2024-11-25T16:00:00Z',
    updatedAt: '2024-11-25T16:00:00Z',
  },
];

/**
 * 공지사항 목록 조회 API (플로우 10.4)
 * 
 * 기능:
 * - 공개 상태인 공지사항만 반환 (isPublished = true)
 * - 정렬 순서:
 *   1. 고정된 공지사항 우선 (isPinned = true)
 *   2. 이후 작성일 최신순 정렬 (createdAt DESC)
 * 
 * API 명세:
 * - Method: GET
 * - Endpoint: /api/announcements
 * - Headers: Authorization: Bearer {token} (선택사항)
 * - Response: Announcement[]
 * 
 * [백엔드 팀] 실제 구현 시:
 * - GET /api/announcements
 * - 쿼리:
 *   SELECT * FROM announcements
 *   WHERE is_published = true
 *   ORDER BY is_pinned DESC, created_at DESC
 * - 응답: 공지사항 배열
 * 
 * @returns Promise<Announcement[]> - 공지사항 목록
 */
export async function getAnnouncements(): Promise<Announcement[]> {
  // Mock 데이터 반환 (실제 구현 시 API 호출)
  return new Promise((resolve) => {
    setTimeout(() => {
      // 공개 상태인 공지사항만 필터링
      const publishedAnnouncements = mockAnnouncements.filter(
        (announcement) => announcement.isPublished
      );

      // 정렬: 고정된 공지사항 우선, 이후 최신순
      const sortedAnnouncements = publishedAnnouncements.sort((a, b) => {
        // 1. 고정 여부로 정렬 (고정된 것이 상단)
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // 2. 작성일 최신순 정렬
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      resolve(sortedAnnouncements);
    }, 500); // 0.5초 딜레이 (로딩 상태 시뮬레이션)
  });

  /* [백엔드 팀] 실제 구현 시 아래 코드로 교체:
  
  const response = await fetch('/api/announcements', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 토큰이 필요한 경우
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('공지사항을 불러오지 못했습니다.');
  }

  const data = await response.json();
  return data.announcements || data;
  
  */
}

/**
 * 공지사항 상세 조회 API (플로우 10.4)
 * 
 * 기능:
 * - 특정 공지사항의 상세 정보 반환
 * - 공개 상태인 공지사항만 조회 가능
 * 
 * API 명세:
 * - Method: GET
 * - Endpoint: /api/announcements/{id}
 * - Headers: Authorization: Bearer {token} (선택사항)
 * - Response: Announcement
 * 
 * [백엔드 팀] 실제 구현 시:
 * - GET /api/announcements/{id}
 * - 쿼리:
 *   SELECT * FROM announcements
 *   WHERE id = :id AND is_published = true
 * - 응답: 공지사항 객체
 * - 에러: 404 (공지사항이 없거나 비공개인 경우)
 * 
 * @param id - 공지사항 ID
 * @returns Promise<Announcement> - 공지사항 상세 정보
 */
export async function getAnnouncementById(id: string): Promise<Announcement> {
  // Mock 데이터 반환 (실제 구현 시 API 호출)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const announcement = mockAnnouncements.find(
        (a) => a.id === id && a.isPublished
      );

      if (!announcement) {
        reject(new Error('공지사항을 찾을 수 없습니다.'));
        return;
      }

      resolve(announcement);
    }, 300); // 0.3초 딜레이
  });

  /* [백엔드 팀] 실제 구현 시 아래 코드로 교체:
  
  const response = await fetch(`/api/announcements/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 토큰이 필요한 경우
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('공지사항을 찾을 수 없습니다.');
    }
    throw new Error('공지사항을 불러오지 못했습니다.');
  }

  const data = await response.json();
  return data.announcement || data;
  
  */
}
