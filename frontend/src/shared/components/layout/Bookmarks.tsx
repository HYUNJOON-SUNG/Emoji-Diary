/**
 * ========================================
 * 북마크 네비게이션 컴포넌트
 * ========================================
 * 
 * [플로우 11: 로그아웃 플로우]
 * 
 * **플로우 11.1: 로그아웃 실행**
 * 
 * **경로**: 북마크 네비게이션 "로그아웃" 버튼 클릭
 * 
 * **프로세스**:
 * 1. 로그아웃 확인 모달 표시
 * 2. "로그아웃" 확인 → 토큰 삭제, 사용자 데이터 삭제
 * 3. 랜딩 페이지로 이동
 * 4. "취소" → 모달 닫기
 * 
 * [플로우 12: 네비게이션 플로우]
 * 
 * **플로우 12.1: 북마크 네비게이션**
 * 
 * **화면**: 모든 메인 화면 우측 상단에 북마크 표시
 * 
 * **북마크 버튼**:
 * 1. **홈** (파란색)
 *    - 클릭 → 캘린더 메인 화면으로 이동
 * 2. **감정 통계** (하늘색)
 *    - 클릭 → 감정 통계 페이지로 이동
 * 3. **일기 검색** (청록색)
 *    - 클릭 → 일기 검색 페이지로 이동
 * 4. **마이페이지** (남색)
 *    - 클릭 → 마이페이지로 이동
 * 5. **로그아웃** (회색)
 *    - 클릭 → 로그아웃 확인 모달 → 로그아웃 처리
 * 
 * 주요 기능:
 * - 다이어리 주요 화면 이동 버튼 (책갈피 스타일)
 * - 5개 주요 기능으로 빠른 이동
 * - 로그아웃 확인 모달
 * 
 * 디자인:
 * - 책갈피 모양 (상단에서 내려온 형태)
 * - 그라데이션 배경 (3단계: from → via → to)
 * - 호버 시 애니메이션 (-translate-y-1 → translate-y-0)
 * - 파란색 계열 톤온톤 색상 (명세서 요구사항)
 * - 아이콘 + 그림자 효과
 */

import { useState } from 'react';
import { Home, UserCircle, LogOut, Activity, Search } from 'lucide-react';

/**
 * Bookmarks 컴포넌트 Props (플로우 12.1)
 */
interface BookmarksProps {
  onHomeClick?: () => void; // 홈(캘린더) 이동 (플로우 12.1)
  onStatsClick?: () => void; // 감정 통계 이동 (플로우 7.1, 12.1)
  onSearchClick?: () => void; // 일기 검색 이동 (플로우 6.1, 12.1)
  onProfileClick?: () => void; // 마이페이지 이동 (플로우 10.1, 12.1)
  onLogoutClick?: () => void; // 로그아웃 (플로우 11.1, 12.1)
}

