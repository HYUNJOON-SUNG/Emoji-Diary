/**
 * ========================================
 * AI 그림일기 이미지 생성 서비스 (Mock 구현)
 * ========================================
 * 
 * [AI 팀 작업 필요 - 최우선 작업]
 * 현재는 Unsplash API를 사용한 Mock 구현입니다.
 * 나노바나나 API(Stable Diffusion)로 교체해주세요.
 * 
 * 요구사항:
 * 1. 일기 본문(content)을 분석하여 핵심 키워드 추출
 * 2. 감정(emotion), 날씨(weather) 정보를 반영
 * 3. 나노바나나 API로 그림일기 스타일의 이미지 생성
 * 4. 생성된 이미지 URL 반환
 * 
 * 처리 흐름:
 * 1. extractImageKeywords로 키워드 추출 (이 로직은 참고용으로 사용 가능)
 * 2. 나노바나나 API 호출 (프롬프트 생성)
 * 3. 이미지 URL 반환
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
 * 일기 텍스트 분석 및 이미지 생성용 키워드 추출
 * 
 * [AI 팀] 이 함수는 참고용 로직입니다. 
 * 나노바나나 API 프롬프트 생성 시 이 로직을 활용하거나 
 * 더 정교한 NLP 모델을 사용할 수 있습니다.
 * 
 * @param content - 일기 본문
 * @param emotion - 사용자가 선택한 감정 (기분 텍스트)
 * @param weather - 날씨 정보 (선택사항)
 * @returns 이미지 생성용 키워드 객체
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
 * 일기 내용 기반 AI 이미지 생성
 * 
 * [AI 팀 작업 필요 - 최우선 작업]
 * 이 함수를 나노바나나 API 호출로 대체해주세요.
 * 
 * 요구사항:
 * 1. 일기 본문을 분석하여 이미지 생성 프롬프트 작성
 * 2. 나노바나나 API(Stable Diffusion) 호출
 * 3. 그림일기 스타일의 이미지 생성
 * 4. 생성된 이미지 URL 반환
 * 
 * 프롬프트 예시:
 * - "watercolor painting of cozy cafe on rainy day, warm and peaceful atmosphere, artistic illustration"
 * - "oil painting of nature walk, joyful and bright mood, artistic diary illustration"
 * 
 * @param content - 일기 본문
 * @param emotion - 사용자 감정 (기분 텍스트)
 * @param weather - 날씨 정보
 * @returns 생성된 이미지 URL (나노바나나 API 응답)
 */
export async function generateDiaryImage(
  content: string,
  emotion: string,
  weather?: string
): Promise<string> {
  // [AI 팀] 아래 로직을 나노바나나 API 호출로 대체
  
  // 1. 키워드 추출 (참고용 - 더 정교한 방법 사용 가능)
  const keywords = extractImageKeywords(content, emotion, weather);
  
  // 2. 프롬프트 생성
  const searchQuery = `${keywords.primary} ${keywords.mood} ${keywords.secondary} watercolor painting artistic`;
  
  // 3. [AI 팀] 나노바나나 API 호출
  // const response = await fetch('나노바나나_API_URL', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     prompt: searchQuery,
  //     style: 'watercolor diary illustration',
  //     width: 1080,
  //     height: 1080
  //   })
  // });
  // const data = await response.json();
  // return data.imageUrl;
  
  // Mock 구현: Unsplash API 사용 (실제 환경에서는 제거)
  try {
    const imageUrl = await fetchUnsplashImage(searchQuery);
    return imageUrl;
  } catch (error) {
    console.error('Failed to generate diary image:', error);
    // 기본 이미지 반환
    return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1080';
  }
}

/**
 * Unsplash 이미지 가져오기 (Mock - 실제 환경에서는 나노바나나 API로 대체)
 * 
 * [AI 팀] 이 함수는 제거하고 나노바나나 API로 대체해주세요.
 */
async function fetchUnsplashImage(query: string): Promise<string> {
  // Mock: Unsplash Source API 사용
  // [AI 팀] 실제 환경에서는 이 함수를 제거하고 generateDiaryImage에서 직접 나노바나나 API 호출
  return `https://source.unsplash.com/1080x1080/?${encodeURIComponent(query)}`;
}

/**
 * Unsplash Tool용 간소화된 검색 쿼리 생성
 * 
 * [프론트엔드] DiaryBook.tsx에서 unsplash_tool을 호출할 때 사용
 * 이 함수는 프론트엔드에서 임시 이미지를 표시하기 위한 용도
 * 
 * @param content - 일기 본문
 * @param emotion - 감정
 * @param weather - 날씨
 * @returns 2-3단어로 구성된 검색 쿼리
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
