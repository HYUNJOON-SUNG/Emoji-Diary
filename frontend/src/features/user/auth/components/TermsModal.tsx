import { X } from 'lucide-react';
import { TermItem } from '../../services/termsData';

interface TermsModalProps {
  term: TermItem;
  onClose: () => void;
}

export function TermsModal({ term, onClose }: TermsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white/95 dark:bg-stone-900/95 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-emerald-100/50 dark:border-emerald-800/30">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">{term.title}</h2>
            {term.required && (
              <span className="text-xs text-emerald-100 font-medium">(필수)</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] scrollbar-hide">
          <pre className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed font-sans">
            {term.content}
          </pre>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}