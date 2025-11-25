package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity // DB와 자바 객체를 연동 시켜주는 Entity 어노테이션
@Table(name = "notices") // 테이블명 설정 - notices
@Getter // 자동 Getter 함수 생성
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능

// 공지사항 게시판 DB(notices)와 연동되는 자바 Entity 객체이다.
public class Notice {

    // 공지 ID (notice_id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    @Column(name = "notice_id", updatable = false) // 칼럼명 설정 및 id값 업데이트 불가
    private Long noticeId;

    // 제목 (title)
    @Column(name = "title", nullable = false, length = 100) // null 불가
    private String title;

    // 내용 (content)
    @Column(name = "content", nullable = false, columnDefinition = "TEXT") // null 불가, TEXT 타입 지정
    private String content;

    // 작성일 (created_at)
    @Column(name = "created_at", updatable = false) // 업데이트 불가
    private LocalDateTime createdAt;
}