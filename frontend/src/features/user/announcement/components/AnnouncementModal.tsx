/**
 * ========================================
 * 공지사항 모달 컴포넌트
 * ========================================
 * 
 * [플로우 10.4: 공지사항 조회]
 * 
 * 기능:
 * - 공지사항 목록 표시
 * - 공지사항 상세 보기
 * - 고정된 공지사항 상단 표시
 * - 최신순 정렬
 */

import { useState, useEffect } from 'react';
import { X, Pin, Calendar, Loader2, FileText } from 'lucide-react';
import { getNotices, getNoticeById, type Notice } from '@/features/user/announcement/api/announcementApi';

interface AnnouncementModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
}

export function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 공지사항 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadNotices();
    } else {
      // 모달이 닫힐 때 상태 초기화
      setNotices([]);
      setSelectedNotice(null);
      setError(null);
    }
  }, [isOpen]);

  const loadNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotices(1, 10);
      setNotices(result.notices);
    } catch (err) {
      setError('공지사항을 불러오지 못했습니다.');
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeClick = async (noticeId: number) => {
    try {
      const notice = await getNoticeById(noticeId);
      setSelectedNotice(notice);
    } catch (err) {
      setError('공지사항을 불러오지 못했습니다.');
      console.error('Failed to load notice:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  // 상세 보기 모달
  if (selectedNotice) {
    return (
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-white/20 ring-1 ring-black/5">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-5 border-b border-stone-200/50 dark:border-white/10">
            <div className="flex items-center gap-3">
              {selectedNotice.isPinned && (
                <Pin className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              )}
              <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
                {selectedNotice.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNotice(null)}
              className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors text-stone-500 dark:text-stone-400"
              aria-label="닫기"
              title="닫기"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 overflow-y-auto scrollbar-hide max-h-[60vh]">
            <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-6">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedNotice.createdAt)}</span>
            </div>
            {selectedNotice.content ? (
              <div
                className="prose prose-sm max-w-none text-stone-700 dark:text-stone-300 prose-headings:text-emerald-900 dark:prose-headings:text-emerald-100 prose-a:text-emerald-600 dark:prose-a:text-emerald-400"
                dangerouslySetInnerHTML={{ __html: selectedNotice.content }}
              />
            ) : (
              <p className="text-stone-500 dark:text-stone-400">내용이 없습니다.</p>
            )}
          </div>

          {/* 푸터 */}
          <div className="p-5 border-t border-stone-200/50 dark:border-white/10 bg-stone-50/50 dark:bg-black/20">
            <button
              onClick={() => setSelectedNotice(null)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 목록 모달
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-white/20 ring-1 ring-black/5">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200/50 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">공지사항</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors text-stone-500 dark:text-stone-400"
            aria-label="닫기"
            title="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 overflow-y-auto scrollbar-hide max-h-[60vh] bg-stone-50/30 dark:bg-black/10">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <span className="ml-3 text-stone-500 dark:text-stone-400 font-medium">공지사항을 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-rose-500 dark:text-rose-400 font-medium">{error}</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-stone-500 dark:text-stone-400">
              <FileText className="w-12 h-12 mb-3 opacity-20" />
              <p>등록된 공지사항이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((notice) => (
                <button
                  key={notice.id}
                  onClick={() => handleNoticeClick(notice.id)}
                  className="w-full text-left p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {notice.isPinned && (
                          <Pin className="w-4 h-4 text-emerald-500 fill-emerald-500 flex-shrink-0" />
                        )}
                        <h4 className={`text-lg font-bold group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors ${notice.isPinned ? 'text-emerald-900 dark:text-emerald-100' : 'text-stone-800 dark:text-stone-200'}`}>
                          {notice.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(notice.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

