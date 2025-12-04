package com.p_project.p_project_backend.backend_admin.dto.counselingresource;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingResourceCreateRequest {

    @NotBlank(message = "기관명은 필수입니다")
    @Size(max = 255, message = "기관명은 최대 255자까지 입력 가능합니다")
    private String name;

    @NotBlank(message = "카테고리는 필수입니다")
    private String category;

    @NotBlank(message = "전화번호는 필수입니다")
    @Size(max = 50, message = "전화번호는 최대 50자까지 입력 가능합니다")
    private String phone;

    @Pattern(regexp = "^(https?://).*", message = "웹사이트 주소는 http:// 또는 https://로 시작해야 합니다")
    @Size(max = 500, message = "웹사이트 주소는 최대 500자까지 입력 가능합니다")
    private String website; // 선택 필드 (null 허용)

    @NotBlank(message = "설명은 필수입니다")
    private String description;

    @Size(max = 255, message = "운영 시간은 최대 255자까지 입력 가능합니다")
    private String operatingHours;

    @NotNull(message = "긴급 상담 여부는 필수입니다")
    private Boolean isUrgent;
}

