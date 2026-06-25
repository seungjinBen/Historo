package com.historo.repository;

import com.historo.entity.Event;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * historo-events 테이블 접근
 * PK: id (String)
 */
@Repository
public class EventRepository {

    private final DynamoDbTable<Event> table;

    public EventRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("historo-events", TableSchema.fromBean(Event.class));
    }

    public Optional<Event> findById(String id) {
        Event result = table.getItem(Key.builder().partitionValue(id).build());
        return Optional.ofNullable(result);
    }

    public List<Event> findAll() {
        return table.scan().items().stream().collect(Collectors.toList());
    }

    public void save(Event event) {
        table.putItem(event);
    }

    public long count() {
        return table.scan().items().stream().count();
    }
}
