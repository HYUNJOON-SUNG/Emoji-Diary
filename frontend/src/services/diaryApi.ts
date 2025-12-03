/**
 * ========================================
 * 일기 API 서비스 (Mock 구현)
 * ========================================
 * 
 * [백엔드 팀 작업 필요]
 * - 현재는 Mock 데이터로 동작하며, 실제 백엔드 API와 연결이 필요합니다.
 * - 각 함수의 주석을 참고하여 실제 API 엔드포인트를 구현해주세요.
 * - JWT 토큰은 localStorage에서 가져와 헤더에 포함시켜주세요.
 * 
 * [AI 팀 작업 필요]
 * - createDiary, updateDiary 함수에서 AI 코멘트 생성 부분을 실제 API로 연결해주세요.
 * - generateAIComment 함수를 제미나이 API 호출로 대체해주세요.
 * 
 * [플로우 14: 에러 처리 플로우]
 * 
 * **플로우 14.2: API 에러** (명세서)
 * - 네트워크 에러: 에러 메시지 표시 (예: "일기를 불러오는 데 실패했습니다.")
 * - 인증 에러: 로그인 페이지로 리다이렉트
 * - 기타 에러: 각 화면에서 적절한 에러 메시지 표시
 * 
 * **플로우 14.3: 로딩 상태** (명세서)
 * - API 호출 중: 로딩 스피너 표시
 * - 버튼: "저장 중...", "검색 중..." 등 텍스트 변경
 * - 화면 전체: 중앙에 로딩 스피너
 * 
 * [백엔드 팀] 에러 처리 가이드:
 * - 400: 잘못된 요청 → "입력값을 확인해주세요"
 * - 401: 인증 실패 → 로그인 페이지 리다이렉트
 * - 403: 권한 없음 → "접근 권한이 없습니다"
 * - 404: 리소스 없음 → "요청한 데이터를 찾을 수 없습니다"
 * - 500: 서버 에러 → "서버 오류가 발생했습니다"
 */

/**
 * 감정 데이터 인터페이스
 * - 캘린더 히트맵에 표시되는 일별 감정 정보
 */
export interface EmotionData {
  date: string; // 날짜 (YYYY-MM-DD 형식)
  emotion: string; // 감정 이모지 (예: '😊', '😢')
  emotionCategory: string; // 감정 카테고리 (예: 'happy', 'sad', 'anxious')
}

/**
 * 일기 상세 정보 인터페이스
 * - 일기 조회/작성/수정 시 사용되는 전체 데이터 구조
 */
export interface DiaryDetail {
  id: string; // 일기 고유 ID
  date: string; // 날짜 (YYYY-MM-DD 형식)
  emotion: string; // 사용자가 선택한 감정 이모지
  emotionCategory: string; // AI가 분석한 감정 카테고리 (KoBERT 결과)
  mood: string; // 사용자가 입력한 기분 텍스트
  title: string; // 일기 제목
  note: string; // 일기 본문
  weather?: string; // 날씨 (선택사항)
  activities?: string[]; // 활동 목록 (선택사항)
  aiComment?: string; // AI 코멘트 (제미나이 API로 생성, 페르소나 반영)
  imageUrl?: string; // AI 생성 그림일기 이미지 URL (나노바나나 API)
}

/**
 * 일기 작성 요청 인터페이스
 * - POST /diaries API에 전송되는 데이터 구조
 */
export interface CreateDiaryRequest {
  date: string; // 날짜 (YYYY-MM-DD 형식)
  title: string; // 일기 제목 (필수)
  note: string; // 일기 본문 (필수)
  emotion: string; // 사용자가 선택한 감정 이모지
  mood: string; // 사용자가 입력한 기분
  weather?: string; // 날씨 (선택사항)
  activities?: string[]; // 활동 목록 (선택사항)
  imageUrl?: string; // AI 생성 그림일기 이미지 URL (나노바나나 API)
}

/**
 * 일기 수정 요청 인터페이스
 * - PATCH /diaries/{id} API에 전송되는 데이터 구조
 */
export interface UpdateDiaryRequest {
  title: string; // 일기 제목 (필수)
  note: string; // 일기 본문 (필수)
  emotion: string; // 사용자가 선택한 감정 이모지
  mood: string; // 사용자가 입력한 기분
  weather?: string; // 날씨 (선택사항)
  activities?: string[]; // 활동 목록 (선택사항)
  imageUrl?: string; // AI 생성 그림일기 이미지 URL (기존 이미지 유지)
}

/**
 * ========== Mock 데이터 (백엔드 구현 시 제거) ==========
 */

/**
 * Mock 감정 데이터 (캘린더 히트맵용)
 * 
 * [백엔드 팀] GET /diaries/emotions?month=YYYY-MM 엔드포인트로 교체
 * - 해당 월의 모든 일기 날짜와 감정 정보 반환
 * - 캘린더에 감정 스티커 표시용
 */
