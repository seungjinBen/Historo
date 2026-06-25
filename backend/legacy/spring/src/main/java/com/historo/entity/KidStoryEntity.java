package com.historo.entity;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

/**
 * historo-kid-stories 테이블
 * PK: eventId (String)
 */
@DynamoDbBean
public class KidStoryEntity {

    private String eventId;
    private String source;
    private String sillokUrl;
    private boolean fromSillok;
    private String kidStory;
    private String funFactsJson;

    public KidStoryEntity() {}

    public KidStoryEntity(String eventId, String source, String sillokUrl,
                          boolean fromSillok, String kidStory, String funFactsJson) {
        this.eventId = eventId;
        this.source = source;
        this.sillokUrl = sillokUrl;
        this.fromSillok = fromSillok;
        this.kidStory = kidStory;
        this.funFactsJson = funFactsJson;
    }

    @DynamoDbPartitionKey
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSillokUrl() { return sillokUrl; }
    public void setSillokUrl(String sillokUrl) { this.sillokUrl = sillokUrl; }

    public boolean isFromSillok() { return fromSillok; }
    public void setFromSillok(boolean fromSillok) { this.fromSillok = fromSillok; }

    public String getKidStory() { return kidStory; }
    public void setKidStory(String kidStory) { this.kidStory = kidStory; }

    public String getFunFactsJson() { return funFactsJson; }
    public void setFunFactsJson(String funFactsJson) { this.funFactsJson = funFactsJson; }
}
