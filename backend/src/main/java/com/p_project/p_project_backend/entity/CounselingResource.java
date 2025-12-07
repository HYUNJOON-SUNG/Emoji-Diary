package com.p_project.p_project_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "counseling_resources", indexes = {
        @Index(name = "idx_counseling_resources_category", columnList = "category"),
        @Index(name = "idx_counseling_resources_is_urgent", columnList = "is_urgent"),
        @Index(name = "idx_counseling_resources_deleted_at", columnList = "deleted_at")
}) // 테이블명 설정 - counseling_resources, 인덱스 설정
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자가 필요없는 생성자 생성
@AllArgsConstructor // 모든 인자를 필요로하는 생성자 생성
@Builder // 객체 생성 시 Builder를 활용하여 생성 가능
// 상담 기관 DB(counseling_resources)와 연동되는 자바 Entity 객체이다.
public class CounselingResource {

    // 상담 기관 고유 ID (id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 설정
    private Long id;

    // 기관명 (name)
    @Column(name = "name", nullable = false, length = 255) // null 불가
    private String name;

    // 카테고리 (category)
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private Category category;

    // 전화번호 (phone)
    @Column(name = "phone", length = 50)
    private String phone;

    // 웹사이트 URL (website)
    @Column(name = "website", length = 500)
    private String website;

    // 설명 (description)
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // 운영 시간 (operating_hours)
    @Column(name = "operating_hours", length = 255)
    private String operatingHours;

    // 긴급 상담 여부 (is_urgent)
    @Column(name = "is_urgent", columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean isUrgent = false;

    // 이용 가능 여부 (is_available)
    @Column(name = "is_available", columnDefinition = "TINYINT(1) DEFAULT 1")
    @Builder.Default
    private Boolean isAvailable = true;

    // 생성일시 (created_at)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정일시 (updated_at)
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 삭제일시 (deleted_at) - 소프트 삭제
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum Category {
        EMERGENCY("긴급상담"),
        PROFESSIONAL("전문상담"),
        HOTLINE("상담전화"),
        MEDICAL("의료기관");

        private final String description;

        Category(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }

        public static Category fromDescription(String description) {
            for (Category category : values()) {
                if (category.description.equals(description) || category.name().equalsIgnoreCase(description)) {
                    return category;
                }
            }
            throw new IllegalArgumentException("Unknown category: " + description);
        }
    }
}
