package com.historo.repository;

import com.historo.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserStoryRepository extends JpaRepository<UserStory, Long> {
    List<UserStory> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<UserStory> findBySharedTrueOrderByCreatedAtDesc();
}
