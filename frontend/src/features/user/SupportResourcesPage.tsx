/**
 * ========================================
 * 지원 리소스 페이지 컴포넌트 (모바일 최적화)
 * ========================================
 * 
 * 주요 기능:
 * - 정신건강 지원 기관 정보 제공
 * - 카테고리별 필터링
 * - 위험 신호 경고 메시지 표시
 * - 도움 요청 안내
 */

import { useState, useEffect } from 'react';
import { Phone, ExternalLink, Clock, Heart, AlertTriangle, MessageCircle, Building, Filter, X, Loader2, ArrowLeft, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCounselingResources, type CounselingResource } from '../../services/counselingResourcesApi';
import { categoryLabels, categoryColors } from '../../services/supportResources';

interface SupportResourcesPageProps {
  showRiskWarning?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  riskReasons?: string[];
  onBack?: () => void;
}

/**
 * 백엔드 카테고리(한글)를 프론트엔드 카테고리(영문)로 변환
 */
const mapCategoryToFrontend = (category: string): 'emergency' | 'counseling' | 'hotline' | 'community' => {
  switch (category) {
    case '긴급상담':
      return 'emergency';
    case '전문상담':
      return 'counseling';
    case '상담전화':
      return 'hotline';
    case '의료기관':
      return 'community';
    default:
      return 'emergency';
  }
};

/**
 * 프론트엔드 카테고리(영문)를 백엔드 카테고리(한글)로 변환
 */
const mapCategoryToBackend = (category: string): 'all' | '긴급상담' | '전문상담' | '상담전화' | '의료기관' => {
  switch (category) {
    case 'emergency':
      return '긴급상담';
    case 'counseling':
      return '전문상담';
    case 'hotline':
      return '상담전화';
    case 'community':
      return '의료기관';
    default:
      return 'all';
  }
};

/**
 * CounselingResource를 SupportResource 형식으로 변환
 */
const convertToSupportResource = (resource: CounselingResource) => {
  return {
    id: resource.id.toString(),
    name: resource.name,
    description: resource.description || '',
    phone: resource.phone || undefined,
    website: resource.website || undefined,
    hours: resource.operatingHours || undefined,
    category: mapCategoryToFrontend(resource.category),
    isUrgent: resource.isUrgent,
  };
};

