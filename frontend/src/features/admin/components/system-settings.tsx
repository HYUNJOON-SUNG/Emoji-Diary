import { useState, useEffect } from 'react';
import { Settings, AlertTriangle, Save, Plus, Edit2, Trash2, Phone, Globe, Building2, X, Check } from 'lucide-react';
import { getRiskDetectionSettings, updateRiskDetectionSettings, getCounselingResources, createCounselingResource, updateCounselingResource, deleteCounselingResource } from '../../../services/adminApi';
import type { RiskThreshold, CounselingResource } from '../types';

export function SystemSettings() {
  // ========================================
  // State 관리
  // ========================================
  const [activeTab, setActiveTab] = useState<'risk' | 'resources'>('risk'); // 5.1: 기본 선택 = 위험 신호 기준
  const [isLoading, setIsLoading] = useState(true);
  
  // 위험 신호 기준 설정 (5.2 기본값)
  const [riskThreshold, setRiskThreshold] = useState<RiskThreshold>({
    monitoringPeriodDays: 14,        // 모니터링 기간: 14일
    highConsecutiveDays: 5,          // High: 연속 5일
    highTotalDays: 8,                // High: 14일 중 8일
    mediumConsecutiveDays: 3,        // Medium: 연속 3일
    mediumTotalDays: 5,              // Medium: 14일 중 5일
    lowConsecutiveDays: 2,           // Low: 연속 2일
    lowTotalDays: 3                  // Low: 14일 중 3일
  });
  const [originalThreshold, setOriginalThreshold] = useState<RiskThreshold>(riskThreshold);
  const [hasThresholdChanges, setHasThresholdChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 상담 기관 리소스
  const [resources, setResources] = useState<CounselingResource[]>([]);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState<CounselingResource | null>(null);

  // ========================================
  // 페이지 진입 시 자동 로드 (5.1)
  // ========================================
  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Check if threshold has changes
    const hasChanges = 
      riskThreshold.monitoringPeriodDays !== originalThreshold.monitoringPeriodDays ||
      riskThreshold.highConsecutiveDays !== originalThreshold.highConsecutiveDays ||
      riskThreshold.highTotalDays !== originalThreshold.highTotalDays ||
      riskThreshold.mediumConsecutiveDays !== originalThreshold.mediumConsecutiveDays ||
      riskThreshold.mediumTotalDays !== originalThreshold.mediumTotalDays ||
      riskThreshold.lowConsecutiveDays !== originalThreshold.lowConsecutiveDays ||
      riskThreshold.lowTotalDays !== originalThreshold.lowTotalDays;
    
    setHasThresholdChanges(hasChanges);
  }, [riskThreshold, originalThreshold]);

  const loadSettings = async () => {
    setIsLoading(true);
    
    try {
      // GET /api/admin/settings/risk-detection
      const riskResponse = await getRiskDetectionSettings();
      if (riskResponse.success && riskResponse.data) {
        const settings = riskResponse.data;
        const threshold: RiskThreshold = {
          monitoringPeriodDays: settings.monitoringPeriod,
          highConsecutiveDays: settings.high.consecutiveScore,
          highTotalDays: settings.high.scoreInPeriod,
          mediumConsecutiveDays: settings.medium.consecutiveScore,
          mediumTotalDays: settings.medium.scoreInPeriod,
          lowConsecutiveDays: settings.low.consecutiveScore,
          lowTotalDays: settings.low.scoreInPeriod
        };
        setRiskThreshold(threshold);
        setOriginalThreshold(threshold);
      }
      
      // GET /api/admin/settings/counseling-resources
      const resourcesResponse = await getCounselingResources();
      if (resourcesResponse.success && resourcesResponse.data) {
        setResources(resourcesResponse.data.resources);
      }
    } catch (error: any) {
      console.error('설정 로드 실패:', error);
      alert(error.message || '설정을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveThreshold = async () => {
    // Validation
    if (riskThreshold.monitoringPeriodDays < 1 || riskThreshold.monitoringPeriodDays > 365) {
      alert('모니터링 기간은 1~365일 사이의 값이어야 합니다.');
      return;
    }

    setIsSaving(true);
    
    try {
      // PUT /api/admin/settings/risk-detection
      const settings = {
        monitoringPeriod: riskThreshold.monitoringPeriodDays,
        high: {
          consecutiveScore: riskThreshold.highConsecutiveDays,
          scoreInPeriod: riskThreshold.highTotalDays
        },
        medium: {
          consecutiveScore: riskThreshold.mediumConsecutiveDays,
          scoreInPeriod: riskThreshold.mediumTotalDays
        },
        low: {
          consecutiveScore: riskThreshold.lowConsecutiveDays,
          scoreInPeriod: riskThreshold.lowTotalDays
        }
      };
      
      await updateRiskDetectionSettings(settings);
      
      setOriginalThreshold(riskThreshold);
      setHasThresholdChanges(false);
      
      alert('설정이 성공적으로 저장되었습니다.');
    } catch (error: any) {
      console.error('위험 신호 감지 기준 저장 실패:', error);
      alert(error.message || '설정 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetThreshold = () => {
    setRiskThreshold(originalThreshold);
  };

  const handleAddResource = () => {
    setEditingResource({
      id: 0, // 새로 추가할 때는 0 (저장 시 서버에서 생성)
      name: '',
      category: '전문상담',
      phone: '',
      website: '',
      description: '',
      operatingHours: '',
      isUrgent: false
    });
    setShowResourceModal(true);
  };

  const handleEditResource = (resource: CounselingResource) => {
    setEditingResource({ ...resource });
    setShowResourceModal(true);
  };

  const handleDeleteResource = async (id: number) => {
    if (!confirm('정말 이 상담 기관을 삭제하시겠습니까?')) {
      return;
    }

    try {
      // DELETE /api/admin/settings/counseling-resources/{resourceId}
      await deleteCounselingResource(id);
      alert('상담 기관이 삭제되었습니다.');
      loadSettings(); // 목록 갱신
    } catch (error: any) {
      console.error('상담 기관 삭제 실패:', error);
      alert(error.message || '삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSaveResource = async (resource: CounselingResource) => {
    // Validation
    if (!resource.name || !resource.phone || !resource.description) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    // Validate URL format
    if (resource.website && !resource.website.match(/^https?:\/\/.+/)) {
      alert('웹사이트 주소는 http:// 또는 https://로 시작해야 합니다.');
      return;
    }

    try {
      if (resource.id && resource.id > 0) {
        // PUT /api/admin/settings/counseling-resources/{resourceId}
        await updateCounselingResource(resource.id, {
          name: resource.name,
          category: resource.category,
          phone: resource.phone,
          website: resource.website,
          description: resource.description,
          operatingHours: resource.operatingHours,
          isUrgent: resource.isUrgent
        });
        alert('상담 기관 정보가 수정되었습니다.');
      } else {
        // POST /api/admin/settings/counseling-resources
        await createCounselingResource({
          name: resource.name,
          category: resource.category,
          phone: resource.phone,
          website: resource.website,
          description: resource.description,
          operatingHours: resource.operatingHours,
          isUrgent: resource.isUrgent
        });
        alert('새 상담 기관이 추가되었습니다.');
      }
      
      setShowResourceModal(false);
      setEditingResource(null);
      loadSettings(); // 목록 갱신
    } catch (error: any) {
      console.error('상담 기관 저장 실패:', error);
      alert(error.message || '저장에 실패했습니다. 다시 시도해주세요.');
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800 text-3xl mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            시스템 설정
          </h1>
          <p className="text-slate-600">
            위험 신호 감지 기준 및 상담 기관 리소스를 관리합니다
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b-2 border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'risk'
              ? 'border-b-4 border-blue-600 text-blue-600 -mb-0.5'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          위험 신호 기준 변경
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'resources'
              ? 'border-b-4 border-blue-600 text-blue-600 -mb-0.5'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          상담 기관 리소스 관리
        </button>
      </div>

      {/* Risk Threshold Settings */}
      {activeTab === 'risk' && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b-2 border-orange-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-slate-800 text-lg sm:text-xl break-words">위험 신호 감지 기준</h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 break-words">
                  사용자 위험도 평가에 사용되는 임계값을 설정합니다
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
            {/* Monitoring Period */}
            <div className="min-w-0">
              <label className="block text-slate-700 font-medium mb-2 text-sm sm:text-base">
                모니터링 기간 (일)
              </label>
              <p className="text-slate-600 text-xs sm:text-sm mb-3 break-words">
                위험도 평가 시 분석할 과거 일지의 기간입니다
              </p>
              <div className="flex items-center gap-2 sm:gap-4">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={riskThreshold.monitoringPeriodDays}
                  onChange={(e) => setRiskThreshold({
                    ...riskThreshold,
                    monitoringPeriodDays: parseInt(e.target.value) || 1
                  })}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-lg min-w-0"
                />
                <span className="text-slate-700 font-medium text-base sm:text-lg flex-shrink-0">일</span>
              </div>
              <div className="mt-2 text-sm text-slate-500">
                현재 설정: 최근 {riskThreshold.monitoringPeriodDays}일간의 일지 분석
              </div>
            </div>

            {/* High Level Threshold */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <label className="block text-slate-700 font-medium mb-2">
                High 레벨 판정 기준
              </label>
              <p className="text-slate-600 text-sm mb-4">
                둘 중 하나라도 충족하면 High 레벨로 판정됩니다
              </p>
              
              {/* 연속 부정 감정 임계 일수 */}
              <div className="mb-4">
                <label className="block text-slate-600 text-sm mb-2">
                  연속 부정 감정 임계 일수
                </label>
                <p className="text-slate-500 text-xs mb-2">
                  연속으로 부정적 감정을 기록한 일수가 이 값을 초과하면 High 레벨로 판정됩니다
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={riskThreshold.highConsecutiveDays}
                    onChange={(e) => setRiskThreshold({
                      ...riskThreshold,
                      highConsecutiveDays: parseInt(e.target.value) || 1
                    })}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-lg min-w-0"
                  />
                  <span className="text-slate-700 font-medium text-base sm:text-lg flex-shrink-0">일</span>
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  현재 설정: {riskThreshold.highConsecutiveDays}일 이상 연속 부정 감정 시 High 레벨
                </div>
              </div>
              
              {/* 또는 */}
              <div className="text-center text-slate-600 font-medium text-sm mb-4">
                또는
              </div>
              
              {/* 모니터링 기간 내 부정 감정 임계 일수 */}
              <div>
                <label className="block text-slate-600 text-sm mb-2">
                  모니터링 기간 내 부정 감정 임계 일수
                </label>
                <p className="text-slate-500 text-xs mb-2">
                  모니터링 기간 중 부정 감정이 이 값 이상 발생하면 High 레벨로 판정됩니다
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max={riskThreshold.monitoringPeriodDays}
                    value={riskThreshold.highTotalDays}
                    onChange={(e) => setRiskThreshold({
                      ...riskThreshold,
                      highTotalDays: parseInt(e.target.value) || 1
                    })}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-lg min-w-0"
                  />
                  <span className="text-slate-700 font-medium text-base sm:text-lg flex-shrink-0">일</span>
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  현재 설정: {riskThreshold.monitoringPeriodDays}일 중 {riskThreshold.highTotalDays}일 이상 부정 감정 시 High 레벨
                </div>
              </div>
            </div>

            {/* Medium Level Threshold */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <label className="block text-slate-700 font-medium mb-2">
                Medium 레벨 판정 기준
              </label>
              <p className="text-slate-600 text-sm mb-4">
                둘 중 하나라도 충족하면 Medium 레벨로 판정됩니다 (단, High 레벨 기준을 충족하지 않은 경우)
              </p>
              
              {/* 연속 부정 감정 임계 일수 */}
              <div className="mb-4">
                <label className="block text-slate-600 text-sm mb-2">
                  연속 부정 감정 임계 일수
                </label>
                <p className="text-slate-500 text-xs mb-2">
                  연속으로 부정적 감정을 기록한 일수가 이 값 이상이면 Medium 레벨로 판정됩니다
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={riskThreshold.mediumConsecutiveDays}
                    onChange={(e) => setRiskThreshold({
                      ...riskThreshold,
                      mediumConsecutiveDays: parseInt(e.target.value) || 1
                    })}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-lg min-w-0"
                  />
                  <span className="text-slate-700 font-medium text-base sm:text-lg flex-shrink-0">일</span>
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  현재 설정: {riskThreshold.mediumConsecutiveDays}일 이상 연속 부정 감정 시 Medium 레벨
                </div>
              </div>
              
              {/* 또는 */}
              <div className="text-center text-slate-600 font-medium text-sm mb-4">
                또는
              </div>
              
              {/* 모니터링 기간 내 부정 감정 임계 일수 */}
              <div>
                <label className="block text-slate-600 text-sm mb-2">
                  모니터링 기간 내 부정 감정 임계 일수
                </label>
                <p className="text-slate-500 text-xs mb-2">
                  모니터링 기간 중 부정 감정이 이 값 이상 발생하면 Medium 레벨로 판정됩니다
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max={riskThreshold.monitoringPeriodDays}
                    value={riskThreshold.mediumTotalDays}
                    onChange={(e) => setRiskThreshold({
                      ...riskThreshold,
                      mediumTotalDays: parseInt(e.target.value) || 1
                    })}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-lg min-w-0"
                  />
                  <span className="text-slate-700 font-medium text-base sm:text-lg flex-shrink-0">일</span>
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  현재 설정: {riskThreshold.monitoringPeriodDays}일 중 {riskThreshold.mediumTotalDays}일 이상 부정 감정 시 Medium 레벨
                </div>
              </div>
            </div>

            {/* Low Level Threshold */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <label className="block text-slate-700 font-medium mb-2">
                Low 레벨 판정 기준
              </label>
              <p className="text-slate-600 text-sm mb-4">
                둘 중 하나라도 충족하면 Low 레벨로 판정됩니다 (단, High 또는 Medium 레벨 기준을 충족하지 않은 경우)
              </p>
              
              {/* 연속 부정 감정 임계 일수 */}
              <div className="mb-4">
                <label className="block text-slate-600 text-sm mb-2">
                  연속 부정 감정 임계 일수
                </label>
                <p className="text-slate-500 text-xs mb-2">
                  연속으로 부정적 감정을 기록한 일수가 이 값 이상이면 Low 레벨로 판정됩니다
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={riskThreshold.lowConsecutiveDays}
                    onChange={(e) => setRiskThreshold({
                      ...riskThreshold,
                      lowConsecutiveDays: parseInt(e.target.value) || 1
                    })}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-lg min-w-0"
                  />
                  <span className="text-slate-700 font-medium text-base sm:text-lg flex-shrink-0">일</span>
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  현재 설정: {riskThreshold.lowConsecutiveDays}일 이상 연속 부정 감정 시 Low 레벨
                </div>
              </div>
              
              {/* 또는 */}
              <div className="text-center text-slate-600 font-medium text-sm mb-4">
                또는
              </div>
              
              {/* 모니터링 기간 내 부정 감정 임계 일수 */}
              <div>
                <label className="block text-slate-600 text-sm mb-2">
                  모니터링 기간 내 부정 감정 임계 일수
                </label>
                <p className="text-slate-500 text-xs mb-2">
                  모니터링 기간 중 부정 감정이 이 값 이상 발생하면 Low 레벨로 판정됩니다
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max={riskThreshold.monitoringPeriodDays}
                    value={riskThreshold.lowTotalDays}
                    onChange={(e) => setRiskThreshold({
                      ...riskThreshold,
                      lowTotalDays: parseInt(e.target.value) || 1
                    })}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-base sm:text-lg min-w-0"
                  />
                  <span className="text-slate-700 font-medium text-base sm:text-lg flex-shrink-0">일</span>
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  현재 설정: {riskThreshold.monitoringPeriodDays}일 중 {riskThreshold.lowTotalDays}일 이상 부정 감정 시 Low 레벨
                </div>
              </div>
            </div>
            
            {/* None Level Description */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <label className="block text-slate-700 font-medium mb-2">
                None 레벨
              </label>
              <p className="text-slate-600 text-sm">
                위의 High/Medium/Low 기준을 모두 충족하지 않는 경우 자동으로 None 레벨로 판정됩니다 (별도 설정 불필요)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t-2 border-slate-200">
              <button
                onClick={handleResetThreshold}
                disabled={!hasThresholdChanges || isSaving}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                초기화
              </button>
              <button
                onClick={handleSaveThreshold}
                disabled={!hasThresholdChanges || isSaving}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>

            {hasThresholdChanges && (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ 변경사항이 있습니다. 저장 버튼을 눌러 적용해주세요.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Counseling Resources */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-green-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-slate-800 text-lg sm:text-xl break-words">상담 기관 리소스</h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 break-words">
                  사용자에게 제공되는 상담 기관 정보를 관리합니다
                </p>
              </div>
            </div>
            <button
              onClick={handleAddResource}
              className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 text-sm sm:text-base whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">새 기관 추가</span>
              <span className="sm:hidden">추가</span>
            </button>
          </div>

          <div className="p-6">
            {resources.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">등록된 상담 기관이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="border-2 border-slate-200 rounded-lg p-3 sm:p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-slate-800 font-medium text-base sm:text-lg break-words">
                            {resource.name}
                          </h3>
                          <span className={`px-2 sm:px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                            resource.isUrgent
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {resource.category}
                          </span>
                          {resource.isUrgent && (
                            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full flex items-center gap-1 whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3" />
                              긴급
                            </span>
                          )}
                        </div>
                        
                        <p className="text-slate-600 text-sm mb-3 break-words">{resource.description}</p>
                        
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span className="break-all">{resource.phone}</span>
                          </div>
                          {resource.website && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Globe className="w-4 h-4 flex-shrink-0" />
                              <a href={resource.website} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                                웹사이트 방문
                              </a>
                            </div>
                          )}
                          {resource.operatingHours && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <span className="break-words">운영시간: {resource.operatingHours}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 수정/삭제 버튼 - 오른쪽 고정 */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditResource(resource)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {showResourceModal && editingResource && (
        <ResourceModal
          resource={editingResource}
          onSave={handleSaveResource}
          onClose={() => {
            setShowResourceModal(false);
            setEditingResource(null);
          }}
        />
      )}
    </div>
  );
}

// Resource Modal Component
interface ResourceModalProps {
  resource: CounselingResource;
  onSave: (resource: CounselingResource) => void;
  onClose: () => void;
}

function ResourceModal({ resource, onSave, onClose }: ResourceModalProps) {
  const [formData, setFormData] = useState<CounselingResource>(resource);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-1 sm:p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-h-[98vh] sm:max-h-[95vh] my-1 sm:my-2 md:my-8 flex flex-col mx-1 sm:mx-2 md:mx-0 min-w-0 overflow-hidden" style={{ maxWidth: 'min(calc(100vw - 0.5rem), calc(100vw - 1rem), 95vw, 600px)', width: 'min(calc(100vw - 0.5rem), calc(100vw - 1rem), 95vw, 600px)' }}>
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between rounded-t-xl flex-shrink-0 min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="break-words truncate">{resource.id ? '상담 기관 수정' : '새 상담 기관 추가'}</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Form */}
          <div className="p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1 min-w-0">
            {/* Name */}
            <div className="min-w-0">
              <label className="block text-slate-700 font-medium mb-2 text-sm sm:text-base">
                기관명 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-slate-300 rounded-lg focus:outline-none focus:border-green-500 break-words min-w-0"
                placeholder="예: 자살예방 상담전화"
              />
            </div>

            {/* Category */}
            <div className="min-w-0">
              <label className="block text-slate-700 font-medium mb-2 text-sm sm:text-base">
                카테고리 <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CounselingResource['category'] })}
                className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-slate-300 rounded-lg focus:outline-none focus:border-green-500 min-w-0"
              >
                <option value="긴급상담">긴급 상담</option>
                <option value="전문상담">전문 상담</option>
                <option value="상담전화">상담 전화</option>
                <option value="의료기관">의료 기관</option>
              </select>
            </div>

            {/* Phone */}
            <div className="min-w-0">
              <label className="block text-slate-700 font-medium mb-2 text-sm sm:text-base">
                전화번호 <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-slate-300 rounded-lg focus:outline-none focus:border-green-500 break-words min-w-0"
                placeholder="예: 1393"
              />
            </div>

            {/* Website */}
            <div className="min-w-0">
              <label className="block text-slate-700 font-medium mb-2 text-sm sm:text-base">
                웹사이트 주소
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-slate-300 rounded-lg focus:outline-none focus:border-green-500 break-all min-w-0"
                placeholder="https://example.com"
              />
            </div>

            {/* Description */}
            <div className="min-w-0">
              <label className="block text-slate-700 font-medium mb-2 text-sm sm:text-base">
                설명 <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-slate-300 rounded-lg focus:outline-none focus:border-green-500 resize-none break-words overflow-x-auto"
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                rows={3}
                placeholder="상담 기관에 대한 간단한 설명을 입력하세요"
              />
            </div>

            {/* Availability */}
            <div className="min-w-0">
              <label className="block text-slate-700 font-medium mb-2 text-sm sm:text-base">
                운영 시간
              </label>
              <input
                type="text"
                value={formData.operatingHours || ''}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-slate-300 rounded-lg focus:outline-none focus:border-green-500 break-words min-w-0"
                placeholder="예: 24시간, 평일 09:00-18:00"
              />
            </div>

            {/* Is Urgent */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isUrgent"
                checked={formData.isUrgent}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                className="w-4 h-4 text-green-600"
              />
              <label htmlFor="isUrgent" className="text-slate-700">
                긴급 상담 기관으로 표시
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 bg-slate-50 rounded-b-xl flex flex-col sm:flex-row gap-2 sm:gap-3 border-t-2 border-slate-200 flex-shrink-0 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium text-sm sm:text-base min-w-0"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base min-w-0"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}