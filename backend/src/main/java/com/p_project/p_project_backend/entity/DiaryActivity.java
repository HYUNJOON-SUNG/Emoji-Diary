package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "diary_activities", indexes = {
        @Index(name = "idx_diary_activities_diary_id", columnList = "diary_id")
}) // 테이블명 설정 - diary_activities, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
// 일기 활동 DB(diary_activities)와 연동되는 자바 Entity 객체이다.
public class DiaryActivity {

    // 활동 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 일기 ID (diary_id) - FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diary_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Diary diary;

    // 활동 내용 (activity)
    @Column(name = "activity", nullable = false, length = 100) // null 불가
    private String activity;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
