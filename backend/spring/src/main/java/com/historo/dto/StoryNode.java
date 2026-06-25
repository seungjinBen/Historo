package com.historo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StoryNode(
        String narration,
        List<Choice> choices,
        String ending,
        List<Panel> panels
) {}
