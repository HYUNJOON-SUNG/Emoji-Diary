package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "risk_detection_settings") // 테이블명 설정 - risk_detection_settings
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
// 위험 신호 감지 기준 DB(risk_detection_settings)와 연동되는 자바 Entity 객체이다.
public class RiskDetectionSettings {

    // 설정 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 모니터링 기간 (monitoring_period) - 일 단위
    @Column(name = "monitoring_period", nullable = false, columnDefinition = "INT DEFAULT 14")
    @Builder.Default
    private Integer monitoringPeriod = 14;

    // High 레벨 연속 부정 감정 임계 일수 (high_consecutive_days)
    @Column(name = "high_consecutive_days", nullable = false, columnDefinition = "INT DEFAULT 5")
    @Builder.Default
    private Integer highConsecutiveDays = 5;

    // High 레벨 부정 감정 임계 일수 (high_negative_days)
    @Column(name = "high_negative_days", nullable = false, columnDefinition = "INT DEFAULT 8")
    @Builder.Default
    private Integer highNegativeDays = 8;

    // Medium 레벨 연속 부정 감정 임계 일수 (medium_consecutive_days)
    @Column(name = "medium_consecutive_days", nullable = false, columnDefinition = "INT DEFAULT 3")
    @Builder.Default
    private Integer mediumConsecutiveDays = 3;

    // Medium 레벨 부정 감정 임계 일수 (medium_negative_days)
    @Column(name = "medium_negative_days", nullable = false, columnDefinition = "INT DEFAULT 5")
    @Builder.Default
    private Integer mediumNegativeDays = 5;

    // Low 레벨 연속 부정 감정 임계 일수 (low_consecutive_days)
    @Column(name = "low_consecutive_days", nullable = false, columnDefinition = "INT DEFAULT 2")
    @Builder.Default
    private Integer lowConsecutiveDays = 2;

    // Low 레벨 부정 감정 임계 일수 (low_negative_days)
    @Column(name = "low_negative_days", nullable = false, columnDefinition = "INT DEFAULT 3")
    @Builder.Default
    private Integer lowNegativeDays = 3;

    // 수정일시 (updated_at)
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
