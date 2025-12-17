/**
 * Persona 변환 유틸리티
 * - 프론트엔드(한글) <-> 백엔드(Enum) 간 변환
 */

/**
 * 한글 Persona → 백엔드 enum 변환
 */
export function personaToEnum(persona: string): string {
  const personaMap: { [key: string]: string } = {
    '베프': 'BEST_FRIEND',
    '부모님': 'PARENTS',
    '전문가': 'EXPERT',
    '멘토': 'MENTOR',
    '상담사': 'COUNSELOR',
    '시인': 'POET',
  };
  
  return personaMap[persona] || 'BEST_FRIEND'; // 기본값
}

/**
 * 백엔드 enum → 한글 Persona 변환
 */
export function enumToPersona(personaEnum: string): string {
  const enumMap: { [key: string]: string } = {
    'BEST_FRIEND': '베프',
    'PARENTS': '부모님',
    'EXPERT': '전문가',
    'MENTOR': '멘토',
    'COUNSELOR': '상담사',
    'POET': '시인',
  };
  
  return enumMap[personaEnum] || '베프'; // 기본값
}

