package com.p_project.p_project_backend.backend_user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.p_project.p_project_backend.backend_user.dto.ai.AiServerRequest;
import com.p_project.p_project_backend.backend_user.dto.ai.AiServiceResult;
import com.p_project.p_project_backend.backend_user.dto.diary.DiaryRequest;
import com.p_project.p_project_backend.backend_user.dto.diary.DiaryResponse;
import com.p_project.p_project_backend.backend_user.repository.DiaryActivityRepository;
import com.p_project.p_project_backend.backend_user.repository.DiaryImageRepository;
import com.p_project.p_project_backend.backend_user.repository.DiaryRepository;
import com.p_project.p_project_backend.entity.Diary;
import com.p_project.p_project_backend.entity.DiaryActivity;
import com.p_project.p_project_backend.entity.DiaryImage;
import com.p_project.p_project_backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final AiService aiService;
    private final DiaryActivityRepository diaryActivityRepository;
    private final DiaryImageRepository diaryImageRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public DiaryResponse createDiary(User user, DiaryRequest request) {
        // 1. AI 분석 요청
        AiServerRequest aiRequest = buildAiRequest(user, request);
        AiServiceResult aiResult = aiService.analyzeDiary(aiRequest);

        // 2. Diary 엔티티 생성 및 저장
        Diary diary = buildDiaryEntity(user, request, aiResult);
        Diary savedDiary = diaryRepository.save(diary);

        // 3. 활동 및 이미지 저장
        saveActivities(savedDiary, request.getActivities());
        saveImages(savedDiary, request.getImages());

        // 4. 응답 반환
        return buildDiaryResponse(savedDiary, request);
    }

    private AiServerRequest buildAiRequest(User user, DiaryRequest request) {
        return AiServerRequest.builder()
                .date(request.getDate())
                .title(request.getTitle())
                .content(request.getContent())
                .mood(request.getMood())
                .weather(request.getWeather())
                .activities(request.getActivities())
                .images(request.getImages())
                .persona(user.getPersona())
                .build();
    }

    private Diary buildDiaryEntity(User user, DiaryRequest request, AiServiceResult aiResult) {
        return Diary.builder()
                .user(user)
                .date(request.getDate())
                .title(request.getTitle())
                .content(request.getContent())
                .mood(request.getMood())
                .weather(request.getWeather())
                .emotion(Diary.Emotion.valueOf(aiResult.getEmotion()))
                .aiComment(aiResult.getAiComment())
                .recommendedFood(convertToJson(aiResult.getRecommendedFood()))
                .imageUrl(aiResult.getImageUrl())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private DiaryResponse buildDiaryResponse(Diary savedDiary, DiaryRequest request) {
        return DiaryResponse.builder()
                .id(savedDiary.getId())
                .date(savedDiary.getDate())
                .title(savedDiary.getTitle())
                .content(savedDiary.getContent())
                .emotion(savedDiary.getEmotion().name())
                .mood(savedDiary.getMood())
                .weather(savedDiary.getWeather() != null ? savedDiary.getWeather().name() : null)
                .activities(
                        request.getActivities() != null ? request.getActivities() : java.util.Collections.emptyList())
                .images(request.getImages() != null ? request.getImages() : java.util.Collections.emptyList())
                .imageUrl(savedDiary.getImageUrl())
                .aiComment(savedDiary.getAiComment())
                .recommendedFood(savedDiary.getRecommendedFood())
                .createdAt(savedDiary.getCreatedAt())
                .updatedAt(savedDiary.getUpdatedAt())
                .build();
    }

    private void saveActivities(Diary diary, List<String> activities) {
        if (activities == null || activities.isEmpty())
            return;

        List<DiaryActivity> activityEntities = activities.stream()
                .map(activity -> DiaryActivity.builder()
                        .diary(diary)
                        .activity(activity)
                        .createdAt(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());

        diaryActivityRepository.saveAll(activityEntities);
    }

    private void saveImages(Diary diary, List<String> images) {
        if (images == null || images.isEmpty())
            return;

        List<DiaryImage> imageEntities = images.stream()
                .map(imageUrl -> DiaryImage.builder()
                        .diary(diary)
                        .imageUrl(imageUrl)
                        .createdAt(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());

        diaryImageRepository.saveAll(imageEntities);
    }

    private String convertToJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[]"; // 에러 시 빈 배열 반환
        }
    }
}
