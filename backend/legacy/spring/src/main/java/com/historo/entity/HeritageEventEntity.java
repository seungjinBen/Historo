package com.historo.entity;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

import java.util.ArrayList;
import java.util.List;

/**
 * historo-heritage-events 테이블
 * PK: id (String)
 *
 * heritageItems는 별도 historo-heritage-items 테이블에서 관리됩니다.
 * (HeritageItemRepository 참조)
 * 이 엔티티에는 items 필드가 없으며, DataService에서 조합합니다.
 */
@DynamoDbBean
public class HeritageEventEntity {

    private String id;
    private String title;
    private String year;
    private String sillokUrl;

    // 런타임에서만 사용 (DynamoDB 저장 안 함) — DataService에서 조합
    private transient List<HeritageItemEntity> heritageItems = new ArrayList<>();

    public HeritageEventEntity() {}

    public HeritageEventEntity(String id, String title, String year, String sillokUrl) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.sillokUrl = sillokUrl;
    }

    // DataInitializer 호환용 — 런타임 리스트에만 추가 (DB 저장 안 됨)
    public void addItem(HeritageItemEntity item) {
        heritageItems.add(item);
        item.setHeritageEventId(this.id);
    }

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getSillokUrl() { return sillokUrl; }
    public void setSillokUrl(String sillokUrl) { this.sillokUrl = sillokUrl; }

    // transient — DynamoDB 매핑 제외
    public List<HeritageItemEntity> getHeritageItems() { return heritageItems; }
    public void setHeritageItems(List<HeritageItemEntity> heritageItems) { this.heritageItems = heritageItems; }
}