export function SupportResourcesPage({ showRiskWarning, riskLevel, riskReasons, onBack }: SupportResourcesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resources, setResources] = useState<ReturnType<typeof convertToSupportResource>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // 상담 기관 목록 조회
  useEffect(() => {
    const loadResources = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const categoryParam = selectedCategory === 'all' ? 'all' : mapCategoryToBackend(selectedCategory);
        const response = await getCounselingResources(categoryParam);
        const convertedResources = response.resources.map(convertToSupportResource);
        setResources(convertedResources);
      } catch (err: any) {
        console.error('상담 기관 목록 조회 실패:', err);
        setError('상담 기관 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        setResources([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();
  }, [selectedCategory]);

  // 모달 스크롤 잠금
  useEffect(() => {
    const mainContent = document.getElementById('mobile-main-content');
    if (!mainContent) return;

    if (showHelpModal) {
      mainContent.style.overflow = 'hidden';
    } else {
      mainContent.style.overflow = 'auto'; // scrollbar-hide 클래스가 있어서 auto로 해도 스크롤바는 안 보임
    }
    return () => {
      if (mainContent) {
        mainContent.style.overflow = 'auto';
      }
    };
  }, [showHelpModal]);

  const filteredResources = resources;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <AlertTriangle className="w-4 h-4" />;
      case 'counseling':
        return <MessageCircle className="w-4 h-4" />;
      case 'hotline':
        return <Phone className="w-4 h-4" />;
      case 'community':
        return <Building className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getRiskColor = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return 'bg-rose-50 border-rose-400 text-rose-900';
      case 'medium':
        return 'bg-amber-50 border-amber-300 text-amber-900';
      case 'low':
        return 'bg-blue-50 border-blue-300 text-blue-900';
      default:
        return 'bg-blue-50 border-blue-300 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen pb-6 space-y-6">
      {/* 헤더 - 뒤로가기 버튼 포함 */}
      {/* 헤더 - 뒤로가기 버튼 포함 (Glass Style) */}
      <div className="relative text-center space-y-3 pb-6 border-b border-emerald-100/50 dark:border-emerald-800/30">
        {/* 뒤로가기 버튼 - 왼쪽 상단 고정 (요구사항 12) */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-0 left-0 p-2 rounded-full transition-colors text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-stone-400 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 active:bg-emerald-100 dark:active:bg-emerald-800/30 touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* 도움말 버튼 - 오른쪽 상단 고정 */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="absolute top-0 right-0 p-2 rounded-full transition-colors text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-stone-400 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 active:bg-emerald-100 dark:active:bg-emerald-800/30 touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="도움말"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100/50 dark:bg-emerald-900/40 flex items-center justify-center backdrop-blur-sm shadow-sm border border-emerald-200/50 dark:border-emerald-700/30">
          <Heart className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-stone-800 dark:text-stone-100 font-bold text-lg">상담 연결 리소스</h2>
        </div>
      </div>

      {/* 위험 신호 경고 */}
      {showRiskWarning && riskLevel && (
        <div className={`p-5 rounded-xl border-2 ${getRiskColor(riskLevel)}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium">
                {riskLevel === 'high' && '최근 감정 패턴에서 심각한 위험 신호가 감지되었습니다.'}
                {riskLevel === 'medium' && '최근 부정적인 감정이 지속되고 있습니다.'}
                {riskLevel === 'low' && '최근 부정적인 감정이 반복되고 있습니다.'}
              </p>
              {riskReasons && riskReasons.length > 0 && (
                <ul className="text-xs space-y-1.5">
                  {riskReasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs mt-3 pt-3 border-t border-current/20">
                {riskLevel === 'high' && '전문가의 도움을 받는 것을 강력히 권장합니다. 아래 긴급 상담 전화를 이용해주세요.'}
                {riskLevel === 'medium' && '감정 상태를 돌아보고 필요시 전문가와 상담해보세요.'}
                {riskLevel === 'low' && '잠시 시간을 내어 자신을 돌아보고 필요시 전문가와 상담해보세요.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 px-1">
          <Filter className="w-4 h-4 text-emerald-500" />
          <span className="font-medium">카테고리</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2.5 text-xs rounded-xl transition-all font-medium min-h-[44px] border ${selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-transparent'
              : 'bg-white/50 dark:bg-stone-900/50 text-stone-700 dark:text-stone-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 border-stone-200 dark:border-stone-800'
              }`}
          >
            전체
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-2.5 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 font-medium min-h-[44px] border ${selectedCategory === key
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-transparent'
                : 'bg-white/50 dark:bg-stone-900/50 text-stone-700 dark:text-stone-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 border-stone-200 dark:border-stone-800'
                }`}
            >
              <span className={selectedCategory === key ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}>
                {getCategoryIcon(key)}
              </span>
              <span>{label}</span>
            </button>
          ))}       </div>

      </div>

      {/* 리소스 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <span className="ml-2 text-sm text-stone-600 dark:text-stone-400">상담 기관 목록을 불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50/50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-800/30 rounded-2xl backdrop-blur-sm">
            <p className="text-sm text-rose-800 dark:text-rose-200">{error}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-700 dark:text-stone-300 font-medium px-1">
              총 {filteredResources.length}개의 기관
            </p>

            {filteredResources.length === 0 ? (
              <div className="p-8 text-center bg-stone-50/50 dark:bg-stone-900/50 rounded-2xl border border-stone-200 dark:border-stone-800 backdrop-blur-sm">
                <p className="text-sm text-stone-600 dark:text-stone-400">표시할 상담 기관이 없습니다.</p>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-5 bg-white/60 dark:bg-stone-900/60 rounded-2xl border border-white/40 dark:border-white/5 space-y-4 hover:shadow-lg transition-all backdrop-blur-md ring-1 ring-black/5 dark:ring-white/5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-sm text-stone-900 dark:text-stone-100 mb-2 font-bold"
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}
                      >
                        {resource.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border bg-white/50 backdrop-blur-sm ${categoryColors[resource.category].replace('bg-', 'bg-opacity-20 ')}`}>
                        {getCategoryIcon(resource.category)}
                        <span>{categoryLabels[resource.category]}</span>
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium"
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}
                  >
                    {resource.description}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
                    {/* Phone */}
                    {resource.phone && (
                      <a
                        href={`tel:${resource.phone}`}
                        className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline min-h-[44px] break-words font-medium"
                      >
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="break-all">{resource.phone}</span>
                      </a>
                    )}

                    {/* Hours */}
                    {resource.hours && (
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 break-words">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">{resource.hours}</span>
                      </div>
                    )}

                    {/* Website */}
                    {resource.website && (
                      <a
                        href={resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline min-h-[44px] font-medium"
                      >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        <span>웹사이트 방문</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* 도움말 모달 */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="absolute inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-emerald-50 border-2 border-emerald-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* 닫기 버튼 */}
              <button
                onClick={() => setShowHelpModal(false)}
                className="absolute top-2 right-2 p-2 text-stone-400 hover:text-stone-600 transition-colors rounded-lg hover:bg-black/5 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-5 flex flex-col h-full">
                <div className="text-center space-y-2 mb-4">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-stone-800">
                    도움을 요청하는 것은 용기입니다
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed break-keep">
                    전문가의 도움은 현명한 선택입니다. 언제든 도움을 요청하세요.
                  </p>
                </div>

                {/* 긴급한 경우 박스 */}
                <div className="bg-white border border-rose-100 rounded-xl p-3 space-y-2 shadow-sm mb-3">
                  <div className="flex items-center gap-1.5 text-rose-600">
                    <AlertTriangle className="w-4 h-4" />
                    <h4 className="text-xs font-bold">긴급한 경우 (24시간)</h4>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed break-keep">
                    자살 충동 등 위기 시 즉시 연락주세요.<br />
                    <span className="font-bold text-rose-600">1393</span>(자살예방) 또는 <span className="font-bold text-rose-600">1577-0199</span>
                  </p>
                </div>

                {/* 상담이 도움이 되는 경우 */}
                <div className="space-y-2 bg-white/50 p-3 rounded-xl border border-emerald-100 mb-4 flex-1">
                  <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    상담이 도움이 되는 경우
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-600">
                    <li className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span>지속적인 우울감이나 불안감</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span>일상생활에 지장을 주는 감정 변화</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span>수면 문제나 식욕 변화</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span>대인관계의 어려움</span>
                    </li>
                  </ul>
                </div>

                {/* 닫기 버튼 */}
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 mt-auto"
                >
                  확인했습니다
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