let mockEmotionData: EmotionData[] = [
  { date: '2025-11-03', emotion: '🌟', emotionCategory: 'happy' },
  { date: '2025-11-05', emotion: '😊', emotionCategory: 'happy' },
  { date: '2025-11-08', emotion: '🥰', emotionCategory: 'love' },
  { date: '2025-11-10', emotion: '✨', emotionCategory: 'excited' },
  { date: '2025-11-12', emotion: '😌', emotionCategory: 'calm' },
  { date: '2025-11-13', emotion: '😢', emotionCategory: 'sad' },
  { date: '2025-11-14', emotion: '😰', emotionCategory: 'anxious' },
  { date: '2025-11-15', emotion: '😞', emotionCategory: 'sad' },
  { date: '2025-11-16', emotion: '😔', emotionCategory: 'sad' },
  { date: '2025-11-17', emotion: '😟', emotionCategory: 'anxious' },
  { date: '2025-11-18', emotion: '😢', emotionCategory: 'sad' },
  { date: '2025-11-19', emotion: '😰', emotionCategory: 'anxious' },
  { date: '2025-11-20', emotion: '😞', emotionCategory: 'sad' },
  { date: '2025-11-22', emotion: '🌈', emotionCategory: 'hopeful' },
  { date: '2025-11-25', emotion: '😴', emotionCategory: 'tired' },
  { date: '2025-11-27', emotion: '😊', emotionCategory: 'happy' },
];

/**
 * Mock 일기 상세 데이터
 * 
 * [백엔드 팀] 실제 DB로 교체
 * - 날짜(YYYY-MM-DD)를 키로 사용
 * - 일기 전체 정보 저장
 */
