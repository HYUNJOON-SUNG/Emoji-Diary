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
import { Phone, ExternalLink, Clock, Heart, AlertTriangle, MessageCircle, Building, Filter, X, Loader2 } from 'lucide-react';
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

export function SupportResourcesPage({ showRiskWarning, riskLevel, riskReasons }: SupportResourcesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resources, setResources] = useState<ReturnType<typeof convertToSupportResource>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      {/* 헤더 */}
      <div className="text-center space-y-3 pb-6 border-b border-stone-200/60">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
          <Heart className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-stone-800 mb-2">도움말 & 리소스</h2>
          <p className="text-sm text-stone-600">언제든 도움을 요청할 수 있습니다</p>
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

      {/* 도움 안내 */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 space-y-4 border border-blue-200">
        <h3 className="text-sm text-stone-800 font-medium">도움을 요청하는 것은 용기입니다</h3>
        
        <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
          <p>
            혼자서 감정을 감당하기 어려울 때, 전문가의 도움을 받는 것은 매우 현명한 선택입니다. 
            당신의 감정과 고민은 소중하며, 언제든 도움을 요청할 수 있습니다.
          </p>
          
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-lg">
            <p className="text-rose-900">
              <strong className="block mb-2">긴급한 경우</strong>
              자살 충동이나 자해 생각이 든다면 즉시 <strong>1393</strong>(자살예방 상담전화) 또는 
              <strong> 1577-0199</strong>(정신건강 위기상담)로 연락해주세요. <strong>24시간 상담 가능</strong>합니다.
            </p>
          </div>
          
          <div>
            <strong className="text-stone-800 block mb-2">상담이 도움이 되는 경우:</strong>
            <ul className="space-y-1.5 ml-1">
              <li>• 지속적인 우울감이나 불안감</li>
              <li>• 일상생활에 지장을 주는 감정 변화</li>
              <li>• 수면 문제나 식욕 변화</li>
              <li>• 대인관계의 어려움</li>
              <li>• 스트레스 관리의 어려움</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-stone-700">
          <Filter className="w-4 h-4" />
          <span className="font-medium">카테고리</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2.5 text-xs rounded-lg transition-colors font-medium min-h-[44px] ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            전체
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-2.5 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 font-medium min-h-[44px] ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
              }`}
            >
              {getCategoryIcon(key)}
              <span>{label}</span>
            </button>
          ))}       </div>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="w-full py-2.5 text-xs text-stone-600 hover:text-stone-800 flex items-center justify-center gap-1 min-h-[44px]"
          >
            <X className="w-3.5 h-3.5" />
            <span>필터 해제</span>
          </button>
        )}
      </div>

      {/* 리소스 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-sm text-stone-600">상담 기관 목록을 불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-700 font-medium">
              총 {filteredResources.length}개의 기관
            </p>
            
            {filteredResources.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-lg border border-stone-200">
                <p className="text-sm text-stone-600">표시할 상담 기관이 없습니다.</p>
              </div>
            ) : (
              filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="p-5 bg-white rounded-xl border border-stone-200 space-y-4 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm text-stone-900 mb-2 font-medium">{resource.name}</h3>
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${categoryColors[resource.category]}`}>
                  {getCategoryIcon(resource.category)}
                  <span>{categoryLabels[resource.category]}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-600 leading-relaxed">
              {resource.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-2.5 pt-3 border-t border-stone-200">
              {/* Phone */}
              {resource.phone && (
                <a
                  href={`tel:${resource.phone}`}
                  className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 hover:underline min-h-[44px]"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{resource.phone}</span>
                </a>
              )}
              
              {/* Hours */}
              {resource.hours && (
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{resource.hours}</span>
                </div>
              )}
              
              {/* Website */}
              {resource.website && (
                <a
                  href={resource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-800 hover:underline min-h-[44px]"
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

      {/* Bottom Info */}
      <div className="pt-4 mt-4 border-t border-stone-200">
        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900 leading-relaxed">
            💡 <strong>알림 설정</strong><br />
            마이페이지에서 '위험 알림 받기'를 켜두면 위험 신호가 감지될 때 
            알림을 받을 수 있습니다. 당신의 감정과 고민은 소중하며, 언제든 도움을 요청할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
