package com.historo.repository;

import com.historo.entity.HeritageEventEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * historo-heritage-events 테이블 접근
 * PK: id (String)
 */
@Repository
public class HeritageEventRepository {

    private final DynamoDbTable<HeritageEventEntity> table;

    public HeritageEventRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("historo-heritage-events", TableSchema.fromBean(HeritageEventEntity.class));
    }

    public Optional<HeritageEventEntity> findById(String id) {
        HeritageEventEntity result = table.getItem(Key.builder().partitionValue(id).build());
        return Optional.ofNullable(result);
    }

    public List<HeritageEventEntity> findAll() {
        return table.scan().items().stream().collect(Collectors.toList());
    }

    public void save(HeritageEventEntity entity) {
        table.putItem(entity);
    }

    public long count() {
        return table.scan().items().stream().count();
    }
}
