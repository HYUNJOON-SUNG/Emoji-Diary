package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity // DB와 자바 객체를 연동 시켜주는 Entity 어노테이션
@Table(name = "users") // 테이블명 설정 - users
@Getter // 자동 Getter 함수 생성
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
// 사용자 DB(users)와 연동되는 자바 Entity 객체이다.
public class User {

    // 사용자 고유 ID (user_id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    @Column(name = "user_id", updatable = false) // 칼럼명 설정 및 id값 업데이트 불가
    private Long userId; // 자바에서 DB 칼럼에 접근할 변수

    // 로그인 아이디 (username)
    @Column(name = "username", nullable = false, unique = true, length = 50) // null 불가, unique 설정
    private String username;

    // 비밀번호 (password)
    @Column(name = "password", nullable = false) // null 불가
    private String password; // BCrypt Hash 저장

    // 이메일 (email)
    @Column(name = "email", nullable = false, unique = true, length = 100) // null 불가, unique 설정
    private String email;

    // 닉네임 (nickname)
    @Column(name = "nickname", nullable = false, length = 30)
    private String nickname;

    // 생년월일 (birth_date)
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    // 권한 (role)
    @Column(name = "role", nullable = false, length = 20)
    private String role; // 예: "ROLE_USER"

    // 앱 푸시 알림 동의 (alert_push)
    @Column(name = "alert_push", columnDefinition = "TINYINT(1)") // 0/1 값
    private Boolean alertPush;

    // 이메일 알림 동의 (alert_email)
    @Column(name = "alert_email", columnDefinition = "TINYINT(1)") // 0/1 값
    private Boolean alertEmail;

    // 가입일 (created_at)
    @Column(name = "created_at", updatable = false) // 생성일은 업데이트 불가
    private LocalDateTime createdAt;

    // 수정일 (updated_at)
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- 연관 관계 매핑 ---

    // 일기와의 1대 N 매핑 - 사용자는 다수의 일기 보유 가능
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Diary> diaries;

    // 리프레시 토큰과의 1대 N 매핑 - 사용자는 다수의 토큰을 가질 수 있음
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RefreshToken> refreshTokens;

    // 위험 로그와의 1대 N 매핑 - 사용자는 다수의 위험 로그를 가질 수 있음
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RiskLog> riskLogs;
}