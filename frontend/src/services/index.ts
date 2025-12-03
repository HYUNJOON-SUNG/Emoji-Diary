/**
 * ========================================
 * Services 인덱스 - API 및 비즈니스 로직 중앙 관리
 * ========================================
 * 
 * 모든 서비스 모듈을 중앙에서 export
 * 
 * 사용 예시:
 * import { login, getDiaries, analyzeEmotions } from '@/services';
 */

// ========== 인증 API (Auth API) ==========
export * from './authApi';

// ========== 일기 API (Diary API) ==========
export * from './diaryApi';

// ========== 공지사항 API (Announcement API) ==========
export * from './announcementApi';

// ========== 위험 신호 감지 (Risk Detection) ==========
export * from './riskDetection';

// ========== 지원 리소스 (Support Resources) ==========
export * from './supportResources';

// ========== 약관 데이터 (Terms Data) ==========
export * from './termsData';

// ========== 이미지 생성기 (Image Generator) ==========
export * from './imageGenerator';

// ========== 파일 업로드 API (Upload API) ==========
export * from './uploadApi';

// ========== 통계 API (Statistics API) ==========
export * from './statisticsApi';