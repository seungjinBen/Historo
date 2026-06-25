package com.historo.entity;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

/**
 * historo-heritage-items 테이블
 * PK: id (String)
 * GSI: heritageEventId-index — heritageEventId (String)
 *
 * AWS CLI로 GSI 생성 예시:
 *   --global-secondary-indexes '[{"IndexName":"heritageEventId-index",
 *     "KeySchema":[{"AttributeName":"heritageEventId","KeyType":"HASH"}],
 *     "Projection":{"ProjectionType":"ALL"},
 *     "ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]'
 */
@DynamoDbBean
public class HeritageItemEntity {

    private String id;
    private String heritageEventId;  // GSI PK
    private String name;
    private String imagePath;
    private String docentText;
    private String source;
    private String sourceUrl;

    public HeritageItemEntity() {}

    public HeritageItemEntity(String id, String name, String imagePath,
                              String docentText, String source, String sourceUrl) {
        this.id = id;
        this.name = name;
        this.imagePath = imagePath;
        this.docentText = docentText;
        this.source = source;
        this.sourceUrl = sourceUrl;
    }

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    @DynamoDbSecondaryPartitionKey(indexNames = "heritageEventId-index")
    public String getHeritageEventId() { return heritageEventId; }
    public void setHeritageEventId(String heritageEventId) { this.heritageEventId = heritageEventId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getDocentText() { return docentText; }
    public void setDocentText(String docentText) { this.docentText = docentText; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
}
