/**
 * ========================================
 * 파일 업로드 API 서비스
 * ========================================
 * 
 * 주요 기능:
 * - 이미지 업로드 (일기 작성 시 사용자 업로드 이미지)
 * - 이미지 삭제 (업로드된 이미지 삭제)
 * 
 * [API 명세서 Section 9]
 * - JWT 토큰은 apiClient의 interceptor에서 자동으로 추가됩니다.
 */

/**
 * 이미지 업로드 요청 인터페이스
 */
export interface UploadImageRequest {
  image: File; // 이미지 파일 (JPG, PNG 등)
}

/**
 * 이미지 업로드 응답 인터페이스
 * 
 * [API 명세서 Section 9.1]
 * - Response: { success: true, data: { imageUrl: string } }
 * 
 * [ERD 설계서 참고 - Diary_Images 테이블]
 * - 업로드된 이미지 URL은 Diary_Images 테이블에 저장됨
 * - id: BIGINT (PK) → (이미지 고유 ID, API 응답에 포함되지 않음)
 * - diary_id: BIGINT (FK) → (일기 ID, 일기 저장 시 연결, Diaries.id 참조)
 * - image_url: VARCHAR(500) → imageUrl (이미지 URL, 업로드 후 반환된 URL)
 * - created_at: DATETIME → (생성일시, API 응답에 포함되지 않음)
 * 
 * [관계]
 * - Diary_Images.diary_id → Diaries.id (FK, CASCADE)
 * - 일기 작성/수정 시 images 배열로 전송되면 백엔드에서 Diary_Images 테이블에 저장
 * - 일기 삭제 시 Diary_Images 레코드도 함께 삭제 (CASCADE)
 * 
 * [참고]
 * - Diaries.image_url은 AI 생성 이미지 (NanoVana API)
 * - Diary_Images는 사용자가 직접 업로드한 이미지
 */
export interface UploadImageResponse {
  imageUrl: string; // 업로드된 이미지 URL (ERD: Diary_Images.image_url, VARCHAR(500), 일기 저장 시 Diary_Images 테이블에 저장)
}

/**
 * 이미지 삭제 요청 인터페이스
 * 
 * [API 명세서 Section 9.2]
 * - Request: { imageUrl: string }
 */
export interface DeleteImageRequest {
  imageUrl: string; // 삭제할 이미지 URL
}

/**
 * 이미지 삭제 응답 인터페이스
 * 
 * [API 명세서 Section 9.2]
 * - Response: { success: true, data: { message: string } }
 */
export interface DeleteImageResponse {
  message: string; // 삭제 완료 메시지
}

import { apiClient, BASE_URL } from './api';

/**
 * POST /upload/image
 * 이미지 업로드
 * 
 * [API 명세서 Section 9.1]
 * 
 * 동작:
 * 1. 이미지 파일 검증 (파일 형식, 크기)
 * 2. multipart/form-data로 서버에 업로드
 * 3. 업로드된 이미지 URL 반환
 * 
 * 에러 케이스:
 * - 파일 형식 오류 → "지원하지 않는 파일 형식입니다"
 * - 파일 크기 초과 → "파일 크기가 너무 큽니다"
 * - 업로드 실패 → "이미지 업로드에 실패했습니다"
 * 
 * - POST /api/upload/image
 * - Headers: 
 *   * Authorization: Bearer {accessToken} (apiClient interceptor에서 자동 추가)
 *   * Content-Type: multipart/form-data (FormData 사용 시 자동 설정)
 * - Request Body (Form Data): { image: File }
 * - Response: { success: true, data: { imageUrl: string } }
 */
export async function uploadImage(data: UploadImageRequest): Promise<UploadImageResponse> {
  // 파일 형식 검증
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(data.image.type)) {
    throw new Error('지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP만 업로드 가능합니다.');
  }
  
  // 파일 크기 검증 (10MB 제한)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (data.image.size > maxSize) {
    throw new Error('파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.');
  }
  
  const formData = new FormData();
  formData.append('image', data.image);
  
  try {
    const response = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      // 백엔드가 imageUrls 배열을 반환하는 경우 처리
      const responseData = response.data.data;
      if (responseData.imageUrls && Array.isArray(responseData.imageUrls) && responseData.imageUrls.length > 0) {
        return { imageUrl: responseData.imageUrls[0] };
      }
      return { imageUrl: responseData.imageUrl };
    } else {
      throw new Error(response.data.error?.message || '이미지 업로드에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 413) {
      throw new Error('파일 크기가 너무 큽니다.');
    }
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
}

