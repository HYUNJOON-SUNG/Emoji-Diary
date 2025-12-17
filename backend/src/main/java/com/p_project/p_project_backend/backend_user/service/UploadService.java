package com.p_project.p_project_backend.backend_user.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Slf4j
@Service
public class UploadService {

    // 로컬 저장 경로
    private static final String UPLOAD_DIR = "images/user_uploads";

    /**
     * 이미지 업로드 (다중)
     */
    public List<String> uploadImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Files are empty");
        }

        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty())
                continue;

            // Validate content type (basic check)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException(
                        "Invalid file type. Only images are allowed: " + file.getOriginalFilename());
            }

            try {
                // Ensure directory exists
                Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // Generate unique filename
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String filename = UUID.randomUUID().toString() + extension;

                // Save file
                Path targetLocation = uploadPath.resolve(filename);
                Files.copy(file.getInputStream(), targetLocation);

                // Generate URL (Served via /images/user_uploads/**)
                String fileUrl = "/images/user_uploads/" + filename;
                imageUrls.add(fileUrl);
            } catch (IOException e) {
                // Wrap and throw to be handled by GlobalExceptionHandler (500 Internal Server
                // Error)
                throw new RuntimeException("Failed to upload image: " + file.getOriginalFilename(), e);
            }
        }
        return imageUrls;
    }

    /**
     * 이미지 삭제
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // Extract filename from URL (assuming /images/filename format)
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);

            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).toAbsolutePath().normalize();

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Deleted image: {}", filename);
            } else {
                log.warn("Image file not found for deletion: {}", filename);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image: " + imageUrl, e);
        }
    }
}
