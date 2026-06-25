package com.historo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HeritageItem(
        String id,
        String name,
        String imagePath,
        String docentText,
        String source,
        String sourceUrl
) {}
