package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "error_logs", indexes = {
        @Index(name = "idx_error_logs_level", columnList = "level"),
        @Index(name = "idx_error_logs_created_at", columnList = "created_at DESC"),
        @Index(name = "idx_error_logs_user_id", columnList = "user_id"),
        @Index(name = "idx_error_logs_admin_id", columnList = "admin_id"),
        @Index(name = "idx_error_logs_endpoint", columnList = "endpoint")
}) // 테이블명 설정 - error_logs, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
/**
 * 에러 로그 엔티티
 */
public class ErrorLog {

    // 로그 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 로그 레벨 (level)
    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    private Level level;

    // 에러 메시지 (message)
    @Column(name = "message", nullable = false, columnDefinition = "TEXT") // null 불가
    private String message;

    // 에러 코드 (error_code)
    @Column(name = "error_code", length = 50)
    private String errorCode;

    // API 엔드포인트 (endpoint)
    @Column(name = "endpoint", length = 255)
    private String endpoint;

    // 사용자 ID (user_id) - FK (NULL 가능)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    // 관리자 ID (admin_id) - FK (NULL 가능)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Admin admin;

    // 스택 트레이스 (stack_trace)
    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Level {
        ERROR, WARN, INFO
    }
}
