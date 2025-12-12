/**
 * ========================================
 * 공지사항 페이지 컴포넌트
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Pin, Calendar, Loader2, FileText, X } from 'lucide-react';
import { getNotices, getNoticeById, type Notice } from '../../services/announcementApi';

interface AnnouncementPageProps {
    /** 뒤로가기 핸들러 */
    onBack: () => void;
}

export function AnnouncementPage({ onBack }: AnnouncementPageProps) {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 공지사항 목록 로드
    useEffect(() => {
        loadNotices();
    }, []);

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

    // 상세 보기 화면
    if (selectedNotice) {
        return (
            <div className="flex flex-col h-full w-full bg-[#FAFAF9] dark:bg-stone-950">
                {/* 헤더 */}
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-white/10 px-4 py-3 flex items-center justify-between shadow-sm">
                    <button
                        onClick={() => setSelectedNotice(null)}
                        className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-300"
                        aria-label="목록으로"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100 truncate max-w-[200px]">
                        {selectedNotice.title}
                    </h1>
                    <div className="w-10" /> {/* 밸런스용 여백 */}
                </div>

                {/* 내용 */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-5 pb-20">
                    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-5">
                        <div className="flex flex-col gap-2 border-b border-stone-200 dark:border-stone-800 pb-4">
                            <div className="flex items-center gap-3">
                                {selectedNotice.isPinned && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg mb-1">
                                        <Pin className="w-3 h-3 fill-current" />
                                        고정
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                                {selectedNotice.title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(selectedNotice.createdAt)}</span>
                            </div>
                        </div>

                        <div className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-img:rounded-xl">
                            {selectedNotice.content ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selectedNotice.content}
                                </ReactMarkdown>
                            ) : (
                                <p className="text-stone-500 italic">내용이 없습니다.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 목록 화면
    return (
        <div className="flex flex-col h-full w-full bg-[#FAFAF9] dark:bg-stone-950">
            {/* 헤더 */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-white/10 px-4 py-3 flex items-center justify-between shadow-sm">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-300"
                    aria-label="뒤로가기"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    공지사항
                </h1>
                <div className="w-10" />
            </div>

            {/* 목록 내용 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-4 pb-20">
                <div className="max-w-2xl mx-auto space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            <span className="text-stone-500 dark:text-stone-400 font-medium">공지사항을 불러오는 중...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                                <X className="w-6 h-6 text-rose-500" />
                            </div>
                            <p className="text-rose-500 dark:text-rose-400 font-medium">{error}</p>
                        </div>
                    ) : notices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-stone-500 dark:text-stone-400">
                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                            <p>등록된 공지사항이 없습니다.</p>
                        </div>
                    ) : (
                        notices.map((notice, index) => (
                            <button
                                key={notice.id}
                                onClick={() => handleNoticeClick(notice.id)}
                                className="w-full text-left p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group animate-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            {notice.isPinned && (
                                                <div className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                                    <Pin className="w-3 h-3 fill-current" />
                                                    고정
                                                </div>
                                            )}
                                            {/* 날짜 배지 */}
                                            <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
                                                {formatDate(notice.createdAt)}
                                            </span>
                                        </div>
                                        <h3 className={`text-base font-bold truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors ${notice.isPinned ? 'text-stone-900 dark:text-stone-100' : 'text-stone-700 dark:text-stone-300'}`}>
                                            {notice.title}
                                        </h3>
                                    </div>
                                    <div className="self-center">
                                        <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
