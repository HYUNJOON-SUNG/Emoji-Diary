package com.p_project.p_project_backend.backend_user.controller;

import com.p_project.p_project_backend.backend_user.dto.counseling.CounselingResourceResponse;
import com.p_project.p_project_backend.backend_user.service.CounselingResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/counseling-resources")
@RequiredArgsConstructor
public class CounselingResourceController {

    private final CounselingResourceService counselingResourceService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCounselingResources(
            @RequestParam(required = false) String category) {

        List<CounselingResourceResponse> resources = counselingResourceService.getCounselingResources(category);

        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("resources", resources)));
    }
}
