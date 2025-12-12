import friendIcon from '../../assets/친구.png';
import parentIcon from '../../assets/부모님.png';
import expertIcon from '../../assets/전문가.png';
import mentorIcon from '../../assets/멘토.png';
import therapistIcon from '../../assets/상담사.png';
import poetIcon from '../../assets/시인.png';

/**
 * 페르소나 선택 모달에서 사용하는 페르소나 데이터
 */
export const PERSONAS = [
  {
    id: 'friend',
    name: '베프',
    icon: friendIcon,
    style: '친근하고 공감적'
  },
  {
    id: 'parent',
    name: '부모님',
    icon: parentIcon,
    style: '따뜻하고 지지적'
  },
  {
    id: 'expert',
    name: '전문가',
    icon: expertIcon,
    style: '전문적이고 분석적'
  },
  {
    id: 'mentor',
    name: '멘토',
    icon: mentorIcon,
    style: '동기부여하는 성장 코치'
  },
  {
    id: 'therapist',
    name: '상담사',
    icon: therapistIcon,
    style: '심리 분석 중심 치유자'
  },
  {
    id: 'poet',
    name: '시인',
    icon: poetIcon,
    style: '감성적이고 철학적'
  }
];