export function Bookmarks({ onHomeClick, onStatsClick, onSearchClick, onProfileClick, onLogoutClick }: BookmarksProps) {
  /**
   * 로그아웃 확인 모달 표시 여부 (플로우 11.1)
   */
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /**
   * 로그아웃 버튼 클릭 핸들러 (플로우 11.1)
   * 
   * 동작:
   * 1. "로그아웃" 북마크 버튼 클릭
   * 2. showLogoutConfirm을 true로 변경
   * 3. 로그아웃 확인 모달 표시
   */
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  /**
   * 로그아웃 확인 핸들러 (플로우 11.1)
   * 
   * 동작:
   * 1. 모달에서 "로그아웃" 버튼 클릭
   * 2. showLogoutConfirm을 false로 변경 (모달 닫기)
   * 3. onLogoutClick() 콜백 실행
   * 4. DiaryBook → App → 로그아웃 처리
   * 5. 토큰 삭제
   * 6. 사용자 데이터 삭제
   * 7. 랜딩 페이지로 이동
   */
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogoutClick) {
      onLogoutClick();
    }
  };

  return (
    <>
      <div className="absolute top-0 right-12 flex gap-1 z-20">
        {/* 
          홈 북마크 (플로우 12.1)
          
          색상: Blue 500 (파란색)
          아이콘: Home (집 모양)
          
          동작:
          - 클릭 시 onHomeClick 콜백 호출
          - DiaryBook에서 handleGoHome 실행
          - navigateWithCheck('calendar') 호출
          - 작성/수정 중이면 경고 모달 표시 (플로우 3.5, 4.4)
          - 작성/수정 중이 아니면 캘린더 화면으로 즉시 이동
          
          플로우 12.1 요구사항:
          - 모든 메인 화면 우측 상단에 표시
          - 클릭 → 캘린더 메인 화면으로 이동
        */}
        <button
          onClick={onHomeClick}
          className="relative group"
          title="홈으로"
        >
          <div className="w-10 h-12 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-b-lg shadow-lg transform -translate-y-1 transition-all group-hover:translate-y-0">
            <div className="absolute inset-0 bg-white/20 rounded-b-lg" />
            <div className="relative flex items-start justify-center pt-1.5">
              <Home className="w-4 h-4 text-white drop-shadow" />
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-blue-700/50 blur-sm rounded-full" />
        </button>

        {/* 
          감정 통계 북마크 (플로우 7.1, 12.1)
          
          색상: Sky 500 (하늘색)
          아이콘: Activity (막대 그래프)
          
          동작:
          - 클릭 시 onStatsClick 콜백 호출
          - DiaryBook에서 handleGoToStats 실행
          - navigateWithCheck('stats') 호출
          - 작성/수정 중이면 경고 모달 표시 (플로우 3.5, 4.4)
          - 작성/수정 중이 아니면 감정 통계 화면으로 즉시 이동
          - EmotionStatsPage 컴포넌트 표시 (감정 통계 화면)
          
          플로우 7.1 요구사항:
          - 경로: 북마크 네비게이션 "감정 통계" 버튼 클릭
          - 화면: 감정 통계 페이지 (좌우 2페이지)
          
          플로우 12.1 요구사항:
          - 색상: 하늘색
          - 클릭 → 감정 통계 페이지로 이동
        */}
        <button
          onClick={onStatsClick}
          className="relative group"
          title="감정 통계"
        >
          <div className="w-10 h-12 bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 rounded-b-lg shadow-lg transform -translate-y-1 transition-all group-hover:translate-y-0">
            <div className="absolute inset-0 bg-white/20 rounded-b-lg" />
            <div className="relative flex items-start justify-center pt-1.5">
              <Activity className="w-4 h-4 text-white drop-shadow" />
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-sky-700/50 blur-sm rounded-full" />
        </button>

        {/* 
          일기 검색 북마크 (플로우 6.1, 12.1)
          
          색상: Cyan 500 (청록색)
          아이콘: Search (돋보기)
          
          동작:
          - 클릭 시 onSearchClick 콜백 호출
          - DiaryBook에서 handleGoToList 실행
          - navigateWithCheck('list') 호출
          - 작성/수정 중이면 경고 모달 표시 (플로우 3.5, 4.4)
          - 작성/수정 중이 아니면 검색 화면으로 즉시 이동
          - DiaryListPage 컴포넌트 표시 (검색 화면)
          
          플로우 6.1 요구사항:
          - 북마크 네비게이션 "일기 검색" 버튼 클릭
          - 일기 검색 및 목록 페이지로 이동
          
          플로우 12.1 요구사항:
          - 색상: 청록색
          - 클릭 → 일기 검색 페이지로 이동
        */}
        <button
          onClick={onSearchClick}
          className="relative group"
          title="일기 검색"
        >
          <div className="w-10 h-12 bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-600 rounded-b-lg shadow-lg transform -translate-y-1 transition-all group-hover:translate-y-0">
            <div className="absolute inset-0 bg-white/20 rounded-b-lg" />
            <div className="relative flex items-start justify-center pt-1.5">
              <Search className="w-4 h-4 text-white drop-shadow" />
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-cyan-700/50 blur-sm rounded-full" />
        </button>

        {/* 
          마이페이지 북마크 (플로우 10.1, 12.1)
          
          색상: Indigo 500 (남색)
          아이콘: UserCircle (사용자 프로필)
          
          동작:
          - 클릭 시 onProfileClick 콜백 호출
          - DiaryBook에서 handleGoToMyPage 실행
          - navigateWithCheck('mypage') 호출
          - 작성/수정 중이면 경고 모달 표시 (플로우 3.5, 4.4)
          - 작성/수정 중이 아니면 마이페이지로 즉시 이동
          - MyPage 컴포넌트 표시 (마이페이지)
          
          플로우 10.1 요구사항:
          - 경로: 북마크 네비게이션 "마이페이지" 버튼 클릭
          - 화면: 마이페이지 (좌우 2페이지)
          
          플로우 12.1 요구사항:
          - 색상: 남색
          - 클릭 → 마이페이지로 이동
        */}
        <button
          onClick={onProfileClick}
          className="relative group"
          title="마이페이지"
        >
          <div className="w-10 h-12 bg-gradient-to-b from-indigo-400 via-indigo-500 to-indigo-600 rounded-b-lg shadow-lg transform -translate-y-1 transition-all group-hover:translate-y-0">
            <div className="absolute inset-0 bg-white/20 rounded-b-lg" />
            <div className="relative flex items-start justify-center pt-1.5">
              <UserCircle className="w-4 h-4 text-white drop-shadow" />
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-indigo-700/50 blur-sm rounded-full" />
        </button>

        {/* 
          로그아웃 북마크 (플로우 11.1, 12.1)
          
          색상: Slate 500 (회색)
          아이콘: LogOut (나가기 화살표)
          
          동작 (플로우 11.1):
          1. 클릭 시 handleLogoutClick() 실행
          2. showLogoutConfirm을 true로 변경
          3. 로그아웃 확인 모달 표시:
             - "로그아웃 하시겠어요?"
             - "다시 로그인하여 계속 사용하실 수 있어요"
          4. "취소" 버튼 → 모달 닫기
          5. "로그아웃" 버튼 → handleConfirmLogout() 실행
             - onLogoutClick() 콜백 호출
             - DiaryBook → App → 로그아웃 처리
             - 토큰 삭제 (localStorage.removeItem('token'))
             - 사용자 데이터 삭제
             - 랜딩 페이지로 이동
          
          플로우 11.1 요구사항:
          - 경로: 북마크 네비게이션 "로그아웃" 버튼 클릭
          - 프로세스:
            1. 로그아웃 확인 모달 표시
            2. "로그아웃" 확인 → 토큰 삭제, 사용자 데이터 삭제
            3. 랜딩 페이지로 이동
            4. "취소" → 모달 닫기
          
          플로우 12.1 요구사항:
          - 색상: 회색
          - 클릭 → 로그아웃 확인 모달 → 로그아웃 처리
        */}
        <button
          onClick={handleLogoutClick}
          className="relative group"
          title="로그아웃"
        >
          <div className="w-10 h-12 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 rounded-b-lg shadow-lg transform -translate-y-1 transition-all group-hover:translate-y-0">
            <div className="absolute inset-0 bg-white/20 rounded-b-lg" />
            <div className="relative flex items-start justify-center pt-1.5">
              <LogOut className="w-4 h-4 text-white drop-shadow" />
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-slate-700/50 blur-sm rounded-full" />
        </button>
      </div>

      {/* 
        로그아웃 확인 모달 (플로우 11.1)
        
        표시 조건:
        - showLogoutConfirm = true (로그아웃 버튼 클릭 시)
        
        UI:
        - 배경: 반투명 회색 + 블러 효과
        - 카드: 흰색 배경, 둥근 모서리
        - 아이콘: LogOut (회색 원형 배경)
        - 제목: "로그아웃 하시겠어요?"
        - 설명: "다시 로그인하여 계속 사용하실 수 있어요"
        
        버튼:
        1. "취소" (플로우 11.1):
           - setShowLogoutConfirm(false)
           - 모달 닫기
           - 현재 화면으로 복귀
        
        2. "로그아웃" (플로우 11.1):
           - handleConfirmLogout() 실행
           - onLogoutClick() 콜백 호출
           - DiaryBook → App → 로그아웃 처리
           - 토큰 삭제 (localStorage.removeItem('token'))
           - 사용자 데이터 삭제
           - 랜딩 페이지로 이동
      */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                <LogOut className="w-7 h-7 text-slate-600" />
              </div>
            </div>
            <h3 className="text-slate-800 text-center mb-2">로그아웃 하시겠어요?</h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              다시 로그인하여 계속 사용하실 수 있어요
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}