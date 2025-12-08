/**
 * ====================================================================================================
 * 사용자용 공지사항 컴포넌트 (UI 확인용)
 * ====================================================================================================
 * 
 * @description
 * 사용자 앱에서 공지사항을 조회하는 화면 (사용자 명세서 10.4)
 * - 이 파일은 관리자 대시보드에서 UI 확인용으로만 사용됩니다
 * - 실제 사용자 앱 코드가 있으면 그쪽으로 이동/통합해야 합니다
 * 
 * @연동_가이드
 * [사용자 앱 통합 시 작업사항]
 * 1. 이 파일의 컴포넌트를 사용자 앱의 공지사항 페이지로 복사
 * 2. 사용자 앱의 라우터에 "/notices" 경로 추가
 * 3. API 엔드포인트: GET /api/user/notices (공개된 공지사항만 조회)
 * 4. localStorage 대신 실제 API 호출로 변경
 * 5. 사용자 앱의 레이아웃/스타일 가이드에 맞춰 조정
 * 
 * @주의사항
 * - 관리자 대시보드와 별도로 사용자 앱에서 사용
 * - 이 파일은 추후 삭제 가능 (사용자 앱으로 이동 후)
 * - 관리자가 작성한 공지사항(isPublic: true)만 표시
 * 
 * @참고
 * - 유스케이스: 사용자 명세서 10.4 공지사항 조회
 * - 관리자 대시보드 4.6과 연동됨 (고정 공지사항)
 * 
 * ====================================================================================================
 */

import { useState, useEffect } from 'react';
import { Megaphone, X, Pin, Calendar } from 'lucide-react';
import { getNotices } from '../../../services/announcementApi';

// ========================================
// 공지사항 데이터 타입
// ========================================
interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isPublic: boolean;
  views: number;
}

export function UserNotices() {
  // ========================================
  // State 관리
  // ========================================
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // ========================================
  // 공지사항 목록 로드 (사용자용)
  // ========================================
  useEffect(() => {
    loadNotices();
  }, []);

  /**
   * 사용자용 공지사항 목록 조회
   * 
   * [백엔드 작업] API: GET /api/user/notices
   * - 공개된 공지사항만 조회 (isPublic: true)
   * - 고정된 공지사항이 상단에 표시됨
   * - 최신순 정렬
   */
  const loadNotices = async () => {
    setIsLoading(true);
    
    try {
      // GET /api/notices
      // [API 명세서 Section 7.1]
      // 공개된 공지사항만 조회되며, 고정된 공지사항이 먼저 표시됩니다.
      const response = await getNotices(1, 100);
      if (response.success && response.data) {
        // 고정된 공지사항 먼저, 그 다음 작성일 최신순 정렬
        const sortedNotices = [...response.data.notices].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setNotices(sortedNotices);
      }
    } catch (error: any) {
      console.error('공지사항 목록 조회 실패:', error);
      setNotices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // 공지사항 조회 (사용자용)
  // ========================================
  const handleView = (notice: Notice) => {
    setSelectedNotice(notice);
    
    // [백엔드 작업] 조회수 증가: PATCH /api/user/notices/:id/view
    // (관리자 대시보드와 동일한 조회수 카운터 사용)
  };

  // ========================================
  // 정렬: 고정 먼저, 최신순
  // ========================================
  const sortedNotices = [...notices].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // ========================================
  // 로딩 상태 UI
  // ========================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">공지사항을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ========================================
          헤더 영역
          ======================================== */}
      <div className="mb-8">
        <h1 className="text-slate-800 tracking-tight flex items-center gap-3 mb-2">
          <Megaphone className="w-8 h-8 text-blue-600" />
          공지사항
        </h1>
        <p className="text-slate-600">중요한 소식과 업데이트를 확인하세요</p>
      </div>

      {/* ========================================
          공지사항 목록
          ======================================== */}
      {notices.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-slate-200">
          <Megaphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">등록된 공지사항이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotices.map((notice) => (
            <button
              key={notice.id}
              onClick={() => handleView(notice)}
              className="w-full text-left bg-white border-2 border-slate-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-lg transition-all group"
            >
              {/* 제목 */}
              <div className="flex items-start gap-3 mb-2">
                {/* 고정 배지 (관리자 대시보드 4.6과 연동) */}
                {notice.isPinned && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs font-medium flex-shrink-0">
                    <Pin className="w-3 h-3 mr-1" />
                    고정
                  </span>
                )}
                
                <h2 className="text-slate-800 font-medium group-hover:text-blue-600 transition-colors flex-1">
                  {notice.title}
                </h2>
              </div>

              {/* 작성일 */}
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar className="w-4 h-4" />
                {notice.createdAt.split(' ')[0]}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ========================================
          공지사항 조회 모달 (사용자용)
          ======================================== */}
      {selectedNotice && (
        <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
      )}
    </div>
  );
}

