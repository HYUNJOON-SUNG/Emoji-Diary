/**
 * ========================================
 * 파일 업로드 API 서비스 (Mock 구현)
 * ========================================
 * 
 * [백엔드 팀 작업 필요]
 * - 현재는 Mock 데이터로 동작
 * - 실제 백엔드 API로 교체 필요
 * - multipart/form-data 형식으로 이미지 업로드
 * 
 * 주요 기능:
 * - 이미지 업로드 (일기 작성 시 사용자 업로드 이미지)
 * - 이미지 삭제 (업로드된 이미지 삭제)
 * 
 * [API 명세서 Section 9]
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
 */
export interface UploadImageResponse {
  imageUrl: string; // 업로드된 이미지 URL
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

/**
 * 지연 함수 (네트워크 지연 시뮬레이션)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
 * [백엔드 팀] 실제 구현 시:
 * - POST /api/upload/image
 * - Headers: 
 *   * Authorization: Bearer {accessToken}
 *   * Content-Type: multipart/form-data
 * - Request Body (Form Data): { image: File }
 * - Response: { success: true, data: { imageUrl: string } }
 * - 파일 크기 제한: 예) 10MB
 * - 지원 형식: JPG, PNG, GIF, WebP
 * - 업로드된 이미지는 S3 또는 클라우드 스토리지에 저장
 * - 이미지 URL은 CDN URL로 반환
 */
export async function uploadImage(data: UploadImageRequest): Promise<UploadImageResponse> {
  await delay(1000);
  
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
  
  // [백엔드 팀] 실제 구현 시:
  // 1. FormData 생성
  // const formData = new FormData();
  // formData.append('image', data.image);
  // 
  // 2. API 호출
  // const response = await fetch('/api/upload/image', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${TokenStorage.getAccessToken()}`,
  //   },
  //   body: formData,
  // });
  // 
  // 3. 응답 처리
  // const result = await response.json();
  // if (!result.success) {
  //   throw new Error(result.error.message);
  // }
  // return { imageUrl: result.data.imageUrl };
  
  // Mock 구현: 임시 URL 생성
  const mockImageUrl = `https://example.com/uploaded/${Date.now()}-${data.image.name}`;
  
  console.log('[Image Uploaded]', {
    fileName: data.image.name,
    fileSize: data.image.size,
    fileType: data.image.type,
    imageUrl: mockImageUrl,
  });
  
  return {
    imageUrl: mockImageUrl,
  };
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
 * [백엔드 팀] 실제 구현 시:
 * - DELETE /api/upload/image
 * - Headers: { Authorization: Bearer {accessToken} }
 * - Request Body: { imageUrl: string }
 * - Response: { success: true, data: { message: string } }
 * - S3 또는 클라우드 스토리지에서 이미지 삭제
 */
export async function deleteImage(data: DeleteImageRequest): Promise<DeleteImageResponse> {
  await delay(500);
  
  // URL 검증
  if (!data.imageUrl || !data.imageUrl.startsWith('http')) {
    throw new Error('유효하지 않은 이미지 URL입니다.');
  }
  
  // [백엔드 팀] 실제 구현 시:
  // const response = await fetch('/api/upload/image', {
  //   method: 'DELETE',
  //   headers: {
  //     'Authorization': `Bearer ${TokenStorage.getAccessToken()}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ imageUrl: data.imageUrl }),
  // });
  // 
  // const result = await response.json();
  // if (!result.success) {
  //   throw new Error(result.error.message);
  // }
  // return { message: result.data.message };
  
  // Mock 구현
  console.log('[Image Deleted]', { imageUrl: data.imageUrl });
  
  return {
    message: '이미지가 삭제되었습니다',
  };
}

