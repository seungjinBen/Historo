package com.historo.repository;

import com.historo.entity.StoryTree;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryTreeRepository extends JpaRepository<StoryTree, String> {
}
