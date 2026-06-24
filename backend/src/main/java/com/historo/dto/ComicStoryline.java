package com.historo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ComicStoryline(
        String id,
        String q1,
        String q2,
        String q3,
        @JsonProperty("path_text") String pathText,
        @JsonProperty("image_folder") String imageFolder,
        List<ComicCut> cuts
) {
    public ComicStoryline withCuts(List<ComicCut> newCuts) {
        return new ComicStoryline(id, q1, q2, q3, pathText, imageFolder, newCuts);
    }
}
