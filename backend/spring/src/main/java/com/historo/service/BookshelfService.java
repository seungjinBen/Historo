package com.historo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.historo.dto.BookshelfItem;
import com.historo.dto.BookshelfSaveRequest;
import com.historo.entity.UserStory;
import com.historo.repository.UserStoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookshelfService {

    private final UserStoryRepository storyRepo;
    private final ObjectMapper mapper;

    public BookshelfService(UserStoryRepository storyRepo, ObjectMapper mapper) {
        this.storyRepo = storyRepo;
        this.mapper = mapper;
    }

    public List<BookshelfItem> getMyStories(String username) {
        return storyRepo.findByUsernameOrderByCreatedAtDesc(username).stream()
                .map(this::toItem)
                .toList();
    }

    public BookshelfItem save(String username, BookshelfSaveRequest req) {
        String picksJson;
        try {
            picksJson = mapper.writeValueAsString(req.picks());
        } catch (Exception e) {
            picksJson = "[]";
        }
        UserStory story = new UserStory(
                username, req.eventId(), req.title(),
                picksJson, req.pathText(), req.thumbnailUrl()
        );
        storyRepo.save(story);
        return toItem(story);
    }

    public void delete(String username, String storyId) {
        UserStory story = storyRepo.findById(username, storyId)
                .orElseThrow(() -> new IllegalArgumentException("스토리를 찾을 수 없습니다."));
        if (!story.getUsername().equals(username)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }
        storyRepo.delete(story);
    }

    private BookshelfItem toItem(UserStory s) {
        List<Integer> picks;
        try {
            picks = mapper.readValue(s.getPicksJson(), new TypeReference<>() {});
        } catch (Exception e) {
            picks = List.of();
        }
        return new BookshelfItem(
                s.getId(), s.getEventId(), s.getTitle(),
                picks, s.getPathText(), s.getThumbnailUrl(), s.getCreatedAt()
        );
    }
}
