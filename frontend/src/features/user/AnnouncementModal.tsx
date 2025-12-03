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
import { getAnnouncements, getAnnouncementById, Announcement } from '../../services/announcementApi';

interface AnnouncementModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
}

export function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 공지사항 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadAnnouncements();
    } else {
      // 모달이 닫힐 때 상태 초기화
      setAnnouncements([]);
      setSelectedAnnouncement(null);
      setError(null);
    }
  }, [isOpen]);

  const loadAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError('공지사항을 불러오지 못했습니다.');
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementClick = async (id: string) => {
    try {
      const announcement = await getAnnouncementById(id);
      setSelectedAnnouncement(announcement);
    } catch (err) {
      setError('공지사항을 불러오지 못했습니다.');
      console.error('Failed to load announcement:', err);
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
  if (selectedAnnouncement) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200">
            <div className="flex items-center gap-2">
              {selectedAnnouncement.isPinned && (
                <Pin className="w-5 h-5 text-blue-600 fill-blue-600" />
              )}
              <h3 className="text-lg font-semibold text-stone-800">
                {selectedAnnouncement.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedAnnouncement.createdAt)}</span>
            </div>
            <div
              className="prose prose-sm max-w-none text-stone-700"
              dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
            />
          </div>

          {/* 푸터 */}
          <div className="p-4 border-t border-stone-200">
            <button
              onClick={() => setSelectedAnnouncement(null)}
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
          ) : announcements.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-stone-500">등록된 공지사항이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {announcements.map((announcement) => (
                <button
                  key={announcement.id}
                  onClick={() => handleAnnouncementClick(announcement.id)}
                  className="w-full text-left p-4 rounded-xl border border-stone-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.isPinned && (
                          <Pin className="w-4 h-4 text-blue-600 fill-blue-600 flex-shrink-0" />
                        )}
                        <h4 className="font-semibold text-stone-800">{announcement.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(announcement.createdAt)}</span>
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

