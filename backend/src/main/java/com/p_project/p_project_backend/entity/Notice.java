package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "notices", indexes = {
        @Index(name = "idx_notices_is_pinned", columnList = "is_pinned"),
        @Index(name = "idx_notices_created_at", columnList = "created_at DESC"),
        @Index(name = "idx_notices_is_public", columnList = "is_public"),
        @Index(name = "idx_notices_deleted_at", columnList = "deleted_at")
}) // 테이블명 설정 - notices, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
// 공지사항 DB(notices)와 연동되는 자바 Entity 객체이다.
public class Notice {

    // 공지사항 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 작성자 ID (admin_id) - FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    // 공지사항 제목 (title)
    @Column(name = "title", nullable = false, length = 255) // null 불가
    private String title;

    // 공지사항 내용 (content) - HTML
    @Column(name = "content", nullable = false, columnDefinition = "TEXT") // null 불가
    private String content;

    // 상단 고정 여부 (is_pinned)
    @Column(name = "is_pinned", columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean isPinned = false;

    // 조회수 (views)
    @Column(name = "views", nullable = false, columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private Integer views = 0;

    // 공개 여부 (is_public)
    @Column(name = "is_public", columnDefinition = "TINYINT(1) DEFAULT 1")
    @Builder.Default
    private Boolean isPublic = true;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정일시 (updated_at)
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 삭제일시 (deleted_at) - 소프트 삭제
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}