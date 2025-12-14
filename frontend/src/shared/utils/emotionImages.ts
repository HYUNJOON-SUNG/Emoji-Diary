import happyImage from '@/assets/행복.png';
import neutralImage from '@/assets/중립.png';
import surprisedImage from '@/assets/당황.png';
import sadImage from '@/assets/슬픔.png';
import angryImage from '@/assets/분노.png';
import anxiousImage from '@/assets/불안.png';
import disgustImage from '@/assets/혐오.png';

export const EMOTION_IMAGES: { [key: string]: string } = {
  '행복': happyImage,
  '중립': neutralImage,
  '당황': surprisedImage,
  '슬픔': sadImage,
  '분노': angryImage,
  '불안': anxiousImage,
  '혐오': disgustImage,
};

export const getEmotionImage = (emotion: string): string => {
  return EMOTION_IMAGES[emotion] || neutralImage;
};
