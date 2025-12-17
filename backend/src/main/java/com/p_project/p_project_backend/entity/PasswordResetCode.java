package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "password_reset_codes", indexes = {
        @Index(name = "idx_password_codes_email", columnList = "email"),
        @Index(name = "idx_password_codes_code", columnList = "code"),
        @Index(name = "idx_password_codes_reset_token", columnList = "reset_token"),
        @Index(name = "idx_password_codes_expires_at", columnList = "expires_at")
}) // 테이블명 설정 - password_reset_codes, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
/**
 * 비밀번호 재설정 코드 엔티티
 */
public class PasswordResetCode {

    // 재설정 코드 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 이메일 주소 (email)
    @Column(name = "email", nullable = false, length = 255) // null 불가
    private String email;

    // 재설정 코드 (code) - 6자리
    @Column(name = "code", nullable = false, length = 6) // null 불가
    private String code;

    @Column(name = "reset_token")
    private String resetToken;

    // 만료 일시 (expires_at)
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // 사용 완료 일시 (used_at)
    @Column(name = "used_at")
    private LocalDateTime usedAt;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
