package com.historo.entity;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

/**
 * historo-story-trees 테이블
 * PK: eventId (String)
 */
@DynamoDbBean
public class StoryTree {

    private String eventId;
    private String treeJson;

    public StoryTree() {}

    public StoryTree(String eventId, String treeJson) {
        this.eventId = eventId;
        this.treeJson = treeJson;
    }

    @DynamoDbPartitionKey
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getTreeJson() { return treeJson; }
    public void setTreeJson(String treeJson) { this.treeJson = treeJson; }
}
