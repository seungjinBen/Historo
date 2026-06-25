package com.historo.repository;

import com.historo.entity.ComicEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * historo-comics 테이블 접근
 * PK: episodeId (String)
 */
@Repository
public class ComicRepository {

    private final DynamoDbTable<ComicEntity> table;

    public ComicRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("historo-comics", TableSchema.fromBean(ComicEntity.class));
    }

    public Optional<ComicEntity> findById(String episodeId) {
        ComicEntity result = table.getItem(Key.builder().partitionValue(episodeId).build());
        return Optional.ofNullable(result);
    }

    public List<ComicEntity> findAll() {
        return table.scan().items().stream().collect(Collectors.toList());
    }

    public void save(ComicEntity entity) {
        table.putItem(entity);
    }

    public long count() {
        return table.scan().items().stream().count();
    }
}
