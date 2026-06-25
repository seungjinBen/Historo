package com.historo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Comic(
        String id,
        String title,
        @JsonProperty("source_file") String sourceFile,
        Map<String, String> questions,
        List<ComicStoryline> storylines
) {
    public Comic withStorylines(List<ComicStoryline> newStorylines) {
        return new Comic(id, title, sourceFile, questions, newStorylines);
    }
}