/**
 * DELETE /upload/image
 * 이미지 삭제
 * 
 * [API 명세서 Section 9.2]
 * 
 * 동작:
 * 1. 이미지 URL 검증
 * 2. 서버에서 이미지 삭제
 * 3. 삭제 완료 메시지 반환
 * 
 * 에러 케이스:
 * - 이미지 없음 → "이미지를 찾을 수 없습니다"
 * - 삭제 실패 → "이미지 삭제에 실패했습니다"
 * 
 * - DELETE /api/upload/image
 * - Headers: { Authorization: Bearer {accessToken} } (apiClient interceptor에서 자동 추가)
 * - Request Body: { imageUrl: string }
 * - Response: { success: true, data: { message: string } }
 */
export async function deleteImage(data: DeleteImageRequest): Promise<DeleteImageResponse> {
  // [디버깅용] 이미지 삭제 API 호출 시작 로그 (F12 관리자도구에서 확인 가능)
  console.log('[이미지 삭제 API] 호출 시작 - imageUrl:', data.imageUrl);
  
  // URL 검증 및 정규화
  // API 명세서에 따르면 imageUrl은 문자열이므로, http/https로 시작하는지 확인
  // 단, blob: 또는 data: URL은 서버에 업로드되지 않은 로컬 이미지이므로 API 호출 불필요
  if (!data.imageUrl) {
    console.error('[이미지 삭제 API] imageUrl이 없습니다');
    throw new Error('유효하지 않은 이미지 URL입니다.');
  }
  
  // blob: 또는 data: URL은 서버에 업로드되지 않은 로컬 이미지
  if (data.imageUrl.startsWith('blob:') || data.imageUrl.startsWith('data:')) {
    console.log('[이미지 삭제 API] 로컬 이미지 (blob/data URL) - API 호출 불필요');
    throw new Error('로컬 이미지는 서버 삭제가 필요하지 않습니다.');
  }
  
  // 상대 경로 URL을 전체 URL로 변환
  let imageUrl = data.imageUrl;
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    // 상대 경로인 경우 (예: /images/user_uploads/...)
    // BASE_URL에서 origin을 추출하여 전체 URL로 변환
    // BASE_URL 예: http://localhost:8080/api
    // 상대 경로 예: /images/user_uploads/xxx.png
    // 결과: http://localhost:8080/images/user_uploads/xxx.png
    try {
      const baseUrlObj = new URL(BASE_URL);
      // 상대 경로가 /로 시작하는지 확인
      if (imageUrl.startsWith('/')) {
        imageUrl = `${baseUrlObj.origin}${imageUrl}`;
        console.log('[이미지 삭제 API] 상대 경로를 전체 URL로 변환:', imageUrl);
      } else {
        console.error('[이미지 삭제 API] 유효하지 않은 URL 형식:', data.imageUrl);
        throw new Error('유효하지 않은 이미지 URL입니다.');
      }
    } catch (urlError) {
      console.error('[이미지 삭제 API] URL 변환 실패:', urlError);
      throw new Error('유효하지 않은 이미지 URL입니다.');
    }
  }
  
  try {
    const response = await apiClient.delete('/upload/image', {
      data: { imageUrl: imageUrl }, // 정규화된 URL 사용
    });
    
    // [디버깅용] API 응답 로그
    console.log('[이미지 삭제 API] 응답:', response.data);
    
    if (response.data.success) {
      console.log('[이미지 삭제 API] 삭제 성공');
      return { message: response.data.data.message };
    } else {
      console.error('[이미지 삭제 API] 응답 실패:', response.data);
      throw new Error(response.data.error?.message || '이미지 삭제에 실패했습니다.');
    }
  } catch (error: any) {
    // [디버깅용] 에러 상세 로그
    console.error('[이미지 삭제 API] API 호출 실패:', error);
    if (error.response) {
      console.error('[이미지 삭제 API] 응답 상태:', error.response.status);
      console.error('[이미지 삭제 API] 응답 데이터:', error.response.data);
    }
    if (error instanceof Error) {
      console.error('[이미지 삭제 API] 에러 메시지:', error.message);
    }
    throw error;
  }
}

