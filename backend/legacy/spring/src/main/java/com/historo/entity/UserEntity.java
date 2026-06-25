package com.historo.entity;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

import java.time.LocalDateTime;

/**
 * historo-users 테이블
 * PK: username (String) — email 값을 그대로 사용
 */
@DynamoDbBean
public class UserEntity {

    private String username;   // PK (= email)
    private String password;
    private String nickname;
    private String createdAt;

    public UserEntity() {}

    public UserEntity(String email, String password, String nickname) {
        this.username = email;
        this.password = password;
        this.nickname = nickname;
        this.createdAt = LocalDateTime.now().toString();
    }

    @DynamoDbPartitionKey
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    // 기존 코드 호환용 — username(email)을 반환
    public String getEmail() { return username; }
    public String getId() { return username; }
}
