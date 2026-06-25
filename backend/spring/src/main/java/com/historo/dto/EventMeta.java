package com.historo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EventMeta(
        String id,
        String heritageId,
        String title,
        int year,
        String king,
        String era,
        String category,
        String status,
        String source,
        String sillokUrl,
        String factCard,
        String factContext,
        CharacterInfo character
) {}
