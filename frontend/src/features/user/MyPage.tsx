/**
 * ========================================
 * 마이페이지 컴포넌트
 * ========================================
 * 
 * 주요 기능 (모바일 웹 최적화):
 * - 사용자 정보 확인 (이메일, 이름)
 * - 알림 설정 (위험 신호 알림 활성화/비활성화)
 * - AI 코멘트 말투 변경 (페르소나 선택)
 * - 공지사항 조회 및 비밀번호 변경
 * - 계정 탈퇴
 * 
 * 변경 사항 (모바일):
 * - 좌우 2페이지 레이아웃 → 단일 세로 스크롤 레이아웃
 * - 섹션별 카드 형태로 정리 (프로필, 설정, 계정 관리)
 * - 비밀번호 변경 등은 아코디언 또는 모달 대신 인라인 확장 형태로 간소화
 */

import { useState, useEffect } from 'react';
import { UserCircle, Mail, Lock, Bell, BellOff, Sparkles, Heart, FileText, LogOut, ChevronRight, UserX, AlertTriangle, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getCurrentUser, changePassword, updateNotification, User as UserType, deleteAccount } from '../../services/authApi';
import { PERSONAS } from './PersonaSelectionModal';
import { AnnouncementModal } from './AnnouncementModal';

interface MyPageProps {
  onBack?: () => void;
  onUserUpdate?: (user: { name: string; email: string }) => void;
  onAccountDeleted: () => void;
  onGoToSupport?: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
  onLogout?: () => void;
}

