package com.p_project.p_project_backend.backend_user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.p_project.p_project_backend.backend_user.dto.ai.AiServerRequest;
import com.p_project.p_project_backend.backend_user.dto.ai.AiServiceResult;
import com.p_project.p_project_backend.backend_user.dto.diary.DiaryRequest;
import com.p_project.p_project_backend.backend_user.dto.diary.DiaryResponse;
import com.p_project.p_project_backend.backend_user.dto.diary.DiarySummaryResponse;
import com.p_project.p_project_backend.backend_user.repository.DiaryActivityRepository;
import com.p_project.p_project_backend.backend_user.repository.DiaryImageRepository;
import com.p_project.p_project_backend.backend_user.repository.DiaryRepository;
import com.p_project.p_project_backend.entity.Diary;
import com.p_project.p_project_backend.entity.Diary.Emotion;
import com.p_project.p_project_backend.entity.DiaryActivity;
import com.p_project.p_project_backend.entity.DiaryImage;
import com.p_project.p_project_backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
        AiServiceResult aiResult = analyzeDiaryContent(user, request);
        Diary diary = buildDiaryEntity(user, request, aiResult);
        Diary savedDiary = diaryRepository.save(diary);

        saveDiaryContents(savedDiary, request.getActivities(), request.getImages());

        return buildDiaryResponse(savedDiary, request);
    }

    @Transactional
    public DiaryResponse updateDiary(User user, Long diaryId, DiaryRequest request) {
        Diary diary = getOwnedDiary(user, diaryId);

        AiServiceResult aiResult = analyzeDiaryContent(user, request);
        updateDiaryEntity(diary, request, aiResult);

        deleteDiaryContents(diary);
        saveDiaryContents(diary, request.getActivities(), request.getImages());

        return buildDiaryResponse(diary, request);
    }

    public DiaryResponse getDiary(User user, Long diaryId) {
        Diary diary = getOwnedDiary(user, diaryId);
        return buildDiaryResponse(diary, null);
    }

    public DiaryResponse getDiaryByDate(User user, LocalDate date) {
        Diary diary = diaryRepository.findByUserAndDate(user, date)
                .orElseThrow(() -> new IllegalArgumentException("Diary not found for date: " + date));
        return buildDiaryResponse(diary, null);
    }

    public List<DiarySummaryResponse> getMonthlyDiaries(User user, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        return diaryRepository.findByUserAndDateBetweenAndDeletedAtIsNull(user, startDate, endDate).stream()
                .map(this::buildDiarySummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> searchDiaries(User user, String keyword, LocalDate startDate,
            LocalDate endDate, List<Emotion> emotions, int page, int limit) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page - 1,
                limit);
        org.springframework.data.domain.Page<Diary> diaryPage = diaryRepository.searchDiaries(user, keyword, startDate,
                endDate, emotions, pageable);

        List<DiarySummaryResponse> diaryResponses = diaryPage.getContent().stream()
                .map(this::buildDiarySummaryResponse)
                .collect(Collectors.toList());

        return java.util.Map.of(
                "total", diaryPage.getTotalElements(),
                "page", page,
                "limit", limit,
                "totalPages", diaryPage.getTotalPages(),
                "diaries", diaryResponses);
    }

    @Transactional
    public void deleteDiary(User user, Long diaryId) {
        Diary diary = getOwnedDiary(user, diaryId);
        deleteDiaryContents(diary);
        diaryRepository.delete(diary);
    }

    // --- Helper Methods ---

    private Diary getOwnedDiary(User user, Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("Diary not found"));

        if (!diary.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized access");
        }
        return diary;
    }

    private AiServiceResult analyzeDiaryContent(User user, DiaryRequest request) {
        AiServerRequest aiRequest = buildAiRequest(user, request);
        return aiService.analyzeDiary(aiRequest);
    }

    private void updateDiaryEntity(Diary diary, DiaryRequest request, AiServiceResult aiResult) {
        diary.setDate(request.getDate());
        diary.setTitle(request.getTitle());
        diary.setContent(request.getContent());
        diary.setMood(request.getMood());
        diary.setWeather(request.getWeather());
        diary.setEmotion(Emotion.valueOf(aiResult.getEmotion()));
        diary.setAiComment(aiResult.getAiComment());
        diary.setRecommendedFood(convertToJson(aiResult.getRecommendedFood()));
        diary.setImageUrl(aiResult.getImageUrl());
        diary.setUpdatedAt(LocalDateTime.now());
    }

    private void saveDiaryContents(Diary diary, List<String> activities, List<String> images) {
        saveActivities(diary, activities);
        saveImages(diary, images);
    }

    private void deleteDiaryContents(Diary diary) {
        diaryActivityRepository.deleteAll(diaryActivityRepository.findAllByDiary(diary));
        diaryImageRepository.deleteAll(diaryImageRepository.findAllByDiary(diary));
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
                .emotion(Emotion.valueOf(aiResult.getEmotion()))
                .aiComment(aiResult.getAiComment())
                .recommendedFood(convertToJson(aiResult.getRecommendedFood()))
                .imageUrl(aiResult.getImageUrl())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private DiaryResponse buildDiaryResponse(Diary savedDiary, DiaryRequest request) {
        List<String> activities;
        List<String> images;

        if (request != null) {
            activities = request.getActivities() != null ? request.getActivities() : java.util.Collections.emptyList();
            images = request.getImages() != null ? request.getImages() : java.util.Collections.emptyList();
        } else {
            activities = diaryActivityRepository.findAllByDiary(savedDiary).stream()
                    .map(DiaryActivity::getActivity)
                    .collect(Collectors.toList());
            images = diaryImageRepository.findAllByDiary(savedDiary).stream()
                    .map(DiaryImage::getImageUrl)
                    .collect(Collectors.toList());
        }

        return DiaryResponse.builder()
                .id(savedDiary.getId())
                .date(savedDiary.getDate())
                .title(savedDiary.getTitle())
                .content(savedDiary.getContent())
                .emotion(savedDiary.getEmotion().name())
                .mood(savedDiary.getMood())
                .weather(savedDiary.getWeather() != null ? savedDiary.getWeather().name() : null)
                .activities(activities)
                .images(images)
                .imageUrl(savedDiary.getImageUrl())
                .aiComment(savedDiary.getAiComment())
                .recommendedFood(savedDiary.getRecommendedFood())
                .createdAt(savedDiary.getCreatedAt())
                .updatedAt(savedDiary.getUpdatedAt())
                .build();
    }

    private DiarySummaryResponse buildDiarySummaryResponse(Diary diary) {
        return DiarySummaryResponse.builder()
                .id(diary.getId())
                .date(diary.getDate())
                .emotion(diary.getEmotion().name())
                .build();
    }

    private void saveActivities(Diary diary, List<String> activities) {
        if (activities == null || activities.isEmpty())
            return;
        List<DiaryActivity> entities = activities.stream()
                .map(activity -> DiaryActivity.builder()
                        .diary(diary)
                        .activity(activity)
                        .createdAt(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());
        diaryActivityRepository.saveAll(entities);
    }

    private void saveImages(Diary diary, List<String> images) {
        if (images == null || images.isEmpty())
            return;
        List<DiaryImage> entities = images.stream()
                .map(imageUrl -> DiaryImage.builder()
                        .diary(diary)
                        .imageUrl(imageUrl)
                        .createdAt(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());
        diaryImageRepository.saveAll(entities);
    }

    private String convertToJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

}
