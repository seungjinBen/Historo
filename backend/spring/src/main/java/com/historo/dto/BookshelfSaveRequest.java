package com.historo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BookshelfSaveRequest(
        @NotBlank String eventId,
        @NotBlank String title,
        @NotNull List<Integer> picks,
        String pathText,
        String thumbnailUrl
) {}
