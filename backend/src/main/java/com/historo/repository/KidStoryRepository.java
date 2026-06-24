package com.historo.repository;

import com.historo.entity.KidStoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KidStoryRepository extends JpaRepository<KidStoryEntity, String> {
}
