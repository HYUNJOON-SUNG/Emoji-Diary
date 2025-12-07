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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadImages(@RequestParam("image") List<MultipartFile> images) {
        List<String> imageUrls = uploadService.uploadImages(images);
        // 클라이언트 하위 호환성을 위해 하나만 올라오면 data: { imageUrl: ... } 형태 유지하되,
        // 여러개면 data: { imageUrls: [...] } 등으로 줄 수도 있지만,
        // 기존 API 규격을 최대한 유지하면서 여러장 업로드 시에는... 응답 규격이 변경되어야 함.
        // 하지만 사용자 요청이 "여러장 업로드 가능하게 해달라"는 것이므로, 응답에 'imageUrls' (List)를 포함시킴.
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("imageUrls", imageUrls)));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteImage(@RequestBody Map<String, String> request) {
        String imageUrl = request.get("imageUrl");
        uploadService.deleteImage(imageUrl);
        return ResponseEntity.ok(Map.of("success", true, "message", "Image deleted successfully"));
    }
}
