package com.historo.dto.auth;

public record AuthResponse(
        String token,
        String nickname,
        String email
) {}
