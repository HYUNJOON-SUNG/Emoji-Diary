/**
 * ========================================
 * 위험 신호 알림 모달 컴포넌트
 * ========================================
 * 
 * [플로우 9.1: 자동 위험 분석]
 * 
 * **트리거**:
 * - 로그인 성공 후 다이어리 메인 화면 진입 시 **한 번만** 실행
 * 
 * **분석 과정**:
 * - 시스템: 관리자가 설정한 모니터링 기간(관리자 명세서 5.2 참조)만큼 최근 일기 데이터 조회
 * - 감정 패턴 분석:
 *   * 연속 부정 감정 일수 계산
 *   * 부정 감정 발생 횟수 계산
 *   * 위험 레벨 판정 (none/low/medium/high)
 * 
 * **위험 레벨 기준**:
 * - 시스템이 관리자가 설정한 기준(관리자 명세서 5.2 참조)에 따라 위험 레벨을 판정합니다
 * - **High**: 관리자가 설정한 High 레벨 판정 기준을 충족하는 경우
 * - **Medium**: 관리자가 설정한 Medium 레벨 판정 기준을 충족하는 경우 (High 기준 미충족 시)
 * - **Low**: 관리자가 설정한 Low 레벨 판정 기준을 충족하는 경우 (High/Medium 기준 미충족 시)
 * - **None**: 위의 기준을 모두 충족하지 않는 경우
 * 
 * [플로우 9.2: 위험 알림 모달 표시]
 * 
 * **조건**:
 * - 위험 레벨이 low 이상인 경우
 * 
 * **표시 시점**: 로그인 성공 후 다이어리 메인 화면 진입 시 **한 번만** 표시
 * - 세션 중에는 다시 표시하지 않음
 * - 로그아웃 후 재로그인 시에만 다시 확인
 * 
 * **모달 내용**:
 * - 위험 레벨별 아이콘 및 색상
 * - 위험 레벨별 메시지:
 *   * High: "위험 신호가 감지되었습니다"
 *   * Medium: "감정 상태를 확인해주세요"
 *   * Low: "감정 돌아보기"
 * - 감지된 위험 신호 이유 목록 표시
 * - High 레벨인 경우: 관리자가 설정한 긴급 상담 기관의 전화번호 표시 (관리자 명세서 5.3의 "긴급 상담 기관으로 표시"로 설정된 기관의 전화번호)
 * 
 * **사용자 선택지**:
 * 1. **"상담 연결 리소스 보기" 버튼**
 *    - 클릭 → 지원 리소스 페이지로 이동
 *    - 모달 닫기
 * 2. **"닫기" 버튼**
 *    - 클릭 → 모달 닫기 (메인 화면 계속 사용)
 * 
 * 알림 설정 비활성화 시:
 * - 위험 레벨이 low 이상이어도 모달 표시 안 함
 * - 사용자가 마이페이지에서 알림 설정을 활성화해야 모달 표시됨
 * 
 * 디자인:
 * - 위험 심각도별 색상 (high: rose, medium: amber, low: blue)
 * - 경고 아이콘 + 제목 + 메시지
 * - 감지된 패턴 표시 (reasons)
 * - 긴급 연락처 (high 레벨만)
 * - 액션 버튼 (도움말 보기, 닫기)
 */

