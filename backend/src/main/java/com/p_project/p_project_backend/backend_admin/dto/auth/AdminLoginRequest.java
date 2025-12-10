package com.p_project.p_project_backend.backend_admin.dto.auth;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 관리자 로그인 요청 DTO
 * 
 * [API 명세서 10.1.1]
 * - 클라이언트 검증 없음, 서버에서만 검증
 * - 이메일 형식 오류, 빈 필드, 비밀번호 불일치, 관리자 권한 없음 등
 * 모든 로그인 실패 케이스에 동일한 통합 에러 메시지 반환
 * - Bean Validation 사용하지 않음 (필드별 에러 메시지 노출 방지)
 */
@Getter
@Setter
@NoArgsConstructor
public class AdminLoginRequest {
    private String email;
    private String password;
}
