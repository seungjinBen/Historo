package com.historo.repository;

import com.historo.entity.UserStory;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * historo-user-stories 테이블 접근
 * PK: username (String)
 * SK: id (String, UUID)
 *
 * findByUserIdOrderByCreatedAtDesc → query by PK(username), sort by createdAt desc in memory
 */
@Repository
public class UserStoryRepository {

    private final DynamoDbTable<UserStory> table;

    public UserStoryRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("historo-user-stories", TableSchema.fromBean(UserStory.class));
    }

    /**
     * username으로 해당 사용자의 모든 스토리 조회 (최신순)
     */
    public List<UserStory> findByUsernameOrderByCreatedAtDesc(String username) {
        QueryConditional condition = QueryConditional.keyEqualTo(
                Key.builder().partitionValue(username).build()
        );
        return table.query(condition)
                .items()
                .stream()
                .sorted(Comparator.comparing(UserStory::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    /**
     * username + storyId(SK)로 단건 조회
     */
    public Optional<UserStory> findById(String username, String storyId) {
        UserStory result = table.getItem(
                Key.builder().partitionValue(username).sortValue(storyId).build()
        );
        return Optional.ofNullable(result);
    }

    public void save(UserStory story) {
        table.putItem(story);
    }

    public void delete(UserStory story) {
        table.deleteItem(story);
    }
}
