package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "diaries", indexes = {
        @Index(name = "idx_diaries_user_id", columnList = "user_id"),
        @Index(name = "idx_diaries_date", columnList = "date"),
        @Index(name = "idx_diaries_emotion", columnList = "emotion"),
        @Index(name = "idx_diaries_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_diaries_user_date", columnList = "user_id, date", unique = true), // 복합 유니크 인덱스 (deleted_at IS NULL 조건은 DB 레벨에서 처리 필요)
        @Index(name = "idx_diaries_user_emotion", columnList = "user_id, emotion"), // 위험 신호 감지 최적화
        @Index(name = "idx_diaries_user_emotion_date", columnList = "user_id, emotion, date"), // 위험 신호 감지 최적화 (모니터링 기간 내 일기 조회)
        @Index(name = "idx_diaries_emotion_date", columnList = "emotion, date") // 통계 조회 최적화
        // FULLTEXT 인덱스 (title, content)는 DatabaseIndexInitializer에서 애플리케이션 시작 시 자동 생성됨
}) // 테이블명 설정 - diaries, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
// 일기 DB(diaries)와 연동되는 자바 Entity 객체이다.
public class Diary {

    // 일기 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 작성자 ID (user_id) - FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 일기 작성 날짜 (date)
    @Column(name = "date", nullable = false)
    private LocalDate date;

    // 일기 제목 (title)
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    // 일기 본문 (content)
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    // 감정 (emotion)
    @Enumerated(EnumType.STRING)
    @Column(name = "emotion", nullable = false)
    private Emotion emotion;

    // 기분 (mood) - 자유 텍스트
    @Column(name = "mood", length = 255)
    private String mood;

    // 날씨 (weather)
    @Enumerated(EnumType.STRING)
    @Column(name = "weather")
    private Weather weather;

    // AI 생성 이미지 URL (image_url)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // AI 코멘트 (ai_comment)
    @Column(name = "ai_comment", columnDefinition = "TEXT")
    private String aiComment;

    // 음식 추천 정보 (recommended_food) - JSON
    @Column(name = "recommended_food", columnDefinition = "JSON")
    private String recommendedFood;

    // KoBERT 감정 분석 결과 (kobert_analysis) - JSON
    @Column(name = "kobert_analysis", columnDefinition = "JSON")
    private String kobertAnalysis;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정일시 (updated_at)
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 삭제일시 (deleted_at) - 소프트 삭제
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum Emotion {
        JOY,        // 행복
        NEUTRAL,    // 중립
        SURPRISE,   // 당황
        SADNESS,    // 슬픔
        ANGER,      // 분노
        ANXIETY,    // 불안
        DISGUST     // 혐오
    }

    public enum Weather {
        SUNNY, CLOUDY, RAINY, THUNDER, SNOWY, FOGGY
    }
}