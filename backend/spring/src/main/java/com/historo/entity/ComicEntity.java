package com.historo.entity;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

/**
 * historo-comics 테이블
 * PK: episodeId (String)
 */
@DynamoDbBean
public class ComicEntity {

    private String episodeId;
    private String comicJson;

    public ComicEntity() {}

    public ComicEntity(String episodeId, String comicJson) {
        this.episodeId = episodeId;
        this.comicJson = comicJson;
    }

    @DynamoDbPartitionKey
    public String getEpisodeId() { return episodeId; }
    public void setEpisodeId(String episodeId) { this.episodeId = episodeId; }

    public String getComicJson() { return comicJson; }
    public void setComicJson(String comicJson) { this.comicJson = comicJson; }
}
