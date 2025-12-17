package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "admins", indexes = {
        @Index(name = "idx_admins_email", columnList = "email")
}) // 테이블명 설정 - admins, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
/**
 * 관리자 엔티티
 */
public class Admin {

    // 관리자 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 이메일 주소 (email)
    @Column(name = "email", nullable = false, unique = true, length = 255) // null 불가, unique 설정
    private String email;

    // 관리자 이름 (name)
    @Column(name = "name", nullable = false, length = 100) // null 불가
    private String name;

    // 비밀번호 해시값 (password_hash)
    @Column(name = "password_hash", nullable = false, length = 255) // null 불가
    private String passwordHash;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정일시 (updated_at)
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
