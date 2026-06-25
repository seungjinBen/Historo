package com.historo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_stories")
public class UserStory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String eventId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String picksJson;

    private String pathText;

    private String thumbnailUrl;

    private boolean shared;

    private LocalDateTime createdAt;

    protected UserStory() {}

    public UserStory(Long userId, String eventId, String title,
                     String picksJson, String pathText, String thumbnailUrl) {
        this.userId = userId;
        this.eventId = eventId;
        this.title = title;
        this.picksJson = picksJson;
        this.pathText = pathText;
        this.thumbnailUrl = thumbnailUrl;
        this.shared = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getEventId() { return eventId; }
    public String getTitle() { return title; }
    public String getPicksJson() { return picksJson; }
    public String getPathText() { return pathText; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public boolean isShared() { return shared; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setShared(boolean shared) { this.shared = shared; }
}
