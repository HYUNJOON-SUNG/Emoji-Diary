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
import { X, Pin, Calendar, Loader2 } from 'lucide-react';
import { getNotices, getNoticeById, type Notice } from '../../services/announcementApi';

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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200">
            <div className="flex items-center gap-2">
              {selectedNotice.isPinned && (
                <Pin className="w-5 h-5 text-blue-600 fill-blue-600" />
              )}
              <h3 className="text-lg font-semibold text-stone-800">
                {selectedNotice.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNotice(null)}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedNotice.createdAt)}</span>
            </div>
            {selectedNotice.content ? (
              <div
                className="prose prose-sm max-w-none text-stone-700"
                dangerouslySetInnerHTML={{ __html: selectedNotice.content }}
              />
            ) : (
              <p className="text-stone-500">내용이 없습니다.</p>
            )}
          </div>

          {/* 푸터 */}
          <div className="p-4 border-t border-stone-200">
            <button
              onClick={() => setSelectedNotice(null)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 목록 모달
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-800">공지사항</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
              <span className="ml-2 text-stone-500">공지사항을 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-stone-500">{error}</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-stone-500">등록된 공지사항이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notices.map((notice) => (
                <button
                  key={notice.id}
                  onClick={() => handleNoticeClick(notice.id)}
                  className="w-full text-left p-4 rounded-xl border border-stone-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {notice.isPinned && (
                          <Pin className="w-4 h-4 text-blue-600 fill-blue-600 flex-shrink-0" />
                        )}
                        <h4 className="font-semibold text-stone-800">{notice.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-500">
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

