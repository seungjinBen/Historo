package com.historo.dto;

import java.time.LocalDateTime;
import java.util.List;

public record BookshelfItem(
        Long id,
        String eventId,
        String title,
        List<Integer> picks,
        String pathText,
        String thumbnailUrl,
        LocalDateTime createdAt
) {}
