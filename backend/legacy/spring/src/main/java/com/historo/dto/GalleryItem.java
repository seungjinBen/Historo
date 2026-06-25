package com.historo.dto;

import java.util.List;

public record GalleryItem(
        String episodeId,
        String title,
        String storylineId,
        String pathText,
        List<GalleryPanel> panels
) {
    public record GalleryPanel(
            int number,
            String description,
            String imageUrl
    ) {}
}
