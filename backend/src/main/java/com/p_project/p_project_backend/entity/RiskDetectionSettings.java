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
/**
 * 위험 신호 감지 기준 엔티티
 */
public class RiskDetectionSettings {

    // 설정 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 모니터링 기간 (monitoring_period) - 일 단위
    @Column(name = "monitoring_period", nullable = false, columnDefinition = "INT DEFAULT 14")
    @Builder.Default
    private Integer monitoringPeriod = 14;

    // High 레벨 연속 부정 감정 임계 점수 (high_consecutive_score)
    @Column(name = "high_consecutive_score", nullable = false, columnDefinition = "INT DEFAULT 8")
    @Builder.Default
    private Integer highConsecutiveScore = 8;

    // High 레벨 모니터링 기간 내 부정 감정 임계 점수 (high_score_in_period)
    @Column(name = "high_score_in_period", nullable = false, columnDefinition = "INT DEFAULT 12")
    @Builder.Default
    private Integer highScoreInPeriod = 12;

    // Medium 레벨 연속 부정 감정 임계 점수 (medium_consecutive_score)
    @Column(name = "medium_consecutive_score", nullable = false, columnDefinition = "INT DEFAULT 5")
    @Builder.Default
    private Integer mediumConsecutiveScore = 5;

    // Medium 레벨 모니터링 기간 내 부정 감정 임계 점수 (medium_score_in_period)
    @Column(name = "medium_score_in_period", nullable = false, columnDefinition = "INT DEFAULT 8")
    @Builder.Default
    private Integer mediumScoreInPeriod = 8;

    // Low 레벨 연속 부정 감정 임계 점수 (low_consecutive_score)
    @Column(name = "low_consecutive_score", nullable = false, columnDefinition = "INT DEFAULT 2")
    @Builder.Default
    private Integer lowConsecutiveScore = 2;

    // Low 레벨 모니터링 기간 내 부정 감정 임계 점수 (low_score_in_period)
    @Column(name = "low_score_in_period", nullable = false, columnDefinition = "INT DEFAULT 4")
    @Builder.Default
    private Integer lowScoreInPeriod = 4;

    // 수정일시 (updated_at)
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 수정한 관리자 ID (updated_by) - FK (NULL 가능)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private Admin updatedBy;
}
