package com.historo.service;

import com.historo.config.JwtUtil;
import com.historo.dto.auth.AuthResponse;
import com.historo.dto.auth.LoginRequest;
import com.historo.dto.auth.SignupRequest;
import com.historo.entity.UserEntity;
import com.historo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse signup(SignupRequest req) {
        if (userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        UserEntity user = new UserEntity(
                req.email(),
                passwordEncoder.encode(req.password()),
                req.nickname()
        );
        userRepo.save(user);
        // subject = username (email)
        String token = jwtUtil.generateToken(user.getUsername(), user.getEmail());
        return new AuthResponse(token, user.getNickname(), user.getEmail());
    }

    public AuthResponse login(LoginRequest req) {
        UserEntity user = userRepo.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        String token = jwtUtil.generateToken(user.getUsername(), user.getEmail());
        return new AuthResponse(token, user.getNickname(), user.getEmail());
    }
}
