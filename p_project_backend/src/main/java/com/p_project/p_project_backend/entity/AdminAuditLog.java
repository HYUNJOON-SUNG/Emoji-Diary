package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity // DB와 자바 객체를 연동 시켜주는 Entity 어노테이션
@Table(name = "admin_audit_logs") // 테이블명 설정 - admin_audit_logs
@Getter // 자동 Getter 함수 생성
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능

// 관리자 활동 감사 로그 DB(admin_audit_logs)와 연동되는 자바 Entity 객체이다.
public class AdminAuditLog {

    // 감사 로그 ID (log_id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    @Column(name = "log_id", updatable = false) // 칼럼명 설정 및 id값 업데이트 불가
    private Long logId;

    // 행위자(관리자) ID (admin_id) - FK (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY) // 지연 로딩 설정
    @JoinColumn(name = "admin_id", nullable = false, foreignKey = @ForeignKey(name = "fk_log_admin")) // FK 컬럼 지정
    private Admin admin; // 1에 해당하는 Admin 객체

    // 대상 사용자 ID (target_user_id)
    @Column(name = "target_user_id")
    private Long targetUserId;

    // 행위 유형 (action_type)
    @Column(name = "action_type", nullable = false, length = 20) // VIEW, DELETE, UPDATE
    private String actionType;

    // 상세 내용 (details)
    @Column(name = "details", length = 255)
    private String details;

    // 수행 시간 (action_time)
    @Column(name = "action_time", updatable = false)
    private LocalDateTime actionTime;
}