let mockDiaryDetails: { [key: string]: DiaryDetail } = {
  '2025-11-03': {
    id: 'd1',
    date: '2025-11-03',
    emotion: '🌟',
    emotionCategory: 'happy',
    mood: 'Inspired',
    title: '새로운 시작',
    note: 'Started a new project today. Feeling motivated and ready for new challenges!',
    weather: '맑음',
    activities: ['운동', '독서'],
    aiComment: '긍정적인 에너지가 느껴지는 하루네요! 새로운 도전을 시작하는 모습이 멋져요.',
    imageUrl: 'https://images.unsplash.com/photo-1605702012553-e954fbde66eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMGNpdHklMjBsaWdodHN8ZW58MXx8fHwxNzY0MjQ5OTcyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  '2025-11-05': {
    id: 'd2',
    date: '2025-11-05',
    emotion: '😊',
    emotionCategory: 'happy',
    mood: 'Content',
    title: '평화로운 아침',
    note: 'Had a peaceful morning walk. The fresh air really cleared my mind.',
    weather: '맑음',
    activities: ['산책'],
    aiComment: '자연과 함께하는 시간은 마음을 편안하게 해주죠. 좋은 하루 보내셨네요!',
    imageUrl: 'https://images.unsplash.com/photo-1506788493784-a85a26871e43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMG1vcm5pbmclMjBuYXR1cmV8ZW58MXx8fHwxNzY0Mjk3NzA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  '2025-11-08': {
    id: 'd3',
    date: '2025-11-08',
    emotion: '🥰',
    emotionCategory: 'love',
    mood: 'Loving',
    title: '소중한 시간',
    note: 'Spent quality time with loved ones. These moments are precious.',
    weather: '흐림',
    activities: ['가족 시간'],
    aiComment: '가족과 함께하는 시간은 정말 소중해요. 따뜻한 하루였겠어요.',
    imageUrl: 'https://images.unsplash.com/photo-1703611987698-595febef3f9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBnYXRoZXJpbmclMjB3YXJtfGVufDF8fHx8MTc2NDI5NzcwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  '2025-11-10': {
    id: 'd4',
    date: '2025-11-10',
    emotion: '✨',
    emotionCategory: 'excited',
    mood: 'Magical',
    title: '놀라운 발견',
    note: 'Discovered something amazing today. Life is full of surprises!',
    weather: '맑음',
    activities: ['공부', '취미'],
    aiComment: '새로운 발견은 항상 설레게 하죠! 호기심을 잃지 않는 모습이 좋아요.',
  },
  '2025-11-12': {
    id: 'd5',
    date: '2025-11-12',
    emotion: '😌',
    emotionCategory: 'calm',
    mood: 'Peaceful',
    title: '조용한 하루',
    note: 'Just a quiet, restful day. Sometimes that\'s exactly what we need.',
    weather: '맑음',
    activities: ['휴식'],
    aiComment: '때로는 아무것도 하지 않는 시간이 가장 필요해요. 잘 쉬셨길 바래요.',
    imageUrl: 'https://images.unsplash.com/photo-1622489937280-af9291e62ccc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBiZWFjaCUyMHBlYWNlZnVsfGVufDF8fHx8MTc2NDI5NzcwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  '2025-11-13': {
    id: 'd12',
    date: '2025-11-13',
    emotion: '😢',
    emotionCategory: 'sad',
    mood: 'Sad',
    title: '슬픈 날',
    note: 'Had a tough day. Feeling down but trying to stay positive.',
    weather: '흐림',
    activities: ['독서'],
    aiComment: '어려운 날이지만, 긍정적인 마음가짐을 유지하는 것이 중요해요.',
  },
  '2025-11-14': {
    id: 'd13',
    date: '2025-11-14',
    emotion: '😰',
    emotionCategory: 'anxious',
    mood: 'Anxious',
    title: '불안한 순간',
    note: 'Feeling anxious about upcoming events. Need to find a way to relax.',
    weather: '흐림',
    activities: ['명상'],
    aiComment: '불안감을 느낄 때는 명상이나 휴식이 도움이 될 수 있어요.',
  },
  '2025-11-15': {
    id: 'd6',
    date: '2025-11-15',
    emotion: '😄',
    emotionCategory: 'happy',
    mood: 'Joyful',
    title: '새로운 배움',
    note: 'Started learning something new. The journey ahead looks promising and fun.',
    weather: '맑음',
    activities: ['공부', '운동'],
    aiComment: '배움은 언제나 즐거워요! 앞으로의 여정이 기대되네요.',
  },
  '2025-11-16': {
    id: 'd14',
    date: '2025-11-16',
    emotion: '😔',
    emotionCategory: 'sad',
    mood: 'Sad',
    title: '슬픈 생각',
    note: 'Thinking about past events that made me sad. Trying to move on.',
    weather: '흐림',
    activities: ['산책'],
    aiComment: '과거의 슬픔을 기억하면서도 앞으로 나아가는 것이 중요해요.',
  },
  '2025-11-17': {
    id: 'd7',
    date: '2025-11-17',
    emotion: '🎉',
    emotionCategory: 'excited',
    mood: 'Excited',
    title: '좋은 소식',
    note: 'Got some amazing news today! Can\'t wait to share with everyone.',
    weather: '맑음',
    activities: ['모임'],
    aiComment: '축하해요! 좋은 소식이 있다니 정말 기쁘겠어요.',
  },
  '2025-11-18': {
    id: 'd8',
    date: '2025-11-18',
    emotion: '😢',
    emotionCategory: 'sad',
    mood: 'Sad',
    title: '프로젝트 완료',
    note: 'Completed my project on time. Celebrated with friends at our favorite cafe!',
    weather: '맑음',
    activities: ['작업', '친구 만남'],
    aiComment: '목표를 달성하셨네요! 친구들과의 축하는 더욱 의미있었을 거예요.',
  },
  '2025-11-19': {
    id: 'd15',
    date: '2025-11-19',
    emotion: '😰',
    emotionCategory: 'anxious',
    mood: 'Anxious',
    title: '불안한 하루',
    note: 'Feeling anxious about the future. Need to find a way to relax.',
    weather: '흐림',
    activities: ['명상'],
    aiComment: '불안감을 느낄 때는 명상이나 휴식이 도움이 될 수 있어요.',
  },
  '2025-11-20': {
    id: 'd9',
    date: '2025-11-20',
    emotion: '😞',
    emotionCategory: 'sad',
    mood: 'Sad',
    title: '감사한 하루',
    note: 'Had a wonderful day with family. Feeling blessed and content. The weather was perfect.',
    weather: '맑음',
    activities: ['가족 시간', '외식'],
    aiComment: '감사하는 마음을 가진 하루는 특별해요. 좋은 시간 보내셨네요!',
  },
  '2025-11-22': {
    id: 'd10',
    date: '2025-11-22',
    emotion: '🌈',
    emotionCategory: 'hopeful',
    mood: 'Hopeful',
    title: '희망찬 미래',
    note: 'Looking forward to the future. So many possibilities ahead!',
    weather: '비',
    activities: ['계획 세우기'],
    aiComment: '미래에 대한 기대감이 느껴져요. 긍정적인 마음가짐이 좋아요!',
  },
  '2025-11-25': {
    id: 'd11',
    date: '2025-11-25',
    emotion: '😴',
    emotionCategory: 'tired',
    mood: 'Tired',
    title: '긴 하루',
    note: 'Long day but productive. Need to get some rest tonight.',
    weather: '흐림',
    activities: ['작업'],
    aiComment: '오늘 하루도 수고 많으셨어요. 푹 쉬시고 내일을 준비하세요!',
  },
  '2025-11-27': {
    id: 'd16',
    date: '2025-11-27',
    emotion: '😊',
    emotionCategory: 'happy',
    mood: '평온하고 행복함',
    title: '카페에서의 오후',
    note: '오늘은 좋아하는 카페에 갔다. 창밖으로 비가 내리는 걸 보면서 따뜻한 커피를 마셨다. 평소보다 여유로운 시간을 보낼 수 있어서 좋았다. 책도 읽고, 생각도 정리하고... 이런 날이 더 많았으면 좋겠다.',
    weather: '비',
    activities: ['카페', '독서', '휴식'],
    aiComment: '오늘의 감정은 구름 사이로 비치는 달빛처럼 은은하면서도 깊은 의미를 담고 있어요. 여유로운 시간을 가질 수 있어서 다행이에요!',
    imageUrl: 'https://images.unsplash.com/photo-1524577393498-23c6b0c40468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwY2FmZSUyMHJhaW55fGVufDF8fHx8MTc2NDI5NzcwNnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
};

/**
 * API 응답 시뮬레이션을 위한 지연 함수
 * [백엔드 팀] 실제 API 연결 시 이 함수는 제거됩니다.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * AI 코멘트 생성 함수 (Mock)
 * 
 * [AI 팀 작업 필요 - 최우선 작업]
 * 이 함수를 제미나이 API 호출로 대체해주세요.
 * 
 * 요구사항:
 * 1. KoBERT 모델로 일기 본문(note) 감정 분석
 *    - KoBERT 결과는 사용자에게 직접 표시하지 않음
 *    - emotionCategory 필드에 저장 (happy, sad, anxious 등)
 * 
 * 2. 제미나이 API로 AI 코멘트 생성
 *    - 입력: KoBERT 분석 결과 + 사용자 선택 감정(emotion) + 페르소나 정보
 *    - 페르소나는 localStorage.getItem('aiPersona')에서 가져옴
 *    - 페르소나 종류: friend(베프), parent(부모님), expert(전문가), 
 *                      mentor(멘토), therapist(상담사), poet(시인)
 *    - 각 페르소나에 맞는 말투와 스타일로 코멘트 생성
 * 
 * 3. 반환값: AI 코멘트 문자열 (한글, 2-3문장)
 * 
 * @param mood - 사용자가 입력한 기분
 * @param note - 일기 본문 (감정 분석 대상)
 * @returns AI 코멘트 문자열
 */
const generateAIComment = (mood: string, note: string): string => {
  // [AI 팀] 아래 mock 코드를 실제 제미나이 API 호출로 대체해주세요.
  
  // localStorage에서 페르소나 설정 가져오기 (플로우 16.1)
  const persona = localStorage.getItem('aiPersona') || 'friend';
  
  // 페르소나별 코멘트 스타일 (Mock 구현)
  // [AI 팀] 실제 구현 시 제미나이 API에 페르소나 정보를 전달하여 
  // 각 페르소나에 맞는 말투와 스타일로 코멘트를 생성해주세요.
  const commentsByPersona: { [key: string]: string[] } = {
    // 베프 (친근하고 공감적인 친구)
    friend: [
      '오 오늘 하루 어땠어? 너의 감정을 이렇게 솔직하게 적어줘서 고마워!',
      '와 진짜 멋진 하루였네! 이런 순간들 계속 기억하자~',
      '너의 이야기 들으니까 나도 기분이 좋아지는 것 같아. 항상 응원해!',
      '오늘도 수고했어! 감정을 표현하는 거 정말 중요한데 잘하고 있어.',
      '이런 경험들이 쌓여서 너를 더 성장시킬 거야. 파이팅!',
    ],
    
    // 부모님 (따뜻하고 지지적인 보호자)
    parent: [
      '힘든 일이 있었구나. 괜찮아, 천천히 해도 돼. 엄마/아빠는 네가 자랑스러워.',
      '오늘도 열심히 했네. 많이 힘들었지? 잘 이겨내고 있어. 정말 대견해.',
      '무슨 일이 있어도 엄마/아빠는 항상 네 편이야. 언제든 기댈 수 있어.',
      '네가 이렇게 감정을 잘 표현하는 걸 보니 정말 기특하구나. 잘 자라고 있어.',
      '힘들 때는 쉬어가도 괜찮아. 네 건강이 제일 중요하단다. 사랑해.',
    ],
    
    // 전문가 (전문적이고 분석적인 조언자)
    expert: [
      '오늘의 감정 패턴을 분석한 결과, 스트레스 관리가 필요해 보입니다. 호흡 운동을 추천드립니다.',
      '감정 일기 작성은 정신 건강에 긍정적인 영향을 미치는 것으로 연구되었습니다. 꾸준히 이어가시길 권장합니다.',
      '자신의 감정을 인지하고 기록하는 것은 감정 조절 능력 향상에 도움이 됩니다.',
      '일기를 통한 자기 성찰은 스트레스 관리와 심리적 안정에 효과적입니다.',
      '정기적인 감정 기록은 자기 인식을 높이고 정서적 웰빙을 증진시킵니다.',
    ],
    
    // 멘토 (동기부여하는 성장 코치)
    mentor: [
      '오늘의 작은 성장이 내일의 큰 변화를 만들어. 계속 나아가자, 할 수 있어!',
      '오늘 하루를 돌아보며 감정을 기록하는 것, 정말 훌륭한 습관입니다. 이런 성찰이 당신을 성장시킬 거예요.',
      '감정을 솔직하게 표현하는 것은 자기 이해의 첫걸음입니다. 잘하고 계세요.',
      '당신의 경험과 감정을 소중히 여기세요. 이 모든 순간이 당신을 만들어갑니다.',
      '오늘의 감정을 인정하고 받아들이는 것, 그것이 진정한 성장의 시작이에요.',
    ],
    
    // 상담사 (심리 분석 중심 치유자)
    therapist: [
      '당신의 감정을 표현해주셔서 감사해요. 이런 감정을 느끼는 것은 자연스러운 반응입니다.',
      '감정을 마주하는 용기를 내주셔서 기쁩니다. 스스로를 이해하는 과정이 시작되었네요.',
      '오늘 하루 당신의 감정에 귀 기울여 보세요. 모든 감정은 의미가 있습니다.',
      '감정을 표현하는 것 자체가 치유의 시작입니다. 잘하고 계세요.',
      '당신의 감정은 소중합니다. 이렇게 기록하며 자신을 돌보는 것이 중요해요.',
    ],
    
    // 시인 (감성적이고 철학적인 예술가)
    poet: [
      '오늘의 감정은 구름 사이로 비치는 달빛처럼 은은하면서도 깊은 의미를 담고 있어요.',
      '당신의 마음은 잔잔한 호수에 비치는 하늘처럼 아름답고도 깊습니다.',
      '감정은 바람에 흩날리는 꽃잎처럼 덧없지만, 그 순간의 아름다움은 영원히 남아요.',
      '오늘 당신의 마음에 내린 빗방울들이 내일의 무지개가 될 거예요.',
      '당신의 감정은 계절이 바뀌는 자연처럼 자연스럽고 조화로워요.',
    ],
  };
  
  // 선택된 페르소나의 코멘트 목록 가져오기
  const comments = commentsByPersona[persona] || commentsByPersona['friend'];
  
  // 랜덤하게 하나 선택하여 반환
  return comments[Math.floor(Math.random() * comments.length)];
};

/**
 * ========== API 함수들 ==========
 */

/**
 * GET /diaries/heatMap
 * 해당 사용자, 해당 연월 날짜별 감정 조회
 * 
 * [백엔드 팀] 엔드포인트: GET /api/diaries/heatMap?year={year}&month={month}
 * 
 * 용도:
 * - 캘린더 히트맵에 감정 스티커 표시
 * - 해당 월에 작성된 모든 일기의 날짜와 감정 정보 반환
 * 
 * @param year - 연도 (예: 2025)
 * @param month - 월 (0-11, JavaScript Date 형식)
 * @returns 해당 월의 감정 데이터 배열
 */
export async function fetchMonthlyEmotions(year: number, month: number): Promise<EmotionData[]> {
  await delay(300); // Mock 지연
  
  // [백엔드 팀] 실제 API 호출로 대체
  // const token = localStorage.getItem('accessToken');
  // const response = await fetch(`/api/diaries/heatMap?year=${year}&month=${month + 1}`, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // return await response.json();
  
  const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
  return mockEmotionData.filter(data => data.date.startsWith(yearMonth));
}

/**
 * GET /diaries/details
 * 선택 날짜의 일기 상세 정보 조회 (플로우 3.1)
 * 
 * [백엔드 팀] 엔드포인트: GET /api/diaries/details?date={YYYY-MM-DD}
 * 
 * 용도:
 * - 캘린더에서 날짜 클릭 시 해당 날짜의 일기 조회
 * - 일기가 없으면 null 반환
 * 
 * @param date - 날짜 (YYYY-MM-DD 형식)
 * @returns 일기 상세 정보 또는 null
 */
export async function fetchDiaryDetails(date: string): Promise<DiaryDetail | null> {
  await delay(200); // Mock 지연
  
  // [백엔드 팀] 실제 API 호출로 대체
  // const token = localStorage.getItem('accessToken');
  // const response = await fetch(`/api/diaries/details?date=${date}`, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (response.status === 404) return null;
  // return await response.json();
  
  return mockDiaryDetails[date] || null;
}

/**
 * POST /diaries
 * 일기 작성 API
 * 
 * [백엔드 팀 작업 필요]
 * - 엔드포인트: POST /api/diaries
 * - 헤더: Authorization: Bearer {JWT_TOKEN}
 * - 요청 본문: CreateDiaryRequest 인터페이스 참고
 * - 응답: DiaryDetail 인터페이스 참고
 * 
 * [AI 팀 작업 필요]
 * 1. KoBERT 모델로 일기 본문 감정 분석
 *    - 입력: data.note (일기 본문)
 *    - 출력: emotionCategory (happy, sad, anxious, angry 등)
 * 
 * 2. 제미나이 API로 AI 코멘트 생성
 *    - 입력: KoBERT 결과 + data.emotion (사용자 선택 감정) + 페르소나
 *    - 페르소나: localStorage.getItem('aiPersona')
 *    - 페르소나 종류: friend(베프), parent(부모님), expert(전문가), 
 *                      mentor(멘토), therapist(상담사), poet(시인)
 *    - 각 페르소나에 맞는 말투와 스타일로 코멘트 생성
 * 
 * 처리 흐름:
 * 1. 일기 데이터 저장
 * 2. KoBERT로 감정 분석 (백그라운드)
 * 3. 제미나이 API로 AI 코멘트 생성
 * 4. emotionCategory와 aiComment를 포함한 DiaryDetail 반환
 */
export async function createDiary(data: CreateDiaryRequest): Promise<DiaryDetail> {
  // [백엔드 팀] 실제 API 호출로 대체
  // const token = localStorage.getItem('token');
  // const response = await fetch('/api/diaries', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`
  //   },
  //   body: JSON.stringify(data)
  // });
  // return await response.json();
  
  await delay(500); // API 응답 시뮬레이션
  
  // [AI 팀 작업 필요] generateAIComment를 실제 제미나이 API 호출로 대체
  // const persona = localStorage.getItem('aiPersona') || 'friend';
  // const aiComment = await callGeminiAPI(data.note, data.emotion, persona, kobertResult);
  const aiComment = generateAIComment(data.mood, data.note);
  
  // [AI 팀 작업 필요] emotionCategory는 KoBERT 분석 결과로 대체
  // const kobertResult = await analyzeEmotionWithKoBERT(data.note);
  // 현재는 사용자 선택 감정을 기반으로 간단히 매핑 (Mock)
  const newDiary: DiaryDetail = {
    id: `d${Date.now()}`, // 실제: DB에서 자동 생성
    ...data,
    emotionCategory: data.emotion === '😊' || data.emotion === '😄' || data.emotion === '🌟' ? 'happy' :
                     data.emotion === '🥰' || data.emotion === '💖' ? 'love' :
                     data.emotion === '😌' ? 'calm' :
                     data.emotion === '🎉' || data.emotion === '✨' ? 'excited' :
                     data.emotion === '🤗' ? 'grateful' :
                     data.emotion === '😴' ? 'tired' : 'neutral',
    aiComment,
  };
  
  // Mock 데이터 저장 (실제 환경에서는 백엔드 DB에 저장)
  mockDiaryDetails[data.date] = newDiary;
  
  // 캘린더 히트맵 데이터 업데이트
  const existingIndex = mockEmotionData.findIndex(e => e.date === data.date);
  if (existingIndex >= 0) {
    mockEmotionData[existingIndex] = {
      date: data.date,
      emotion: data.emotion,
      emotionCategory: newDiary.emotionCategory,
    };
  } else {
    mockEmotionData.push({
      date: data.date,
      emotion: data.emotion,
      emotionCategory: newDiary.emotionCategory,
    });
  }
  
  return newDiary;
}

/**
 * PATCH /diaries/{id}
 * 일기 수정 API
 * 
 * [백엔드 팀 작업 필요]
 * - 엔드포인트: PATCH /api/diaries/{id}
 * - 헤더: Authorization: Bearer {JWT_TOKEN}
 * - 요청 본문: UpdateDiaryRequest 인터페이스 참고
 * - 응답: DiaryDetail 인터페이스 참고
 * 
 * [AI 팀 작업 필요]
 * - createDiary와 동일하게 KoBERT + 제미나이 API 호출
 * - 수정된 내용을 기반으로 새로운 감정 분석 및 AI 코멘트 생성
 * 
 * @param id - 일기 고유 ID
 * @param date - 일기 날짜 (YYYY-MM-DD)
 * @param data - 수정할 일기 데이터
 */
export async function updateDiary(id: string, date: string, data: UpdateDiaryRequest): Promise<DiaryDetail> {
  // [백엔드 팀] 실제 API 호출로 대체
  // const token = localStorage.getItem('token');
  // const response = await fetch(`/api/diaries/${id}`, {
  //   method: 'PATCH',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`
  //   },
  //   body: JSON.stringify(data)
  // });
  // return await response.json();
  
  await delay(400); // API 응답 시뮬레이션
  
  const existing = mockDiaryDetails[date];
  if (!existing) {
    throw new Error('Diary not found');
  }
  
  // [AI 팀] generateAIComment를 실제 제미나이 API 호출로 대체
  const aiComment = generateAIComment(data.mood, data.note);
  
  // [AI 팀] emotionCategory는 KoBERT 분석 결과로 대체
  const updatedDiary: DiaryDetail = {
    ...existing,
    ...data,
    emotionCategory: data.emotion === '😊' || data.emotion === '😄' || data.emotion === '🌟' ? 'happy' :
                     data.emotion === '🥰' || data.emotion === '💖' ? 'love' :
                     data.emotion === '😌' ? 'calm' :
                     data.emotion === '🎉' || data.emotion === '✨' ? 'excited' :
                     data.emotion === '🤗' ? 'grateful' :
                     data.emotion === '😴' ? 'tired' : 'neutral',
    aiComment,
  };
  
  // Mock 데이터 업데이트
  mockDiaryDetails[date] = updatedDiary;
  
  // 캘린더 히트맵 데이터 업데이트
  const existingIndex = mockEmotionData.findIndex(e => e.date === date);
  if (existingIndex >= 0) {
    mockEmotionData[existingIndex] = {
      date: date,
      emotion: data.emotion,
      emotionCategory: updatedDiary.emotionCategory,
    };
  }
  
  return updatedDiary;
}

/**
 * DELETE /diaries/{id}
 * 일기 삭제
 * 
 * [백엔드 팀] 엔드포인트: DELETE /api/diaries/{id}
 * 
 * 동작:
 * 1. 일기 데이터 삭제
 * 2. 캘린더 히트맵 데이터도 함께 삭제
 * 
 * @param id - 일기 고유 ID
 * @param date - 일기 날짜 (YYYY-MM-DD)
 */
export async function deleteDiary(id: string, date: string): Promise<void> {
  await delay(300);
  
  // [백엔드 팀] 실제 API 호출로 대체
  // const token = localStorage.getItem('accessToken');
  // await fetch(`/api/diaries/${id}`, {
  //   method: 'DELETE',
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  
  // Mock 데이터 삭제
  delete mockDiaryDetails[date];
  
  // 히트맵 데이터에서도 제거
  mockEmotionData = mockEmotionData.filter(e => e.date !== date);
}

/**
 * ========== 통계 API ==========
 */

/**
 * 일별 통계 데이터 인터페이스
 * - 감정 통계 페이지의 히트맵에 사용
 */
export interface DailyStats {
  date: string; // 날짜 (YYYY-MM-DD)
  emotion: string; // 감정 이모지
  emotionCategory: string; // 감정 카테고리
  title: string; // 일기 제목
}

/**
 * GET /stats/daily?month={YYYY-MM}
 * 해당 월의 일별 감정 통계 조회
 * 
 * [백엔드 팀] 엔드포인트: GET /api/stats/daily?month={YYYY-MM}
 * 
 * 용도:
 * - 감정 통계 페이지에서 해당 월의 모든 일기 감정 데이터 조회
 * - 월별 감정 히트맵 표시
 * 
 * @param yearMonth - 연월 (YYYY-MM 형식)
 * @returns 일별 감정 통계 배열
 */
export async function fetchDailyStats(yearMonth: string): Promise<DailyStats[]> {
  await delay(300);
  
  // [백엔드 팀] 실제 API 호출로 대체
  // const token = localStorage.getItem('accessToken');
  // const response = await fetch(`/api/stats/daily?month=${yearMonth}`, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // return await response.json();
  
  // Mock 구현: 해당 월의 일기 필터링
  const stats: DailyStats[] = [];
  
  Object.values(mockDiaryDetails)
    .filter(diary => diary.date.startsWith(yearMonth))
    .forEach(diary => {
      stats.push({
        date: diary.date,
        emotion: diary.emotion,
        emotionCategory: diary.emotionCategory,
        title: diary.title,
      });
    });
  
  return stats;
}

/**
 * 차트 데이터 포인트 인터페이스
 * - 감정 통계 페이지의 선 그래프에 사용
 */
export interface ChartDataPoint {
  date: string; // 날짜 (YYYY-MM-DD)
  displayLabel: string; // 차트 표시용 레이블 (예: "11월 1주차", "11월")
  happy: number; // 행복 감정 카운트
  love: number; // 사랑 감정 카운트
  excited: number; // 설렘 감정 카운트
  calm: number; // 평온 감정 카운트
  grateful: number; // 감사 감정 카운트
  hopeful: number; // 희망 감정 카운트
  tired: number; // 피곤 감정 카운트
  sad: number; // 슬픔 감정 카운트
  angry: number; // 화남 감정 카운트
  anxious: number; // 불안 감정 카운트
  neutral: number; // 중립 감정 카운트
  total: number; // 전체 일기 개수
}

/**
 * GET /stats/chart?start={YYYY-MM-DD}&end={YYYY-MM-DD}&type={weekly|monthly}
 * 기간별 감정 변화 추이 데이터 조회 (Aggregation)
 * 
 * [백엔드 팀] 엔드포인트: GET /api/stats/chart
 * 
 * 용도:
 * - 감정 통계 페이지의 선 그래프 데이터
 * - 주별/월별 감정 변화 추이 분석
 * 
 * 처리:
 * - type='weekly': 주별로 감정 집계
 * - type='monthly': 월별로 감정 집계
 * 
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @param type - 집계 타입 (weekly 또는 monthly)
 * @returns 차트 데이터 포인트 배열
 */
export async function fetchChartStats(
  startDate: string,
  endDate: string,
  type: 'weekly' | 'monthly'
): Promise<ChartDataPoint[]> {
  await delay(400);
  
  // [백엔드 팀] 실제 API 호출로 대체
  // const token = localStorage.getItem('accessToken');
  // const response = await fetch(
  //   `/api/stats/chart?start=${startDate}&end=${endDate}&type=${type}`, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // return await response.json();
  
  // Mock 구현: 기간 내 일기 필터링
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const filteredDiaries = Object.values(mockDiaryDetails).filter(diary => {
    const diaryDate = new Date(diary.date);
    return diaryDate >= start && diaryDate <= end;
  });
  
  // Aggregate by date
  const aggregated: { [key: string]: ChartDataPoint } = {};
  
  filteredDiaries.forEach(diary => {
    const date = diary.date;
    
    if (!aggregated[date]) {
      aggregated[date] = {
        date,
        displayLabel: formatDateLabel(date, type),
        happy: 0,
        love: 0,
        excited: 0,
        calm: 0,
        grateful: 0,
        hopeful: 0,
        tired: 0,
        sad: 0,
        angry: 0,
        anxious: 0,
        neutral: 0,
        total: 0,
      };
    }
    
    // Increment emotion category count
    const category = diary.emotionCategory as keyof Omit<ChartDataPoint, 'date' | 'displayLabel' | 'total'>;
    if (category in aggregated[date]) {
      aggregated[date][category]++;
      aggregated[date].total++;
    }
  });
  
  // Convert to array and sort by date
  return Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date));
}

