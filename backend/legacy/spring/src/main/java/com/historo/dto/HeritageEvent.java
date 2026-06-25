package com.historo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HeritageEvent(
        String id,
        String title,
        String year,
        String sillokUrl,
        List<HeritageItem> heritageItems
) {}
