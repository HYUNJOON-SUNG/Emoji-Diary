package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity // DB와 자바 객체를 연동 시켜주는 Entity 어노테이션
@Table(name = "refresh_tokens") // 테이블명 설정 - refresh_tokens
@Getter // 자동 Getter 함수 생성
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
// 리프레시 토큰 DB(refresh_tokens)와 연동되는 자바 Entity 객체이다.
public class RefreshToken {

    // 리프레시 토큰 값 (token_value) - PK
    @Id
    @Column(name = "token_value", updatable = false, length = 255) // 칼럼명 설정, 업데이트 불가
    private String tokenValue;

    // 사용자 ID (user_id) - FK (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY) // 지연 로딩 설정 (필요할 때만 조회)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_token_user")) // FK 컬럼 지정 및 제약조건 이름 설정
    private User user; // 1에 해당하는 User 객체

    // 토큰 만료 시간 (expiration)
    @Column(name = "expiration", nullable = false) // null 불가
    private LocalDateTime expiration;
}