function formatDateLabel(dateStr: string, type: 'weekly' | 'monthly'): string {
  const date = new Date(dateStr);
  if (type === 'weekly') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } else {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
}

/**
 * 일기 검색 파라미터 인터페이스 (플로우 6.1, 6.2)
 * 
 * [백엔드 팀 작업 필요]
 * - 엔드포인트: GET /api/diaries/search
 * - 파라미터:
 *   * keyword: 제목이나 내용으로 검색
 *   * startDate: 기간 검색 시작일 (YYYY-MM-DD)
 *   * endDate: 기간 검색 종료일 (YYYY-MM-DD)
 *   * emotionCategory: 감정 카테고리 필터 (여러 감정 중복 선택 가능, 콤마로 구분)
 *     예: "happy,love,excited" → 선택된 감정 중 하나라도 포함된 일기 검색
 *   * page: 현재 페이지 번호
 *   * limit: 페이지당 항목 수 (플로우 6.2: 10개)
 * 
 * 플로우 6.2 요구사항:
 * - 키워드 검색: 제목이나 내용에서 검색
 * - 기간 검색: 시작일 ~ 종료일 범위
 * - 감정별 검색: 여러 감정 중복 선택 가능 (체크박스 방식)
 * - 필터 변경 시 자동으로 검색 실행
 * - 검색 결과 최신순 표시
 * - 페이지당 10개 일기 표시
 */
