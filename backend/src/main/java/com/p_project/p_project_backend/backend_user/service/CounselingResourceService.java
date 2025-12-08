package com.p_project.p_project_backend.backend_user.service;

import com.p_project.p_project_backend.backend_user.dto.counseling.CounselingResourceResponse;
import com.p_project.p_project_backend.entity.CounselingResource;
import com.p_project.p_project_backend.repository.CounselingResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CounselingResourceService {

    private final CounselingResourceRepository counselingResourceRepository;

    @Transactional(readOnly = true)
    public List<CounselingResourceResponse> getCounselingResources(String category) {
        List<CounselingResource> resources = fetchResources(category);

        return resources.stream()
                .map(CounselingResourceResponse::from)
                .collect(Collectors.toList());
    }

    private List<CounselingResource> fetchResources(String category) {
        if (!StringUtils.hasText(category) || category.equalsIgnoreCase("all")) {
            return counselingResourceRepository.findAllNotDeleted();
        }

        CounselingResource.Category cat = CounselingResource.Category.fromDescription(category);
        return counselingResourceRepository.findAllByCategoryAndDeletedAtIsNull(cat);
    }
}
