package com.p_project.p_project_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 웹 MVC 설정 (정적 리소스, CORS)
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * 정적 리소스 핸들러 설정 (이미지 업로드 경로)
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expose the images directory to /images/** (includes user_uploads and
        // ai_generates)
        Path uploadDir = Paths.get("images");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:///" + uploadPath + "/");
    }

    /**
     * CORS 매핑 설정 (모든 출처 허용)
     */
    @Override
    public void addCorsMappings(org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로에 대해
                .allowedOriginPatterns("*") // 모든 출처 허용 (모바일/외부 접속 지원)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용할 HTTP 메서드
                .allowedHeaders("*") // 모든 헤더 허용
                .allowCredentials(true); // 쿠키/인증 정보 포함 허용
    }
}