export interface DiarySearchParams {
  keyword?: string; // 키워드 (제목 또는 내용)
  startDate?: string; // 기간 검색 시작일
  endDate?: string; // 기간 검색 종료일
  emotionCategory?: string; // 감정 카테고리 필터 (콤마 구분: "happy,love,excited")
  page?: number; // 현재 페이지 번호
  limit?: number; // 페이지당 항목 수
}

/**
 * 일기 검색 결과 인터페이스 (플로우 6.1, 6.2)
 * 
 * [백엔드 팀 작업 필요]
 * - 응답 형식:
 *   * diaries: 검색된 일기 목록 (최신순)
 *   * total: 총 일기 개수
 *   * page: 현재 페이지 번호
 *   * totalPages: 전체 페이지 수
 */
export interface DiarySearchResult {
  diaries: DiaryDetail[]; // 검색된 일기 목록
  total: number; // 총 일기 개수
  page: number; // 현재 페이지 번호
  totalPages: number; // 전체 페이지 수
}

/**
 * 일기 검색 API (플로우 6.1, 6.2)
 * 
 * [백엔드 팀 작업 필요]
 * - 엔드포인트: GET /api/diaries/search
 * - 파라미터: DiarySearchParams
 * - 응답: DiarySearchResult
 * 
 * 검색 기능 (플로우 6.2):
 * 1. 키워드 검색: 제목이나 내용에 키워드 포함된 일기
 * 2. 기간 검색: 시작일 ~ 종료일 범위 내 일기
 * 3. 감정별 검색: 여러 감정 중복 선택 가능
 *    - emotionCategory 파라미터: "happy,love,excited" (콤마로 구분)
 *    - 선택된 감정 중 하나라도 포함된 일기를 검색 결과에 표시
 * 4. 정렬: 최신순 (날짜 내림차순)
 * 5. 페이지네이션: 페이지당 10개 항목
 * 
 * Mock 구현:
 * - 실제 백엔드 API로 교체 필요
 * - 현재는 mockDiaryDetails에서 필터링
 */
