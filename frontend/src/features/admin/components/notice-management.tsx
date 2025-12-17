/**
 * ====================================================================================================
 * 공지사항 관리 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자가 사용자에게 전달할 공지사항을 작성하고 관리하는 페이지
 * - 유스케이스: 명세서 3.1-3.6 공지사항 관리 플로우
 * - 플로우: 공지사항 관리 플로우
 * 
 * [명세서 참고]
 * - 3.1: 공지사항 목록 조회
 * - 3.2: 공지사항 작성
 * - 3.3: 공지사항 조회
 * - 3.4: 공지사항 수정
 * - 3.5: 공지사항 삭제
 * - 3.6: 공지사항 고정
 * 
 * @features
 * 1. 공지사항 목록 조회 (4.1):
 *    - 네비게이션 "공지사항 관리" 탭 클릭
 *    - 로딩 스피너 ("공지사항 목록을 불러오는 중...")
 *    - 전체 공지사항 목록 자동 로드
 *    - 테이블 열: 고정 여부 (📌), 제목, 작성자, 작성일, 조회수, 공개 상태, 액션
 *    - 정렬: 고정된 공지사항 먼저, 그 다음 작성일 최신순
 * 
 * 2. 공지사항 작성 (4.2):
 *    - "새 공지사항 작성" 버튼 → 작성 모달
 *    - 제목 입력 (필수, 최대 200자)
 *    - HTML 에디터 (기본 포맷팅 도구: 굵게, 기울임, 밑줄, H1/H2/H3, 목록, 링크, 이미지)
 *    - "편집" / "미리보기" 탭 전환
 *    - 옵션 설정: 공개 상태 (라디오 버튼), 상단 고정 (체크박스)
 *    - "작성 완료" 버튼 → 저장 API 호출
 *    - X 버튼 클릭 시 확인 다이얼로그
 * 
 * 3. 공지사항 조회 (4.3):
 *    - 조회 버튼 (👁️) 클릭 → 조회 모달
 *    - 표시: 제목, 작성자, 작성일, 고정 여부 배지, 공개 상태, 조회수
 *    - 공지사항 내용 (HTML 렌더링)
 *    - X 버튼 닫기
 * 
 * 4. 공지사항 수정 (4.4):
 *    - 수정 버튼 (✏️) 클릭 → 수정 모달
 *    - 4.2와 동일한 구조
 *    - 기존 공지사항 내용 자동 로드
 *    - "수정 완료" 버튼 → 수정 API 호출
 *    - X 버튼 클릭 시 확인 다이얼로그
 * 
 * 5. 공지사항 삭제 (4.5):
 *    - 삭제 버튼 (🗑️) 클릭 → 확인 다이얼로그
 *    - 메시지: "이 공지사항을 삭제하시겠습니까? 삭제된 공지사항은 복구할 수 없습니다."
 *    - 확인 → 삭제 API 호출, 목록 갱신
 * 
 * 6. 공지사항 고정 (4.6):
 *    - 고정 버튼 (📌) 클릭 → 고정/고정 해제 토글
 *    - 고정 상태 즉시 반영 (API 호출)
 *    - 고정된 공지사항은 목록 상단에 항상 표시
 *    - 사용자 화면에서도 고정 공지사항이 상단에 표시됨
 * 
 * 7. 액션 버튼 (4.1):
 *    - 고정/고정 해제 (📌)
 *    - 조회 (👁️)
 *    - 수정 (✏️)
 *    - 삭제 (🗑️)
 * 
 * @data_source
 * - [백엔드 작업] Database에서 공지사항 목록 조회
 *   GET /api/admin/notices
 * 
 * ====================================================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Eye, X, Save, Calendar, User, Pin, Search } from 'lucide-react';
import { getNoticeList, getNoticeById, createNotice, updateNotice, deleteNotice, pinNotice } from '../../../services/adminApi';
import type { Notice } from '../types';
import { getAdminInfo } from '../utils/session-manager';

export function NoticeManagement() {
  // ========================================
  // State 관리
  // ========================================
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // 페이징, 검색, 필터 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublic, setFilterPublic] = useState<'all' | 'public' | 'private'>('all');
  const [filterPinned, setFilterPinned] = useState<'all' | 'pinned' | 'unpinned'>('all');

  // ========================================
  // 공지사항 목록 로드 (4.1)
  // ========================================
  useEffect(() => {
    loadNotices();
  }, []);

  // 검색어나 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPublic, filterPinned]);

  /**
   * 플로우: 4.1 공지사항 목록 조회
   * 
   * 1. 네비게이션 "공지사항 관리" 탭 클릭
   * 2. 로딩 스피너 표시 ("공지사항 목록을 불러오는 중...")
   * 3. API 호출하여 전체 공지사항 목록 로드
   * 4. 정렬: 고정된 공지사항 먼저, 최신순
   */
  const loadNotices = async () => {
    setIsLoading(true);

    try {
      // GET /api/admin/notices
      const response = await getNoticeList({ page: 1, limit: 100 });
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
  // 새 공지사항 작성 (4.2)
  // ========================================
  const handleCreate = () => {
    // 현재 로그인한 관리자 정보 가져오기
    const adminInfo = getAdminInfo();
    setEditingNotice({
      id: 0, // 새로 추가할 때는 0 (저장 시 서버에서 생성)
      title: '',
      content: '',
      author: adminInfo?.email || '관리자', // 실제 관리자 이메일 사용
      createdAt: '',
      updatedAt: '',
      isPinned: false,
      isPublic: true,
      views: 0
    });
    setShowModal(true);
  };

  // ========================================
  // 공지사항 수정 (3.4)
  // ========================================
  /**
   * 플로우: 3.4 공지사항 수정
   * 
   * 1. 공지사항 목록에서 수정 버튼 (✏️) 클릭
   * 2. API 호출: GET /api/admin/notices/{noticeId}
   * 3. content를 포함한 전체 데이터 가져오기
   * 4. 공지사항 수정 모달 표시
   *    - 3.2와 동일한 구조
   *    - 기존 공지사항 내용 자동 로드 (제목, HTML 내용, 공개 상태, 상단 고정 여부)
   * 5. 내용 수정 후 "수정 완료" 버튼 클릭
   * 6. 검증 통과 → PUT API 호출
   * 7. 성공 시: 성공 메시지, 목록 갱신, 모달 닫기
   * 8. 수정한 내용 있을 시 X 버튼 클릭 → 확인 다이얼로그
   * 
   * [API 명세서 Section 10.3.2, 10.3.4]
   * - 수정 시 content를 포함한 전체 데이터를 가져와야 합니다.
   */
  const handleEdit = async (notice: Notice) => {
    try {
      // [API 명세서 Section 10.3.2] GET /api/admin/notices/{noticeId}
      // content를 포함한 전체 데이터 가져오기
      const response = await getNoticeById(notice.id);
      if (response.success && response.data) {
        setEditingNotice(response.data);
        setShowModal(true);
      } else {
        alert('공지사항을 불러올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('공지사항 상세 조회 실패:', error);
      alert(error.message || '공지사항을 불러올 수 없습니다.');
    }
  };

  // ========================================
  // 공지사항 삭제 (4.5)
  // ========================================
  /**
   * 플로우: 4.5 공지사항 삭제
   * 
   * 1. 공지사항 목록에서 삭제 버튼 (🗑️) 클릭
   * 2. 삭제 확인 다이얼로그 표시
   *    - 메시지: "이 공지사항을 삭제하시겠습니까? 삭제된 공지사항은 복구할 수 없습니다."
   * 3. "확인" → DELETE API 호출
   *    - 성공 시: 성공 메시지, 목록에서 제거, 목록 갱신
   * 4. "취소" → 다이얼로그 닫기
   */
  const handleDelete = async (id: number) => {
    console.log('=== handleDelete 함수 호출됨 ===');
    console.log('삭제할 공지사항 ID:', id);

    const userConfirmed = confirm('이 공지사항을 삭제하시겠습니까?\n\n삭제된 공지사항은 복구할 수 없습니다.');
    console.log('사용자 확인 결과:', userConfirmed);

    if (!userConfirmed) {
      console.log('삭제 취소됨');
      return;
    }

    console.log('삭제 확인됨 - API 호출 시작');
    try {
      // DELETE /api/admin/notices/{id}
      const result = await deleteNotice(id);
      console.log('deleteNotice API 응답:', result);
      alert('공지사항이 삭제되었습니다.');
      loadNotices(); // 목록 갱신
    } catch (error: any) {
      console.error('공지사항 삭제 실패:', error);
      console.error('에러 상세:', error.response || error.message);
      alert(error.message || '삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // ========================================
  // 공지사항 저장
  // ========================================
  const handleSave = async (notice: Notice) => {
    if (!notice.title || !notice.content) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 내용 길이 체크 (TEXT 타입 제한: 65KB, 안전하게 60KB로 제한)
    const contentBytes = new Blob([notice.content]).size;
    const maxBytes = 60 * 1024; // 60KB
    if (contentBytes > maxBytes) {
      alert(`내용이 너무 깁니다.\n현재: ${(contentBytes / 1024).toFixed(1)}KB\n최대: ${maxBytes / 1024}KB\n\n내용을 줄여주세요.`);
      return;
    }

    try {
      if (notice.id && notice.id > 0) {
        // PUT /api/admin/notices/{id}
        await updateNotice(notice.id, {
          title: notice.title,
          content: notice.content,
          isPublic: notice.isPublic,
          isPinned: notice.isPinned
        });
        alert('공지사항이 수정되었습니다.');
      } else {
        // POST /api/admin/notices
        await createNotice({
          title: notice.title,
          content: notice.content,
          isPublic: notice.isPublic,
          isPinned: notice.isPinned
        });
        alert('공지사항이 등록되었습니다.');
      }

      setShowModal(false);
      setEditingNotice(null);
      loadNotices(); // 목록 갱신
    } catch (error: any) {
      console.error('공지사항 저장 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.message || error.message || '저장에 실패했습니다. 다시 시도해주세요.';
      alert(`저장 실패: ${errorMessage}`);
    }
  };

  // ========================================
  // 공지사항 조회 (3.3)
  // ========================================
  /**
   * 플로우: 3.3 공지사항 조회
   * 
   * 1. 공지사항 목록에서 조회 버튼 (👁️) 클릭
   * 2. API 호출: GET /api/admin/notices/{noticeId}
   * 3. content를 포함한 전체 데이터 가져오기
   * 4. 조회 모달 표시
   * 
   * [API 명세서 Section 10.3.2]
   * - 관리자가 조회하는 경우 조회수는 증가하지 않습니다.
   * - content 필드가 포함된 전체 데이터를 반환합니다.
   */
  const handleView = async (notice: Notice) => {
    try {
      // [API 명세서 Section 10.3.2] GET /api/admin/notices/{noticeId}
      // content를 포함한 전체 데이터 가져오기
      const response = await getNoticeById(notice.id);
      if (response.success && response.data) {
        setSelectedNotice(response.data);
      } else {
        alert('공지사항을 불러올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('공지사항 상세 조회 실패:', error);
      alert(error.message || '공지사항을 불러올 수 없습니다.');
    }
  };

  // ========================================
  // 고정/고정 해제 (4.6)
  // ========================================
  /**
   * 플로우: 4.6 공지사항 고정
   * 
   * 1. 공지사항 목록에서 고정 버튼 (📌) 클릭
   * 2. 고정되지 않은 공지사항 → 상단에 고정
   * 3. 고정된 공지사항 → 고정 해제
   * 4. 고정 상태 즉시 반영 (PATCH API 호출)
   * 5. 고정된 공지사항은 목록 상단에 항상 표시
   * 6. 사용자 화면(사용자 명세서 10.4)에서도 고정 공지사항이 상단에 표시됨
   * 
   * @참고
   * - 고정 상태 토글 시 즉시 반영
   * - 목록은 자동으로 재정렬됨 (고정 먼저, 최신순)
   * - localStorage에 저장되어 새로고침 시에도 유지
   */
  const togglePin = async (id: number) => {
    try {
      const notice = notices.find(n => n.id === id);
      if (!notice) return;

      // PUT /api/admin/notices/{id}/pin
      await pinNotice(id, !notice.isPinned);
      loadNotices(); // 목록 갱신
    } catch (error: any) {
      console.error('공지사항 고정 상태 변경 실패:', error);
      alert(error.message || '상태 변경에 실패했습니다.');
    }
  };


  // ========================================
  // 필터링, 검색, 정렬, 페이징 로직
  // ========================================

  // 1. 검색 필터링
  const searchFiltered = notices.filter(notice => {
    const query = searchQuery.toLowerCase();
    const titleMatch = notice.title.toLowerCase().includes(query);
    const authorMatch = notice.author.toLowerCase().includes(query);
    return titleMatch || authorMatch;
  });

  // 2. 공개 상태 필터링
  const publicFiltered = searchFiltered.filter(notice => {
    if (filterPublic === 'all') return true;
    if (filterPublic === 'public') return notice.isPublic;
    if (filterPublic === 'private') return !notice.isPublic;
    return true;
  });

  // 3. 고정 여부 필터링
  const pinnedFiltered = publicFiltered.filter(notice => {
    if (filterPinned === 'all') return true;
    if (filterPinned === 'pinned') return notice.isPinned;
    if (filterPinned === 'unpinned') return !notice.isPinned;
    return true;
  });

  // 4. 정렬: 고정 먼저, 최신순
  const sortedNotices = [...pinnedFiltered].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 5. 페이징 계산
  const totalPages = Math.ceil(sortedNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotices = sortedNotices.slice(startIndex, endIndex);

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterPublic('all');
    setFilterPinned('all');
    setCurrentPage(1);
  };

  // ========================================
  // 로딩 상태 UI (4.1)
  // ========================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-600">공지사항 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ========================================
          헤더 영역
          ======================================== */}
      <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-slate-300">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-slate-800 tracking-tight flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl lg:text-3xl">
              <Megaphone className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex-shrink-0" />
              <span className="break-words">공지사항 관리</span>
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base break-words">사용자에게 전달할 공지사항을 작성하고 관리합니다</p>
          </div>

          {/* ========================================
              "새 공지사항 작성" 버튼 (4.1) - 오른쪽 고정
              ======================================== */}
          <button
            onClick={handleCreate}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">새 공지사항 작성</span>
            <span className="sm:hidden">작성</span>
          </button>
        </div>
      </div>

      {/* ========================================
          검색 및 필터 영역
          ======================================== */}
      <div className="mb-6 bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
        {/* 검색 및 필터 - 가로 정렬 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* 검색창 */}
          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목 또는 작성자로 검색..."
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* 공개 상태 필터 */}
          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              공개 상태
            </label>
            <select
              value={filterPublic}
              onChange={(e) => setFilterPublic(e.target.value as 'all' | 'public' | 'private')}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="all">전체</option>
              <option value="public">공개</option>
              <option value="private">비공개</option>
            </select>
          </div>

          {/* 고정 여부 필터 */}
          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              고정 여부
            </label>
            <select
              value={filterPinned}
              onChange={(e) => setFilterPinned(e.target.value as 'all' | 'pinned' | 'unpinned')}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="all">전체</option>
              <option value="pinned">고정됨</option>
              <option value="unpinned">고정 안 됨</option>
            </select>
          </div>

          {/* 초기화 버튼 */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium text-sm"
            >
              필터 초기화
            </button>
          </div>
        </div>

        {/* 검색 결과 개수 표시 */}
        <div className="text-sm text-slate-600 border-t border-slate-200 pt-3">
          총 <span className="font-semibold text-slate-800">{sortedNotices.length}개</span>의 검색 결과
          {notices.length !== sortedNotices.length && (
            <span className="ml-2 text-slate-500">
              (전체 {notices.length}개 중)
            </span>
          )}
        </div>
      </div>

      {/* ========================================
          공지사항 목록 테이블 (4.1)
          ======================================== */}
      <div className="border-2 border-slate-300 rounded-lg overflow-hidden shadow-md bg-white">
        {sortedNotices.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {notices.length === 0
                ? '등록된 공지사항이 없습니다'
                : '검색 결과가 없습니다. 다른 검색어나 필터를 시도해보세요.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-w-full">
            <table className="w-full min-w-[800px]">
              {/* 테이블 헤더 */}
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300">
                  <th className="px-6 py-4 text-left text-slate-700 border-r border-slate-200 w-24">
                    고정 여부
                  </th>
                  <th className="px-6 py-4 text-left text-slate-700 border-r border-slate-200">
                    제목
                  </th>
                  <th className="px-6 py-4 text-left text-slate-700 border-r border-slate-200 w-40">
                    작성자
                  </th>
                  <th className="px-6 py-4 text-left text-slate-700 border-r border-slate-200 w-48">
                    작성일
                  </th>
                  <th className="px-6 py-4 text-center text-slate-700 border-r border-slate-200 w-24">
                    조회수
                  </th>
                  <th className="px-6 py-4 text-center text-slate-700 border-r border-slate-200 w-28">
                    공개 상태
                  </th>
                  <th className="px-6 py-4 text-center text-slate-700 w-56">
                    액션
                  </th>
                </tr>
              </thead>

              {/* ========================================
                  테이블 본문
                  ======================================== */}
              <tbody>
                {paginatedNotices.map((notice, index) => (
                  <tr
                    key={notice.id}
                    className={`
                      border-b border-slate-200 transition-all duration-200
                      hover:bg-blue-50
                      ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                    `}
                  >
                    {/* 고정 여부 (📌 아이콘) */}
                    <td className="px-6 py-4 border-r border-slate-100">
                      {notice.isPinned && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs font-medium">
                          <Pin className="w-3 h-3 mr-1" />
                          고정
                        </span>
                      )}
                    </td>

                    {/* 제목 */}
                    <td className="px-6 py-4 border-r border-slate-100" style={{ maxWidth: '300px' }}>
                      <button
                        onClick={() => handleView(notice)}
                        className="text-slate-800 hover:text-blue-600 font-medium text-left transition-colors underline-offset-2 hover:underline w-full block truncate"
                        title={notice.title}
                      >
                        {notice.title}
                      </button>
                    </td>

                    {/* 작성자 */}
                    <td className="px-6 py-4 text-slate-600 text-sm border-r border-slate-100">
                      {notice.author.split('@')[0]}
                    </td>

                    {/* 작성일 (명세서 3.1: YYYY-MM-DD 형식) */}
                    <td className="px-6 py-4 text-slate-600 text-sm border-r border-slate-100">
                      {notice.createdAt ? (() => {
                        // YYYY-MM-DD 형식으로 변환 (명세서 3.1)
                        const date = new Date(notice.createdAt);
                        if (isNaN(date.getTime())) {
                          return notice.createdAt; // 파싱 실패 시 원본 반환
                        }
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      })() : '-'}
                    </td>

                    {/* 조회수 */}
                    <td className="px-6 py-4 text-center text-slate-600 text-sm border-r border-slate-100">
                      {notice.views.toLocaleString()}
                    </td>

                    {/* 공개 상태 배지 (4.1) */}
                    <td className="px-6 py-4 text-center border-r border-slate-100">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${notice.isPublic
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                      >
                        {notice.isPublic ? '공개' : '비공개'}
                      </span>
                    </td>

                    {/* 액션 버튼 (4.1) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* 고정/고정 해제 버튼 (📌) */}
                        <button
                          onClick={() => togglePin(notice.id)}
                          className={`p-2 rounded-lg transition-colors ${notice.isPinned
                            ? 'bg-red-100 hover:bg-red-200 text-red-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          title={notice.isPinned ? '고정 해제' : '상단 고정'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>

                        {/* 조회 버튼 (👁️) */}
                        <button
                          onClick={() => handleView(notice)}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                          title="보기"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* 수정 버튼 (✏️) */}
                        <button
                          onClick={() => handleEdit(notice)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* 삭제 버튼 (🗑️) */}
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 테이블 푸터 */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-t-2 border-slate-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* 페이지 정보 */}
            <p className="text-slate-600 text-sm">
              총 <span className="font-semibold text-slate-800">{sortedNotices.length}개</span>의 공지사항
              {sortedNotices.length > 0 && (
                <span className="ml-2">
                  (페이지 {currentPage} / {totalPages})
                </span>
              )}
            </p>

            {/* 페이징 버튼 */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                {/* 이전 버튼 */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 hover:bg-blue-100 border border-slate-300'
                    }`}
                >
                  이전
                </button>

                {/* 페이지 번호들 */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // 현재 페이지 주변 2개씩만 표시
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      return Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, arr) => {
                      // ... 표시
                      if (index > 0 && arr[index - 1] !== page - 1) {
                        return (
                          <span key={`dot-${page}`} className="px-2 text-slate-500">
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[32px] px-2 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 hover:bg-blue-100 border border-slate-300'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                </div>

                {/* 다음 버튼 */}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 hover:bg-blue-100 border border-slate-300'
                    }`}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================
          공지사항 작성/수정 모달 (4.2)
          ======================================== */}
      {showModal && editingNotice && (
        <NoticeModal
          notice={editingNotice}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingNotice(null);
          }}
        />
      )}

      {/* ========================================
          공지사항 조회 모달 (4.3)
          ======================================== */}
      {selectedNotice && (
        <NoticeViewModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
          onEdit={async () => {
            if (selectedNotice) {
              const noticeToEdit = selectedNotice;
              setSelectedNotice(null);
              await handleEdit(noticeToEdit);
            }
          }}
        />
      )}
    </>
  );
}

// ========================================
// 공지사항 작성/수정 모달 컴포넌트 (4.2)
// ========================================
/**
 * 플로우: 4.2 공지사항 작성
 * 
 * 1. "새 공지사항 작성" 버튼 클릭 → 모달 표시
 * 2. 제목 입력 (최대 200자)
 * 3. 내용 입력 (HTML 에디터)
 * 4. "편집" / "미리보기" 탭 전환
 * 5. 옵션 설정:
 *    - 공개 상태 (라디오 버튼)
 *    - 상단 고정 (체크박스)
 * 6. "작성 완료" 버튼 → 저장 API 호출
 * 7. 성공 시 목록 갱신 및 모달 닫기
 */
interface NoticeModalProps {
  notice: Notice;
  onSave: (notice: Notice) => void;
  onClose: () => void;
}

function NoticeModal({ notice, onSave, onClose }: NoticeModalProps) {
  const [formData, setFormData] = useState<Notice>(notice);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit'); // 편집/미리보기 탭
  const [hasChanges, setHasChanges] = useState(false); // 변경사항 추적
  const textareaRef = useRef<HTMLTextAreaElement>(null); // textarea 참조 (선택한 텍스트 가져오기용)
  const [showLinkModal, setShowLinkModal] = useState(false); // 링크 입력 모달
  const [showImageModal, setShowImageModal] = useState(false); // 이미지 입력 모달
  const [linkUrl, setLinkUrl] = useState(''); // 링크 URL
  const [linkText, setLinkText] = useState(''); // 링크 텍스트
  const [imageUrl, setImageUrl] = useState(''); // 이미지 URL
  const [imageAlt, setImageAlt] = useState(''); // 이미지 alt 텍스트

  // 폼 데이터 변경 시 hasChanges 업데이트
  const updateFormData = (updates: Partial<Notice>) => {
    setFormData({ ...formData, ...updates });
    setHasChanges(true);
  };

  /**
   * textarea에서 선택한 텍스트 가져오기
   * @returns 선택한 텍스트와 시작/끝 위치
   */
  const getSelectedText = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { text: '', start: 0, end: 0 };

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    return { text: selectedText, start, end };
  };

  /**
   * 선택한 텍스트를 HTML 태그로 감싸기
   * @param openTag - 시작 태그 (예: '<h1>')
   * @param closeTag - 종료 태그 (예: '</h1>')
   */
  const wrapSelectedText = (openTag: string, closeTag: string) => {
    const { text, start, end } = getSelectedText();
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 현재 textarea의 실제 값 사용 (formData.content와 동기화)
    const currentContent = textarea.value;

    let newContent: string;
    if (text) {
      // 선택한 텍스트가 있으면 태그로 감싸기
      const before = currentContent.substring(0, start);
      const after = currentContent.substring(end);
      newContent = before + openTag + text + closeTag + after;
    } else {
      // 선택한 텍스트가 없으면 커서 위치에 태그 삽입
      const before = currentContent.substring(0, start);
      const after = currentContent.substring(start);
      newContent = before + openTag + closeTag + after;
    }

    // formData 업데이트
    updateFormData({ content: newContent });

    // textarea의 value 직접 업데이트 (즉시 반영)
    textarea.value = newContent;

    // 커서 위치 조정 (태그 삽입 후)
    setTimeout(() => {
      if (textarea) {
        const newPosition = text ? start + openTag.length + text.length + closeTag.length : start + openTag.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setHasChanges(false);
  };

  // 모달 닫기 시 확인 다이얼로그 (4.2)
  const handleClose = () => {
    if (hasChanges && (formData.title || formData.content)) {
      if (confirm('작성 중인 내용이 있습니다. 정말 닫으시겠습니까?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-1 sm:p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-h-[95vh] my-auto flex flex-col mx-1 min-w-0 overflow-hidden" style={{ maxWidth: 'min(calc(100vw - 0.5rem), 98vw, 800px)', width: 'min(calc(100vw - 0.5rem), 98vw, 800px)' }}>
          <form onSubmit={handleSubmit}>
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-2 sm:px-3 py-2 flex items-center justify-between rounded-t-lg min-w-0 flex-shrink-0">
              <h2 className="text-sm sm:text-base flex items-center gap-1 min-w-0 flex-1">
                <Megaphone className="w-4 h-4 flex-shrink-0" />
                <span className="break-words truncate">{notice.id ? '공지사항 수정' : '새 공지사항 작성'}</span>
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 폼 영역 */}
            <div className="p-2 sm:p-3 space-y-2 sm:space-y-3 overflow-y-auto flex-1 min-w-0">
              {/* ========================================
                1. 제목 입력 (필수, 최대 200자)
                ======================================== */
              }
              <div className="min-w-0">
                <label className="block text-slate-700 font-medium mb-1 text-xs sm:text-sm">
                  제목 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm min-w-0"
                  placeholder="공지사항 제목을 입력하세요 (최대 200자)"
                />
                <p className="text-sm text-slate-500 mt-1 text-right">
                  {formData.title.length} / 200자
                </p>
              </div>

              {/* ========================================
                2. 내용 입력 (HTML 에디터)
                ======================================== */}
              <div className="min-w-0 max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 gap-1 min-w-0">
                  <label className="block text-slate-700 font-medium text-xs sm:text-sm min-w-0 flex-shrink">
                    내용 <span className="text-red-600">*</span>
                  </label>

                  {/* 편집/미리보기 탭 전환 (4.2) */}
                  <div className="flex gap-0.5 bg-slate-200 rounded-lg p-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('edit')}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'edit'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      편집
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'preview'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      미리보기
                    </button>
                  </div>
                </div>

                {activeTab === 'edit' ? (
                  <div className="min-w-0 max-w-full overflow-hidden">
                    {/* 기본 포맷팅 도구 (4.2) */}
                    <div className="mb-1 flex flex-wrap gap-0.5 p-1 bg-slate-100 rounded-t-lg border-2 border-b-0 border-slate-300 min-w-0 max-w-full overflow-x-auto">
                      {/* 제목 */}
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => wrapSelectedText('<h1>', '</h1>')}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs font-semibold border border-slate-300 whitespace-nowrap"
                          title="제목 1 (선택한 텍스트에 적용)"
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() => wrapSelectedText('<h2>', '</h2>')}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs font-semibold border border-slate-300 whitespace-nowrap"
                          title="제목 2 (선택한 텍스트에 적용)"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => wrapSelectedText('<h3>', '</h3>')}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs font-semibold border border-slate-300 whitespace-nowrap"
                          title="제목 3 (선택한 텍스트에 적용)"
                        >
                          H3
                        </button>
                      </div>

                      <div className="w-px h-4 bg-slate-300 flex-shrink-0"></div>

                      {/* 텍스트 스타일 */}
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => wrapSelectedText('<strong>', '</strong>')}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs font-bold border border-slate-300 whitespace-nowrap"
                          title="굵게 (선택한 텍스트에 적용)"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => wrapSelectedText('<em>', '</em>')}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs italic border border-slate-300 whitespace-nowrap"
                          title="기울임 (선택한 텍스트에 적용)"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => wrapSelectedText('<u>', '</u>')}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs underline border border-slate-300 whitespace-nowrap"
                          title="밑줄 (선택한 텍스트에 적용)"
                        >
                          U
                        </button>
                      </div>

                      <div className="w-px h-4 bg-slate-300 flex-shrink-0"></div>

                      {/* 목록 */}
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => updateFormData({ content: formData.content + '<ul><li>항목 1</li><li>항목 2</li></ul>' })}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs border border-slate-300 whitespace-nowrap"
                          title="순서 없는 목록"
                        >
                          • 목록
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFormData({ content: formData.content + '<ol><li>항목 1</li><li>항목 2</li></ol>' })}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs border border-slate-300 whitespace-nowrap"
                          title="순서 있는 목록"
                        >
                          1. 목록
                        </button>
                      </div>

                      <div className="w-px h-4 bg-slate-300 flex-shrink-0"></div>

                      {/* 링크 & 이미지 */}
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const { text } = getSelectedText();
                            setLinkText(text || ''); // 선택한 텍스트가 있으면 링크 텍스트로 사용
                            setLinkUrl('');
                            setShowLinkModal(true);
                          }}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs border border-slate-300 whitespace-nowrap"
                          title="링크 삽입 (선택한 텍스트에 링크 적용)"
                        >
                          🔗 링크
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl('');
                            setImageAlt('');
                            setShowImageModal(true);
                          }}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs border border-slate-300 whitespace-nowrap"
                          title="이미지 삽입"
                        >
                          🖼️ 이미지
                        </button>
                      </div>

                      <div className="w-px h-4 bg-slate-300 flex-shrink-0"></div>

                      {/* 문단 */}
                      <button
                        type="button"
                        onClick={() => updateFormData({ content: formData.content + '<p>내용을 입력하세요.</p>' })}
                        className="px-1.5 py-0.5 bg-white hover:bg-slate-200 rounded text-xs border border-slate-300 whitespace-nowrap flex-shrink-0"
                        title="문단 추가"
                      >
                        P 문단
                      </button>
                    </div>

                    <textarea
                      ref={textareaRef}
                      required
                      value={formData.content}
                      onChange={(e) => updateFormData({ content: e.target.value })}
                      className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-b-lg focus:outline-none focus:border-blue-500 resize-y font-mono text-xs min-w-0"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        overflowX: 'hidden',
                        whiteSpace: 'pre-wrap',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        width: '100%',
                        maxHeight: '400px',
                        minHeight: '150px'
                      }}
                      rows={6}
                      placeholder="HTML 형식으로 내용을 입력하거나 위 도구를 사용하세요. 텍스트를 선택한 후 버튼을 클릭하면 선택한 텍스트에 태그가 적용됩니다."
                    />
                  </div>
                ) : (
                  /* 미리보기 탭 (4.2) */
                  <div className="border-2 border-slate-300 rounded-lg p-4 sm:p-6 bg-white min-w-0 max-w-full overflow-y-auto" style={{ maxHeight: '400px', minHeight: '150px' }}>
                    {formData.content ? (
                      <div
                        className="prose prose-slate max-w-none min-w-0"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '100%'
                        }}
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    ) : (
                      <p className="text-slate-400 text-center py-12 text-sm sm:text-base">
                        내용을 입력하면 미리보기가 표시됩니다.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ========================================
                3. 옵션 설정 (4.2)
                ======================================== */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-2 space-y-2 min-w-0 max-w-full">
                <h3 className="font-medium text-slate-800 mb-1 text-xs sm:text-sm">옵션 설정</h3>

                {/* 공개 상태 (라디오 버튼) */}
                <div className="min-w-0">
                  <label className="block text-slate-700 font-medium mb-1 text-xs sm:text-sm">
                    공개 상태 <span className="text-red-600">*</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer min-w-0">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={formData.isPublic === true}
                        onChange={() => updateFormData({ isPublic: true })}
                        className="w-3.5 h-3.5 flex-shrink-0"
                      />
                      <span className="text-slate-700 text-xs sm:text-sm break-words">
                        <span className="font-medium">공개</span> - 사용자에게 표시됨
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer min-w-0">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={formData.isPublic === false}
                        onChange={() => updateFormData({ isPublic: false })}
                        className="w-3.5 h-3.5 flex-shrink-0"
                      />
                      <span className="text-slate-700 text-xs sm:text-sm break-words">
                        <span className="font-medium">비공개</span> - 관리자만 볼 수 있음
                      </span>
                    </label>
                  </div>
                </div>

                {/* 상단 고정 (체크박스) */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="isPinned"
                      checked={formData.isPinned}
                      onChange={(e) => updateFormData({ isPinned: e.target.checked })}
                      className="w-5 h-5 mt-0.5"
                    />
                    <div>
                      <span className="text-slate-700 font-medium">상단에 고정</span>
                      <p className="text-sm text-slate-600 mt-0.5">
                        체크 시 공지사항 목록 상단에 고정 표시되며, 사용자 화면에서도 고정됩니다.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="px-2 py-2 bg-slate-50 rounded-b-lg flex flex-col sm:flex-row gap-2 border-t-2 border-slate-200 flex-shrink-0 min-w-0">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium text-xs sm:text-sm min-w-0"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm min-w-0"
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {notice.id ? '수정 완료' : '작성 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 링크 입력 모달 - form 바깥으로 이동 */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">링크 삽입</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  링크 URL <span className="text-red-600">*</span>
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  링크 텍스트 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="클릭할 텍스트"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!linkUrl || !linkText) {
                    alert('URL과 링크 텍스트를 모두 입력해주세요.');
                    return;
                  }
                  const { start, end } = getSelectedText();
                  const before = formData.content.substring(0, start);
                  const after = formData.content.substring(end);
                  const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
                  updateFormData({ content: before + linkHtml + after });
                  setShowLinkModal(false);
                  setLinkUrl('');
                  setLinkText('');
                  // 커서 위치 조정
                  setTimeout(() => {
                    if (textareaRef.current) {
                      const newPosition = start + linkHtml.length;
                      textareaRef.current.setSelectionRange(newPosition, newPosition);
                      textareaRef.current.focus();
                    }
                  }, 0);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                삽입
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 입력 모달 - form 바깥으로 이동 */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">이미지 삽입</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  이미지 URL <span className="text-red-600">*</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  이미지 설명 (alt 텍스트)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="이미지에 대한 설명"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                  setImageAlt('');
                }}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!imageUrl) {
                    alert('이미지 URL을 입력해주세요.');
                    return;
                  }
                  const { start } = getSelectedText();
                  const before = formData.content.substring(0, start);
                  const after = formData.content.substring(start);
                  const imageHtml = `<img src="${imageUrl}" alt="${imageAlt || '이미지'}" style="max-width: 100%; height: auto;" />`;
                  updateFormData({ content: before + imageHtml + after });
                  setShowImageModal(false);
                  setImageUrl('');
                  setImageAlt('');
                  // 커서 위치 조정
                  setTimeout(() => {
                    if (textareaRef.current) {
                      const newPosition = start + imageHtml.length;
                      textareaRef.current.setSelectionRange(newPosition, newPosition);
                      textareaRef.current.focus();
                    }
                  }, 0);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                삽입
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ========================================
// 공지사항 조회 모달 컴포넌트 (4.3)
// ========================================
/**
 * 플로우: 4.3 공지사항 조회
 * 
 * 1. 공지사항 목록에서 조회 버튼 (👁️) 클릭
 * 2. 모달 표시:
 *    - 제목
 *    - 작성자
 *    - 작성일
 *    - 고정 여부 (고정된 경우 "📌 고정" 배지)
 *    - 공개 상태
 *    - 조회수
 *    - 공지사항 내용 (HTML 렌더링)
 * 3. 우측 상단 "X" 버튼 → 모달 닫기
 * 
 * @참고
 * 이 기능은 관리자가 작성한 공지사항을 확인하는 용도입니다.
 * 사용자가 조회하는 공지사항은 사용자 명세서 10.4에 정의되어 있습니다.
 */
interface NoticeViewModalProps {
  notice: Notice;
  onClose: () => void;
  onEdit: () => void;
}

function NoticeViewModal({ notice, onClose, onEdit }: NoticeViewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* ========================================
            모달 헤더 (4.3)
            ======================================== */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <div className="flex-1">
            {/* 제목 및 배지 */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-medium">{notice.title}</h2>

              {/* 고정 여부 배지 (4.3) */}
              {notice.isPinned && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  고정됨
                </span>
              )}

              {/* 공개 상태 배지 (4.3) */}
              <span className={`px-2 py-1 text-xs rounded-full ${notice.isPublic
                ? 'bg-green-500 text-white'
                : 'bg-slate-400 text-white'
                }`}>
                {notice.isPublic ? '공개' : '비공개'}
              </span>
            </div>

            {/* 작성자, 작성일, 조회수 (4.3) */}
            <div className="flex items-center gap-4 text-slate-200 text-sm">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {notice.author.split('@')[0]}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {notice.createdAt ? (() => {
                  // YYYY-MM-DD 형식으로 변환 (명세서 3.3)
                  const date = new Date(notice.createdAt);
                  if (isNaN(date.getTime())) {
                    return notice.createdAt; // 파싱 실패 시 원본 반환
                  }
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })() : '-'}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                조회 {notice.views.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 닫기 버튼 (4.3) */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ========================================
            공지사항 내용 (HTML 렌더링) (4.3)
            ======================================== */}
        {/**
         * 편집기에서 작성한 HTML 그대로 렌더링
         * - 이미지, 링크 등 모든 요소 정상 표시
         * - prose 스타일 적용 (읽기 편한 타이포그래피)
         * - 고정된 높이로 내용이 길면 스크롤바가 나타남
         */}
        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: '60vh', minHeight: '200px' }}>
          <div
            className="prose prose-slate max-w-none"
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal'
            }}
            dangerouslySetInnerHTML={{ __html: notice.content }}
          />
        </div>

        {/* 모달 푸터 */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-lg flex gap-3 border-t-2 border-slate-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
          >
            닫기
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            수정
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ====================================================================================================
 * 백엔드 API 연동 가이드
 * ====================================================================================================
 * 
 * 1. 공지사항 목록 조회
 * GET /api/admin/notices
 * Response: {
 *   "notices": [
 *     {
 *       "id": "NOT001",
 *       "title": "서비스 ��기 점검 안내",
 *       "content": "<h3>정기 점검 안내</h3>...",
 *       "author": "admin@example.com",
 *       "createdAt": "2025-11-20 10:30",
 *       "updatedAt": "2025-11-20 10:30",
 *       "isPinned": true,
 *       "isPublic": true,
 *       "views": 1245
 *     }
 *   ]
 * }
 * 
 * 2. 공지사항 작성
 * POST /api/admin/notices
 * Request: { "title": "...", "content": "...", "isPinned": false, "isPublic": true }
 * Response: { "id": "NOT004", ... }
 * 
 * 3. 공지사항 수정
 * PUT /api/admin/notices/:id
 * Request: { "title": "...", "content": "...", "isPinned": false, "isPublic": true }
 * 
 * 4. 공지사항 삭제
 * DELETE /api/admin/notices/:id
 * 
 * 5. 고정/해제
 * PATCH /api/admin/notices/:id/pin
 * Request: { "isPinned": true }
 * 
 * 6. 공개/비공개
 * PATCH /api/admin/notices/:id/public
 * Request: { "isPublic": true }
 * 
 * 7. 조회수 증가
 * PATCH /api/admin/notices/:id/view
 * 
 * ====================================================================================================
 */