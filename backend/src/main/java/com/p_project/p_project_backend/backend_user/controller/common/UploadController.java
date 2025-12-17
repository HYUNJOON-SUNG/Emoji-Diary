package com.p_project.p_project_backend.backend_user.controller.common;

import com.p_project.p_project_backend.backend_user.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/upload/image")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    /**
     * 이미지 업로드 (다중 지원)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadImages(@RequestParam("image") List<MultipartFile> images) {
        List<String> imageUrls = uploadService.uploadImages(images);
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("imageUrls", imageUrls)));
    }

    /**
     * 이미지 삭제
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteImage(@RequestBody Map<String, String> request) {
        String imageUrl = request.get("imageUrl");
        uploadService.deleteImage(imageUrl);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("message", "이미지가 삭제되었습니다")));
    }
}