// ========================================
// 사용자용 공지사항 조회 모달
// ========================================
interface NoticeModalProps {
  notice: Notice;
  onClose: () => void;
}

function NoticeModal({ notice, onClose }: NoticeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8">
        {/* 모달 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex-1">
            {/* 제목 및 배지 */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-medium">{notice.title}</h2>
              
              {/* 고정 배지 */}
              {notice.isPinned && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  고정됨
                </span>
              )}
            </div>
            
            {/* 작성일 */}
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Calendar className="w-4 h-4" />
              {notice.createdAt}
            </div>
          </div>
          
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 공지사항 내용 (HTML 렌더링) */}
        <div className="p-6">
          <div 
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: notice.content }}
          />
        </div>

        {/* 모달 푸터 */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-lg flex justify-end border-t-2 border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ====================================================================================================
 * 사용자 앱 통합 가이드
 * ====================================================================================================
 * 
 * 1. 사용자 앱에 이 컴포넌트 복사
 * - 위치: /app/notices/page.tsx (또는 사용자 앱의 공지사항 페이지)
 * - 컴포넌트명: UserNotices → Notices로 변경 가능
 * 
 * 2. API 연동
 * GET /api/user/notices
 * Response: {
 *   "notices": [
 *     {
 *       "id": "NOT001",
 *       "title": "서비스 정기 점검 안내",
 *       "content": "<h3>정기 점검 안내</h3>...",
 *       "createdAt": "2025-11-20 10:30",
 *       "isPinned": true,
 *       "views": 1245
 *     }
 *   ]
 * }
 * 
 * 주의: isPublic: true인 공지사항만 반환해야 함
 * 
 * 3. 조회수 증가
 * PATCH /api/user/notices/:id/view
 * 
 * 4. 라우터 설정 (Next.js 예시)
 * /app/notices/page.tsx
 * 
 * 5. 네비게이션 메뉴에 추가
 * - 이름: "공지사항"
 * - 아이콘: Megaphone
 * - 경로: /notices
 * 
 * 6. 관리자 대시보드와의 연동
 * - 관리자가 공지사항 고정 시 (4.6) → 사용자 화면에서도 상단 고정 표시
 * - 관리자가 공개 상태 변경 시 → 사용자 화면에서 즉시 반영
 * 
 * 7. localStorage 제거
 * - loadNotices 함수에서 localStorage 대신 실제 API 호출
 * - 예시: const response = await fetch('/api/user/notices');
 * 
 * 8. 스타일 커스터마이징
 * - 사용자 앱의 디자인 시스템에 맞춰 색상/폰트 조정
 * - 현재: Blue 계열 (blue-600) → 사용자 앱 Primary 색상으로 변경
 * 
 * 9. 이 파일(user-notices.tsx) 삭제
 * - 사용자 앱으로 이동 완료 후 관리자 대시보드에서 제거
 * 
 * ====================================================================================================
 */
