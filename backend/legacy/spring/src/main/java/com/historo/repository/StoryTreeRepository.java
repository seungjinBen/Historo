package com.historo.repository;

import com.historo.entity.StoryTree;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.Optional;

/**
 * historo-story-trees 테이블 접근
 * PK: eventId (String)
 */
@Repository
public class StoryTreeRepository {

    private final DynamoDbTable<StoryTree> table;

    public StoryTreeRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("historo-story-trees", TableSchema.fromBean(StoryTree.class));
    }

    public Optional<StoryTree> findById(String eventId) {
        StoryTree result = table.getItem(Key.builder().partitionValue(eventId).build());
        return Optional.ofNullable(result);
    }

    public void save(StoryTree entity) {
        table.putItem(entity);
    }

    public long count() {
        return table.scan().items().stream().count();
    }
}
