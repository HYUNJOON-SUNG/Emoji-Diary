package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity // DB와 자바 객체를 연동 시켜주는 Entity 어노테이션
@Table(name = "admins") // 테이블명 설정 - admins
@Getter // 자동 Getter 함수 생성
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능

// 관리자 DB(admins)와 연동되는 자바 Entity 객체이다.
public class Admin {

    // 관리자 고유 Id (admin_id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    @Column(name = "admin_id", updatable = false) // 칼럼명 설정 및 id값 업데이트 불가
    private Long adminId; // 자바에서 DB 칼럼에 접근할 변수

    // 관리자 접속용 아이디 (username)
    @Column(name = "username", nullable = false, unique = true, length = 50) // null 불가, unique
    private String username; // 자바에서 DB 칼럼에 접근할 변수

    // 비밀번호 (password)
    @Column(name = "password", nullable = false) // null 불가
    private String password; // Hash로 변경(Bcrypt)후 저장

    // 관리자 이름 (name)
    @Column(name = "name", nullable = false, length = 30)
    private String name;

    // 계정 생성일 (created_at)
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // --- 연관 관계 매핑 ---

    // 관리자 감사 로그와 1대 N 매핑 - 관리자는 다수의 로그 보유 가능
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdminAuditLog> auditLogs;
}
