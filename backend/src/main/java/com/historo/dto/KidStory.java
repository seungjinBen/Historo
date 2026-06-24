package com.historo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record KidStory(
        String eventId,
        String source,
        String sillokUrl,
        boolean fromSillok,
        String kidStory,
        List<String> funFacts
) {}