export async function searchDiaries(params: DiarySearchParams): Promise<DiarySearchResult> {
  // Mock API delay
  await delay(300);
  
  const {
    keyword = '',
    startDate,
    endDate,
    emotionCategory,
    page = 1,
    limit = 10, // 플로우 6.2: 페이지당 10개
  } = params;
  
  // Filter diaries
  let filtered = Object.values(mockDiaryDetails);
  
  // 1. 키워드 검색 (제목 또는 내용)
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filtered = filtered.filter(diary => 
      diary.title.toLowerCase().includes(lowerKeyword) ||
      diary.note.toLowerCase().includes(lowerKeyword)
    );
  }
  
  // 2. 기간 검색 (시작일)
  if (startDate) {
    filtered = filtered.filter(diary => diary.date >= startDate);
  }
  
  // 3. 기간 검색 (종료일)
  if (endDate) {
    filtered = filtered.filter(diary => diary.date <= endDate);
  }
  
  // 4. 감정별 검색 (플로우 6.2: 여러 감정 중복 선택 가능)
  // emotionCategory 예: "happy,love,excited" (콤마로 구분)
  // 선택된 감정 중 하나라도 포함된 일기를 검색 결과에 표시
  if (emotionCategory) {
    const categories = emotionCategory.split(',').map(c => c.trim());
    filtered = filtered.filter(diary => categories.includes(diary.emotionCategory));
  }
  
  // 5. 정렬: 최신순 (날짜 내림차순)
  filtered.sort((a, b) => b.date.localeCompare(a.date));
  
  // 6. 페이지네이션
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const diaries = filtered.slice(startIndex, endIndex);
  
  return {
    diaries,
    total,
    page,
    totalPages,
  };
}