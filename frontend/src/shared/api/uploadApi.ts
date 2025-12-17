/**
 * 파일 업로드 API 서비스
 * - 이미지 업로드 및 삭제
 */

/**
 * 이미지 업로드 요청 인터페이스
 */
export interface UploadImageRequest {
  image: File; // 이미지 파일 (JPG, PNG 등)
}

/**
 * 이미지 업로드 응답 인터페이스
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

import { apiClient, BASE_URL } from '@/shared/api/client';

/**
 * 이미지 업로드
 * - 파일 형식 및 크기 검증 후 서버 전송
 * @param data 이미지 파일
 * @returns 업로드된 이미지 URL
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
 * 이미지 삭제
 * - 서버에 저장된 이미지 삭제 요청
 * @param data 삭제할 이미지 URL
 * @returns 삭제 완료 메시지
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
    try {
      let baseUrlOrigin;
      try {
        const baseUrlObj = new URL(BASE_URL);
        baseUrlOrigin = baseUrlObj.origin;
      } catch (e) {
        // BASE_URL이 상대 경로일 경우 (예: '/api')
        // 브라우저 환경에서는 current origin 사용
        if (typeof window !== 'undefined') {
          baseUrlOrigin = window.location.origin;
        } else {
          // 서버 사이드 렌더링 등 window 없는 환경 (여기선 해당 없음)
          baseUrlOrigin = '';
        }
      }

      // 상대 경로가 /로 시작하는지 확인
      if (imageUrl.startsWith('/')) {
        imageUrl = `${baseUrlOrigin}${imageUrl}`;
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

