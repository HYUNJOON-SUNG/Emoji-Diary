/**
 * AI 이미지 생성 관련 유틸리티
 * - 일기 텍스트 기반 키워드 추출
 * - Unsplash 검색 쿼리 생성
 * - 실제 이미지 생성은 백엔드에서 처리됨
 */

/**
 * 이미지 생성을 위한 키워드 인터페이스
 */
interface ImageKeywords {
  primary: string; // 주요 키워드 (예: 'cafe', 'nature')
  secondary: string; // 보조 키워드 (예: 'rainy', 'sunny')
  mood: string; // 분위기 키워드 (예: 'peaceful calm', 'joyful colorful')
}

/**
 * 일기 내용에서 이미지 생성용 키워드 추출
 * @param content 일기 본문
 * @param emotion 사용자 감정
 * @param weather 날씨
 * @returns 추출된 키워드 (primary, secondary, mood)
 */
export function extractImageKeywords(
  content: string,
  emotion: string,
  weather?: string
): ImageKeywords {
  const text = content.toLowerCase();
  
  // Emotion-based mood mapping
  const moodMap: { [key: string]: string } = {
    '행복': 'bright sunny cheerful',
    '기쁨': 'joyful colorful vibrant',
    '사랑': 'warm gentle romantic',
    '평온': 'peaceful calm serene',
    '흥분': 'energetic dynamic vivid',
    '감사': 'grateful light soft',
    '슬픔': 'melancholic rainy blue',
    '우울': 'moody grey atmospheric',
    '불안': 'dark foggy mysterious',
    '분노': 'intense stormy dramatic',
    '외로움': 'solitary quiet minimal',
    '피곤': 'tired soft muted',
  };

  // Weather-based keywords
  const weatherMap: { [key: string]: string } = {
    '맑음': 'sunny clear sky',
    '흐림': 'cloudy overcast',
    '비': 'rainy wet drops',
    '눈': 'snowy winter white',
    '안개': 'foggy misty mysterious',
  };

  // Common diary keywords and their visual equivalents
  const keywordMap: { [key: string]: string } = {
    '카페': 'cozy cafe coffee',
    '커피': 'coffee cup warm',
    '집': 'home cozy interior',
    '방': 'bedroom window light',
    '공원': 'park nature trees',
    '산': 'mountain landscape hiking',
    '바다': 'ocean beach waves',
    '강': 'river water peaceful',
    '하늘': 'sky clouds beautiful',
    '꽃': 'flowers blooming garden',
    '나무': 'trees forest nature',
    '책': 'book reading cozy',
    '음악': 'music aesthetic vintage',
    '영화': 'cinema movie aesthetic',
    '친구': 'friends gathering happy',
    '가족': 'family warm together',
    '반려동물': 'pet cute adorable',
    '고양이': 'cat cute cozy',
    '강아지': 'dog puppy happy',
    '여행': 'travel adventure landscape',
    '도시': 'city urban night',
    '밤': 'night stars moonlight',
    '아침': 'morning sunrise golden',
    '저녁': 'sunset evening golden hour',
    '식사': 'food delicious aesthetic',
    '요리': 'cooking kitchen warm',
    '운동': 'sport fitness active',
    '산책': 'walk path nature',
    '드라이브': 'road drive scenic',
    '비': 'rain window droplets',
    '눈': 'snow winter peaceful',
    '봄': 'spring flowers bloom',
    '여름': 'summer bright warm',
    '가을': 'autumn leaves orange',
    '겨울': 'winter snow cold',
  };

  // Find matching keywords in diary text
  let primary = 'aesthetic';
  let secondary = 'artistic';
  
  for (const [keyword, visual] of Object.entries(keywordMap)) {
    if (text.includes(keyword)) {
      if (primary === 'aesthetic') {
        primary = visual;
      } else {
        secondary = visual;
        break;
      }
    }
  }

  // Get mood from emotion
  const mood = moodMap[emotion] || 'peaceful calm';

  // Add weather if available
  if (weather && weatherMap[weather]) {
    secondary = weatherMap[weather];
  }

  return { primary, secondary, mood };
}

/**
 * [Deprecated] 일기 이미지 생성 요청
 * - 현재 백엔드에서 일기 저장 시 자동으로 처리됨
 * @deprecated 백엔드 자동 처리로 변경됨
 */
export async function generateDiaryImage(
  content: string,
  emotion: string,
  weather?: string
): Promise<string> {
  // [중요] 이 함수는 더 이상 사용되지 않습니다.
  // AI 이미지 생성은 백엔드에서 자동으로 처리됩니다.
  // 일기 저장 API(POST /api/diaries) 호출 시 백엔드가 AI 서버와 통신하여 이미지를 생성하고
  // 응답에 imageUrl이 포함되어 반환됩니다.
  
  console.warn('[Deprecated] generateDiaryImage는 더 이상 사용되지 않습니다. 백엔드가 자동으로 처리합니다.');
  
  // 기본 이미지 반환 (임시)
  return '';
}

/**
 * Unsplash 검색용 쿼리 생성
 * - 프론트엔드 임시 이미지 표시용
 * @param content 일기 본문
 * @param emotion 감정
 * @param weather 날씨
 * @returns 검색 쿼리 문자열
 */
export function getSimplifiedImageQuery(content: string, emotion: string, weather?: string): string {
  const keywords = extractImageKeywords(content, emotion, weather);
  
  // Unsplash에 적합한 2-3단어 쿼리 반환
  const queries = [
    keywords.primary.split(' ')[0],
    keywords.mood.split(' ')[0],
  ];
  
  return queries.join(' ');
}
