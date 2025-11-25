package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity // DB와 자바 객체를 연동 시켜주는 Entity 어노테이션
@Table(name = "risk_logs") // 테이블명 설정 - risk_logs
@Getter // 자동 Getter 함수 생성
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능

// 위험 신호 로그 DB(risk_logs)와 연동되는 자바 Entity 객체이다.
public class RiskLog {

    // 로그 ID (log_id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    @Column(name = "log_id", updatable = false) // 칼럼명 설정 및 id값 업데이트 불가
    private Long logId;

    // 대상 사용자 ID (user_id) - FK (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY) // 지연 로딩 설정
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_risk_user")) // FK 컬럼 지정
    private User user; // 1에 해당하는 User 객체

    // 위험 등급 (risk_level)
    @Column(name = "risk_level", nullable = false, length = 20) // HIGH, MEDIUM
    private String riskLevel;

    // 감지 사유 (trigger_reason)
    @Column(name = "trigger_reason", nullable = false, length = 100) // null 불가
    private String triggerReason;

    // 감지 시간 (detected_at)
    @Column(name = "detected_at", updatable = false)
    private LocalDateTime detectedAt;

    // 알림 발송 여부 (is_notified)
    @Column(name = "is_notified", columnDefinition = "TINYINT(1)") // 0/1 값
    private Boolean isNotified;
}