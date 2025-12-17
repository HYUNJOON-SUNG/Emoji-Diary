package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "admin_refresh_tokens", indexes = {
        @Index(name = "idx_admin_refresh_tokens_admin_id", columnList = "admin_id"),
        @Index(name = "idx_admin_refresh_tokens_token", columnList = "token"),
        @Index(name = "idx_admin_refresh_tokens_expires_at", columnList = "expires_at"),
        @Index(name = "idx_admin_refresh_tokens_revoked_at", columnList = "revoked_at")
}) // 테이블명 설정 - admin_refresh_tokens, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
/**
 * 관리자 리프레시 토큰 엔티티
 */
public class AdminRefreshToken {

    // 리프레시 토큰 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 관리자 ID (admin_id) - FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    // 리프레시 토큰 값 (token)
    @Column(name = "token", nullable = false, length = 500) // null 불가
    private String token;

    // 만료 일시 (expires_at)
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // 무효화 일시 (revoked_at)
    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    // 기기 정보 (device_info)
    @Column(name = "device_info", length = 255)
    private String deviceInfo;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
