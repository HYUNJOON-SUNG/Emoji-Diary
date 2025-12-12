package com.p_project.p_project_backend.backend_user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.p_project.p_project_backend.backend_user.dto.ai.AiServerRequest;
import com.p_project.p_project_backend.backend_user.dto.ai.AiServiceResult;
import com.p_project.p_project_backend.backend_user.dto.diary.DiaryCreateRequest;
import com.p_project.p_project_backend.backend_user.dto.diary.DiaryUpdateRequest;
import com.p_project.p_project_backend.backend_user.dto.diary.DiaryMonthlyResponse;
import com.p_project.p_project_backend.backend_user.dto.diary.DiaryResponse;
import com.p_project.p_project_backend.backend_user.dto.diary.DiarySearchResponse;
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
    public DiaryResponse createDiary(User user, DiaryCreateRequest request) {
        validateDuplicateDiary(user, request.getDate());

        AiServiceResult aiResult = analyzeDiaryContent(user, request.getContent(), request.getWeather());
        Diary diary = buildDiaryEntity(user, request, aiResult);
        Diary savedDiary = diaryRepository.save(diary);

        saveDiaryContents(savedDiary, request.getActivities(), request.getImages());

        return buildDiaryResponse(savedDiary, request.getActivities(), request.getImages());
    }

    @Transactional
    public DiaryResponse updateDiary(User user, Long diaryId, DiaryUpdateRequest request) {
        Diary diary = getOwnedDiary(user, diaryId);

        // Check if content, weather, or persona has changed
        boolean contentChanged = !diary.getContent().equals(request.getContent());
        boolean weatherChanged = diary.getWeather() != request.getWeather();
        boolean personaChanged = diary.getPersona() != user.getPersona();

        if (contentChanged || weatherChanged || personaChanged) {
            // If any critical field changed, trigger AI analysis (Smart Update)
            AiServiceResult aiResult = analyzeDiaryContent(user, request.getContent(), request.getWeather());
            updateDiaryEntity(diary, request, aiResult);
        } else {
            // Only metadata changed (title, mood, activities, images), skip AI
            updateDiaryEntityPartial(diary, request);
        }

        deleteDiaryContents(diary);
        saveDiaryContents(diary, request.getActivities(), request.getImages());

        return buildDiaryResponse(diary, request.getActivities(), request.getImages());
    }

    public DiaryResponse getDiary(User user, Long diaryId) {
        Diary diary = getOwnedDiary(user, diaryId);
        return buildDiaryResponse(diary, null, null);
    }

    public DiaryResponse getDiaryByDate(User user, LocalDate date) {
        Diary diary = diaryRepository.findByUserAndDate(user, date)
                .orElseThrow(() -> new com.p_project.p_project_backend.exception.DiaryNotFoundException(
                        "해당 날짜에 작성된 일기가 없습니다"));
        return buildDiaryResponse(diary, null, null);
    }

    public DiaryMonthlyResponse getMonthlyDiaries(User user, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<DiarySummaryResponse> diaries = diaryRepository
                .findByUserAndDateBetweenAndDeletedAtIsNull(user, startDate, endDate).stream()
                .map(this::buildDiarySummaryResponse)
                .collect(Collectors.toList());

        return DiaryMonthlyResponse.builder()
                .year(year)
                .month(month)
                .diaries(diaries)
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> searchDiaries(User user, String keyword, LocalDate startDate,
            LocalDate endDate, List<Emotion> emotions, int page, int limit) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page - 1,
                limit);
        org.springframework.data.domain.Page<Diary> diaryPage = diaryRepository.searchDiaries(user, keyword, startDate,
                endDate, emotions, pageable);

        List<DiarySearchResponse> diaryResponses = diaryPage.getContent().stream()
                .map(this::buildDiarySearchResponse)
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

    private void validateDuplicateDiary(User user, LocalDate date) {
        if (diaryRepository.findByUserAndDate(user, date).isPresent()) {
            throw new IllegalArgumentException("이미 해당 날짜에 작성된 일기가 있습니다. 기존 일기를 수정해주세요.");
        }
    }

    private Diary getOwnedDiary(User user, Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("Diary not found"));

        if (!diary.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized access");
        }
        return diary;
    }

    private AiServiceResult analyzeDiaryContent(User user, String content,
            com.p_project.p_project_backend.entity.Diary.Weather weather) {
        AiServerRequest aiRequest = buildAiRequest(user, content, weather);
        return aiService.analyzeDiary(aiRequest);
    }

    private void updateDiaryEntity(Diary diary, DiaryUpdateRequest request, AiServiceResult aiResult) {
        // Update does not change date
        diary.setTitle(request.getTitle());
        diary.setContent(request.getContent());
        diary.setMood(request.getMood());
        diary.setWeather(request.getWeather());
        // Save user's current persona as snapshot
        diary.setPersona(diary.getUser().getPersona());

        diary.setEmotion(Emotion.valueOf(aiResult.getEmotion()));
        diary.setAiComment(aiResult.getAiComment());
        diary.setRecommendedFood(convertToJson(aiResult.getRecommendedFood()));
        diary.setImageUrl(aiResult.getImageUrl());
        diary.setUpdatedAt(LocalDateTime.now());
    }

    private void updateDiaryEntityPartial(Diary diary, DiaryUpdateRequest request) {
        // Update only metadata fields, skip AI fields
        diary.setTitle(request.getTitle());
        diary.setContent(request.getContent()); // Content is same, but set it anyway or just metadata?
        // Actually if content didn't change, we still update it just in case text
        // encoding quirks? No need if checked equality.
        // But the partial update is for when AI inputs (content/weather/persona) are
        // NOT changed.
        // Wait, if content IS same, we don't need to set it?
        // Logic says: if !contentChanged && !weatherChanged && !personaChanged ->
        // partial.

        diary.setTitle(request.getTitle());
        // Content, Weather are same effectively, but let's set them to be safe or if
        // there are minor diffs ignored?
        // Actually if they are equal, setting them is fine (no-op).
        diary.setContent(request.getContent());
        diary.setMood(request.getMood());
        diary.setWeather(request.getWeather());
        // Persona is same, no need to update or just set it.

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

    private AiServerRequest buildAiRequest(User user, String content,
            com.p_project.p_project_backend.entity.Diary.Weather weather) {
        return AiServerRequest.builder()
                .content(content)
                .weather(weather)
                .persona(user.getPersona())
                .gender(user.getGender())
                .build();
    }

    private Diary buildDiaryEntity(User user, DiaryCreateRequest request, AiServiceResult aiResult) {
        return Diary.builder()
                .user(user)
                .date(request.getDate())
                .title(request.getTitle())
                .content(request.getContent())
                .mood(request.getMood())
                .weather(request.getWeather())
                .persona(user.getPersona()) // Save snapshot of persona
                .emotion(Emotion.valueOf(aiResult.getEmotion()))
                .aiComment(aiResult.getAiComment())
                .recommendedFood(convertToJson(aiResult.getRecommendedFood()))
                .imageUrl(aiResult.getImageUrl())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private DiaryResponse buildDiaryResponse(Diary savedDiary, List<String> requestActivities,
            List<String> requestImages) {
        List<String> activities;
        List<String> images;

        if (requestActivities != null) {
            activities = requestActivities;
            images = requestImages != null ? requestImages : java.util.Collections.emptyList();
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
                .recommendedFood(convertFromJson(savedDiary.getRecommendedFood()))
                .createdAt(savedDiary.getCreatedAt())
                .updatedAt(savedDiary.getUpdatedAt())
                .persona(savedDiary.getPersona() != null ? savedDiary.getPersona().name() : null)
                .build();
    }

    private DiarySummaryResponse buildDiarySummaryResponse(Diary diary) {
        return DiarySummaryResponse.builder()
                .id(diary.getId())
                .date(diary.getDate())
                .emotion(diary.getEmotion().name())
                .build();
    }

    private DiarySearchResponse buildDiarySearchResponse(Diary diary) {
        return DiarySearchResponse.builder()
                .id(diary.getId())
                .date(diary.getDate())
                .title(diary.getTitle())
                .content(diary.getContent())
                .emotion(diary.getEmotion().name())
                .weather(diary.getWeather() != null ? diary.getWeather().name() : null)
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

    private String convertToJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            throw new RuntimeException("JSON conversion failed", e);
        }
    }

    private Object convertFromJson(String json) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("JSON parsing failed", e);
        }
    }

}
