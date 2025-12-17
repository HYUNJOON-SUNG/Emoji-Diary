package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_deleted_at", columnList = "deleted_at")
}) // 테이블명 설정 - users, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
/**
 * 사용자 엔티티
 */
public class User {

    // 사용자 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 이메일 주소 (email)
    @Column(name = "email", nullable = false, unique = true, length = 255) // null 불가, unique 설정
    private String email;

    // 사용자 이름 (name)
    @Column(name = "name", nullable = false, length = 100) // null 불가
    private String name;

    // 비밀번호 해시값 (password_hash)
    @Column(name = "password_hash", nullable = false, length = 255) // null 불가
    private String passwordHash;

    // 성별 (gender)
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    @Builder.Default
    private Gender gender = Gender.MALE;

    // 페르소나 (persona)
    @Enumerated(EnumType.STRING)
    @Column(name = "persona")
    @Builder.Default
    private Persona persona = Persona.BEST_FRIEND;

    // 이메일 인증 완료 여부 (email_verified)
    @Column(name = "email_verified", columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean emailVerified = false;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정일시 (updated_at)
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 삭제일시 (deleted_at) - 소프트 삭제
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum Persona {
        BEST_FRIEND, PARENTS, EXPERT, MENTOR, COUNSELOR, POET
    }

    public enum Gender {
        MALE, FEMALE
    }
}