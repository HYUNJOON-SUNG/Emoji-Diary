import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { termsData, TermItem } from '../../services/termsData';
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
      <div className="text-sm text-stone-700 mb-2">약관 동의</div>

      {/* All Agree - Radio Style */}
      <button
        onClick={handleAllAgree}
        className="w-full flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-300 hover:border-stone-400 transition-all"
      >
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            allAgreed
              ? 'border-blue-600'
              : 'border-stone-300'
          }`}
        >
          {allAgreed && (
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
          )}
        </div>
        <span className="flex-1 text-left text-sm text-stone-800">
          전체 약관에 동의합니다
        </span>
      </button>

      {/* Individual Terms - Compact Style */}
      <div className="space-y-2">
        {termsData.map((term) => (
          <div
            key={term.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-stone-200"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Checkbox */}
              <button
                onClick={() => handleCheckboxChange(term.id, !agreements[term.id])}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  agreements[term.id]
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-stone-300'
                }`}
              >
                {agreements[term.id] && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </button>

              {/* Label */}
              <button
                onClick={() => handleTermClick(term)}
                className="flex-1 text-left text-xs text-stone-700 hover:text-stone-900 transition-colors"
              >
                {term.title}
                {term.required && (
                  <span className="text-rose-600 ml-1">(필수)</span>
                )}
              </button>
            </div>

            {/* View Detail Button */}
            <button
              onClick={() => handleTermClick(term)}
              className="p-1 text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Status Message */}
      {!requiredAgreed && (
        <p className="text-xs text-rose-600 text-center mt-2">
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
