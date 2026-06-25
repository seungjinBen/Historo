package com.historo.entity;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * historo-user-stories 테이블
 * PK: username (String, email)
 * SK: id (String, UUID)
 */
@DynamoDbBean
public class UserStory {

    private String username;   // PK
    private String id;         // SK (UUID)
    private String eventId;
    private String title;
    private String picksJson;
    private String pathText;
    private String thumbnailUrl;
    private boolean shared;
    private String createdAt;

    public UserStory() {}

    public UserStory(String username, String eventId, String title,
                     String picksJson, String pathText, String thumbnailUrl) {
        this.username = username;
        this.id = UUID.randomUUID().toString();
        this.eventId = eventId;
        this.title = title;
        this.picksJson = picksJson;
        this.pathText = pathText;
        this.thumbnailUrl = thumbnailUrl;
        this.shared = false;
        this.createdAt = LocalDateTime.now().toString();
    }

    @DynamoDbPartitionKey
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    @DynamoDbSortKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPicksJson() { return picksJson; }
    public void setPicksJson(String picksJson) { this.picksJson = picksJson; }

    public String getPathText() { return pathText; }
    public void setPathText(String pathText) { this.pathText = pathText; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public boolean isShared() { return shared; }
    public void setShared(boolean shared) { this.shared = shared; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
