package com.historo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ComicCut(
        int number,
        String camera,
        String description,
        @JsonProperty("image_path") String imagePath,
        @JsonProperty("unique_image_path") String uniqueImagePath,
        String imageUrl
) {
    public ComicCut withImageUrl(String url) {
        return new ComicCut(number, camera, description, imagePath, uniqueImagePath, url);
    }
}
