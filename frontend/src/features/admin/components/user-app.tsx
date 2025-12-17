import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Check, Megaphone } from 'lucide-react';
import { UserNotices } from './user-notices';

interface Notification {
  id: string;
  title: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  priority: 'high' | 'normal';
}

// Mock API to fetch user notifications
const fetchUserNotifications = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get notifications from localStorage (simulating server)
  const stored = localStorage.getItem('user_notifications');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default notifications
  return [
    {
      id: 'N001',
      title: '시스템 점검 안내',
      content: '2025년 11월 25일 새벽 2시부터 4시까지 시스템 점검이 진행됩니다.',
      sentAt: '2025-11-24 10:30',
      isRead: false,
      priority: 'normal' as const
    },
    {
      id: 'N002',
      title: '전문가 상담 안내',
      content: '귀하의 감정 상태를 전문가와 함께 이야기해보세요. 무료 상담이 가능합니다.',
      sentAt: '2025-11-23 15:20',
      isRead: false,
      priority: 'high' as const
    }
  ];
};

/**
 * ====================================================================================================
 * 사용자 앱 미리보기/시뮬레이션 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자 대시보드 내에서 사용자 앱의 UI와 동작을 시뮬레이션하여 확인하는 컴포넌트
 * - 실제 사용자 앱 코드가 아니며, 관리자가 사용자 관점에서 시스템을 점검하기 위한 용도
 * - 유스케이스: 2.5 사용자 앱 미리보기 (관리자용)
 * 
 * @features
 * 1. 알림 시스템 시뮬레이션:
 *    - 관리자가 발송한 알림/공지사항 수신 확인
 *    - 중요 알림 팝업 및 알림 센터 UI 확인
 * 2. 공지사항 조회 (UserNotices 연동):
 *    - 사용자 관점에서의 공지사항 목록 및 상세 조회 확인
 * 3. 모바일 레이아웃 시뮬레이션:
 *    - 모바일 화면 크기에 맞춘 UI 컨테이너 제공
 * 
 * @mock_data
 * - 이 컴포넌트는 내부적으로 Mock API (fetchUserNotifications)를 사용하여 데이터를 로드함
 * - 실제 사용자 앱에서는 실제 API 연동 필요
 * 
 * ====================================================================================================
 */

export function UserApp() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'notices'>('home');

  useEffect(() => {
    loadNotifications();
    
    // Check for high priority notifications on login
    checkForUrgentNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUserNotifications();
      setNotifications(data);
      
      // Store in localStorage
      localStorage.setItem('user_notifications', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForUrgentNotifications = async () => {
    const data = await fetchUserNotifications();
    const urgentUnread = data.filter((n: Notification) => !n.isRead && n.priority === 'high');
    
    if (urgentUnread.length > 0) {
      setShowWelcomeAlert(true);
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('user_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem('user_notifications', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentNotifications = notifications.filter(n => !n.isRead && n.priority === 'high');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6">
      {/* User App Header */}
      <div className="max-w-md mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl text-slate-800">마음일기</h1>
              <p className="text-slate-600 text-sm mt-1">오늘의 감정을 기록하세요</p>
            </div>
            
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-3 bg-orange-100 hover:bg-orange-200 rounded-full transition-colors"
            >
              <Bell className="w-6 h-6 text-orange-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User Info */}
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-rose-50 rounded-lg border border-orange-200">
            <p className="text-slate-700 text-sm mb-1">로그인 사용자</p>
            <p className="text-slate-900 font-medium">김민지 님</p>
          </div>

          {/* Quick Info */}
          {urgentNotifications.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium text-sm mb-1">중요 알림이 있습니다</p>
                  <p className="text-red-600 text-xs">
                    {urgentNotifications.length}개의 중요 알림을 확인해주세요
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Placeholder */}
      <div className="max-w-md mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center gap-2 ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            홈
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex-1 px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center gap-2 ${
              activeTab === 'notices'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            공지사항
          </button>
        </div>

        {/* Content */}
        {activeTab === 'home' ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-slate-600">사용자 앱의 메인 화면입니다.</p>
            <p className="text-slate-500 text-sm mt-2">
              관리자가 발송한 알림은 상단 벨 아이콘을 통해 확인할 수 있습니다.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>공지사항 탭</strong>을 눌러 관리자가 작성한 공지사항을 확인해보세요!
              </p>
            </div>
          </div>
        ) : (
          /* 사용자용 공지사항 컴포넌트 (사용자 명세서 10.4) */
          /* 
            [통합 가이드]
            - 이 컴포넌트는 관리자 대시보드에서 UI 확인용으로만 사용됨
            - 실제 사용자 앱으로 이동 시 UserNotices 컴포넌트를 복사하여 사용
            - API: GET /api/user/notices (공개된 공지사항만 조회)
            - 관리자 대시보드 4.6과 연동 (고정 공지사항이 상단에 표시됨)
          */
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <UserNotices />
          </div>
        )}
      </div>

      {/* Welcome Alert for Urgent Notifications */}
      {showWelcomeAlert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl text-slate-800 mb-2">중요 알림</h3>
              <p className="text-slate-600">
                로그인 시 확인이 필요한 중요 알림이 있습니다.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {urgentNotifications.slice(0, 2).map((notif) => (
                <div key={notif.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800 font-medium text-sm mb-1">{notif.title}</p>
                  <p className="text-red-600 text-xs">{notif.content.substring(0, 60)}...</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWelcomeAlert(false)}
                className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
              >
                나중에 보기
              </button>
              <button
                onClick={() => {
                  setShowWelcomeAlert(false);
                  setShowNotifications(true);
                }}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                지금 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-medium">알림</h2>
                  <p className="text-orange-100 text-sm">
                    {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 알림` : '모두 읽음'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <div className="px-6 py-3 bg-orange-50 border-b border-orange-100">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  모두 읽음으로 표시
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[calc(80vh-180px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-slate-600 text-sm">알림을 불러오는 중...</p>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">알림이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notif.isRead ? 'bg-orange-50/50' : ''
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {notif.priority === 'high' ? (
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Bell className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`font-medium text-slate-800 ${!notif.isRead ? 'font-bold' : ''}`}>
                              {notif.title}
                            </p>
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2"></span>
                            )}
                          </div>
                          
                          <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                            {notif.content}
                          </p>
                          
                          <p className="text-slate-400 text-xs">{notif.sentAt}</p>
                          
                          {notif.priority === 'high' && (
                            <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              중요 알림
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}