package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "email_verification_codes", indexes = {
        @Index(name = "idx_email_codes_email", columnList = "email"),
        @Index(name = "idx_email_codes_code", columnList = "code"),
        @Index(name = "idx_email_codes_expires_at", columnList = "expires_at")
}) // 테이블명 설정 - email_verification_codes, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
// 이메일 인증 코드 DB(email_verification_codes)와 연동되는 자바 Entity 객체이다.
public class EmailVerificationCode {

    // 인증 코드 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 이메일 주소 (email)
    @Column(name = "email", nullable = false, length = 255) // null 불가
    private String email;

    // 인증 코드 (code) - 6자리
    @Column(name = "code", nullable = false, length = 6) // null 불가
    private String code;

    // 만료 일시 (expires_at)
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // 인증 완료 일시 (verified_at)
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
