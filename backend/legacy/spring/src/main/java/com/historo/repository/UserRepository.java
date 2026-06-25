package com.historo.repository;

import com.historo.entity.UserEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.Optional;

/**
 * historo-users 테이블 접근
 * PK: username (= email)
 * findByEmail → getItem(email) 으로 직접 조회 (email = PK이므로 GSI 불필요)
 */
@Repository
public class UserRepository {

    private final DynamoDbTable<UserEntity> table;

    public UserRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("historo-users", TableSchema.fromBean(UserEntity.class));
    }

    public Optional<UserEntity> findByEmail(String email) {
        UserEntity result = table.getItem(Key.builder().partitionValue(email).build());
        return Optional.ofNullable(result);
    }

    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }

    public void save(UserEntity user) {
        table.putItem(user);
    }

    public void delete(UserEntity user) {
        table.deleteItem(user);
    }
}
