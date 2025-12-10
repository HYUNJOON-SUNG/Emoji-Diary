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
 * 1. **"도움말 & 리소스 보기" 버튼**
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
 * - 파란색 톤온톤 색상 (high: cyan, medium: sky, low: blue)
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
  onViewResources: () => void; // "도움말 & 리소스 보기" 클릭 콜백 (지원센터로 이동)
  riskLevel: 'low' | 'medium' | 'high'; // 위험 레벨
  reasons: string[]; // 판정 근거 배열 (예: ["최근 5일 연속으로 부정적인 감정이 기록되었습니다."])
  urgentCounselingPhones?: string[]; // 긴급 상담 전화번호 목록 (High 레벨인 경우, 관리자가 설정한 긴급 상담 기관의 전화번호)
}

export function RiskAlertModal({ isOpen, onClose, onViewResources, riskLevel, reasons, urgentCounselingPhones = [] }: RiskAlertModalProps) {
  /**
   * 위험 레벨별 색상 테마 (플로우 9.1)
   * 
   * 디자인 컨셉:
   * - 파란색 톤온톤 (안정감 + 신뢰감)
   * - High: cyan (가장 강한 경고)
   * - Medium: sky (중간 경고)
   * - Low: blue (가벼운 주의)
   * 
   * 색상 구성:
   * - bg: 배경색
   * - border: 테두리 색
   * - text: 텍스트 색
   * - icon: 아이콘 색
   * - button: 버튼 색
   */
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'high':
        return {
          bg: 'bg-cyan-50',
          border: 'border-cyan-400',
          text: 'text-cyan-900',
          icon: 'text-cyan-700',
          button: 'bg-cyan-600 hover:bg-cyan-700',
        };
      case 'medium':
        return {
          bg: 'bg-sky-50',
          border: 'border-sky-300',
          text: 'text-sky-900',
          icon: 'text-sky-700',
          button: 'bg-sky-600 hover:bg-sky-700',
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-900',
          icon: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700',
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
   * 
   * 메시지 내용:
   * - High: 전문가 도움 강력 권장
   * - Medium: 감정 상태 확인 및 필요시 상담 권장
   * - Low: 자기 돌아보기 권장
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
            className={`relative w-full max-w-md ${colors.bg} border-2 ${colors.border} rounded-2xl shadow-2xl overflow-hidden`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-lg hover:bg-white/50 transition-colors ${colors.text} min-w-[44px] min-h-[44px] flex items-center justify-center`}
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Icon & Title */}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-white/70 ${colors.icon} flex-shrink-0`}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`mb-2 ${colors.text}`}>{getTitle()}</h3>
                  <p className={`text-sm ${colors.text}`}>{getMessage()}</p>
                </div>
              </div>

              {/* 
                감지된 패턴 (플로우 9.1)
                
                표시 내용:
                - riskDetection.ts에서 생성한 reasons 배열
                - 예시:
                  - "최근 5일 연속으로 부정적인 감정이 기록되었습니다."
                  - "최근 14일 중 8일에 우울, 분노, 불안 등의 감정이 기록되었습니다."
              */}
              {reasons.length > 0 && (
                <div className={`p-4 bg-white/50 rounded-lg border ${colors.border}`}>
                  <p className={`text-xs mb-2 ${colors.text}`}>감지된 패턴:</p>
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
                
                표시 조건:
                - riskLevel === 'high' 일 때만 표시
                - 관리자가 설정한 긴급 상담 기관의 전화번호 표시 (관리자 명세서 4.3의 "긴급 상담 기관으로 표시"로 설정된 기관의 전화번호)
                
                디자인:
                - 흰색 배경 + 파란색 테두리
                - 하트 아이콘 (따뜻함 표현)
                - 전화번호 강조 (bold)
              */}
              {riskLevel === 'high' && urgentCounselingPhones.length > 0 && (
                <div className="p-4 bg-white border-2 border-blue-400 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-blue-900 mb-2">
                        <strong>즉시 도움이 필요하시면:</strong>
                      </p>
                      <div className="space-y-1.5 text-xs text-blue-800">
                        {urgentCounselingPhones.map((phone, index) => (
                          <p key={index}>• <strong>{phone}</strong></p>
                        ))}
                        <p className="text-blue-600 mt-2">※ 24시간 상담 가능</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 
                액션 버튼 (플로우 9.2)
                
                1. "도움말 & 리소스 보기" 버튼:
                   - 클릭 시 onViewResources() 콜백 호출
                   - DiaryBook의 handleViewResources 실행
                   - setShowRiskAlert(false) + handleGoToSupport() 실행
                   - 지원센터 페이지(SupportResourcesPage)로 이동
                
                2. "닫기" 버튼:
                   - 클릭 시 onClose() 콜백 호출
                   - setShowRiskAlert(false) 실행
                   - 모달만 닫고 현재 페이지 유지
              */}
              <div className="flex gap-2 pt-2">
                {/* 도움말 & 리소스 보기 버튼 (플로우 9.2) */}
                <button
                  onClick={onViewResources}
                  className={`flex-1 py-3 rounded-lg text-white transition-colors text-sm flex items-center justify-center gap-2 ${colors.button}`}
                >
                  <ExternalLink className="w-4 h-4" />
                  도움말 & 리소스 보기
                </button>
                {/* 닫기 버튼 (플로우 9.2) */}
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white text-stone-700 rounded-lg hover:bg-stone-100 transition-colors text-sm border border-stone-300"
                >
                  닫기
                </button>
              </div>

              {/* Info Text */}
              <p className={`text-xs text-center ${colors.text} pt-2 border-t ${colors.border}`}>
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