import { AlertTriangle, X, ExternalLink, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RiskAlertModal Props (플로우 9.1, 9.2)
 */
interface RiskAlertModalProps {
  isOpen: boolean; // 모달 표시 여부
  onClose: () => void; // 닫기 콜백
  onViewResources: () => void; // "설정 및 리소스 보기" 클릭 콜백 (지원센터로 이동)
  riskLevel: 'low' | 'medium' | 'high'; // 위험 레벨
  reasons: string[]; // 판정 근거 배열 (예: ["최근 5일 연속으로 부정적인 감정이 기록되었습니다."])
  urgentCounselingPhones?: string[]; // 긴급 상담 전화번호 목록 (High 레벨인 경우, 관리자가 설정한 긴급 상담 기관의 전화번호)
}

export function RiskAlertModal({ isOpen, onClose, onViewResources, riskLevel, reasons, urgentCounselingPhones = [] }: RiskAlertModalProps) {
  /**
   * 위험 레벨별 색상 테마 (플로우 9.1)
   * 
   * 디자인 컨셉:
   * - 위험 심각도에 따른 직관적 색상
   * - High: Rose (긴급/위험) - 빨간색
   * - Medium: Amber (주의/경고) - 노란색/주황색
   * - Low: Blue (참고/알림) - 파란색
   */
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'high':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-400',
          text: 'text-rose-900',
          icon: 'text-rose-600',
          button: 'bg-rose-100 hover:bg-rose-200', // 버튼 배경색: 연한 톤
        };
      case 'medium':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-400',
          text: 'text-amber-900',
          icon: 'text-amber-600',
          button: 'bg-amber-100 hover:bg-amber-200',
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-900',
          icon: 'text-blue-600',
          button: 'bg-blue-100 hover:bg-blue-200',
        };
    }
  };

  const colors = getRiskColor();

  /**
   * 위험 레벨별 제목 (플로우 9.2)
   */
  const getTitle = () => {
    switch (riskLevel) {
      case 'high':
        return '위험 신호가 감지되었습니다';
      case 'medium':
        return '감정 상태를 확인해주세요';
      case 'low':
        return '감정 돌아보기';
    }
  };

  /**
   * 위험 레벨별 메시지 (플로우 9.2)
   */
  const getMessage = () => {
    switch (riskLevel) {
      case 'high':
        return '최근 감정 패턴에서 심각한 위험 신호가 감지되었습니다. 전문가의 도움을 받는 것을 강력히 권장합니다.';
      case 'medium':
        return '최근 부정적인 감정이 지속되고 있습니다. 감정 상태를 돌아보고 필요시 전문가와 상담해보세요.';
      case 'low':
        return '최근 부정적인 감정이 반복되고 있습니다. 잠시 시간을 내어 자신을 돌아보세요.';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-md bg-white border-2 ${colors.border} rounded-2xl shadow-2xl overflow-hidden flex flex-col`}
            style={{ maxHeight: '85%', maxWidth: '95%' }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-lg hover:bg-white/50 transition-colors ${colors.text} min-w-[44px] min-h-[44px] flex items-center justify-center z-10`}
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto scrollbar-hide flex-1" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Icon & Title */}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-white/70 ${colors.icon} flex-shrink-0`}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`mb-2 font-bold ${colors.text}`}>{getTitle()}</h3>
                  <p className={`text-sm ${colors.text}`}>{getMessage()}</p>
                </div>
              </div>

              {/* 
                감지된 패턴 (플로우 9.1)
              */}
              {/* 
                  감지된 패턴 (플로우 9.1)
                  - [수정] 붉은 계열로 표시하여 위험 강조
                */}
              {reasons.length > 0 && (
                <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <p className={`text-xs mb-2 font-semibold ${colors.text}`}>감지된 패턴:</p>
                  <ul className={`space-y-2 text-xs ${colors.text}`}>
                    {reasons.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0">•</span>
                        <span className="flex-1">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 
                긴급 연락처 (플로우 9.2)
                - [수정] 다른 칸과 비슷한 색상 유지 (테마 색상 적용)
              */}
              {riskLevel === 'high' && urgentCounselingPhones.length > 0 && (
                <div className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}>
                  <div className="flex items-start gap-3">
                    {/* [수정] 하트 아이콘도 테마 색상 적용 */}
                    <Heart className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      {/* [수정] 내부 텍스트도 테마 색상 적용 */}
                      <p className={`text-sm mb-2 font-bold ${colors.text}`}>
                        즉시 도움이 필요하시면:
                      </p>
                      <div className={`space-y-1.5 text-xs ${colors.text}`}>
                        {urgentCounselingPhones.map((phone, index) => (
                          <p key={index}>• <strong>{phone}</strong></p>
                        ))}
                        <p className={`mt-2 opacity-80 ${colors.text}`}>※ 24시간 상담 가능</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 
                액션 버튼 (플로우 9.2)
              */}
              <div className="flex gap-2 pt-2">
                {/* 상담 연결 리소스 보기 버튼 (플로우 9.2) */}
                <button
                  onClick={onViewResources}
                  className={`flex-1 py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 font-bold ${colors.button} ${colors.text}`}
                >
                  <ExternalLink className={`w-4 h-4 ${colors.text}`} />
                  <span>상담 연결 리소스 보기</span>
                </button>
                {/* 닫기 버튼 (플로우 9.2) */}
                <button
                  onClick={onClose}
                  // [수정] 닫기 텍스트 색상: 검정색 (text-stone-900)
                  className={`px-6 py-3 bg-white text-stone-900 rounded-lg hover:bg-stone-100 transition-colors text-sm border border-stone-300 font-bold`}
                >
                  닫기
                </button>
              </div>

              {/* Info Text */}
              <p className={`text-xs text-center text-stone-500 pt-2 border-t ${colors.border} opacity-70`}>
                이 알림은 감정 패턴 분석을 바탕으로 제공됩니다.<br />
                전문적인 진단이 필요하면 전문가와 상담하세요.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}