export function MyPage({ onAccountDeleted, onGoToSupport, onModalStateChange, onLogout }: MyPageProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI States
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState('');

  // Persona
  const [currentPersona, setCurrentPersona] = useState('friend');

  useEffect(() => {
    loadUserInfo();
    const savedPersona = localStorage.getItem('aiPersona');
    if (savedPersona) setCurrentPersona(savedPersona);
  }, []);

  useEffect(() => {
    if (onModalStateChange) onModalStateChange(showPersonaModal);
  }, [showPersonaModal, onModalStateChange]);

  const loadUserInfo = async () => {
    setIsLoading(true);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError('사용자 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotification = async () => {
    if (!user) return;
    try {
      const updatedUser = await updateNotification({ notificationEnabled: !user.notificationEnabled });
      setUser(updatedUser);
      setSuccess(updatedUser.notificationEnabled ? '알림이 켜졌습니다.' : '알림이 꺼졌습니다.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('설정 변경 실패');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('모든 항목을 입력해주세요.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess('비밀번호가 변경되었습니다.');
      setShowPasswordEdit(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setPasswordError('비밀번호 변경 실패. 현재 비밀번호를 확인해주세요.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      onAccountDeleted();
    } catch (err) {
      setError('계정 탈퇴 실패');
    }
  };

  const handlePersonaSelect = (id: string) => {
    setCurrentPersona(id);
    localStorage.setItem('aiPersona', id);
    setShowPersonaModal(false);
    setSuccess('말투가 변경되었습니다.');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (isLoading && !user) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!user) return null;

  return (
    <div className="h-full flex flex-col space-y-4 pb-6">
      {/* Header */}
      <div className="text-center space-y-1 pb-2 border-b border-stone-200/60">
        <div className="flex items-center justify-center gap-2 text-blue-700">
          <UserCircle className="w-5 h-5" />
          <span className="font-bold">마이페이지</span>
        </div>
      </div>

      {/* Messages */}
      {success && <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-xs text-center animate-in fade-in zoom-in">{success}</div>}
      {error && <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded-lg text-xs text-center animate-in fade-in zoom-in">{error}</div>}

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        
        {/* Profile Section */}
        <section className="bg-white rounded-xl border border-stone-200 p-4 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-stone-700 mb-2">내 정보</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <UserCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">{user.name}</p>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
          </div>
        </section>

        {/* Settings Section */}
        <section className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <h3 className="text-sm font-bold text-stone-700 p-4 pb-2">설정</h3>
          
          {/* Notification Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              {user.notificationEnabled ? <Bell className="w-4 h-4 text-blue-600" /> : <BellOff className="w-4 h-4 text-stone-400" />}
              <span className="text-sm text-stone-700">위험 알림 받기</span>
            </div>
            <button 
              onClick={handleToggleNotification}
              className={`w-10 h-6 rounded-full transition-colors relative ${user.notificationEnabled ? 'bg-blue-600' : 'bg-stone-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${user.notificationEnabled ? 'translate-x-4' : ''}`} />
            </button>
          </div>

          {/* Persona Setting */}
          <button 
            onClick={() => setShowPersonaModal(true)}
            className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <div>
                <span className="text-sm text-stone-700 block">AI 말투 설정</span>
                <span className="text-xs text-stone-400">
                  현재: {PERSONAS.find(p => p.id === currentPersona)?.name || '베프'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* Password Change Accordion */}
          <div className="border-b border-stone-100">
            <button 
              onClick={() => setShowPasswordEdit(!showPasswordEdit)}
              className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-stone-500" />
                <span className="text-sm text-stone-700">비밀번호 변경</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${showPasswordEdit ? 'rotate-90' : ''}`} />
            </button>
            
            {showPasswordEdit && (
              <div className="p-4 bg-stone-50 space-y-3 animate-in slide-in-from-top-2">
                {['current', 'new', 'confirm'].map((field) => (
                  <div key={field} className="relative">
                    <input
                      type={showPasswords[field as keyof typeof showPasswords] ? 'text' : 'password'}
                      placeholder={
                        field === 'current' ? '현재 비밀번호' :
                        field === 'new' ? '새 비밀번호 (8자 이상)' : '새 비밀번호 확인'
                      }
                      value={
                        field === 'current' ? currentPassword :
                        field === 'new' ? newPassword : confirmNewPassword
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (field === 'current') setCurrentPassword(val);
                        else if (field === 'new') setNewPassword(val);
                        else setConfirmNewPassword(val);
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:border-blue-500 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, [field]: !prev[field as keyof typeof showPasswords] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                    >
                      {showPasswords[field as keyof typeof showPasswords] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
                {passwordError && <p className="text-xs text-rose-600">{passwordError}</p>}
                <button 
                  onClick={handleChangePassword}
                  className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"
                >
                  변경하기
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Support & Info */}
        <section className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <button 
            onClick={onGoToSupport}
            className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="text-sm text-stone-700">도움말 & 지원 리소스</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button 
            onClick={() => setShowAnnouncementModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-stone-700">공지사항</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </section>

        {/* Logout Button */}
        <div className="pt-2">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors text-stone-700"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="pt-4">
          <button 
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="w-full py-3 text-xs text-stone-400 hover:text-rose-600 transition-colors flex items-center justify-center gap-1"
          >
            <UserX className="w-3 h-3" />
            계정 탈퇴
          </button>
          
          {showDeleteConfirm && (
            <div className="mt-2 p-4 bg-rose-50 border border-rose-100 rounded-xl animate-in slide-in-from-bottom-2 text-center">
              <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
              <p className="text-xs text-rose-800 mb-3 font-medium">
                정말로 탈퇴하시겠습니까?<br/>
                모든 데이터가 영구적으로 삭제됩니다.
              </p>
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 text-xs rounded-lg"
                >
                  취소
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  className="px-3 py-1.5 bg-rose-600 text-white text-xs rounded-lg hover:bg-rose-700"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-10">
            <h3 className="text-lg font-bold text-stone-800 text-center">AI 말투 선택</h3>
            <div className="grid grid-cols-2 gap-3">
              {PERSONAS.map(persona => (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaSelect(persona.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currentPersona === persona.id 
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{persona.icon}</div>
                  <div className="font-medium text-sm text-stone-800">{persona.name}</div>
                  <div className="text-[10px] text-stone-500">{persona.style}</div>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowPersonaModal(false)}
              className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {showAnnouncementModal && (
        <AnnouncementModal 
          isOpen={showAnnouncementModal} 
          onClose={() => setShowAnnouncementModal(false)} 
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <LogOut className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-800 text-center">로그아웃 하시겠습니까?</h3>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}