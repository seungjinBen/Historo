package com.historo.repository;

import com.historo.entity.KidStoryEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.Optional;
import java.util.stream.StreamSupport;

/**
 * historo-kid-stories 테이블 접근
 * PK: eventId (String)
 */
@Repository
public class KidStoryRepository {

    private final DynamoDbTable<KidStoryEntity> table;

    public KidStoryRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("historo-kid-stories", TableSchema.fromBean(KidStoryEntity.class));
    }

    public Optional<KidStoryEntity> findById(String eventId) {
        KidStoryEntity result = table.getItem(Key.builder().partitionValue(eventId).build());
        return Optional.ofNullable(result);
    }

    public void save(KidStoryEntity entity) {
        table.putItem(entity);
    }

    public long count() {
        return table.scan().items().stream().count();
    }
}
