/**
 * ========================================
 * AI 페르소나 초기 설정 컴포넌트
 * ========================================
 * 
 * 회원가입 직후에만 표시되는 페르소나 선택 화면
 * - 환영 화면과 페르소나 선택 단계 포함
 * - 선택한 페르소나를 DB에 저장 (API 호출)
 * - localStorage에도 저장 (로컬 캐시용)
 */

import { useState } from 'react';
import { BookHeart, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { PERSONAS } from '@/features/user/profile/components/PersonaSelectionModal';
import { updatePersona } from '@/features/user/auth/api/authApi';

interface InitialPersonaSetupProps {
  /** 페르소나 설정 완료 시 호출되는 콜백 */
  onComplete: (personaId: string) => void;
}

export function InitialPersonaSetup({ onComplete }: InitialPersonaSetupProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1: 환영 화면, 2: 페르소나 선택
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersona(personaId);
  };

  const handleComplete = async () => {
    if (!selectedPersona) return;

    // personaId (영어 소문자)를 한글 이름으로 변환
    const persona = PERSONAS.find(p => p.id === selectedPersona);
    if (!persona) {
      setError('페르소나를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // [API 명세서 Section 3.2] PUT /api/users/me/persona
      // DB에 페르소나 저장
      await updatePersona({ persona: persona.name });

      // localStorage에도 저장 (로컬 캐시용)
      localStorage.setItem('aiPersona', selectedPersona);
      localStorage.setItem('personaSetupCompleted', 'true');

      // 완료 콜백 호출
      onComplete(selectedPersona);
    } catch (err: any) {
      console.error('페르소나 설정 실패:', err);
      setError(err?.message || '페르소나 설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 단계 1: 환영 화면
  if (step === 1) {
    return (
      <div className="w-full h-full bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-6 overflow-y-auto scrollbar-hide" style={{ minHeight: 0 }}>
        <div className="w-full max-w-lg space-y-8 text-center flex-shrink-0">
          {/* 아이콘 */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl shadow-emerald-500/20 ring-4 ring-white/20 dark:ring-white/10">
            <BookHeart className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>

          {/* 환영 메시지 */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-emerald-950 dark:text-emerald-50">
              환영합니다! 🎉
            </h1>
            <p className="text-stone-600 dark:text-stone-400">
              나만의 AI 친구를 선택해보세요
            </p>
          </div>

          {/* AI 친구 기능 설명 카드들 */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800">
              <div className="flex items-start gap-4">
                <div className="text-3xl">💬</div>
                <div className="text-left">
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">감정 공유</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">일기를 작성하면 AI 친구가 따뜻한 응원의 말을 해줘요</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎨</div>
                <div className="text-left">
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">그림 일기</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">감정에 맞는 아름다운 그림을 자동으로 생성해줘요</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📊</div>
                <div className="text-left">
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">감정 분석</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">나의 감정 패턴을 분석하고 통계로 보여줘요</p>
                </div>
              </div>
            </div>
          </div>

          {/* 다음 단계 버튼 */}
          <button
            onClick={() => setStep(2)}
            className="w-full max-w-sm mx-auto py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 font-bold"
          >
            AI 친구 선택하기
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 단계 2: 페르소나 선택
  return (
    <div className="w-full h-full bg-zinc-50 dark:bg-black p-4 flex flex-col items-center justify-center" style={{ minHeight: 0 }}>
      {/* 
        모바일 화면에서 컨텐츠가 짤리지 않도록 max-h 설정 및 스크롤 처리
        h-full 내에서 유연하게 배치
      */}
      <div className="w-full h-full flex flex-col items-center justify-center max-w-md mx-auto overflow-y-auto scrollbar-hide py-6">
        <div className="w-full flex-shrink-0">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50 mb-1">
              어떤 AI 친구를 원하시나요?
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              마음에 드는 말투를 선택해주세요
            </p>
          </div>

          {/* 페르소나 그리드 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => handlePersonaSelect(persona.id)}
                className={`p-3 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${selectedPersona === persona.id
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-zinc-900 hover:border-emerald-300 hover:shadow-sm'
                  }`}
              >
                <div className="w-14 h-14 mb-2 mx-auto bg-stone-50 dark:bg-black rounded-full overflow-hidden p-1">
                  <img src={persona.icon} alt={persona.name} className="w-full h-full object-contain" />
                </div>
                <div className={`font-bold text-sm text-center mb-0.5 ${selectedPersona === persona.id ? 'text-emerald-800 dark:text-emerald-300' : 'text-stone-800 dark:text-stone-200'
                  }`}>
                  {persona.name}
                </div>
                <div className="text-[10px] text-center text-stone-500 dark:text-stone-400">{persona.style}</div>
              </button>
            ))}
          </div>

          {/* 미리보기 영역 */}
          <div className={`transition-all duration-300 ${selectedPersona ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 invisible'}`}>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 mb-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
              <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-100 mb-2 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                말투 미리보기
              </h3>
              <div className="text-sm text-stone-600 dark:text-stone-300 italic p-3 bg-stone-50 dark:bg-black rounded-xl border border-stone-100 dark:border-stone-800 leading-relaxed text-center relative">

                {selectedPersona === 'friend' && '"오늘 하루 어땠어? 너의 감정을 이렇게 솔직하게 적어줘서 정말 고마워! 내가 항상 네 이야기에 귀 기울여 줄게."'}
                {selectedPersona === 'parent' && '"힘든 일이 있었구나. 괜찮아, 천천히 해도 돼. 엄마/아빠는 네가 자랑스러워."'}
                {selectedPersona === 'expert' && '"오늘의 감정 패턴을 분석한 결과, 스트레스 관리가 필요해 보입니다. 규칙적인 휴식과 수면을 취해보는 것이 좋겠습니다."'}
                {selectedPersona === 'mentor' && '"오늘의 작은 성장이 내일의 큰 변화를 만들어. 계속 나아가자, 할 수 있어!"'}
                {selectedPersona === 'therapist' && '"당신의 감정을 표현해주셔서 감사해요. 이런 감정을 느끼는 것은 자연스러운 반응입니다."'}
                {selectedPersona === 'poet' && '"오늘의 감정은 구름 사이로 비치는 달빛처럼 은은하면서도 깊은 의미를 담고 있어요."'}
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-center">
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          {/* 시작하기 버튼 */}
          <button
            onClick={handleComplete}
            disabled={!selectedPersona || isLoading}
            className={`w-full py-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-bold ${selectedPersona && !isLoading
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-500/20 active:scale-[0.98]'
              : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed shadow-none'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                설정 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                시작하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}



