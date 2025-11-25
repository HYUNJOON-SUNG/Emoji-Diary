package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity // DB와 자바 객체를 연동 시켜주는 Entity 어노테이션
@Table(name = "emotion_analysis") // 테이블명 설정 - emotion-analysis
@Getter // 자동 Getter 함수 생성
@Setter // 연관 관계 편의 메서드를 위해 Setter 사용
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능

// 감정 분석 결과 DB(emotion_analysis)와 연동되는 자바 Entity 객체이다.
public class EmotionAnalysis {

    // 분석 ID (analysis_id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    @Column(name = "analysis_id", updatable = false) // 칼럼명 설정 및 id값 업데이트 불가
    private Long analysisId;

    // 일기 ID (diary_id) - FK & UNIQUE (1:1 관계)
    @OneToOne(fetch = FetchType.LAZY) // 지연 로딩 설정
    @JoinColumn(name = "diary_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_analysis_diary")) // FK 컬럼 지정, unique 설정
    private Diary diary; // 1에 해당하는 Diary 객체

    // 대표 감정 (primary_emotion)
    @Column(name = "primary_emotion", nullable = false, length = 20) // null 불가
    private String primaryEmotion;

    // 감정 점수 (emotion_score)
    @Column(name = "emotion_score", nullable = false) // null 불가
    private Double emotionScore; // -1.0 ~ 1.0

    // AI의 코멘트 (ai_comment)
    @Column(name = "ai_comment", columnDefinition = "TEXT")
    private String aiComment;

    // 세부 감정 분포 데이터 (analysis_data)
    @Column(name = "analysis_data", columnDefinition = "JSON")
    private String analysisData; // JSON string으로 저장/파싱

    // 분석 완료 시간 (analyzed_at)
    @Column(name = "analyzed_at", updatable = false)
    private LocalDateTime analyzedAt;
}