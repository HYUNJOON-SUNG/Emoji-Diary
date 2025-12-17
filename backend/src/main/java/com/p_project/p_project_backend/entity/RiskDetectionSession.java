package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "risk_detection_sessions", indexes = {
        @Index(name = "idx_risk_sessions_user_id", columnList = "user_id"),
        @Index(name = "idx_risk_sessions_created_at", columnList = "created_at DESC"),
        @Index(name = "idx_risk_sessions_user_created", columnList = "user_id, created_at DESC") // 최신 세션 조회 최적화
}) // 테이블명 설정 - risk_detection_sessions, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
/**
 * 위험 신호 세션 엔티티
 */
public class RiskDetectionSession {

    // 세션 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 사용자 ID (user_id) - FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    // 위험 레벨 (risk_level)
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    // 알림 표시 완료 일시 (shown_at)
    @Column(name = "shown_at")
    private LocalDateTime shownAt;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum RiskLevel {
        NONE, LOW, MEDIUM, HIGH
    }
}
