import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { termsData, TermItem } from '@/features/user/auth/api/termsData';
import { TermsModal } from './TermsModal';

interface TermsAgreementProps {
  onAgreementChange: (agreements: { [key: string]: boolean }) => void;
  agreements: { [key: string]: boolean };
}

export function TermsAgreement({ onAgreementChange, agreements }: TermsAgreementProps) {
  const [selectedTerm, setSelectedTerm] = useState<TermItem | null>(null);

  const handleTermClick = (term: TermItem) => {
    setSelectedTerm(term);
  };

  const handleCloseModal = () => {
    setSelectedTerm(null);
  };

  const handleCheckboxChange = (termId: string, checked: boolean) => {
    const newAgreements = { ...agreements, [termId]: checked };
    onAgreementChange(newAgreements);
  };

  const handleAllAgree = () => {
    const allChecked = termsData.every(term => agreements[term.id]);
    const newAgreements: { [key: string]: boolean } = {};
    termsData.forEach(term => {
      newAgreements[term.id] = !allChecked;
    });
    onAgreementChange(newAgreements);
  };

  const allAgreed = termsData.every(term => agreements[term.id]);
  const requiredAgreed = termsData.filter(t => t.required).every(term => agreements[term.id]);

  return (
    <div className="space-y-3">
      {/* Header Label */}
      <div className="text-sm text-emerald-900/70 dark:text-emerald-100/70 mb-2 font-medium">약관 동의</div>

      {/* All Agree - Radio Style */}
      <button
        onClick={handleAllAgree}
        className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-emerald-100/50 dark:border-emerald-800/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all shadow-sm backdrop-blur-sm"
      >
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${allAgreed
              ? 'border-emerald-600 bg-emerald-600'
              : 'border-emerald-300 dark:border-emerald-700 bg-white/50 dark:bg-black/20'
            }`}
        >
          {allAgreed && (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          )}
        </div>
        <span className="flex-1 text-left text-sm text-emerald-950 dark:text-emerald-50 font-medium">
          전체 약관에 동의합니다
        </span>
      </button>

      {/* Individual Terms - Compact Style */}
      <div className="space-y-2">
        {termsData.map((term) => (
          <div
            key={term.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/30 dark:bg-black/10 border border-emerald-100/30 dark:border-emerald-800/20 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-black/20 transition-all"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Checkbox */}
              <button
                onClick={() => handleCheckboxChange(term.id, !agreements[term.id])}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${agreements[term.id]
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-white/50 dark:bg-black/20 border-emerald-300 dark:border-emerald-700'
                  }`}
              >
                {agreements[term.id] && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </button>

              {/* Label */}
              <button
                onClick={() => handleTermClick(term)}
                className="flex-1 text-left text-xs text-emerald-900 dark:text-emerald-100 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                {term.title}
                {term.required && (
                  <span className="text-emerald-600 dark:text-emerald-400 ml-1 font-medium">(필수)</span>
                )}
              </button>
            </div>

            {/* View Detail Button */}
            <button
              onClick={() => handleTermClick(term)}
              className="p-1 text-emerald-400 hover:text-emerald-600 dark:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Status Message */}
      {!requiredAgreed && (
        <p className="text-xs text-red-500 text-center mt-2 font-medium animate-pulse">
          필수 약관에 모두 동의해주세요
        </p>
      )}

      {/* Terms Modal */}
      {selectedTerm && (
        <TermsModal term={selectedTerm} onClose={handleCloseModal} />
      )}
    </div>
  );
}
