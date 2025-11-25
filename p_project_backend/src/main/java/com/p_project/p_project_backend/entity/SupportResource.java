package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity // DB와 자바 객체를 연동 시켜주는 Entity 어노테이션
@Table(name = "support_resources") // 테이블명 설정 - support_resources
@Getter // 자동 Getter 함수 생성
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능

// 상담 센터 및 도움말 리소스 DB(support_resources)와 연동되는 자바 Entity 객체이다.
public class SupportResource {

    // 리소스 ID (resource_id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    @Column(name = "resource_id", updatable = false) // 칼럼명 설정 및 id값 업데이트 불가
    private Long resourceId;

    // 기관명 (name)
    @Column(name = "name", nullable = false, length = 50) // null 불가
    private String name;

    // 전화번호 (phone)
    @Column(name = "phone", length = 20)
    private String phone;

    // 홈페이지 링크 (link)
    @Column(name = "link", length = 255)
    private String link;
}