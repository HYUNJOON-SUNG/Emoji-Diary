import { useState } from 'react';
import { X, UserCheck, Send, AlertCircle } from 'lucide-react';

interface ExpertReferralModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    riskScore: number;
  };
  onClose: () => void;
}

/**
 * ====================================================================================================
 * 전문가 연계 요청 모달 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 고위험군 사용자를 전문가(상담사, 의사 등)에게 연계 요청하는 모달
 * - 유스케이스: 3.3 전문가 연계 관리
 * - 플로우: 위험 관리 플로우
 * 
 * @features
 * 1. 사용자 정보 요약 표시:
 *    - 이름, ID, 현재 위험 점수 확인
 * 2. 전문가 유형 선택:
 *    - 상담사, 심리학자, 정신과 의사 중 선택
 * 3. 긴급도 설정:
 *    - High, Medium, Low 중 선택
 * 4. 추가 메모 입력:
 *    - 전문가에게 전달할 특이사항 작성
 * 5. 확인 절차:
 *    - 연계 요청 전 최종 확인 모달 표시 (실수 방지)
 * 
 * @props
 * - user: 대상 사용자 정보 객체 { id, name, email, riskScore }
 * - onClose: 모달 닫기 핸들러
 * 
 * ====================================================================================================
 */

export function ExpertReferralModal({ user, onClose }: ExpertReferralModalProps) {
  const [expertType, setExpertType] = useState<'psychologist' | 'counselor' | 'psychiatrist'>('counselor');
  const [urgency, setUrgency] = useState<'high' | 'medium' | 'low'>('medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmReferral = async () => {
    setIsSubmitting(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert(`${user.name}님에 대한 전문가 연계 요청이 성공적으로 전송되었습니다.`);
    setIsSubmitting(false);
    setShowConfirm(false);
    onClose();
  };

  const getExpertLabel = (type: string) => {
    switch (type) {
      case 'psychologist': return '심리학자';
      case 'counselor': return '상담사';
      case 'psychiatrist': return '정신과 의사';
      default: return '';
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'high': return '긴급';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-4 flex items-center justify-between rounded-t-lg border-b-4 border-purple-700">
            <div>
              <h2 className="text-xl flex items-center gap-2">
                <UserCheck className="w-6 h-6" />
                전문가 연계 요청
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                {user.name}님을 전문가에게 연계합니다
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-500 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info Summary */}
          <div className="p-6 bg-red-50 border-b-2 border-red-200">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-slate-800 font-medium">대상 사용자: {user.name} ({user.id})</p>
                <p className="text-red-600 text-sm">위험 점수: <span className="font-bold">{user.riskScore}</span> - 전문가 상담이 필요합니다</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Expert Type Selection */}
            <div className="mb-6">
              <label className="block text-slate-700 mb-3 font-medium">
                전문가 유형 선택
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setExpertType('counselor')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    expertType === 'counselor'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-medium text-slate-800">상담사</p>
                    <p className="text-xs text-slate-600 mt-1">일반 상담</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setExpertType('psychologist')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    expertType === 'psychologist'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-medium text-slate-800">심리학자</p>
                    <p className="text-xs text-slate-600 mt-1">심리 평가</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setExpertType('psychiatrist')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    expertType === 'psychiatrist'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-medium text-slate-800">정신과 의사</p>
                    <p className="text-xs text-slate-600 mt-1">전문 치료</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Urgency Level */}
            <div className="mb-6">
              <label className="block text-slate-700 mb-3 font-medium">
                긴급도
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgency('high')}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    urgency === 'high'
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <p className="font-medium text-slate-800 text-center">긴급</p>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency('medium')}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    urgency === 'medium'
                      ? 'border-yellow-500 bg-yellow-50 shadow-md'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <p className="font-medium text-slate-800 text-center">보통</p>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency('low')}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    urgency === 'low'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <p className="font-medium text-slate-800 text-center">낮음</p>
                </button>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-slate-700 mb-2 font-medium">
                추가 메모 (선택사항)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="전문가에게 전달할 추가 정보를 입력하세요"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-slate-500 text-sm mt-1">{notes.length}/500자</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
              >
                연계 요청
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl text-slate-800 mb-2">전문가 연계 요청 확인</h3>
              <p className="text-slate-600">
                다음 내용으로 전문가 연계를 요청하시겠습니까?
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-slate-600 text-sm">
                <span className="font-medium">대상 사용자:</span> {user.name} ({user.id})
              </p>
              <p className="text-slate-600 text-sm">
                <span className="font-medium">전문가 유형:</span> {getExpertLabel(expertType)}
              </p>
              <p className="text-slate-600 text-sm">
                <span className="font-medium">긴급도:</span> {getUrgencyLabel(urgency)}
              </p>
              {notes && (
                <p className="text-slate-600 text-sm">
                  <span className="font-medium">메모:</span> {notes.substring(0, 50)}{notes.length > 50 ? '...' : ''}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirmReferral}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting ? '요청 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
