package com.historo.repository;

import com.historo.entity.HeritageItemEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * historo-heritage-items 테이블 접근
 * PK: id (String)
 * GSI: heritageEventId-index — heritageEventId (String)
 *
 * DataService에서 heritageEvent 목록 조합 시 사용
 */
@Repository
public class HeritageItemRepository {

    private final DynamoDbTable<HeritageItemEntity> table;
    private final DynamoDbIndex<HeritageItemEntity> heritageEventIndex;

    public HeritageItemRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("historo-heritage-items", TableSchema.fromBean(HeritageItemEntity.class));
        this.heritageEventIndex = table.index("heritageEventId-index");
    }

    /**
     * GSI를 통해 특정 heritage event에 속한 모든 item 조회
     */
    public List<HeritageItemEntity> findByHeritageEventId(String heritageEventId) {
        QueryConditional condition = QueryConditional.keyEqualTo(
                Key.builder().partitionValue(heritageEventId).build()
        );
        return heritageEventIndex.query(condition)
                .stream()
                .flatMap(page -> page.items().stream())
                .collect(Collectors.toList());
    }

    public void save(HeritageItemEntity item) {
        table.putItem(item);
    }

    public void delete(HeritageItemEntity item) {
        table.deleteItem(item);
    }
}
