package com.p_project.p_project_backend.backend_admin.dto.counselingresource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingResourceListResponse {
    private List<CounselingResourceItem> resources;
}

