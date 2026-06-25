package com.historo.repository;

import com.historo.entity.ComicEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComicRepository extends JpaRepository<ComicEntity, String> {
}
