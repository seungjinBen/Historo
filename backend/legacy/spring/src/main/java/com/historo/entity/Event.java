package com.historo.entity;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

/**
 * historo-events 테이블
 * PK: id (String)
 */
@DynamoDbBean
public class Event {

    private String id;
    private String title;
    private int year;
    private String king;
    private String era;
    private String category;
    private String status;
    private String source;
    private String sillokUrl;
    private String factCard;
    private String factContext;
    private String characterName;
    private String characterAppearance;

    public Event() {}

    public Event(String id, String title, int year, String king, String era,
                 String category, String status, String source, String sillokUrl,
                 String factCard, String factContext,
                 String characterName, String characterAppearance) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.king = king;
        this.era = era;
        this.category = category;
        this.status = status;
        this.source = source;
        this.sillokUrl = sillokUrl;
        this.factCard = factCard;
        this.factContext = factContext;
        this.characterName = characterName;
        this.characterAppearance = characterAppearance;
    }

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    // DynamoDB 속성명을 'year'로 명시 (Java 예약어 아니지만 명확성을 위해)
    @DynamoDbAttribute("year")
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public String getKing() { return king; }
    public void setKing(String king) { this.king = king; }

    public String getEra() { return era; }
    public void setEra(String era) { this.era = era; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSillokUrl() { return sillokUrl; }
    public void setSillokUrl(String sillokUrl) { this.sillokUrl = sillokUrl; }

    public String getFactCard() { return factCard; }
    public void setFactCard(String factCard) { this.factCard = factCard; }

    public String getFactContext() { return factContext; }
    public void setFactContext(String factContext) { this.factContext = factContext; }

    public String getCharacterName() { return characterName; }
    public void setCharacterName(String characterName) { this.characterName = characterName; }

    public String getCharacterAppearance() { return characterAppearance; }
    public void setCharacterAppearance(String characterAppearance) { this.characterAppearance = characterAppearance; }
}
