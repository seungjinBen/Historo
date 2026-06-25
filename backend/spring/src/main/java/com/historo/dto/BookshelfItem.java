package com.historo.dto;

import java.util.List;

public record BookshelfItem(
        String id,
        String eventId,
        String title,
        List<Integer> picks,
        String pathText,
        String thumbnailUrl,
        String createdAt
) {}
