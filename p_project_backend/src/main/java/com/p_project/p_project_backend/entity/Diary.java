package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity // DB와 자바 객체를 연동 시켜주는 Entity 어노테이션
/**
 * 테이블명 설정 - diaries
 * 복합 UNIQUE 제약조건 설정 - 한 유저는 하루에 한 개의 일기만 작성 가능
 */
@Table(name = "diaries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "written_date"}, name = "uk_user_date")
})
@Getter // 자동 Getter 함수 생성
@Setter // Setter가 필요한 필드(status 등)를 위해 사용
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능

// 일기 DB(diaries)와 연동되는 자바 Entity 객체이다.
public class Diary {

    // 일기 고유 ID (diary_id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    @Column(name = "diary_id", updatable = false) // 칼럼명 설정 및 id값 업데이트 불가
    private Long diaryId;

    // 작성자 ID (user_id) - FK (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY) // 지연 로딩 설정
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_diary_user")) // FK 컬럼 지정
    private User user; // 1에 해당하는 User 객체

    // 일기 작성 날짜 (written_date)
    @Column(name = "written_date", nullable = false) // null 불가
    private LocalDate writtenDate;

    // 일기 본문 (content)
    @Column(name = "content", nullable = false, columnDefinition = "TEXT") // null 불가, TEXT 타입 지정
    private String content; // 암호화 처리 필요

    // 날씨 정보 (weather)
    @Column(name = "weather", length = 20)
    private String weather;

    // 분석 상태 (status)
    @Column(name = "status", nullable = false, length = 20)
    private String status; // PENDING, COMPLETE

    // 생성 시간 (created_at)
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 수정 시간 (updated_at)
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- 연관 관계 매핑 ---

    // 감정 분석 결과와 1대 1 매핑
    @OneToOne(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    private EmotionAnalysis emotionAnalysis;

    // 편의 메서드 (데이터 일관성을 위해 EmotionAnalysis 객체 설정 시 사용)
    public void setEmotionAnalysis(EmotionAnalysis analysis) {
        if (this.emotionAnalysis != null) {
            this.emotionAnalysis.setDiary(null);
        }
        this.emotionAnalysis = analysis;
        if (analysis != null) {
            analysis.setDiary(this);
        }
    }
}